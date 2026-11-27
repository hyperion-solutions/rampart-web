import type { RandomItemSource } from "../domain/random-item-source";
import type { BoardRepository, TileRepository } from "../domain/repositories";
import { fail, ok, type Result } from "./board-result";

/** Points a random square is worth. Admins can change any square afterwards. */
const RANDOM_TILE_POINTS = 10;

/** Fills every empty square of a draft board with a random item. Squares already filled are kept. */
export class FillBoardRandomly {
  constructor(
    private readonly boards: BoardRepository,
    private readonly tiles: TileRepository,
    private readonly items: RandomItemSource,
  ) {}

  /** Returns how many squares were filled. */
  async execute(boardId: string): Promise<Result<number>> {
    const board = await this.boards.findById(boardId);
    if (!board) return fail("That board doesn't exist.");
    if (board.status !== "draft") return fail("Only draft boards can be filled at random.");

    const existing = await this.tiles.listForBoard(boardId);
    const taken = new Set(existing.map((t) => `${t.row}:${t.col}`));
    const used = new Set(existing.flatMap((t) => t.itemIds));
    const empty: { row: number; col: number }[] = [];
    for (let row = 0; row < board.size; row++) {
      for (let col = 0; col < board.size; col++) {
        if (!taken.has(`${row}:${col}`)) empty.push({ row, col });
      }
    }
    if (empty.length === 0) return ok(0);

    // Ask for extra so items already on the board can be skipped.
    const picked = (await this.items.pick(empty.length + used.size)).filter((i) => !used.has(i.id));
    const squares = empty.slice(0, picked.length);
    await Promise.all(
      squares.map(({ row, col }, i) => {
        const item = picked[i];
        if (!item) return Promise.resolve();
        return this.tiles.save(boardId, {
          row,
          col,
          name: item.name.slice(0, 60),
          points: RANDOM_TILE_POINTS,
          quantity: 1,
          rule: "any",
          description: null,
          iconItemId: item.id,
          itemIds: [item.id],
        });
      }),
    );
    return ok(squares.length);
  }
}
