import type { ItemIdNormalizer } from "../domain/item-ids";
import type { BoardRepository, TeamRepository, TileRepository } from "../domain/repositories";
import type { AddTileProgress } from "./tile-progress";

export interface DinkDropsInput {
  /** The member whose linked account got the drop. */
  readonly userId: string;
  readonly rsn: string;
  readonly items: readonly { readonly itemId: number; readonly quantity: number }[];
  /** What dropped it, e.g. "Tombs of Amascut". Saved as the drop's note. */
  readonly source: string | null;
}

export interface RecordedDrop {
  readonly boardId: string;
  readonly tileId: string;
  readonly complete: boolean;
}

/**
 * Counts a member's Dink loot on every live bingo board they play, while the board is running
 * (start to end). Each item that's on a tile is added like a manual drop (same rules for
 * "any"/"all" tiles and locking), with source "dink". Anything that doesn't fit is skipped.
 */
export class RecordDinkDrops {
  constructor(
    private readonly boards: BoardRepository,
    private readonly teams: TeamRepository,
    private readonly tiles: TileRepository,
    private readonly itemIds: ItemIdNormalizer,
    private readonly addProgress: AddTileProgress,
  ) {}

  async execute(input: DinkDropsInput, now: Date = new Date()): Promise<RecordedDrop[]> {
    const running = (await this.boards.list(["live"])).filter((b) => b.startsAt <= now && now <= b.endsAt);
    if (running.length === 0 || input.items.length === 0) return [];

    const canonical = await this.itemIds.canonicalIds(input.items.map((i) => i.itemId));
    const drops = input.items.flatMap((i) => {
      const itemId = canonical.get(i.itemId);
      return itemId === undefined ? [] : [{ itemId, quantity: i.quantity }];
    });
    if (drops.length === 0) return [];

    const recorded: RecordedDrop[] = [];
    for (const board of running) {
      const member = (await this.teams.listMembers(board.id)).find((m) => m.userId === input.userId);
      if (!member) continue;
      const tiles = await this.tiles.listForBoard(board.id);
      for (const drop of drops) {
        for (const tile of tiles.filter((t) => t.itemIds.includes(drop.itemId))) {
          // One at a time: two items in one loot can land on the same tile.
          const result = await this.addProgress.execute(
            {
              boardId: board.id,
              teamId: member.teamId,
              tileId: tile.id,
              amount: drop.quantity,
              itemId: drop.itemId,
              obtainedBy: input.userId,
              obtainedRsn: input.rsn,
              source: "dink",
              actor: null,
              note: input.source ? `From ${input.source}` : null,
            },
            now,
          );
          // Already complete, or an item an "all" tile already has: nothing to add.
          if (result.ok) recorded.push({ boardId: board.id, tileId: tile.id, complete: result.value.complete });
        }
      }
    }
    return recorded;
  }
}
