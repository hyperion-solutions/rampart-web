import { isLocked, lockedReason } from "../domain/board";
import type { BoardRepository, TileRepository } from "../domain/repositories";
import { fail, ok, type Result } from "./board-result";

/** Empties one square. */
export class ClearTile {
  constructor(
    private readonly boards: BoardRepository,
    private readonly tiles: TileRepository,
  ) {}

  async execute(boardId: string, row: number, col: number, now: Date = new Date()): Promise<Result<null>> {
    const board = await this.boards.findById(boardId);
    if (!board) return fail("That board doesn't exist.");
    if (isLocked(board, now)) return fail(lockedReason(board));
    await this.tiles.clear(boardId, row, col);
    return ok(null);
  }
}
