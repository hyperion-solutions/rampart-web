/**
 * Raw Dink payload shapes (only the fields we use). Never leak these outside infrastructure.
 * Reference samples: docs/dink/login-payload.json and logout-payload.json.
 */
export interface DinkPayload {
  type: string;
  playerName: string;
  dinkAccountHash: string;
  accountType?: string;
  clanName?: string | null;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Validates the fields we rely on. Returns an error message, or null when the payload is usable. */
export function validateDinkPayload(raw: unknown): { payload: DinkPayload } | { error: string } {
  if (!isRecord(raw)) return { error: "payload is not a JSON object" };
  const { type, playerName, dinkAccountHash, clanName } = raw;
  if (typeof type !== "string" || type.length === 0 || type.length > 64) return { error: "missing or invalid type" };
  if (typeof playerName !== "string" || playerName.length === 0 || playerName.length > 12 + 4) {
    return { error: "missing or invalid playerName" };
  }
  if (typeof dinkAccountHash !== "string" || !/^[0-9a-f]{32,128}$/i.test(dinkAccountHash)) {
    return { error: "missing or invalid dinkAccountHash" };
  }
  if (clanName !== undefined && clanName !== null && (typeof clanName !== "string" || clanName.length > 64)) {
    return { error: "invalid clanName" };
  }
  return { payload: { type, playerName, dinkAccountHash, clanName: (clanName as string | null | undefined) ?? null } };
}
