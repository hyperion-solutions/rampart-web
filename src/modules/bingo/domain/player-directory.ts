/** A site member who can play: signed up with Discord and linked at least one clan account. */
export interface Player {
  readonly userId: string;
  readonly displayName: string;
  readonly rsns: readonly string[];
}

/** Port: finds eligible players (members with linked clan accounts). */
export interface PlayerDirectory {
  /** Matches Discord name or any linked RSN, case-insensitive. */
  search(query: string, limit: number): Promise<Player[]>;
  findByUserIds(userIds: readonly string[]): Promise<Player[]>;
}
