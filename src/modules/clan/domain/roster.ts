import type { Member, MemberRole } from "./member";

/** Ranks that run the clan, highest first. They get their own cards on the members page. */
export const LEADERSHIP_RANKS: readonly MemberRole[] = ["owner", "deputy_owner", "major", "administrator"];

export interface RankGroup {
  readonly rank: MemberRole;
  readonly members: readonly Member[];
}

export interface Roster {
  /** Leadership, grouped by rank, highest rank first. Empty ranks are left out. */
  readonly leadership: readonly RankGroup[];
  /** Everyone else, sorted by rank then total XP. */
  readonly members: readonly Member[];
  readonly total: number;
}
