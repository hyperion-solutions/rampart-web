import type { CompletionSource } from "./completion";
import { type Tile, tileTarget } from "./tile";

/** One addition toward a tile for a team: who got it, who added it, how many. */
export interface ProgressEntry {
  readonly id: string;
  readonly teamId: string;
  readonly tileId: string;
  readonly amount: number;
  readonly itemId: number | null;
  readonly obtainedBy: string | null;
  /** Display name of who got it; null once they deleted their data. */
  readonly obtainedByName: string | null;
  readonly obtainedRsn: string | null;
  readonly source: CompletionSource;
  readonly addedBy: string | null;
  readonly addedByName: string | null;
  readonly note: string | null;
  /** Resized screenshot of the drop and its thumbnail, when Dink sent one. */
  readonly screenshotUrl: string | null;
  readonly thumbnailUrl: string | null;
  readonly addedAt: Date;
}

export type NewProgressEntry = Pick<
  ProgressEntry,
  "teamId" | "tileId" | "amount" | "itemId" | "obtainedBy" | "obtainedRsn" | "source" | "note"
> & { readonly addedBy: string | null };

/**
 * How far a team is on a tile. For "any" tiles every drop counts toward the quantity; for "all"
 * tiles each listed item counts once. Completed tiles count as full even if marked before progress existed.
 */
export function tileProgress(
  tile: Pick<Tile, "rule" | "quantity" | "itemIds">,
  entries: readonly { readonly amount: number; readonly itemId: number | null }[],
  completed: boolean,
) {
  const target = tileTarget(tile);
  const obtainedItemIds =
    tile.rule === "all"
      ? [...new Set(entries.flatMap((e) => (e.itemId !== null && tile.itemIds.includes(e.itemId) ? [e.itemId] : [])))]
      : [];
  const counted = tile.rule === "all" ? obtainedItemIds.length : entries.reduce((sum, e) => sum + e.amount, 0);
  const done = completed ? target : Math.min(target, counted);
  return { done, target, remaining: Math.max(0, target - done), complete: completed || done >= target, obtainedItemIds };
}
