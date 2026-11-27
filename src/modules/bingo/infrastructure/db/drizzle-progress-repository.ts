import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { users } from "@/modules/accounts/infrastructure/db/schema";
import type { NewProgressEntry, ProgressEntry } from "../../domain/progress";
import type { BingoHistoryEraser, ProgressRepository } from "../../domain/repositories";
import type { BingoDb } from "./client";
import { bingoCompletions, bingoTeams, bingoTileProgress } from "./schema";

const obtainer = alias(users, "obtainer");
const adder = alias(users, "adder");

export class DrizzleProgressRepository implements ProgressRepository, BingoHistoryEraser {
  constructor(private readonly db: () => BingoDb) {}

  private select() {
    return this.db()
      .select({ entry: bingoTileProgress, obtainedByName: obtainer.discordName, addedByName: adder.discordName })
      .from(bingoTileProgress)
      .leftJoin(obtainer, eq(obtainer.id, bingoTileProgress.obtainedBy))
      .leftJoin(adder, eq(adder.id, bingoTileProgress.addedBy));
  }

  private static toEntry(r: {
    entry: typeof bingoTileProgress.$inferSelect;
    obtainedByName: string | null;
    addedByName: string | null;
  }): ProgressEntry {
    const e = r.entry;
    return {
      id: e.id,
      teamId: e.teamId,
      tileId: e.tileId,
      amount: e.amount,
      itemId: e.itemId,
      obtainedBy: e.obtainedBy,
      obtainedByName: r.obtainedByName,
      obtainedRsn: e.obtainedRsn,
      source: e.source,
      addedByName: r.addedByName,
      note: e.note,
      addedAt: e.addedAt,
    };
  }

  async listForBoard(boardId: string): Promise<ProgressEntry[]> {
    const rows = await this.select()
      .innerJoin(bingoTeams, eq(bingoTeams.id, bingoTileProgress.teamId))
      .where(eq(bingoTeams.boardId, boardId))
      .orderBy(asc(bingoTileProgress.addedAt));
    return rows.map(DrizzleProgressRepository.toEntry);
  }

  async listFor(teamId: string, tileId: string): Promise<ProgressEntry[]> {
    const rows = await this.select()
      .where(and(eq(bingoTileProgress.teamId, teamId), eq(bingoTileProgress.tileId, tileId)))
      .orderBy(asc(bingoTileProgress.addedAt));
    return rows.map(DrizzleProgressRepository.toEntry);
  }

  async add(entry: NewProgressEntry): Promise<void> {
    await this.db().insert(bingoTileProgress).values(entry);
  }

  async removeLast(teamId: string, tileId: string): Promise<boolean> {
    const db = this.db();
    const [last] = await db
      .select({ id: bingoTileProgress.id })
      .from(bingoTileProgress)
      .where(and(eq(bingoTileProgress.teamId, teamId), eq(bingoTileProgress.tileId, tileId)))
      .orderBy(desc(bingoTileProgress.addedAt))
      .limit(1);
    if (!last) return false;
    await db.delete(bingoTileProgress).where(eq(bingoTileProgress.id, last.id));
    return true;
  }

  /** Blanks the member's RSNs in bingo history; their user id goes when the user row is deleted. */
  async forget(userId: string): Promise<void> {
    const db = this.db();
    await db.batch([
      db.update(bingoTileProgress).set({ obtainedRsn: null }).where(eq(bingoTileProgress.obtainedBy, userId)),
      db.update(bingoCompletions).set({ completedRsn: null }).where(eq(bingoCompletions.completedBy, userId)),
    ]);
  }
}
