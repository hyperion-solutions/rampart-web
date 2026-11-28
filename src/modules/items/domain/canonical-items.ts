/** Port: maps any game item id (noted, placeholder, variant) to the canonical id tiles store. */
export interface CanonicalItemLookup {
  /** Ids not in the catalog are left out. */
  canonicalIds(ids: readonly number[]): Promise<ReadonlyMap<number, number>>;
}
