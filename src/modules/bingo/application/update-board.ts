import { type Board, type BoardDetails, validateBoardDetails } from "../domain/board";
import type { BoardRepository, TileRepository } from "../domain/repositories";
import { fail, ok, type Result } from "./board-result";

/** An admin edits a board's details. Shrinking the grid removes tiles that no longer fit. */
export class UpdateBoard {
  constructor(
    private readonly boards: BoardRepository,
    private readonly tiles: TileRepository,
  ) {}

  async execute(boardId: string, details: BoardDetails): Promise<Result<Board>> {
    const board = await this.boards.findById(boardId);
    if (!board) return fail("That board doesn't exist.");
    if (board.status === "finished") return fail("Finished boards can't be changed.");
    const problem = validateBoardDetails(details);
    if (problem) return fail(problem);
    if (details.size !== board.size && board.status !== "draft") return fail("Change the size only while it's a draft.");

    const updated = await this.boards.updateDetails(boardId, { ...details, title: details.title.trim() });
    if (details.size < board.size) await this.tiles.removeOutside(boardId, details.size);
    return ok(updated);
  }
}
