import type { Member, MemberRole } from "./member";

export interface Clan {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;
  readonly homeworld: number | null;
  readonly members: readonly Member[];
  /** The clan's ranks from highest to lowest. */
  readonly rankOrder: readonly MemberRole[];
}

/** XP a player gained in a period, as reported by the data source. */
export interface Gainer {
  readonly playerId: number;
  readonly displayName: string;
  readonly gained: number;
}

/** A gainer matched to their clan membership, so the UI can show rank, icons and total XP. */
export interface TopGainer {
  readonly member: Member;
  readonly gained: number;
}

export type GainPeriod = "day" | "week" | "month";
