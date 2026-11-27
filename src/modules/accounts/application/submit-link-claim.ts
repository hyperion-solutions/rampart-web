import type { ClanAccountDirectory } from "../domain/clan-account-directory";
import type { LinkClaim } from "../domain/link-claim";
import type { LinkClaimRepository } from "../domain/link-claim-repository";
import type { LinkedAccountRepository } from "../domain/linked-account-repository";

export type SubmitClaimResult =
  | { readonly outcome: "submitted"; readonly claim: LinkClaim }
  | { readonly outcome: "not-in-clan" | "already-yours" | "owned-by-someone-else" | "already-pending" };

/** A member asks an admin to link an RSN for them (for members who don't use Dink). */
export class SubmitLinkClaim {
  constructor(
    private readonly claims: LinkClaimRepository,
    private readonly accounts: LinkedAccountRepository,
    private readonly clan: ClanAccountDirectory,
  ) {}

  async execute(userId: string, rsn: string): Promise<SubmitClaimResult> {
    const member = await this.clan.findByRsn(rsn);
    if (!member) return { outcome: "not-in-clan" };

    const linked = await this.accounts.findByWomPlayerId(member.womPlayerId);
    if (linked) return { outcome: linked.userId === userId ? "already-yours" : "owned-by-someone-else" };

    if (await this.claims.findPendingForPlayer(member.womPlayerId)) return { outcome: "already-pending" };

    const claim = await this.claims.create({
      userId,
      rsn: member.rsn,
      womPlayerId: member.womPlayerId,
      accountType: member.accountType,
    });
    return { outcome: "submitted", claim };
  }
}
