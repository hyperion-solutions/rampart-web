import "server-only";
import type { DinkNotification } from "../../domain/dink-login";
import { validateDinkPayload, validateLootExtra } from "./dink-payload";

/** Dink payloads are a few KB; screenshots go up to 8 MB. LOGIN never has one. */
const MAX_BODY_BYTES = 10 * 1024 * 1024;

/** RuneLite uses non-breaking spaces in names; store plain ones. */
const cleanName = (name: string) => name.replace(/ /g, " ").trim();

/**
 * Adapter: turns a Dink HTTP request into a domain notification.
 * Dink sends `application/json`, or `multipart/form-data` with the JSON in `payload_json`
 * when a screenshot is attached (field `file`, ignored here).
 */
export async function readDinkNotification(request: Request): Promise<DinkNotification> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return { kind: "invalid", reason: "body too large" };

  let raw: unknown;
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.startsWith("multipart/form-data")) {
      const json = (await request.formData()).get("payload_json");
      if (typeof json !== "string") return { kind: "invalid", reason: "multipart body without payload_json" };
      raw = JSON.parse(json);
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
