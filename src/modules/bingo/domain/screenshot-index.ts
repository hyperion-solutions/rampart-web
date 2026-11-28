import type { StoredScreenshot } from "./screenshot-store";

/** Port: which drops link to which stored screenshots (docs/decisions/0005). */
export interface ScreenshotIndex {
  /** Screenshots of drops on boards that finished before `date`. */
  forBoardsFinishedBefore(date: Date): Promise<StoredScreenshot[]>;
  /** Screenshots of drops a member got (to delete with their data). */
  obtainedBy(userId: string): Promise<StoredScreenshot[]>;
  /** Every URL (full image and thumbnail) still linked to a drop. */
  referencedUrls(): Promise<ReadonlySet<string>>;
  /** Unlinks these screenshots (by full image URL) from their drops; the drops stay. */
  forget(urls: readonly string[]): Promise<void>;
}
