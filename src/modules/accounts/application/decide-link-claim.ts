import type { LinkClaimRepository } from "../domain/link-claim-repository";
import type { LinkedAccountRepository } from "../domain/linked-account-repository";

export type DecideClaimResult =
  | { readonly outcome: "approved" | "rejected" }
  | { readonly outcome: "not-found" | "already-decided" | "already-linked" };

/**
 * An admin approves or rejects a claim. Callers must check the decider is an admin.
 * Approving links the account (verified by an admin); a later Dink login attaches its hash.
 */
export class DecideLinkClaim {
  constructor(
    private readonly claims: LinkClaimRepository,
    private readonly accounts: LinkedAccountRepository,
  ) {}

  async execute(claimId: string, deciderUserId: string, approve: boolean): Promise<DecideClaimResult> {
    const claim = await this.claims.findById(claimId);
    if (!claim) return { outcome: "not-found" };
    if (claim.status !== "pending") return { outcome: "already-decided" };

    if (!approve) {
      await this.claims.decide(claim.id, "rejected", deciderUserId);
      return { outcome: "rejected" };
    }

    // Linked meanwhile (e.g. through Dink): nothing to approve.
    if (await this.accounts.findByWomPlayerId(claim.womPlayerId)) {
      await this.claims.decide(claim.id, "rejected", deciderUserId);
      return { outcome: "already-linked" };
    }

    await this.accounts.create({
      userId: claim.userId,
      dinkAccountHash: null,
      rsn: claim.rsn,
      womPlayerId: claim.womPlayerId,
      accountType: claim.accountType,
      verifiedVia: "admin",
      lastSeenAt: null,
    });
    await this.claims.decide(claim.id, "approved", deciderUserId);
    return { outcome: "approved" };
  }
}
