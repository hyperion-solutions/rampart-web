import type { IssuedLinkToken, LinkAttempt, LinkToken } from "./link-token";

/** Port: stores members' personal Dink link tokens. At most one active token per user. */
export interface LinkTokenRepository {
  /** Revokes the user's current token (if any) and creates a new one. */
  issue(userId: string): Promise<IssuedLinkToken>;
  findActiveForUser(userId: string): Promise<LinkToken | null>;
  /** Finds the active token matching a secret from a Dink request. */
  findActiveBySecret(secret: string): Promise<LinkToken | null>;
  recordAttempt(tokenId: string, attempt: LinkAttempt): Promise<void>;
  revokeForUser(userId: string): Promise<void>;
}
