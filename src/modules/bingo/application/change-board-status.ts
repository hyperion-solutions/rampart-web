import { BACK_TO_DRAFT_BLOCKED, type Board, type BoardStatus, canChangeStatus, canGoBackToDraft } from "../domain/board";
import type { BoardRepository, CompletionRepository, ProgressRepository } from "../domain/repositories";
import { fail, ok, type Result } from "./board-result";

/**
 * Publish (draft → live), unpublish (live → draft) or finish (live → finished) a board.
 * Unpublishing is refused once the board has started and teams have drops (`canGoBackToDraft`).
 */
export class ChangeBoardStatus {
  constructor(
    private readonly boards: BoardRepository,
    private readonly progress: ProgressRepository,
    private readonly completions: CompletionRepository,
  ) {}

  async execute(boardId: string, to: BoardStatus, now: Date = new Date()): Promise<Result<Board>> {
    const board = await this.boards.findById(boardId);
    if (!board) return fail("That board doesn't exist.");
    if (!canChangeStatus(board.status, to)) return fail(`A ${board.status} board can't become ${to}.`);
    if (to === "draft") {
      // Completions can exist without progress entries (marked before progress existed).
      const [entries, completed] = await Promise.all([
        this.progress.listForBoard(boardId),
        this.completions.listForBoard(boardId),
      ]);
      if (!canGoBackToDraft(board, entries.length > 0 || completed.length > 0, now)) return fail(BACK_TO_DRAFT_BLOCKED);
    }
    return ok(await this.boards.setStatus(boardId, to));
  }
}
