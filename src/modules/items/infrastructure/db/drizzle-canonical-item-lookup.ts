import "server-only";
import { inArray } from "drizzle-orm";
import type { CanonicalItemLookup } from "../../domain/canonical-items";
import type { ItemsDb } from "./client";
import { items } from "./schema";

/** Adapter: canonical ids from the items catalog. */
export class DrizzleCanonicalItemLookup implements CanonicalItemLookup {
  constructor(private readonly db: () => ItemsDb) {}

  async canonicalIds(ids: readonly number[]): Promise<ReadonlyMap<number, number>> {
    const unique = [...new Set(ids)];
    if (unique.length === 0) return new Map();
    const rows = await this.db()
      .select({ id: items.id, canonicalId: items.canonicalId })
      .from(items)
      .where(inArray(items.id, unique));
    return new Map(rows.map((r) => [r.id, r.canonicalId]));
  }
}
