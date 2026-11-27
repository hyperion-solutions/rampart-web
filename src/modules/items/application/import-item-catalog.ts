import { buildCatalog } from "../domain/build-catalog";
import type { ItemCatalogRepository } from "../domain/item-catalog-repository";
import type { ItemSourceReader } from "../domain/item-source";

export interface ImportSummary {
  readonly written: number;
  readonly total: number;
  readonly searchable: number;
}

/** Refreshes the item catalog from RuneLite and the OSRS Wiki. Safe to re-run. */
export class ImportItemCatalog {
  constructor(
    private readonly sources: ItemSourceReader,
    private readonly catalog: ItemCatalogRepository,
  ) {}

  async execute(): Promise<ImportSummary> {
    const items = buildCatalog(await this.sources.read());
    if (items.length < 10_000) {
      throw new Error(`Item import aborted: only ${items.length} items from the sources (expected 20,000+)`);
    }
    const written = await this.catalog.upsertMany(items);
    return { written, ...(await this.catalog.count()) };
  }
}
