import type { ItemIdNormalizer } from "../domain/item-ids";
import type { BoardRepository, ProgressRepository, TeamRepository, TileRepository } from "../domain/repositories";
import type { ScreenshotStore } from "../domain/screenshot-store";
import type { AddTileProgress } from "./tile-progress";

export interface DinkDropsInput {
  /** The member whose linked account got the drop. */
  readonly userId: string;
  readonly rsn: string;
  readonly items: readonly { readonly itemId: number; readonly quantity: number }[];
  /** What dropped it, e.g. "Tombs of Amascut". Saved as the drop's note. */
  readonly source: string | null;
  /** Dink's screenshot (PNG or JPEG bytes): stored, resized, only if the loot counts. */
  readonly screenshot: Uint8Array | null;
}

export interface RecordedDrop {
  readonly boardId: string;
  readonly tileId: string;
  /** The (canonical) item that counted. */
  readonly itemId: number;
  readonly complete: boolean;
}

/** Why loot did or didn't count, for the logs (members test their Dink setup with real drops). */
export type DinkDropsOutcome =
  | "counted"
  | "no-running-board"
  | "not-on-a-team"
  | "item-not-on-a-tile"
  /** On a tile, but the tile is complete or an "all" tile already has the item. */
  | "nothing-new";

/** What happened to the screenshot: only counted loot with a screenshot is stored. */
export type ScreenshotOutcome = "stored" | "none" | "not-configured" | "failed";

export interface DinkDropsResult {
  readonly outcome: DinkDropsOutcome;
  readonly recorded: readonly RecordedDrop[];
  readonly screenshot: ScreenshotOutcome;
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
    private readonly progress: ProgressRepository,
    /** Null when no store is configured (e.g. local development): drops still count. */
    private readonly screenshots: ScreenshotStore | null,
  ) {}

  async execute(input: DinkDropsInput, now: Date = new Date()): Promise<DinkDropsResult> {
    const running = (await this.boards.list(["live"])).filter((b) => b.startsAt <= now && now <= b.endsAt);
    if (running.length === 0) return { outcome: "no-running-board", recorded: [], screenshot: "none" };

    const canonical = await this.itemIds.canonicalIds(input.items.map((i) => i.itemId));
    const drops = input.items.flatMap((i) => {
      const itemId = canonical.get(i.itemId);
      return itemId === undefined ? [] : [{ itemId, quantity: i.quantity }];
    });

    const recorded: RecordedDrop[] = [];
    const entryIds: string[] = [];
    let onATeam = false;
    let onATile = false;
    for (const board of running) {
      const member = (await this.teams.listMembers(board.id)).find((m) => m.userId === input.userId);
      if (!member) continue;
      onATeam = true;
      const tiles = await this.tiles.listForBoard(board.id);
      for (const drop of drops) {
        for (const tile of tiles.filter((t) => t.itemIds.includes(drop.itemId))) {
          onATile = true;
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
          if (result.ok) {
            recorded.push({ boardId: board.id, tileId: tile.id, itemId: drop.itemId, complete: result.value.complete });
            entryIds.push(result.value.entryId);
          }
        }
      }
    }
    const outcome: DinkDropsOutcome =
      recorded.length > 0 ? "counted" : !onATeam ? "not-on-a-team" : !onATile ? "item-not-on-a-tile" : "nothing-new";
    return { outcome, recorded, screenshot: await this.storeScreenshot(input.screenshot, entryIds) };
  }

  /** One stored copy for all the entries this loot added. Never undoes the drops if it fails. */
  private async storeScreenshot(image: Uint8Array | null, entryIds: readonly string[]): Promise<ScreenshotOutcome> {
    if (!image || entryIds.length === 0) return "none";
    if (!this.screenshots) return "not-configured";
    try {
      await this.progress.attachScreenshot(entryIds, await this.screenshots.save(image));
      return "stored";
    } catch (error) {
      // The drops are saved; only the picture is missing. Say why, for the logs.
      console.warn(`[dink] screenshot not stored: ${error instanceof Error ? error.message : String(error)}`);
      return "failed";
    }
  }
}
