import "server-only";
import { and, asc, eq } from "drizzle-orm";
import type { LinkedAccount, LinkedAccountChanges, NewLinkedAccount } from "../../domain/linked-account";
import type { LinkedAccountRepository } from "../../domain/linked-account-repository";
import type { AccountsDb } from "./client";
import { linkedAccounts } from "./schema";

type LinkedAccountRow = typeof linkedAccounts.$inferSelect;

const toLinkedAccount = (row: LinkedAccountRow): LinkedAccount => ({
  id: row.id,
  userId: row.userId,
  dinkAccountHash: row.dinkAccountHash,
  rsn: row.rsn,
  womPlayerId: row.womPlayerId,
  accountType: row.accountType,
  verifiedVia: row.verifiedVia,
  verifiedAt: row.verifiedAt,
  lastSeenAt: row.lastSeenAt,
});

/** Adapter: LinkedAccountRepository on Postgres via Drizzle. */
export class DrizzleLinkedAccountRepository implements LinkedAccountRepository {
  constructor(private readonly db: () => AccountsDb) {}

  async findByDinkHash(dinkAccountHash: string): Promise<LinkedAccount | null> {
    const [row] = await this.db()
      .select()
      .from(linkedAccounts)
      .where(eq(linkedAccounts.dinkAccountHash, dinkAccountHash))
      .limit(1);
    return row ? toLinkedAccount(row) : null;
  }

  async findByWomPlayerId(womPlayerId: number): Promise<LinkedAccount | null> {
    const [row] = await this.db()
      .select()
      .from(linkedAccounts)
      .where(eq(linkedAccounts.womPlayerId, womPlayerId))
      .limit(1);
    return row ? toLinkedAccount(row) : null;
  }

  async listForUser(userId: string): Promise<LinkedAccount[]> {
    const rows = await this.db()
      .select()
      .from(linkedAccounts)
      .where(eq(linkedAccounts.userId, userId))
      .orderBy(asc(linkedAccounts.createdAt));
    return rows.map(toLinkedAccount);
  }

  async create(account: NewLinkedAccount): Promise<LinkedAccount> {
    const [row] = await this.db().insert(linkedAccounts).values(account).returning();
    if (!row) throw new Error(`Could not link ${account.rsn} for user ${account.userId}`);
    return toLinkedAccount(row);
  }

  async update(id: string, changes: LinkedAccountChanges): Promise<LinkedAccount> {
    const [row] = await this.db().update(linkedAccounts).set(changes).where(eq(linkedAccounts.id, id)).returning();
    if (!row) throw new Error(`Linked account ${id} no longer exists`);
    return toLinkedAccount(row);
  }

  async deleteForUser(userId: string, id: string): Promise<boolean> {
    const deleted = await this.db()
      .delete(linkedAccounts)
      .where(and(eq(linkedAccounts.id, id), eq(linkedAccounts.userId, userId)))
      .returning({ id: linkedAccounts.id });
    return deleted.length > 0;
  }
}
