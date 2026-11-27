import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import type { IssuedLinkToken, LinkAttempt, LinkOutcome, LinkToken } from "../../domain/link-token";
import type { LinkTokenRepository } from "../../domain/link-token-repository";
import type { AccountsDb } from "./client";
import { generateLinkSecret, hashLinkSecret } from "./link-token-secrets";
import { linkTokens } from "./schema";

type LinkTokenRow = typeof linkTokens.$inferSelect;

const toLinkToken = (row: LinkTokenRow): LinkToken => ({
  id: row.id,
  userId: row.userId,
  createdAt: row.createdAt,
  lastUsedAt: row.lastUsedAt,
  lastAttempt:
    row.lastAttemptRsn && row.lastAttemptOutcome && row.lastUsedAt
      ? { rsn: row.lastAttemptRsn, outcome: row.lastAttemptOutcome as LinkOutcome, at: row.lastUsedAt }
      : null,
});

/** Adapter: LinkTokenRepository on Postgres. Stores only SHA-256 hashes of the secrets. */
export class DrizzleLinkTokenRepository implements LinkTokenRepository {
  constructor(private readonly db: () => AccountsDb) {}

  async issue(userId: string): Promise<IssuedLinkToken> {
    const secret = generateLinkSecret();
    const db = this.db();
    // One batch = one transaction, so the "one active token per user" index never trips.
    const [, inserted] = await db.batch([
      db
        .update(linkTokens)
        .set({ revokedAt: new Date() })
        .where(and(eq(linkTokens.userId, userId), isNull(linkTokens.revokedAt))),
      db.insert(linkTokens).values({ userId, tokenHash: hashLinkSecret(secret) }).returning(),
    ]);
    const row = inserted[0];
    if (!row) throw new Error(`Could not create a link token for user ${userId}`);
    return { secret, linkToken: toLinkToken(row) };
  }

  async findActiveForUser(userId: string): Promise<LinkToken | null> {
    const [row] = await this.db()
      .select()
      .from(linkTokens)
      .where(and(eq(linkTokens.userId, userId), isNull(linkTokens.revokedAt)))
      .limit(1);
    return row ? toLinkToken(row) : null;
  }

  async findActiveBySecret(secret: string): Promise<LinkToken | null> {
    const [row] = await this.db()
      .select()
      .from(linkTokens)
      .where(and(eq(linkTokens.tokenHash, hashLinkSecret(secret)), isNull(linkTokens.revokedAt)))
      .limit(1);
    return row ? toLinkToken(row) : null;
  }

  async recordAttempt(tokenId: string, attempt: LinkAttempt): Promise<void> {
    await this.db()
      .update(linkTokens)
      .set({ lastUsedAt: attempt.at, lastAttemptRsn: attempt.rsn, lastAttemptOutcome: attempt.outcome })
      .where(eq(linkTokens.id, tokenId));
  }

  async revokeForUser(userId: string): Promise<void> {
    await this.db()
      .update(linkTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(linkTokens.userId, userId), isNull(linkTokens.revokedAt)));
  }
}
