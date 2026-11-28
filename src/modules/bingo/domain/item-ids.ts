/** Port: maps game item ids (as Dink reports them) to the canonical ids tiles store. Wired to the items module. */
export interface ItemIdNormalizer {
  /** Ids not in the catalog are left out. */
  canonicalIds(ids: readonly number[]): Promise<ReadonlyMap<number, number>>;
}
