import type { BoardRepository, TileRepository } from "../domain/repositories";
import { type Tile, type TileInput, validateTile } from "../domain/tile";
import { fail, ok, type Result } from "./board-result";

/** Fills or replaces one square. The tile shows its first item's icon unless one is chosen. */
export class SaveTile {
  constructor(
    private readonly boards: BoardRepository,
    private readonly tiles: TileRepository,
  ) {}

  async execute(boardId: string, input: TileInput): Promise<Result<Tile>> {
    const board = await this.boards.findById(boardId);
    if (!board) return fail("That board doesn't exist.");
    if (board.status === "finished") return fail("Finished boards can't be changed.");
    const problem = validateTile(input, board.size);
    if (problem) return fail(problem);
    return ok(
      await this.tiles.save(boardId, {
        ...input,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        iconItemId: input.iconItemId ?? input.itemIds[0] ?? null,
      }),
    );
  }
}
