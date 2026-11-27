import type { ItemSearchRepository, ItemSummary } from "../domain/item-search";

const MAX_RESULTS = 20;

/** Item search for the bingo board editor. Short or empty queries return nothing. */
export class SearchItems {
  constructor(private readonly items: ItemSearchRepository) {}

  execute(query: string, limit = MAX_RESULTS): Promise<ItemSummary[]> {
    const q = query.trim();
    if (q.length < 2) return Promise.resolve([]);
    return this.items.search(q.slice(0, 50), Math.min(limit, MAX_RESULTS));
  }
}
