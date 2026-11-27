/** An account found on the clan roster. */
export interface ClanAccount {
  readonly womPlayerId: number;
  /** Current name as the roster shows it. */
  readonly rsn: string;
  readonly accountType: string;
}

/** Port: answers "is this RSN in the clan?" */
export interface ClanAccountDirectory {
  findByRsn(rsn: string): Promise<ClanAccount | null>;
}
