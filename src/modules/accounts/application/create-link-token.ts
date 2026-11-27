import type { IssuedLinkToken } from "../domain/link-token";
import type { LinkTokenRepository } from "../domain/link-token-repository";

/** Gives a member a new personal Dink link, replacing any previous one. */
export class CreateLinkToken {
  constructor(private readonly tokens: LinkTokenRepository) {}

  execute(userId: string): Promise<IssuedLinkToken> {
    return this.tokens.issue(userId);
  }
}
