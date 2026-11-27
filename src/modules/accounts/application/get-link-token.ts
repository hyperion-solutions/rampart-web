import type { LinkToken } from "../domain/link-token";
import type { LinkTokenRepository } from "../domain/link-token-repository";

/** A member's active Dink link (without its secret) and what happened when it was last used. */
export class GetLinkToken {
  constructor(private readonly tokens: LinkTokenRepository) {}

  execute(userId: string): Promise<LinkToken | null> {
    return this.tokens.findActiveForUser(userId);
  }
}
