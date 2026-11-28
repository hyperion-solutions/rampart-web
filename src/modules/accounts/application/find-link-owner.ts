import type { LinkTokenRepository } from "../domain/link-token-repository";

/** Who owns an active Dink link, for requests that only carry the link (e.g. Dink's Dynamic Config URL). */
export class FindLinkOwner {
  constructor(private readonly tokens: LinkTokenRepository) {}

  async execute(secret: string): Promise<string | null> {
    return (await this.tokens.findActiveBySecret(secret))?.userId ?? null;
  }
}
