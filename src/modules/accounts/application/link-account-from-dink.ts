import type { ClanAccountDirectory } from "../domain/clan-account-directory";
import type { DinkLogin } from "../domain/dink-login";
import type { LinkedAccount } from "../domain/linked-account";
import type { LinkedAccountRepository } from "../domain/linked-account-repository";
import type { LinkOutcome } from "../domain/link-token";
import type { LinkTokenRepository } from "../domain/link-token-repository";

export type LinkFromDinkResult =
  | { readonly outcome: "unknown-token" }
  | { readonly outcome: Exclude<LinkOutcome, "linked" | "updated"> }
  | { readonly outcome: "linked" | "updated"; readonly account: LinkedAccount };

/**
 * Links the game account behind a Dink LOGIN to the member who owns the token.
 * Rules (docs/decisions/0001-account-linking.md):
 * - clan accounts only (on the clan roster, and Dink's clan name, when sent, must match);
 * - one owner per account: an account linked to someone else is never moved;
 * - name changes are followed through the stable Dink account hash.
 */
export class LinkAccountFromDink {
  constructor(
    private readonly tokens: LinkTokenRepository,
    private readonly accounts: LinkedAccountRepository,
    private readonly clan: ClanAccountDirectory,
    private readonly clanName: string,
  ) {}

  async execute(secret: string, login: DinkLogin, now: Date = new Date()): Promise<LinkFromDinkResult> {
    const token = await this.tokens.findActiveBySecret(secret);
    if (!token) return { outcome: "unknown-token" };

    const result = await this.link(token.userId, login, now);
    await this.tokens.recordAttempt(token.id, { rsn: login.playerName, outcome: result.outcome, at: now });
    return result;
  }

  private async link(userId: string, login: DinkLogin, now: Date): Promise<Exclude<LinkFromDinkResult, { outcome: "unknown-token" }>> {
    if (login.clanName !== null && login.clanName.toLowerCase() !== this.clanName.toLowerCase()) {
      return { outcome: "not-in-clan" };
    }
    const member = await this.clan.findByRsn(login.playerName);
    if (!member) return { outcome: "not-in-clan" };

    // Known account (same hash): keep its owner, follow name changes.
    const byHash = await this.accounts.findByDinkHash(login.dinkAccountHash);
    if (byHash) {
      if (byHash.userId !== userId) return { outcome: "owned-by-someone-else" };
      const account = await this.accounts.update(byHash.id, {
        rsn: member.rsn,
        accountType: member.accountType,
        lastSeenAt: now,
      });
      return { outcome: "updated", account };
    }

    // Same Wise Old Man player already linked to this member without this hash
    // (admin approval, or Dink reporting a new hash): attach the current hash.
    const byPlayer = await this.accounts.findByWomPlayerId(member.womPlayerId);
    if (byPlayer) {
      if (byPlayer.userId !== userId) return { outcome: "owned-by-someone-else" };
      const account = await this.accounts.update(byPlayer.id, {
        dinkAccountHash: login.dinkAccountHash,
        rsn: member.rsn,
        accountType: member.accountType,
        verifiedVia: "dink",
        lastSeenAt: now,
      });
      return { outcome: "updated", account };
    }

    const account = await this.accounts.create({
      userId,
      dinkAccountHash: login.dinkAccountHash,
      rsn: member.rsn,
      womPlayerId: member.womPlayerId,
      accountType: member.accountType,
      verifiedVia: "dink",
      lastSeenAt: now,
    });
    return { outcome: "linked", account };
  }
}
