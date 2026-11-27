import "server-only";
import { count, eq, sql } from "drizzle-orm";
import type { Item } from "../../domain/item";
import type { ItemCatalogRepository } from "../../domain/item-catalog-repository";
import type { ItemsDb } from "./client";
import { items } from "./schema";

const BATCH_SIZE = 1000;

/** Adapter: ItemCatalogRepository on Postgres via Drizzle. */
export class DrizzleItemCatalogRepository implements ItemCatalogRepository {
  constructor(private readonly db: () => ItemsDb) {}

  async upsertMany(rows: readonly Item[]): Promise<number> {
    const db = this.db();
    let written = 0;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      await db
        .insert(items)
        .values(batch.map((r) => ({ ...r })))
        .onConflictDoUpdate({
          target: items.id,
          set: {
            name: sql`excluded.name`,
            canonicalId: sql`excluded.canonical_id`,
            members: sql`excluded.members`,
            tradeable: sql`excluded.tradeable`,
            updatedAt: sql`now()`,
          },
        });
      written += batch.length;
    }
    return written;
  }

  async count(): Promise<{ total: number; searchable: number }> {
    const db = this.db();
    const [[all], [canonical]] = await Promise.all([
      db.select({ n: count() }).from(items),
      db.select({ n: count() }).from(items).where(eq(items.id, items.canonicalId)),
    ]);
    return { total: all?.n ?? 0, searchable: canonical?.n ?? 0 };
  }
}
