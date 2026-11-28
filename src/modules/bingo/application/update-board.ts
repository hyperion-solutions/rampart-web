import { type Board, type BoardDetails, isLocked, validateBoardDetails } from "../domain/board";
import type { BoardRepository, TileRepository } from "../domain/repositories";
import { fail, ok, type Result } from "./board-result";

/**
 * An admin edits a board's details. Shrinking the grid removes tiles that no longer fit.
 * Once a board has started, only the title, rules and end date can change: the start and the
 * bonuses decide scores.
 */
export class UpdateBoard {
  constructor(
    private readonly boards: BoardRepository,
    private readonly tiles: TileRepository,
  ) {}

  async execute(boardId: string, details: BoardDetails, now: Date = new Date()): Promise<Result<Board>> {
    const board = await this.boards.findById(boardId);
    if (!board) return fail("That board doesn't exist.");
    if (board.status === "finished") return fail("Finished boards can't be changed.");
    const problem = validateBoardDetails(details);
    if (problem) return fail(problem);
    if (details.size !== board.size && board.status !== "draft") return fail("Change the size only while it's a draft.");
    if (isLocked(board, now)) {
      const sameBonuses = (Object.keys(board.bonuses) as (keyof typeof board.bonuses)[]).every(
        (k) => board.bonuses[k] === details.bonuses[k],
      );
      // The form sends times to the minute.
      const minute = (d: Date) => Math.floor(d.getTime() / 60_000);
      if (minute(details.startsAt) !== minute(board.startsAt) || !sameBonuses) {
        return fail("This board has started: only the title, rules and end date can change.");
      }
    }

    const updated = await this.boards.updateDetails(boardId, {
      ...details,
      title: details.title.trim(),
      // Started boards keep their exact start (the form only has minutes).
      startsAt: isLocked(board, now) ? board.startsAt : details.startsAt,
    });
    if (details.size < board.size) await this.tiles.removeOutside(boardId, details.size);
    return ok(updated);
  }
}
