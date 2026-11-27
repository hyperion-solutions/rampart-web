import type { BoardRepository, TileRepository } from "../domain/repositories";
import { fail, ok, type Result } from "./board-result";

/** Empties one square. */
export class ClearTile {
  constructor(
    private readonly boards: BoardRepository,
    private readonly tiles: TileRepository,
  ) {}

  async execute(boardId: string, row: number, col: number): Promise<Result<null>> {
    const board = await this.boards.findById(boardId);
    if (!board) return fail("That board doesn't exist.");
    if (board.status === "finished") return fail("Finished boards can't be changed.");
    await this.tiles.clear(boardId, row, col);
    return ok(null);
  }
}
