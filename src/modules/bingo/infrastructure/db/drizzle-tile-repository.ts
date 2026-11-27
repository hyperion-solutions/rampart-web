import "server-only";
import { and, eq, gte, inArray, or } from "drizzle-orm";
import type { TileRepository } from "../../domain/repositories";
import type { Tile, TileInput } from "../../domain/tile";
import type { BingoDb } from "./client";
import { bingoTileItems, bingoTiles } from "./schema";

type TileRow = typeof bingoTiles.$inferSelect;

const toTile = (r: TileRow, itemIds: number[]): Tile => ({
  id: r.id,
  boardId: r.boardId,
  row: r.row,
  col: r.col,
  name: r.name,
  points: r.points,
  quantity: r.quantity,
  description: r.description,
  iconItemId: r.iconItemId,
  itemIds,
});

export class DrizzleTileRepository implements TileRepository {
  constructor(private readonly db: () => BingoDb) {}

  async listForBoard(boardId: string): Promise<Tile[]> {
    const db = this.db();
    const rows = await db.select().from(bingoTiles).where(eq(bingoTiles.boardId, boardId));
    if (rows.length === 0) return [];
    const links = await db
      .select()
      .from(bingoTileItems)
      .where(inArray(bingoTileItems.tileId, rows.map((r) => r.id)));
    const itemsByTile = new Map<string, number[]>();
    for (const l of links) itemsByTile.set(l.tileId, [...(itemsByTile.get(l.tileId) ?? []), l.itemId]);
    return rows.map((r) => toTile(r, itemsByTile.get(r.id) ?? []));
  }

  async save(boardId: string, tile: TileInput): Promise<Tile> {
    const db = this.db();
    const { itemIds, ...fields } = tile;
    const [row] = await db
      .insert(bingoTiles)
      .values({ boardId, ...fields })
      .onConflictDoUpdate({
        target: [bingoTiles.boardId, bingoTiles.row, bingoTiles.col],
        set: {
          name: fields.name,
          points: fields.points,
          quantity: fields.quantity,
          description: fields.description,
          iconItemId: fields.iconItemId,
        },
      })
      .returning();
    if (!row) throw new Error(`Could not save the tile at row ${tile.row}, column ${tile.col}`);

    const unique = [...new Set(itemIds)];
    await db.delete(bingoTileItems).where(eq(bingoTileItems.tileId, row.id));
    if (unique.length > 0) {
      await db.insert(bingoTileItems).values(unique.map((itemId) => ({ tileId: row.id, itemId })));
    }
    return toTile(row, unique);
  }

  async clear(boardId: string, row: number, col: number): Promise<void> {
    await this.db()
      .delete(bingoTiles)
      .where(and(eq(bingoTiles.boardId, boardId), eq(bingoTiles.row, row), eq(bingoTiles.col, col)));
  }

  async removeOutside(boardId: string, size: number): Promise<number> {
    const removed = await this.db()
      .delete(bingoTiles)
      .where(and(eq(bingoTiles.boardId, boardId), or(gte(bingoTiles.row, size), gte(bingoTiles.col, size))))
      .returning({ id: bingoTiles.id });
    return removed.length;
  }
}
