import type { ScreenshotIndex } from "../domain/screenshot-index";
import type { ScreenshotStore } from "../domain/screenshot-store";

const DAY_MS = 24 * 60 * 60 * 1000;
/** How long screenshots stay after a board finishes (privacy page, docs/decisions/0005). */
export const SCREENSHOT_RETENTION_DAYS = 30;
/** Files this new may still be about to be linked to their drop (upload, then link). */
const ORPHAN_GRACE_MS = 60 * 60 * 1000;

export interface ScreenshotCleanUp {
  /** Screenshots of boards finished more than 30 days ago. */
  readonly expired: number;
  /** Stored files no drop links to (undone drops, removed teams, interrupted uploads). */
  readonly orphans: number;
}

/** Daily: deletes old screenshots, then any stored file no drop uses. The drops themselves stay. */
export class CleanUpScreenshots {
  constructor(
    private readonly index: ScreenshotIndex,
    private readonly store: ScreenshotStore,
  ) {}

  async execute(now: Date = new Date()): Promise<ScreenshotCleanUp> {
    const expired = await this.index.forBoardsFinishedBefore(new Date(now.getTime() - SCREENSHOT_RETENTION_DAYS * DAY_MS));
    if (expired.length > 0) {
      // Unlink first: if deleting the files fails, the orphan sweep tries again tomorrow.
      await this.index.forget(expired.map((s) => s.url));
      await this.store.delete(expired.flatMap((s) => [s.url, s.thumbnailUrl]));
    }

    const [stored, referenced] = await Promise.all([this.store.listStored(), this.index.referencedUrls()]);
    const orphans = stored
      .filter((f) => !referenced.has(f.url) && now.getTime() - f.uploadedAt.getTime() > ORPHAN_GRACE_MS)
      .map((f) => f.url);
    await this.store.delete(orphans);

    return { expired: expired.length, orphans: orphans.length };
  }
}
