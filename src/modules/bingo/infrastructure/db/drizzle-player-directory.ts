import "server-only";
import { asc, eq, ilike, inArray, or } from "drizzle-orm";
import { linkedAccounts, users } from "@/modules/accounts/infrastructure/db/schema";
import type { Player, PlayerDirectory } from "../../domain/player-directory";
import type { BingoDb } from "./client";

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

/**
 * Adapter: eligible players from the accounts tables (users with at least one linked account).
 * Read-only; the accounts module still owns those tables.
 */
export class DrizzlePlayerDirectory implements PlayerDirectory {
  constructor(private readonly db: () => BingoDb) {}

  async search(query: string, limit: number): Promise<Player[]> {
    const pattern = `%${escapeLike(query)}%`;
    const rows = await this.db()
      .selectDistinct({ userId: users.id })
      .from(users)
      .innerJoin(linkedAccounts, eq(linkedAccounts.userId, users.id))
      .where(or(ilike(users.discordName, pattern), ilike(linkedAccounts.rsn, pattern)))
      .limit(limit);
    return this.findByUserIds(rows.map((r) => r.userId));
  }

  async findByUserIds(userIds: readonly string[]): Promise<Player[]> {
    if (userIds.length === 0) return [];
    const rows = await this.db()
      .select({ userId: users.id, displayName: users.discordName, rsn: linkedAccounts.rsn })
      .from(users)
      .innerJoin(linkedAccounts, eq(linkedAccounts.userId, users.id))
      .where(inArray(users.id, [...userIds]))
      .orderBy(asc(users.discordName), asc(linkedAccounts.rsn));
    const players = new Map<string, Player>();
    for (const r of rows) {
      const p = players.get(r.userId);
      players.set(r.userId, { userId: r.userId, displayName: r.displayName, rsns: [...(p?.rsns ?? []), r.rsn] });
    }
    return [...players.values()];
  }
}
