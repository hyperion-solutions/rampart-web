import type { BoardRepository, TileRepository } from "../domain/repositories";

/**
 * Items Dink should always report: those on tiles of boards that are published (live) and
 * haven't ended, including boards that haven't started yet, so members' Dink picks them up
 * before the start (it refreshes at most every 3 hours). Drafts and finished boards are left out.
 */
export class ListTrackedItemIds {
  constructor(
    private readonly boards: BoardRepository,
    private readonly tiles: TileRepository,
  ) {}

  async execute(now: Date = new Date()): Promise<number[]> {
    const boards = (await this.boards.list(["live"])).filter((b) => b.endsAt > now);
    const tiles = await Promise.all(boards.map((b) => this.tiles.listForBoard(b.id)));
    return [...new Set(tiles.flat().flatMap((t) => t.itemIds))];
  }
}
