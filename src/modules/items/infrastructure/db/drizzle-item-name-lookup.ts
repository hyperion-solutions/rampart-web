import "server-only";
import { inArray } from "drizzle-orm";
import type { ItemNameLookup } from "../../domain/item-names";
import type { ItemsDb } from "./client";
import { items } from "./schema";

/** Adapter: names of every catalog row that points to the given canonical ids. */
export class DrizzleItemNameLookup implements ItemNameLookup {
  constructor(private readonly db: () => ItemsDb) {}

  async allNames(canonicalIds: readonly number[]): Promise<string[]> {
    const rows = await this.db()
      .selectDistinct({ name: items.name })
      .from(items)
      .where(inArray(items.canonicalId, [...new Set(canonicalIds)]));
    return rows.map((r) => r.name);
  }
}
