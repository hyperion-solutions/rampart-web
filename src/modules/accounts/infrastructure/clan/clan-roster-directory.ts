import "server-only";
import type { ClanRepository } from "@/modules/clan/domain/clan-repository";
import type { Member } from "@/modules/clan/domain/member";
import type { ClanAccount, ClanAccountDirectory } from "../../domain/clan-account-directory";
import type { ClanMemberLookup } from "../../domain/clan-member-lookup";

/** OSRS treats spaces, underscores and hyphens in names as the same, and ignores case. */
const normalizeRsn = (rsn: string) => rsn.toLowerCase().replace(/[\s_-]+/g, " ").trim();

/** Adapter: looks RSNs up on the clan roster (the Wise Old Man group, via the clan module). */
export class ClanRosterDirectory implements ClanAccountDirectory, ClanMemberLookup {
  constructor(private readonly clan: ClanRepository) {}

  async findByRsn(rsn: string): Promise<ClanAccount | null> {
    const wanted = normalizeRsn(rsn);
    const { members } = await this.clan.getClan();
    const member = members.find((m) => normalizeRsn(m.displayName) === wanted || normalizeRsn(m.username) === wanted);
    return member ? { womPlayerId: member.id, rsn: member.displayName, accountType: member.accountType } : null;
  }

  async findByWomPlayerIds(womPlayerIds: readonly number[]): Promise<ReadonlyMap<number, Member>> {
    const wanted = new Set(womPlayerIds);
    const { members } = await this.clan.getClan();
    return new Map(members.filter((m) => wanted.has(m.id)).map((m) => [m.id, m]));
  }
}
