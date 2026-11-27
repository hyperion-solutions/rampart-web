import "server-only";
import type { ItemSources } from "../../domain/item";
import type { ItemSourceReader } from "../../domain/item-source";

const RUNELITE_NAMES_URL = "https://static.runelite.net/cache/item/names.json";
const WIKI_MAPPING_URL = "https://prices.runescape.wiki/api/v1/osrs/mapping";

interface WikiMappingEntry {
  id: number;
  name: string;
  members?: boolean;
}

/** Adapter: downloads RuneLite's item names and the OSRS Wiki prices mapping, once each. */
export class HttpItemSourceReader implements ItemSourceReader {
  constructor(private readonly userAgent: string) {}

  async read(): Promise<ItemSources> {
    const [names, mapping] = await Promise.all([
      this.getJson<Record<string, string>>(RUNELITE_NAMES_URL),
      this.getJson<WikiMappingEntry[]>(WIKI_MAPPING_URL),
    ]);

    const allNames = new Map<number, string>();
    for (const [id, name] of Object.entries(names)) {
      const n = Number(id);
      if (Number.isInteger(n) && typeof name === "string") allNames.set(n, name);
    }
    const tradeables = mapping
      .filter((e) => Number.isInteger(e.id) && typeof e.name === "string")
      .map((e) => ({ id: e.id, name: e.name, members: e.members === true }));

    return { allNames, tradeables };
  }

  private async getJson<T>(url: string): Promise<T> {
    const res = await fetch(url, { headers: { "User-Agent": this.userAgent }, cache: "no-store" });
    if (!res.ok) throw new Error(`Item import: ${url} answered ${res.status}`);
    return (await res.json()) as T;
  }
}
