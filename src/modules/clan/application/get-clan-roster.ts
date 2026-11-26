import type { Member } from "../domain/member";
import type { ClanRepository } from "../domain/clan-repository";
import { LEADERSHIP_RANKS, type Roster } from "../domain/roster";

/** Splits the clan into leadership (cards) and everyone else (table), in rank order. */
export class GetClanRoster {
  constructor(private readonly clans: ClanRepository) {}

  async execute(): Promise<Roster> {
    const clan = await this.clans.getClan();
    const rankIndex = new Map(clan.rankOrder.map((rank, i) => [rank, i]));
    const byRankThenXp = (a: Member, b: Member) =>
      (rankIndex.get(a.role) ?? Infinity) - (rankIndex.get(b.role) ?? Infinity) || b.totalExp - a.totalExp;

    const sorted = [...clan.members].sort(byRankThenXp);
    const leadership = LEADERSHIP_RANKS.map((rank) => ({
      rank,
      members: sorted.filter((m) => m.role === rank),
    })).filter((group) => group.members.length > 0);

    return {
      leadership,
      members: sorted.filter((m) => !LEADERSHIP_RANKS.includes(m.role)),
      total: sorted.length,
    };
  }
}
