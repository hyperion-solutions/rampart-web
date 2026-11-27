import type { ItemSummary } from "./item-search";

/** Port: picks random real items, e.g. to fill a test bingo board. */
export interface RandomItemPicker {
  /** Up to `count` different tradeable items, in random order. */
  pick(count: number): Promise<ItemSummary[]>;
}
