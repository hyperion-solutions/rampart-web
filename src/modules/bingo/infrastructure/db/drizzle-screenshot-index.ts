import "server-only";
import { and, eq, inArray, isNotNull, lt } from "drizzle-orm";
import type { ScreenshotIndex } from "../../domain/screenshot-index";
import type { StoredScreenshot } from "../../domain/screenshot-store";
import type { BingoDb } from "./client";
import { bingoBoards, bingoTeams, bingoTileProgress } from "./schema";

const unique = (rows: { url: string | null; thumbnailUrl: string | null }[]): StoredScreenshot[] => {
  const byUrl = new Map<string, StoredScreenshot>();
  for (const r of rows) if (r.url && r.thumbnailUrl) byUrl.set(r.url, { url: r.url, thumbnailUrl: r.thumbnailUrl });
  return [...byUrl.values()];
};

/** Adapter: screenshot links on `bingo_tile_progress`. One loot's screenshot can be on several entries. */
export class DrizzleScreenshotIndex implements ScreenshotIndex {
  constructor(private readonly db: () => BingoDb) {}

  async forBoardsFinishedBefore(date: Date): Promise<StoredScreenshot[]> {
    // Finished boards can't change, so their last update is when they finished.
    const rows = await this.db()
      .select({ url: bingoTileProgress.screenshotUrl, thumbnailUrl: bingoTileProgress.thumbnailUrl })
      .from(bingoTileProgress)
      .innerJoin(bingoTeams, eq(bingoTeams.id, bingoTileProgress.teamId))
      .innerJoin(bingoBoards, eq(bingoBoards.id, bingoTeams.boardId))
      .where(and(eq(bingoBoards.status, "finished"), lt(bingoBoards.updatedAt, date), isNotNull(bingoTileProgress.screenshotUrl)));
    return unique(rows);
  }

  async obtainedBy(userId: string): Promise<StoredScreenshot[]> {
    const rows = await this.db()
      .select({ url: bingoTileProgress.screenshotUrl, thumbnailUrl: bingoTileProgress.thumbnailUrl })
      .from(bingoTileProgress)
      .where(and(eq(bingoTileProgress.obtainedBy, userId), isNotNull(bingoTileProgress.screenshotUrl)));
    return unique(rows);
  }

  async referencedUrls(): Promise<ReadonlySet<string>> {
    const rows = await this.db()
      .selectDistinct({ url: bingoTileProgress.screenshotUrl, thumbnailUrl: bingoTileProgress.thumbnailUrl })
      .from(bingoTileProgress)
      .where(isNotNull(bingoTileProgress.screenshotUrl));
    return new Set(rows.flatMap((r) => [r.url, r.thumbnailUrl].filter((u): u is string => u !== null)));
  }

  async forget(urls: readonly string[]): Promise<void> {
    if (urls.length === 0) return;
    await this.db()
      .update(bingoTileProgress)
      .set({ screenshotUrl: null, thumbnailUrl: null })
      .where(inArray(bingoTileProgress.screenshotUrl, [...urls]));
  }
}
