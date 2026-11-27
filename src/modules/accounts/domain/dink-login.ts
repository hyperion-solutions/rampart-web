/** The parts of a Dink LOGIN notification that linking needs. */
export interface DinkLogin {
  readonly dinkAccountHash: string;
  readonly playerName: string;
  /** Present only when the player enabled Dink's "Send Clan Name". */
  readonly clanName: string | null;
}

/** A Dink notification, reduced to what the site acts on. */
export type DinkNotification =
  | { readonly kind: "login"; readonly login: DinkLogin }
  /** Any other type (loot, levels, logout...): accepted and ignored until bingo (v0.3). */
  | { readonly kind: "other"; readonly type: string }
  | { readonly kind: "invalid"; readonly reason: string };
