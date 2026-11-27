import type { BoardRepository, TileRepository } from "../domain/repositories";
import { fail, ok, type Result } from "./board-result";

/** Empties every square of a draft board. Live boards are refused: it would wipe teams' progress. */
export class ClearBoard {
  constructor(
    private readonly boards: BoardRepository,
    private readonly tiles: TileRepository,
  ) {}

  /** Returns how many squares were emptied. */
  async execute(boardId: string): Promise<Result<number>> {
    const board = await this.boards.findById(boardId);
    if (!board) return fail("That board doesn't exist.");
    if (board.status !== "draft") return fail("Only draft boards can be cleared.");
    return ok(await this.tiles.clearAll(boardId));
  }
}
