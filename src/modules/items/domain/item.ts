/** An OSRS item, keyed by its game item id. */
export interface Item {
  readonly id: number;
  readonly name: string;
  /** The id search shows for this name (noted, placeholder and variant ids point to it). */
  readonly canonicalId: number;
  /** Known for tradeable items (from the OSRS Wiki); null when unknown. */
  readonly members: boolean | null;
  readonly tradeable: boolean;
}

/** Raw lists the catalog is built from. */
export interface ItemSources {
  /** Every item id with its in-game name (RuneLite). Names repeat for noted/placeholder/variant ids. */
  readonly allNames: ReadonlyMap<number, string>;
  /** Tradeable items with disambiguated names (OSRS Wiki). */
  readonly tradeables: readonly { readonly id: number; readonly name: string; readonly members: boolean }[];
}
