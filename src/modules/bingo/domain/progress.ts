import type { CompletionSource } from "./completion";

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
  readonly addedByName: string | null;
  readonly note: string | null;
  readonly addedAt: Date;
}

export type NewProgressEntry = Pick<
  ProgressEntry,
  "teamId" | "tileId" | "amount" | "itemId" | "obtainedBy" | "obtainedRsn" | "source" | "note"
> & { readonly addedBy: string | null };

/** How far a team is on a tile. Completed tiles count as full even if added before progress existed. */
export function tileProgress(quantity: number, entries: readonly { amount: number }[], completed: boolean) {
  const counted = Math.min(quantity, entries.reduce((sum, e) => sum + e.amount, 0));
  const done = completed ? quantity : counted;
  return { done, quantity, remaining: Math.max(0, quantity - done), complete: completed || done >= quantity };
}
