import "server-only";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import type { ItemSearchRepository, ItemSummary } from "../../domain/item-search";
import { itemIconUrl } from "../runelite-assets";
import type { ItemsDb } from "./client";
import { items } from "./schema";

/** Escapes LIKE wildcards so "%" or "_" in a query match literally. */
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

const toSummary = (row: { id: number; name: string }): ItemSummary => ({
  id: row.id,
  name: row.name,
  iconUrl: itemIconUrl(row.id),
});

/** Adapter: item search on Postgres. ~12,700 canonical rows, so a scan is a few milliseconds. */
export class DrizzleItemSearchRepository implements ItemSearchRepository {
  constructor(private readonly db: () => ItemsDb) {}

  async search(query: string, limit: number): Promise<ItemSummary[]> {
    const q = query.toLowerCase();
    const contains = `%${escapeLike(q)}%`;
    const prefix = `${escapeLike(q)}%`;
    const rows = await this.db()
      .select({ id: items.id, name: items.name })
      .from(items)
      .where(and(eq(items.id, items.canonicalId), sql`lower(${items.name}) like ${contains}`))
      .orderBy(
        sql`case when lower(${items.name}) = ${q} then 0 when lower(${items.name}) like ${prefix} then 1 else 2 end`,
        sql`length(${items.name})`,
        asc(items.name),
      )
      .limit(limit);
    return rows.map(toSummary);
  }

  async findByIds(ids: readonly number[]): Promise<ItemSummary[]> {
    if (ids.length === 0) return [];
    const rows = await this.db()
      .select({ id: items.id, name: items.name })
      .from(items)
      .where(inArray(items.id, [...ids]));
    return rows.map(toSummary);
  }
}
