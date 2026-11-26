import type { GainPeriod, Gainer } from "../domain/clan";
import type { ClanRepository } from "../domain/clan-repository";

export class GetTopGainers {
  constructor(private readonly clans: ClanRepository) {}

  execute(period: GainPeriod = "week", limit = 5): Promise<Gainer[]> {
    return this.clans.getTopGainers(period, limit);
  }
}
