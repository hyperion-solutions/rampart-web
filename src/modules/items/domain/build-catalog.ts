import type { Item, ItemSources } from "./item";

/**
 * Merges the sources into one catalog (docs/decisions/0002-bingo.md):
 * - every id from either source; the Wiki's name wins when it has the id;
 * - one canonical id per name: the Wiki's id when the Wiki lists that name, otherwise the lowest id.
 */
export function buildCatalog({ allNames, tradeables }: ItemSources): Item[] {
  const wikiById = new Map(tradeables.map((t) => [t.id, t]));
  const wikiIdByName = new Map(tradeables.map((t) => [t.name, t.id]));

  const names = new Map<number, string>();
  for (const [id, name] of allNames) {
    const clean = name.trim();
    if (clean.length > 0 && clean.toLowerCase() !== "null") names.set(id, clean);
  }
  for (const t of tradeables) names.set(t.id, t.name);

  const lowestIdByName = new Map<string, number>();
  for (const [id, name] of names) {
    const current = lowestIdByName.get(name);
    if (current === undefined || id < current) lowestIdByName.set(name, id);
  }

  return [...names].map(([id, name]) => {
    const wiki = wikiById.get(id);
    return {
      id,
      name,
      // The lookup always succeeds: every name above was added to lowestIdByName.
      canonicalId: wikiIdByName.get(name) ?? lowestIdByName.get(name) ?? id,
      members: wiki ? wiki.members : null,
      tradeable: wiki !== undefined,
    };
  });
}
