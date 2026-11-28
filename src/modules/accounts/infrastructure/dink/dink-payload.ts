/**
 * Raw Dink payload shapes (only the fields we use). Never leak these outside infrastructure.
 * Reference samples: docs/dink/login-payload.json and logout-payload.json; LOOT from Dink's
 * docs/json-examples.md (see docs/dink/README.md).
 */
export interface DinkPayload {
  type: string;
  playerName: string;
  dinkAccountHash: string;
  accountType?: string;
  clanName?: string | null;
  /** Type-specific data; read through the validators below. */
  extra?: unknown;
}

/** LOOT `extra`, reduced to what bingo uses. */
export interface DinkLootExtra {
  items: { id: number; quantity: number }[];
  source: string | null;
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
  return {
    payload: { type, playerName, dinkAccountHash, clanName: (clanName as string | null | undefined) ?? null, extra: raw.extra },
  };
}

/** A loot message lists a handful of items; more is a broken or hostile client. */
const MAX_LOOT_ITEMS = 100;
const MAX_QUANTITY = 1_000_000_000;

/** Validates LOOT `extra.items` (id, quantity) and `extra.source`. */
export function validateLootExtra(extra: unknown): { loot: DinkLootExtra } | { error: string } {
  if (!isRecord(extra) || !Array.isArray(extra.items)) return { error: "LOOT without extra.items" };
  if (extra.items.length > MAX_LOOT_ITEMS) return { error: "too many loot items" };
  const items: DinkLootExtra["items"] = [];
  for (const item of extra.items) {
    if (!isRecord(item)) return { error: "invalid loot item" };
    const { id, quantity } = item;
    if (typeof id !== "number" || !Number.isInteger(id) || id < 0) return { error: "invalid loot item id" };
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) return { error: "invalid loot quantity" };
    items.push({ id, quantity: Math.min(quantity, MAX_QUANTITY) });
  }
  const source = typeof extra.source === "string" && extra.source.length > 0 ? extra.source.slice(0, 100) : null;
  return { loot: { items, source } };
}
