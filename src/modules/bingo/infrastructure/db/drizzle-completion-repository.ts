import "server-only";
import { and, eq } from "drizzle-orm";
import type { Completion, CompletionSource } from "../../domain/completion";
import type { CompletionRepository } from "../../domain/repositories";
import type { BingoDb } from "./client";
import { bingoCompletions, bingoTeams } from "./schema";

type CompletionRow = typeof bingoCompletions.$inferSelect;

const toCompletion = (r: CompletionRow): Completion => ({
  id: r.id,
  teamId: r.teamId,
  tileId: r.tileId,
  completedAt: r.completedAt,
  source: r.source,
  markedBy: r.markedBy,
  note: r.note,
});

export class DrizzleCompletionRepository implements CompletionRepository {
  constructor(private readonly db: () => BingoDb) {}

  async listForBoard(boardId: string): Promise<Completion[]> {
    const rows = await this.db()
      .select({ completion: bingoCompletions })
      .from(bingoCompletions)
      .innerJoin(bingoTeams, eq(bingoTeams.id, bingoCompletions.teamId))
      .where(eq(bingoTeams.boardId, boardId));
    return rows.map((r) => toCompletion(r.completion));
  }

  async mark(input: {
    teamId: string;
    tileId: string;
    source: CompletionSource;
    markedBy: string | null;
    note: string | null;
  }): Promise<Completion | null> {
    const [row] = await this.db().insert(bingoCompletions).values(input).onConflictDoNothing().returning();
    return row ? toCompletion(row) : null;
  }

  async unmark(teamId: string, tileId: string): Promise<void> {
    await this.db()
      .delete(bingoCompletions)
      .where(and(eq(bingoCompletions.teamId, teamId), eq(bingoCompletions.tileId, tileId)));
  }
}
