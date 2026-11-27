import "server-only";
import type { ClanRepository } from "@/modules/clan/domain/clan-repository";
import type { ClanAccount, ClanAccountDirectory } from "../../domain/clan-account-directory";

/** OSRS treats spaces, underscores and hyphens in names as the same, and ignores case. */
const normalizeRsn = (rsn: string) => rsn.toLowerCase().replace(/[\s_-]+/g, " ").trim();

/** Adapter: looks RSNs up on the clan roster (the Wise Old Man group, via the clan module). */
export class ClanRosterDirectory implements ClanAccountDirectory {
  constructor(private readonly clan: ClanRepository) {}

  async findByRsn(rsn: string): Promise<ClanAccount | null> {
    const wanted = normalizeRsn(rsn);
    const { members } = await this.clan.getClan();
    const member = members.find((m) => normalizeRsn(m.displayName) === wanted || normalizeRsn(m.username) === wanted);
    return member ? { womPlayerId: member.id, rsn: member.displayName, accountType: member.accountType } : null;
  }
}
