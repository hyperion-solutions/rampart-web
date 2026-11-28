"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ItemIcon, type PickedItem } from "@/app/_components/item-picker";
import { addDropAction, undoLastDropAction } from "../actions";
import { DropScreenshot } from "@/app/_components/drop-screenshot";

export interface ViewTile {
  readonly id: string;
  readonly row: number;
  readonly col: number;
  readonly name: string;
  readonly points: number;
  readonly quantity: number;
  /** "any": any items count toward the quantity; "all": every item is needed once. */
  readonly rule: "any" | "all";
  readonly description: string | null;
  readonly icon: PickedItem | null;
  readonly items: readonly PickedItem[];
}

export interface ViewEntry {
  readonly id: string;
  readonly amount: number;
  readonly itemName: string | null;
  readonly obtainedByName: string | null;
  readonly obtainedRsn: string | null;
  readonly source: "admin" | "dink";
  readonly addedByName: string | null;
  /** Added by the team's (current) captain, not an admin. */
  readonly addedByCaptain: boolean;
  readonly note: string | null;
  /** Dink's screenshot of the drop, resized (docs/decisions/0005), and its thumbnail. */
  readonly screenshotUrl: string | null;
  readonly thumbnailUrl: string | null;
  /** ISO timestamp. */
  readonly addedAt: string;
}

/** A team's state on one tile. */
export interface ViewTileState {
  readonly done: number;
  readonly complete: boolean;
  /** For "all" tiles: the items the team already has. */
  readonly obtainedItemIds: readonly number[];
  readonly completedAt: string | null;
  readonly completedByName: string | null;
  readonly completedRsn: string | null;
  readonly entries: readonly ViewEntry[];
}

/** How many drops complete the tile: its quantity, or one of each item for "all" tiles. */
const targetOf = (tile: ViewTile) => (tile.rule === "all" ? tile.items.length : tile.quantity);

export interface ViewTeamMember {
  readonly userId: string;
  readonly displayName: string;
  readonly rsns: readonly string[];
}

const EMPTY: ViewTileState = { done: 0, complete: false, obtainedItemIds: [], completedAt: null, completedByName: null, completedRsn: null, entries: [] };

/** The board grid for one team. Admins add drops while the board is live. */
export function BoardView({
  boardId,
  size,
  tiles,
  team,
  states,
  members,
  canEdit,
  notStartedYet,
  lineSquares,
}: {
  boardId: string;
  size: number;
  tiles: readonly ViewTile[];
  team: { id: string; name: string } | null;
  states: Readonly<Record<string, ViewTileState>>;
  /** Squares ("row:col") on a line the team completed: outlined in gold. */
  lineSquares: readonly string[];
  members: readonly ViewTeamMember[];
  canEdit: boolean;
  /** Published but before its start time: nothing can be added yet. */
  notStartedYet: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const byPosition = new Map(tiles.map((t) => [`${t.row}:${t.col}`, t]));
  const open = tiles.find((t) => t.id === openId);
  const onLine = new Set(lineSquares);
  const gridRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Clicking outside the grid and the panel, or pressing Escape, deselects the tile.
  useEffect(() => {
    if (openId === null) return;
    const inside = (target: EventTarget | null) =>
      target instanceof Node && (gridRef.current?.contains(target) || panelRef.current?.contains(target));
    const onPointerDown = (e: PointerEvent) => {
      if (!inside(e.target)) setOpenId(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      // An open screenshot dialog handles its own Escape.
      if (e.key === "Escape" && !document.querySelector("dialog[open]")) setOpenId(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openId]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div ref={gridRef} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
        {Array.from({ length: size * size }, (_, i) => {
          const tile = byPosition.get(`${Math.floor(i / size)}:${i % size}`);
          if (!tile) return <div key={i} className="aspect-square bg-obsidian/40" aria-hidden />;
          const state = states[tile.id] ?? EMPTY;
          const glowing = state.complete && onLine.has(`${tile.row}:${tile.col}`);
          const target = targetOf(tile);
          const multi = target > 1;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setOpenId(tile.id)}
              aria-label={`${tile.name}, ${tile.points} points, ${state.complete ? "completed" : multi ? `${state.done} of ${target}` : "not completed"}`}
              // Completed lines glow in a wave: each square starts a little later, from the top-left.
              style={glowing ? { animationDelay: `${(tile.row + tile.col) * 0.15}s` } : undefined}
              className={`relative flex aspect-square flex-col items-center justify-center gap-1 p-1 text-center shadow-[inset_0_0_0_4px] ${
                state.complete
                  ? `bg-gain/25 ${glowing ? "line-glow shadow-brass" : "shadow-gain"}`
                  : "bg-keep shadow-mortar hover:shadow-rune"
              } ${openId === tile.id ? "outline-4 outline-brass" : ""}`}
            >
              {state.complete && (
                <span className="absolute top-1 right-1.5 font-pixel text-pixel text-gain text-shadow-pixel" aria-hidden>
                  ✓
                </span>
              )}
              {tile.icon ? <ItemIcon item={tile.icon} /> : <span className="font-pixel text-pixel-2x text-steel">?</span>}
              <span className="line-clamp-2 font-pixel text-pixel leading-tight text-limestone text-shadow-pixel">{tile.name}</span>
              {multi && !state.complete ? (
                <span className="flex w-4/5 flex-col items-center gap-0.5">
                  <span className="font-pixel text-pixel text-brass text-shadow-pixel">
                    {state.done}/{target}
                  </span>
                  <span className="block h-1.5 w-full bg-obsidian" aria-hidden>
                    <span className="block h-full bg-brass" style={{ width: `${(state.done / target) * 100}%` }} />
                  </span>
                </span>
              ) : (
                <span className="font-pixel text-pixel text-brass text-shadow-pixel">{tile.points} pts</span>
              )}
            </button>
          );
        })}
      </div>

      <div ref={panelRef} className="pixel-box h-fit p-5">
        {open ? (
          <TileDetails
            key={open.id}
            boardId={boardId}
            tile={open}
            team={team}
            state={states[open.id] ?? EMPTY}
            members={members}
            canEdit={canEdit}
            notStartedYet={notStartedYet}
            onClose={() => setOpenId(null)}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            {/* Someone throwing darts while nothing is picked. OSRS Wiki animation (Dart_animation.gif),
                game art © Jagex; resized to WebP, still frame for reduced motion. */}
            <picture>
              <source media="(prefers-reduced-motion: reduce)" srcSet="/bingo/dart-still.png" />
              <img src="/bingo/dart.webp" alt="" width={80} height={150} className="block" />
            </picture>
            <p className="text-steel text-shadow-pixel">Click a tile to see what it needs.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const linkify = (note: string) =>
  /^https?:\/\/\S+$/.test(note) ? (
    <a href={note} target="_blank" rel="noopener noreferrer" className="break-all text-brass hover:text-limestone">
      {note}
    </a>
  ) : (
    note
  );

const who = (name: string | null, rsn: string | null) =>
  name ? (rsn && rsn !== name ? `${name} (${rsn})` : name) : rsn ?? "A former member";

/** Keeps typed amounts between 1 and what's left; an empty field stays empty while typing. */
const clampAmount = (value: string, remaining: number) => {
  if (value === "") return "";
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 1) return "1";
  return String(Math.min(n, remaining));
};

const inputClass =
  "block w-full border-4 border-black bg-obsidian px-3 py-2 font-pixel text-pixel text-limestone outline-none focus:border-rune";

function TileDetails({
  boardId,
  tile,
  team,
  state,
  members,
  canEdit,
  notStartedYet,
  onClose,
}: {
  boardId: string;
  tile: ViewTile;
  team: { id: string; name: string } | null;
  state: ViewTileState;
  members: readonly ViewTeamMember[];
  canEdit: boolean;
  notStartedYet: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const all = tile.rule === "all";
  const target = targetOf(tile);
  const remaining = Math.max(0, target - state.done);
  // "All" tiles: only the items the team still needs can be added, and one is required.
  const missing = all ? tile.items.filter((i) => !state.obtainedItemIds.includes(i.id)) : tile.items;
  const choices = members.flatMap((m) =>
    m.rsns.length > 0 ? m.rsns.map((rsn) => ({ value: `${m.userId}|${rsn}`, label: who(m.displayName, rsn) })) : [{ value: `${m.userId}|`, label: m.displayName }],
  );
  const [obtained, setObtained] = useState(choices[0]?.value ?? "");
  const [itemId, setItemId] = useState(all || tile.items.length === 1 ? String(missing[0]?.id ?? "") : "");
  const [amount, setAmount] = useState("1");
  const amountValid = all
    ? missing.some((i) => String(i.id) === itemId)
    : tile.quantity === 1 || (Number(amount) >= 1 && Number(amount) <= remaining);
  const [note, setNote] = useState("");

  function run(action: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        after?.();
        router.refresh();
      } else setError(result.error ?? "Something went wrong.");
    });
  }

  function addDrop() {
    if (!team) return;
    const [userId = "", rsn = ""] = obtained.split("|");
    run(
      () =>
        addDropAction(boardId, team.id, tile.id, {
          amount: all ? 1 : Number(amount),
          itemId: itemId ? Number(itemId) : null,
          obtainedBy: userId,
          obtainedRsn: rsn || null,
          note,
        }),
      () => {
        setNote("");
        setAmount("1");
        // Move to the next item still needed.
        if (all) setItemId(String(missing.find((i) => String(i.id) !== itemId)?.id ?? ""));
      },
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-pixel text-pixel text-brass text-shadow-pixel">{tile.name}</h3>
        <button type="button" onClick={onClose} className="font-pixel text-pixel text-steel hover:text-limestone">
          Close
        </button>
      </div>
      <p className="font-pixel text-pixel text-gain text-shadow-pixel">
        {tile.points} points{all ? ` · needs all ${target}` : tile.quantity > 1 ? ` · needs ${tile.quantity}` : ""}
      </p>
      {tile.description && <p className="text-steel text-shadow-pixel">{tile.description}</p>}
      {tile.items.length > 0 && (
        <div>
          <p className="text-steel text-shadow-pixel">
            {all ? "All of these are needed:" : tile.items.length > 1 ? "Any of these counts:" : "Item:"}
          </p>
          <ul className="mt-1 space-y-1">
            {tile.items.map((item) => {
              const have = all && team !== null && (state.complete || state.obtainedItemIds.includes(item.id));
              return (
                <li key={item.id} className="flex items-center gap-2">
                  <ItemIcon item={item} />
                  <span className={`font-pixel text-pixel text-shadow-pixel ${have ? "text-gain" : "text-limestone"}`}>
                    {item.name}
                  </span>
                  {all && team && (
                    <span className={`ml-auto font-pixel text-pixel text-shadow-pixel ${have ? "text-gain" : "text-steel"}`}>
                      {have ? "✓" : "needed"}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {team && (
        <div className="space-y-3 border-t-4 border-obsidian pt-3">
          {state.complete ? (
            <p className="text-limestone text-shadow-pixel">
              <span className="font-pixel text-pixel text-gain">✓ {team.name}</span> completed it
              {state.completedByName || state.completedRsn ? ` (${who(state.completedByName, state.completedRsn)})` : ""}
              {state.completedAt ? `, ${new Date(state.completedAt).toLocaleString()}` : ""}.
            </p>
          ) : (
            <p className="text-steel text-shadow-pixel">
              {target > 1
                ? `${team.name}: ${state.done}/${target}, ${remaining} to go.`
                : `${team.name} hasn't completed this yet.`}
            </p>
          )}

          {notStartedYet && (
            <p className="bg-rune/20 px-3 py-2 text-limestone text-shadow-pixel">
              The board hasn&apos;t started yet. Drops can be added once it begins.
            </p>
          )}

          {state.entries.length > 0 && (
            <ul className="space-y-1.5">
              {state.entries.map((e) => (
                <li key={e.id} className="bg-obsidian/60 px-2 py-1.5 text-shadow-pixel">
                  <span className="font-pixel text-pixel text-limestone">{who(e.obtainedByName, e.obtainedRsn)}</span>{" "}
                  <span className="text-steel">
                    got {e.amount > 1 ? `${e.amount}× ` : ""}
                    {e.itemName ?? "it"} · {e.source === "dink" ? "Dink" : `added by ${e.addedByName ?? "an admin"}${e.addedByCaptain ? " (captain)" : ""}`} ·{" "}
                    {new Date(e.addedAt).toLocaleString()}
                  </span>
                  {e.note && <span className="block text-steel">{linkify(e.note)}</span>}
                  {e.screenshotUrl && e.thumbnailUrl && (
                    <DropScreenshot
                      url={e.screenshotUrl}
                      thumbnailUrl={e.thumbnailUrl}
                      label={`${who(e.obtainedByName, e.obtainedRsn)}: ${e.itemName ?? tile.name}`}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}

          {canEdit && !state.complete && (
            <div className="space-y-2">
              {choices.length === 0 ? (
                <p className="text-steel text-shadow-pixel">Add members to {team.name} first.</p>
              ) : (
                <>
                  <label className="block">
                    <span className="font-pixel text-pixel text-limestone text-shadow-pixel">Who got it</span>
                    <select value={obtained} onChange={(e) => setObtained(e.target.value)} className={`mt-1 ${inputClass}`}>
                      {choices.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {tile.items.length > 1 && (
                    <label className="block">
                      <span className="font-pixel text-pixel text-limestone text-shadow-pixel">Which item</span>
                      <select value={itemId} onChange={(e) => setItemId(e.target.value)} className={`mt-1 ${inputClass}`}>
                        {!all && <option value="">Not specified</option>}
                        {missing.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {!all && tile.quantity > 1 && (
                    <label className="block">
                      <span className="font-pixel text-pixel text-limestone text-shadow-pixel">How many</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={remaining}
                        value={amount}
                        onChange={(e) => setAmount(clampAmount(e.target.value, remaining))}
                        className={`mt-1 ${inputClass}`}
                      />
                      <span className="mt-1 block text-steel text-shadow-pixel">
                        {remaining === 1 ? "Only 1 left to complete it." : `1 to ${remaining} (what's left to complete it).`}
                      </span>
                    </label>
                  )}
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={300}
                    placeholder="Note, e.g. link to the Discord screenshot"
                    className={`${inputClass} font-body`}
                  />
                  <button
                    type="button"
                    disabled={pending || !amountValid}
                    onClick={addDrop}
                    className="pixel-btn bg-gain text-obsidian [text-shadow:none] disabled:opacity-60"
                  >
                    {pending
                      ? "Saving..."
                      : all
                        ? remaining === 1
                          ? `Mark complete for ${team.name}`
                          : `Add for ${team.name}`
                        : tile.quantity > 1
                          ? `Add ${amount || 1} for ${team.name}`
                          : `Mark complete for ${team.name}`}
                  </button>
                </>
              )}
            </div>
          )}

          {canEdit && (state.entries.length > 0 || state.complete) && (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => undoLastDropAction(boardId, team.id, tile.id))}
              className="block font-pixel text-pixel text-steel hover:text-banner"
            >
              {pending ? "Undoing..." : state.entries.length > 0 ? "Undo last drop" : "Undo completion"}
            </button>
          )}
        </div>
      )}
      {error && <p className="bg-banner/30 px-3 py-2 text-limestone text-shadow-pixel">{error}</p>}
    </div>
  );
}
