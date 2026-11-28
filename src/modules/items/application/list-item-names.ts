import type { ItemNameLookup } from "../domain/item-names";

/** Every name the given items go by, sorted and without case-only duplicates. */
export class ListItemNames {
  constructor(private readonly names: ItemNameLookup) {}

  async execute(canonicalIds: readonly number[]): Promise<string[]> {
    if (canonicalIds.length === 0) return [];
    const byLower = new Map<string, string>();
    for (const name of await this.names.allNames(canonicalIds)) {
      const key = name.toLowerCase();
      if (!byLower.has(key)) byLower.set(key, name);
    }
    return [...byLower.values()].sort((a, b) => a.localeCompare(b));
  }
}
