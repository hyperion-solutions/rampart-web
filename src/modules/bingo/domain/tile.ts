/**
 * How a tile's items count:
 * - "any": any of the items count toward the quantity (e.g. any 3 Godwars hilts);
 * - "all": every item is needed once (e.g. both crowns for a Twinflame).
 */
export type TileRule = "any" | "all";

export const TILE_RULES: readonly TileRule[] = ["any", "all"];

/** One square of a board. Completed by its items (see TileRule), or a text-only goal when it has none. */
export interface Tile {
  readonly id: string;
  readonly boardId: string;
  readonly row: number;
  readonly col: number;
  readonly name: string;
  readonly points: number;
  /** How many of the items are needed, e.g. 3 for "x3". Always 1 for "all" tiles. */
  readonly quantity: number;
  readonly rule: TileRule;
  readonly description: string | null;
  /** Item whose icon the tile shows. */
  readonly iconItemId: number | null;
  /** Item ids that complete the tile (any one of them). Empty for text-only tiles. */
  readonly itemIds: readonly number[];
}

export type TileInput = Omit<Tile, "id" | "boardId">;

export function validateTile(tile: TileInput, boardSize: number): string | null {
  const inGrid = (n: number) => Number.isInteger(n) && n >= 0 && n < boardSize;
  if (!inGrid(tile.row) || !inGrid(tile.col)) return "That square isn't on the board.";
  if (tile.name.trim().length === 0) return "Give the tile a name.";
  if (tile.name.length > 60) return "Keep the tile name under 60 characters.";
  if (!Number.isInteger(tile.points) || tile.points < 0 || tile.points > 1000) return "Points must be 0 to 1000.";
  if (!Number.isInteger(tile.quantity) || tile.quantity < 1 || tile.quantity > 1000) return "Quantity must be 1 to 1000.";
  if (tile.itemIds.length > 50) return "A tile can list at most 50 items.";
  if (!TILE_RULES.includes(tile.rule)) return "Choose whether any or all of the items are needed.";
  if (tile.rule === "all" && new Set(tile.itemIds).size < 2) return "Add at least 2 items to need all of them.";
  return null;
}

/** How many drops complete the tile: its quantity, or one of each item for "all" tiles. */
export const tileTarget = (tile: Pick<Tile, "rule" | "quantity" | "itemIds">): number =>
  tile.rule === "all" ? new Set(tile.itemIds).size : tile.quantity;
