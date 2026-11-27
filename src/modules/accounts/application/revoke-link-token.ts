import type { LinkTokenRepository } from "../domain/link-token-repository";

/** Turns off a member's personal Dink link. Already linked accounts stay linked. */
export class RevokeLinkToken {
  constructor(private readonly tokens: LinkTokenRepository) {}

  execute(userId: string): Promise<void> {
    return this.tokens.revokeForUser(userId);
  }
}
