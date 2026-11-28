/** Port: every name an item goes by (Wiki name and in-game names of its noted/variant ids). */
export interface ItemNameLookup {
  /** All distinct names of the given canonical items, for matching by name (e.g. Dink's allowlist). */
  allNames(canonicalIds: readonly number[]): Promise<string[]>;
}
