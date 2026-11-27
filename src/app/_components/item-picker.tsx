"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";

export interface PickedItem {
  readonly id: number;
  readonly name: string;
  readonly iconUrl: string;
}

/** RuneLite item icons are 36x32 pixel art; show them at native size. */
export function ItemIcon({ item }: { item: PickedItem }) {
  return <Image src={item.iconUrl} alt="" width={36} height={32} quality={100} className="pixelated shrink-0" />;
}

/**
 * Type to search the item catalog, then pick one or more items (admins only: uses /api/items/search).
 * Reused by the bingo board editor.
 */
export function ItemPicker({
  value,
  onChange,
  multiple = true,
}: {
  value: readonly PickedItem[];
  onChange: (items: PickedItem[]) => void;
  multiple?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PickedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const listId = useId();

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/items/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const data = res.ok ? ((await res.json()) as { items: PickedItem[] }) : { items: [] };
        setResults(data.items);
      } catch {
        // Aborted by a newer keystroke.
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const selected = new Set(value.map((i) => i.id));

  function pick(item: PickedItem) {
    if (selected.has(item.id)) return;
    onChange(multiple ? [...value, item] : [item]);
    setQuery("");
    setResults([]);
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((item) => (
            <li key={item.id} className="flex items-center gap-2 bg-granite px-2 py-1">
              <ItemIcon item={item} />
              <span className="font-pixel text-pixel text-limestone text-shadow-pixel">{item.name}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((i) => i.id !== item.id))}
                aria-label={`Remove ${item.name}`}
                className="px-1 font-pixel text-pixel text-steel hover:text-banner"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search items, e.g. whip"
          aria-controls={listId}
          className="block w-full border-4 border-black bg-obsidian px-3 py-2 font-pixel text-pixel text-limestone outline-none placeholder:text-steel/60 focus:border-rune"
        />
        {loading && <span className="absolute top-3 right-3 font-pixel text-pixel text-steel">...</span>}
      </div>

      {results.length > 0 && (
        <ul id={listId} className="pixel-box max-h-72 overflow-y-auto">
          {results.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => pick(item)}
                disabled={selected.has(item.id)}
                className="flex w-full items-center gap-3 px-3 py-1.5 text-left hover:bg-rune/30 disabled:opacity-40"
              >
                <ItemIcon item={item} />
                <span className="font-pixel text-pixel text-limestone text-shadow-pixel">{item.name}</span>
                <span className="ml-auto text-steel">#{item.id}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {query.trim().length >= 2 && !loading && results.length === 0 && (
        <p className="text-steel text-shadow-pixel">No items match &ldquo;{query.trim()}&rdquo;.</p>
      )}
    </div>
  );
}
