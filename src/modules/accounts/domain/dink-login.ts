/** The parts of a Dink LOGIN notification that linking needs. */
export interface DinkLogin {
  readonly dinkAccountHash: string;
  readonly playerName: string;
  /** Present only when the player enabled Dink's "Send Clan Name". */
  readonly clanName: string | null;
}
