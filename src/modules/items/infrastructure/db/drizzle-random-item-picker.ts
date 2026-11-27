import "server-only";
import { and, eq, sql } from "drizzle-orm";
import type { RandomItemPicker } from "../../domain/random-items";
import type { ItemSummary } from "../../domain/item-search";
import { itemIconUrl } from "../runelite-assets";
import type { ItemsDb } from "./client";
import { items } from "./schema";

/**
 * Adapter: random canonical tradeable items. Tradeable items are real, obtainable things with
 * icons (no quest props or placeholders). A few thousand rows, so `order by random()` is cheap.
 */
export class DrizzleRandomItemPicker implements RandomItemPicker {
  constructor(private readonly db: () => ItemsDb) {}

  async pick(count: number): Promise<ItemSummary[]> {
    if (count <= 0) return [];
    const rows = await this.db()
      .select({ id: items.id, name: items.name })
      .from(items)
      .where(and(eq(items.id, items.canonicalId), eq(items.tradeable, true)))
      .orderBy(sql`random()`)
      .limit(count);
    return rows.map((r) => ({ id: r.id, name: r.name, iconUrl: itemIconUrl(r.id) }));
  }
}
