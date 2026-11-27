import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import type { ClaimStatus, LinkClaim, NewLinkClaim, PendingClaim } from "../../domain/link-claim";
import type { LinkClaimRepository } from "../../domain/link-claim-repository";
import type { AccountsDb } from "./client";
import { linkClaims, users } from "./schema";

type LinkClaimRow = typeof linkClaims.$inferSelect;

const toLinkClaim = (row: LinkClaimRow): LinkClaim => ({
  id: row.id,
  userId: row.userId,
  rsn: row.rsn,
  womPlayerId: row.womPlayerId,
  accountType: row.accountType,
  status: row.status,
  createdAt: row.createdAt,
  decidedAt: row.decidedAt,
});

/** Adapter: LinkClaimRepository on Postgres via Drizzle. */
export class DrizzleLinkClaimRepository implements LinkClaimRepository {
  constructor(private readonly db: () => AccountsDb) {}

  async create(claim: NewLinkClaim): Promise<LinkClaim> {
    const [row] = await this.db().insert(linkClaims).values(claim).returning();
    if (!row) throw new Error(`Could not save the claim for ${claim.rsn}`);
    return toLinkClaim(row);
  }

  async findById(id: string): Promise<LinkClaim | null> {
    const [row] = await this.db().select().from(linkClaims).where(eq(linkClaims.id, id)).limit(1);
    return row ? toLinkClaim(row) : null;
  }

  async findPendingForPlayer(womPlayerId: number): Promise<LinkClaim | null> {
    const [row] = await this.db()
      .select()
      .from(linkClaims)
      .where(and(eq(linkClaims.womPlayerId, womPlayerId), eq(linkClaims.status, "pending")))
      .limit(1);
    return row ? toLinkClaim(row) : null;
  }

  async listForUser(userId: string): Promise<LinkClaim[]> {
    const rows = await this.db()
      .select()
      .from(linkClaims)
      .where(eq(linkClaims.userId, userId))
      .orderBy(desc(linkClaims.createdAt))
      .limit(20);
    return rows.map(toLinkClaim);
  }

  async listPending(): Promise<PendingClaim[]> {
    const rows = await this.db()
      .select({ claim: linkClaims, requesterName: users.discordName })
      .from(linkClaims)
      .innerJoin(users, eq(users.id, linkClaims.userId))
      .where(eq(linkClaims.status, "pending"))
      .orderBy(asc(linkClaims.createdAt));
    return rows.map((r) => ({ ...toLinkClaim(r.claim), requesterName: r.requesterName }));
  }

  async decide(id: string, status: Exclude<ClaimStatus, "pending">, decidedBy: string): Promise<void> {
    await this.db()
      .update(linkClaims)
      .set({ status, decidedBy, decidedAt: new Date() })
      .where(and(eq(linkClaims.id, id), eq(linkClaims.status, "pending")));
  }
}
