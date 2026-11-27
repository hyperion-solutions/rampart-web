import "server-only";
import { and, eq } from "drizzle-orm";
import { users } from "@/modules/accounts/infrastructure/db/schema";
import type { Completion, CompletionSource } from "../../domain/completion";
import type { CompletionRepository } from "../../domain/repositories";
import type { BingoDb } from "./client";
import { bingoCompletions, bingoTeams } from "./schema";

type CompletionRow = typeof bingoCompletions.$inferSelect;

const toCompletion = (r: CompletionRow, completedByName: string | null): Completion => ({
  id: r.id,
  teamId: r.teamId,
  tileId: r.tileId,
  completedAt: r.completedAt,
  source: r.source,
  markedBy: r.markedBy,
  note: r.note,
  completedBy: r.completedBy,
  completedByName,
  completedRsn: r.completedRsn,
});

export class DrizzleCompletionRepository implements CompletionRepository {
  constructor(private readonly db: () => BingoDb) {}

  async listForBoard(boardId: string): Promise<Completion[]> {
    const rows = await this.db()
      .select({ completion: bingoCompletions, completedByName: users.discordName })
      .from(bingoCompletions)
      .innerJoin(bingoTeams, eq(bingoTeams.id, bingoCompletions.teamId))
      .leftJoin(users, eq(users.id, bingoCompletions.completedBy))
      .where(eq(bingoTeams.boardId, boardId));
    return rows.map((r) => toCompletion(r.completion, r.completedByName));
  }

  async mark(input: {
    teamId: string;
    tileId: string;
    source: CompletionSource;
    markedBy: string | null;
    note: string | null;
    completedBy: string | null;
    completedRsn: string | null;
  }): Promise<Completion | null> {
    const [row] = await this.db().insert(bingoCompletions).values(input).onConflictDoNothing().returning();
    return row ? toCompletion(row, null) : null;
  }

  async unmark(teamId: string, tileId: string): Promise<void> {
    await this.db()
      .delete(bingoCompletions)
      .where(and(eq(bingoCompletions.teamId, teamId), eq(bingoCompletions.tileId, tileId)));
  }
}
