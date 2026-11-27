/** A searchable (canonical) item, ready to show. */
export interface ItemSummary {
  readonly id: number;
  readonly name: string;
  readonly iconUrl: string;
}

/** Port: finds canonical items by name. */
export interface ItemSearchRepository {
  /** Exact matches first, then names starting with the query, then names containing it. */
  search(query: string, limit: number): Promise<ItemSummary[]>;
  findByIds(ids: readonly number[]): Promise<ItemSummary[]>;
}
