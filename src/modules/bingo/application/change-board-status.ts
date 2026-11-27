import { type Board, type BoardStatus, canChangeStatus } from "../domain/board";
import type { BoardRepository } from "../domain/repositories";
import { fail, ok, type Result } from "./board-result";

/** Publish (draft → live), unpublish (live → draft) or finish (live → finished) a board. */
export class ChangeBoardStatus {
  constructor(private readonly boards: BoardRepository) {}

  async execute(boardId: string, to: BoardStatus): Promise<Result<Board>> {
    const board = await this.boards.findById(boardId);
    if (!board) return fail("That board doesn't exist.");
    if (!canChangeStatus(board.status, to)) return fail(`A ${board.status} board can't become ${to}.`);
    return ok(await this.boards.setStatus(boardId, to));
  }
}
