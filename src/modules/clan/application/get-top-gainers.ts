import type { GainPeriod, TopGainer } from "../domain/clan";
import type { ClanRepository } from "../domain/clan-repository";

/** Top XP gainers for a period, joined with their clan membership (rank, account type, icons). */
export class GetTopGainers {
  constructor(private readonly clans: ClanRepository) {}

  async execute(period: GainPeriod = "week", limit = 5): Promise<TopGainer[]> {
    const [clan, gainers] = await Promise.all([this.clans.getClan(), this.clans.getTopGainers(period, limit)]);
    const membersById = new Map(clan.members.map((m) => [m.id, m]));

    return gainers.flatMap((g) => {
      const member = membersById.get(g.playerId);
      // Players who left the clan since the period started have no membership; skip them.
      return member && g.gained > 0 ? [{ member, gained: g.gained }] : [];
    });
  }
}
