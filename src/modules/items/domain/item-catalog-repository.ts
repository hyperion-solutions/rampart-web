import type { Item } from "./item";

/** Port: stores the item catalog. */
export interface ItemCatalogRepository {
  /** Inserts new items and updates existing ones. Returns how many rows were written. */
  upsertMany(items: readonly Item[]): Promise<number>;
  count(): Promise<{ readonly total: number; readonly searchable: number }>;
}
