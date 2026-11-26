import type { Member } from "./member";

export interface Clan {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;
  readonly homeworld: number | null;
  readonly members: readonly Member[];
}

export interface Gainer {
  readonly displayName: string;
  readonly gained: number;
}

export type GainPeriod = "day" | "week" | "month";
