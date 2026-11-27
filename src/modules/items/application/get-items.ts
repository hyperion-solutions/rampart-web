import type { ItemSearchRepository, ItemSummary } from "../domain/item-search";

/** Names and icons for item ids already stored elsewhere (e.g. on bingo tiles). */
export class GetItems {
  constructor(private readonly items: ItemSearchRepository) {}

  execute(ids: readonly number[]): Promise<ItemSummary[]> {
    return this.items.findByIds([...new Set(ids)]);
  }
}
