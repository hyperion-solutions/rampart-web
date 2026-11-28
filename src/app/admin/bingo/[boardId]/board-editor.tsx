"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ItemIcon, ItemPicker, type PickedItem } from "@/app/_components/item-picker";
import { clearTileAction, saveTileAction } from "../actions";

export interface EditorTile {
  readonly row: number;
  readonly col: number;
  readonly name: string;
  readonly points: number;
  readonly quantity: number;
  /** "any": any items count toward the quantity; "all": every item is needed once. */
  readonly rule: "any" | "all";
  readonly description: string | null;
  readonly iconItemId: number | null;
  readonly itemIds: readonly number[];
}

type ItemsById = Readonly<Record<number, PickedItem>>;

const inputClass =
  "mt-1 block w-full border-4 border-black bg-obsidian px-3 py-2 font-pixel text-pixel text-limestone outline-none focus:border-rune";

/**
 * The admin's board editor: click a square, then fill it in the panel.
 * Keyboard: Tab, Shift+Tab or the arrow keys move between squares (the panel follows), Enter jumps
 * into the square's item search, Esc goes back to the square, and saving moves to the next square.
 */
export function BoardEditor({
  boardId,
  size,
  tiles,
  items,
  readOnly,
}: {
  boardId: string;
  size: number;
  tiles: readonly EditorTile[];
  items: ItemsById;
  readOnly: boolean;
}) {
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const byPosition = new Map(tiles.map((t) => [`${t.row}:${t.col}`, t]));
  const current = selected ? byPosition.get(`${selected.row}:${selected.col}`) : undefined;
  const squares = useRef<(HTMLButtonElement | null)[]>([]);
  const panel = useRef<HTMLDivElement>(null);

  const focusSquare = (index: number) => squares.current[Math.max(0, Math.min(size * size - 1, index))]?.focus();
  /** The first field (the item search), not the Close button above it. */
  const focusPanel = () => panel.current?.querySelector<HTMLElement>("input:not([disabled])")?.focus();

  function onSquareKey(e: React.KeyboardEvent, i: number) {
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -size, ArrowDown: size };
    const move = moves[e.key];
    if (move !== undefined) {
      e.preventDefault();
      focusSquare(i + move);
    } else if (e.key === "Enter" && !readOnly) {
      e.preventDefault();
      setSelected({ row: Math.floor(i / size), col: i % size });
      // The panel re-renders for the new square first.
      requestAnimationFrame(focusPanel);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
        {Array.from({ length: size * size }, (_, i) => {
          const row = Math.floor(i / size);
          const col = i % size;
          const tile = byPosition.get(`${row}:${col}`);
          const icon = tile?.iconItemId != null ? items[tile.iconItemId] : undefined;
          const isSelected = selected?.row === row && selected.col === col;
          return (
            <button
              key={i}
              ref={(el) => {
                squares.current[i] = el;
              }}
              type="button"
              onClick={() => setSelected({ row, col })}
              onFocus={() => setSelected({ row, col })}
              onKeyDown={(e) => onSquareKey(e, i)}
              aria-label={tile ? `${tile.name}, ${tile.points} points` : `Empty square, row ${row + 1}, column ${col + 1}`}
              className={`flex aspect-square flex-col items-center justify-center gap-1 p-1 text-center ${
                tile ? "bg-keep" : "bg-obsidian/60"
              } shadow-[inset_0_0_0_4px] ${isSelected ? "shadow-brass" : "shadow-mortar hover:shadow-rune"}`}
            >
              {tile ? (
                <>
                  {icon ? <ItemIcon item={icon} /> : <span className="font-pixel text-pixel-2x text-steel">?</span>}
                  <span className="line-clamp-2 font-pixel text-pixel leading-tight text-limestone text-shadow-pixel">
                    {tile.name}
                  </span>
                  <span className="font-pixel text-pixel text-gain text-shadow-pixel">
                    {tile.points} pts
                    {tile.rule === "all" ? ` · all ${tile.itemIds.length}` : tile.quantity > 1 ? ` · x${tile.quantity}` : ""}
                  </span>
                </>
              ) : (
                <span className="font-pixel text-pixel-2x text-mortar">+</span>
              )}
            </button>
          );
        })}
      </div>

      <div
        ref={panel}
        className="pixel-box h-fit p-5"
        onKeyDown={(e) => {
          if (e.key === "Escape" && selected) focusSquare(selected.row * size + selected.col);
        }}
      >
        {selected ? (
          <TilePanel
            // Keyed by the square's saved content too, so the form reloads when the square changes
            // underneath it (fill at random, clear the board, or another admin's save).
            key={`${selected.row}:${selected.col}:${current ? JSON.stringify(current) : "empty"}`}
            boardId={boardId}
            row={selected.row}
            col={selected.col}
            tile={current}
            items={items}
            readOnly={readOnly}
            onClose={() => setSelected(null)}
            onSaved={() => focusSquare(selected.row * size + selected.col + 1)}
          />
        ) : (
          <p className="text-steel text-shadow-pixel">
            {readOnly
              ? "This board is finished, so its squares can't change."
              : "Click a square to fill it. With the keyboard: Tab or the arrow keys move between squares, Enter edits one, Esc goes back."}
          </p>
        )}
      </div>
    </div>
  );
}

function TilePanel({
  boardId,
  row,
  col,
  tile,
  items,
  readOnly,
  onClose,
  onSaved,
}: {
  boardId: string;
  row: number;
  col: number;
  tile: EditorTile | undefined;
  items: ItemsById;
  readOnly: boolean;
  onClose: () => void;
  /** Called after a successful save: the editor moves to the next square. */
  onSaved: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);

  const known = (id: number | null | undefined) => (id != null ? items[id] : undefined);
  const [picked, setPicked] = useState<PickedItem[]>(
    () => (tile?.itemIds ?? []).map((id) => known(id)).filter((i): i is PickedItem => i !== undefined),
  );
  const firstItemIcon = tile?.itemIds[0];
  const [icon, setIcon] = useState<PickedItem[]>(() => {
    const custom = tile?.iconItemId != null && tile.iconItemId !== firstItemIcon ? known(tile.iconItemId) : undefined;
    return custom ? [custom] : [];
  });
  const [name, setName] = useState(tile?.name ?? "");
  const [points, setPoints] = useState(String(tile?.points ?? 10));
  const [quantity, setQuantity] = useState(String(tile?.quantity ?? 1));
  const [rule, setRule] = useState<"any" | "all">(tile?.rule ?? "any");
  // "All of these" only makes sense with two or more items.
  const needsAll = rule === "all" && picked.length >= 2;
  const [description, setDescription] = useState(tile?.description ?? "");

  function onItemsChange(next: PickedItem[]) {
    // The name follows the first item while it's the item's own name (or empty), like the icon does.
    // A name the admin typed ("Any Zulrah unique") is kept.
    const automatic = name.trim().length === 0 || name.trim() === picked[0]?.name;
    if (automatic) setName(next[0]?.name ?? "");
    setPicked(next);
  }

  function save() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveTileAction(boardId, {
        row,
        col,
        name,
        points: Number(points),
        quantity: needsAll ? 1 : Number(quantity),
        rule: needsAll ? "all" : "any",
        description: description.trim() || null,
        iconItemId: icon[0]?.id ?? picked[0]?.id ?? null,
        itemIds: picked.map((i) => i.id),
      });
      setMessage(result.ok ? { tone: "ok", text: "Saved." } : { tone: "warn", text: result.error });
      if (result.ok) {
        router.refresh();
        onSaved();
      }
    });
  }

  function clear() {
    setMessage(null);
    startTransition(async () => {
      const result = await clearTileAction(boardId, row, col);
      if (result.ok) {
        router.refresh();
        onClose();
      } else setMessage({ tone: "warn", text: result.error });
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-pixel text-pixel text-brass text-shadow-pixel">
          Row {row + 1}, column {col + 1}
        </h3>
        <button type="button" onClick={onClose} className="font-pixel text-pixel text-steel hover:text-limestone">
          Close
        </button>
      </div>

      <fieldset disabled={readOnly || pending} className="space-y-4">
        <div>
          <p className="font-pixel text-pixel text-limestone text-shadow-pixel">Items</p>
          <p className="mb-2 text-steel text-shadow-pixel">Leave empty for a goal like &ldquo;99 Runecraft&rdquo;.</p>
          <ItemPicker value={picked} onChange={onItemsChange} />
        </div>

        <label className="block">
          <span className="font-pixel text-pixel text-limestone text-shadow-pixel">Tile name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={inputClass} />
        </label>

        {picked.length >= 2 && (
          <fieldset>
            <legend className="font-pixel text-pixel text-limestone text-shadow-pixel">Counts as</legend>
            <div className="mt-1 space-y-1">
              {(
                [
                  ["any", "Any of these", "Drops of any listed item count toward the quantity."],
                  ["all", "All of these", "Each listed item is needed once, e.g. both crowns for a Twinflame."],
                ] as const
              ).map(([value, label, hint]) => (
                <label key={value} className="flex cursor-pointer items-start gap-2">
                  <input
                    type="radio"
                    name={`rule-${row}-${col}`}
                    value={value}
                    checked={rule === value}
                    onChange={() => setRule(value)}
                    className="mt-1 accent-rune"
                  />
                  <span>
                    <span className="block font-pixel text-pixel text-limestone text-shadow-pixel">{label}</span>
                    <span className="block text-steel text-shadow-pixel">{hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="font-pixel text-pixel text-limestone text-shadow-pixel">Points</span>
            <input type="number" min={0} max={1000} value={points} onChange={(e) => setPoints(e.target.value)} className={inputClass} />
          </label>
          {needsAll ? (
            <div>
              <span className="font-pixel text-pixel text-limestone text-shadow-pixel">Quantity</span>
              <p className="mt-1 py-2 text-steel text-shadow-pixel">1 of each ({picked.length} items)</p>
            </div>
          ) : (
            <label className="block">
              <span className="font-pixel text-pixel text-limestone text-shadow-pixel">Quantity</span>
              <input type="number" min={1} max={1000} value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClass} />
            </label>
          )}
        </div>

        <label className="block">
          <span className="font-pixel text-pixel text-limestone text-shadow-pixel">Description (optional)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="e.g. Any piece counts"
            className={`${inputClass} font-body`}
          />
        </label>

        <div>
          <p className="font-pixel text-pixel text-limestone text-shadow-pixel">Icon (optional)</p>
          <p className="mb-2 text-steel text-shadow-pixel">Defaults to the first item. Pick one for text-only goals.</p>
          <ItemPicker value={icon} onChange={setIcon} multiple={false} />
        </div>

        {message && (
          <p
            role="status"
            className={`px-3 py-2 text-limestone text-shadow-pixel ${message.tone === "ok" ? "bg-gain/15" : "bg-banner/30"}`}
          >
            {message.text}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <button type="button" onClick={save} className="pixel-btn bg-rune text-white disabled:opacity-60">
            {pending ? "Saving..." : "Save tile"}
          </button>
          {tile && (
            <button type="button" onClick={clear} className="font-pixel text-pixel text-steel hover:text-banner">
              Clear square
            </button>
          )}
        </div>
      </fieldset>
    </div>
  );
}
