/** The parts of a Dink LOGIN notification that linking needs. */
export interface DinkLogin {
  readonly dinkAccountHash: string;
  readonly playerName: string;
  /** Present only when the player enabled Dink's "Send Clan Name". */
  readonly clanName: string | null;
}

/** The parts of a Dink LOOT notification that bingo tracking needs. */
export interface DinkLoot {
  readonly dinkAccountHash: string;
  /** Game item ids as Dink reports them (may be variant ids; bingo maps them to canonical ids). */
  readonly items: readonly { readonly itemId: number; readonly quantity: number }[];
  /** What dropped it, e.g. "Tombs of Amascut". */
  readonly source: string | null;
}

/** A Dink notification, reduced to what the site acts on. */
export type DinkNotification =
  | { readonly kind: "login"; readonly login: DinkLogin }
  | { readonly kind: "loot"; readonly loot: DinkLoot }
  /** Any other type (levels, logout, collection log...): accepted and ignored. */
  | { readonly kind: "other"; readonly type: string }
  | { readonly kind: "invalid"; readonly reason: string };
