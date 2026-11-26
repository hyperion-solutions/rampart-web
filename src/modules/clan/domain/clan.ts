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

export interface Gainer {
  readonly displayName: string;
  readonly gained: number;
}

export type GainPeriod = "day" | "week" | "month";
