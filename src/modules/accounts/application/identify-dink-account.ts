import type { LinkedAccountRepository } from "../domain/linked-account-repository";
import type { LinkTokenRepository } from "../domain/link-token-repository";

export type DinkSender =
  | { readonly status: "unknown-token" }
  /** The game account isn't linked to the link's owner (not linked yet, or linked to someone else). */
  | { readonly status: "not-linked" }
  | { readonly status: "ok"; readonly userId: string; readonly rsn: string };

/**
 * Who a Dink notification (other than LOGIN) is from: the link's owner, and only for game
 * accounts already linked to them. Drops from other accounts never count for anyone.
 */
export class IdentifyDinkAccount {
  constructor(
    private readonly tokens: LinkTokenRepository,
    private readonly accounts: LinkedAccountRepository,
  ) {}

  async execute(secret: string, dinkAccountHash: string): Promise<DinkSender> {
    const token = await this.tokens.findActiveBySecret(secret);
    if (!token) return { status: "unknown-token" };
    const account = await this.accounts.findByDinkHash(dinkAccountHash);
    if (!account || account.userId !== token.userId) return { status: "not-linked" };
    return { status: "ok", userId: account.userId, rsn: account.rsn };
  }
}
