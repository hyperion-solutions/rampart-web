/** Clan rank as Wise Old Man names it, e.g. "owner", "deputy_owner", "recruit". */
export type MemberRole = string;

/** Account type: "ironman", "hardcore", "ultimate" or "regular". */
export type AccountType = string;

/** Account build: "def1", "zerker", "main", "hp10", "lvl3", "f2p". */
export type AccountBuild = string;

export interface MemberIcons {
  readonly rank: string;
  readonly accountType: string;
}

export interface Member {
  readonly id: number;
  readonly username: string;
  readonly displayName: string;
  readonly role: MemberRole;
  readonly accountType: AccountType;
  readonly build: AccountBuild;
  readonly ehp: number;
  readonly ehb: number;
  readonly totalExp: number;
  readonly joinedAt: Date;
  /** Last time the player's stats changed. */
  readonly lastProgressedAt: Date | null;
  readonly icons: MemberIcons;
  readonly profileUrl: string;
}
