import { dueToFinish } from "../domain/board";
import type { BoardRepository } from "../domain/repositories";

/**
 * Daily: finishes live boards whose end was AUTO_FINISH_AFTER_HOURS ago or more, so their results
 * become final without an admin. Admins can still finish a board sooner. Returns the boards finished.
 */
export class FinishEndedBoards {
  constructor(private readonly boards: BoardRepository) {}

  async execute(now: Date = new Date()): Promise<{ readonly finished: readonly string[] }> {
    const due = (await this.boards.list(["live"])).filter((b) => dueToFinish(b, now));
    for (const board of due) await this.boards.setStatus(board.id, "finished");
    return { finished: due.map((b) => b.title) };
  }
}
