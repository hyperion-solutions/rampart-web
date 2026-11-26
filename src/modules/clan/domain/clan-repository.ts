import type { Clan, GainPeriod, Gainer } from "./clan";

/** Port: the domain/application layers depend on this, never on Wise Old Man directly (DIP). */
export interface ClanRepository {
  getClan(): Promise<Clan>;
  getTopGainers(period: GainPeriod, limit: number): Promise<Gainer[]>;
}
