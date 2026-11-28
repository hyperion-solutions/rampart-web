import "server-only";
import type { DinkNotification } from "../../domain/dink-login";
import { validateDinkPayload, validateLootExtra } from "./dink-payload";

/** Dink payloads are a few KB; screenshots go up to 8 MB. LOGIN never has one. */
const MAX_BODY_BYTES = 10 * 1024 * 1024;
/** Dink's documented maximum. (Vercel Hobby rejects bodies over 4.5 MB before this runs.) */
const MAX_SCREENSHOT_BYTES = 8 * 1024 * 1024;

/** RuneLite uses non-breaking spaces in names; store plain ones. */
const cleanName = (name: string) => name.replace(/ /g, " ").trim();

/**
 * Adapter: turns a Dink HTTP request into a domain notification.
 * Dink sends `application/json`, or `multipart/form-data` with the JSON in `payload_json`
 * when a screenshot is attached (field `file`, kept only for LOOT: bingo may store it).
 */
export async function readDinkNotification(request: Request): Promise<DinkNotification> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return { kind: "invalid", reason: "body too large" };

  let raw: unknown;
  let screenshot: Uint8Array | null = null;
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.startsWith("multipart/form-data")) {
      const form = await request.formData();
      const json = form.get("payload_json");
      if (typeof json !== "string") return { kind: "invalid", reason: "multipart body without payload_json" };
      raw = JSON.parse(json);
      const file = form.get("file");
      // Dink sends image/png (sometimes image/jpeg). Anything else is ignored, not an error.
      if (file instanceof File && file.type.startsWith("image/") && file.size > 0 && file.size <= MAX_SCREENSHOT_BYTES) {
        screenshot = new Uint8Array(await file.arrayBuffer());
      }
    } else {
      raw = await request.json();
    }
  } catch {
    return { kind: "invalid", reason: "body is not valid JSON" };
  }

  const result = validateDinkPayload(raw);
  if ("error" in result) return { kind: "invalid", reason: result.error };
  const { payload } = result;

  if (payload.type === "LOOT") {
    const extra = validateLootExtra(payload.extra);
    if ("error" in extra) return { kind: "invalid", reason: extra.error };
    return {
      kind: "loot",
      loot: {
        dinkAccountHash: payload.dinkAccountHash.toLowerCase(),
        items: extra.loot.items.map((i) => ({ itemId: i.id, quantity: i.quantity })),
        source: extra.loot.source ? cleanName(extra.loot.source) : null,
        screenshot,
      },
    };
  }
  if (payload.type !== "LOGIN") return { kind: "other", type: payload.type };
  return {
    kind: "login",
    login: {
      dinkAccountHash: payload.dinkAccountHash.toLowerCase(),
      playerName: cleanName(payload.playerName),
      clanName: payload.clanName ? cleanName(payload.clanName) : null,
    },
  };
}
