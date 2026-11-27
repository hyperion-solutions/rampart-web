import type { ItemSources } from "./item";

/** Port: downloads the raw item lists. */
export interface ItemSourceReader {
  read(): Promise<ItemSources>;
}
