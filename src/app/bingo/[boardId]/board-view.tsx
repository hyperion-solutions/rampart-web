"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ItemIcon, type PickedItem } from "@/app/_components/item-picker";
import { addDropAction, undoLastDropAction } from "../actions";

export interface ViewTile {
  readonly id: string;
  readonly row: number;
  readonly col: number;
  readonly name: string;
  readonly points: number;
  readonly quantity: number;
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
  readonly note: string | null;
  /** ISO timestamp. */
  readonly addedAt: string;
}

/** A team's state on one tile. */
export interface ViewTileState {
  readonly done: number;
  readonly complete: boolean;
  readonly completedAt: string | null;
  readonly completedByName: string | null;
  readonly completedRsn: string | null;
  readonly entries: readonly ViewEntry[];
}

export interface ViewTeamMember {
  readonly userId: string;
  readonly displayName: string;
  readonly rsns: readonly string[];
}

const EMPTY: ViewTileState = { done: 0, complete: false, completedAt: null, completedByName: null, completedRsn: null, entries: [] };

/** The board grid for one team. Admins add drops while the board is live. */
export function BoardView({
  boardId,
  size,
  tiles,
  team,
  states,
  members,
  canEdit,
}: {
  boardId: string;
  size: number;
  tiles: readonly ViewTile[];
  team: { id: string; name: string } | null;
  states: Readonly<Record<string, ViewTileState>>;
  members: readonly ViewTeamMember[];
  canEdit: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const byPosition = new Map(tiles.map((t) => [`${t.row}:${t.col}`, t]));
  const open = tiles.find((t) => t.id === openId);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
        {Array.from({ length: size * size }, (_, i) => {
          const tile = byPosition.get(`${Math.floor(i / size)}:${i % size}`);
          if (!tile) return <div key={i} className="aspect-square bg-obsidian/40" aria-hidden />;
          const state = states[tile.id] ?? EMPTY;
          const multi = tile.quantity > 1;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setOpenId(tile.id)}
              aria-label={`${tile.name}, ${tile.points} points, ${state.complete ? "completed" : multi ? `${state.done} of ${tile.quantity}` : "not completed"}`}
              className={`relative flex aspect-square flex-col items-center justify-center gap-1 p-1 text-center shadow-[inset_0_0_0_4px] ${
                state.complete ? "bg-gain/25 shadow-gain" : "bg-keep shadow-mortar hover:shadow-rune"
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
                    {state.done}/{tile.quantity}
                  </span>
                  <span className="block h-1.5 w-full bg-obsidian" aria-hidden>
                    <span className="block h-full bg-brass" style={{ width: `${(state.done / tile.quantity) * 100}%` }} />
                  </span>
                </span>
              ) : (
                <span className="font-pixel text-pixel text-brass text-shadow-pixel">{tile.points} pts</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="pixel-box h-fit p-5">
        {open ? (
          <TileDetails
            key={open.id}
            boardId={boardId}
            tile={open}
            team={team}
            state={states[open.id] ?? EMPTY}
            members={members}
            canEdit={canEdit}
            onClose={() => setOpenId(null)}
          />
        ) : (
          <p className="text-steel text-shadow-pixel">Click a tile to see what it needs.</p>
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

const inputClass =
  "block w-full border-4 border-black bg-obsidian px-3 py-2 font-pixel text-pixel text-limestone outline-none focus:border-rune";

function TileDetails({
  boardId,
  tile,
  team,
  state,
  members,
  canEdit,
  onClose,
}: {
  boardId: string;
  tile: ViewTile;
  team: { id: string; name: string } | null;
  state: ViewTileState;
  members: readonly ViewTeamMember[];
  canEdit: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const remaining = Math.max(0, tile.quantity - state.done);
  const choices = members.flatMap((m) =>
    m.rsns.length > 0 ? m.rsns.map((rsn) => ({ value: `${m.userId}|${rsn}`, label: who(m.displayName, rsn) })) : [{ value: `${m.userId}|`, label: m.displayName }],
  );
  const [obtained, setObtained] = useState(choices[0]?.value ?? "");
  const [itemId, setItemId] = useState(tile.items.length === 1 ? String(tile.items[0]?.id) : "");
  const [amount, setAmount] = useState("1");
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
          amount: Number(amount),
          itemId: itemId ? Number(itemId) : null,
          obtainedBy: userId,
          obtainedRsn: rsn || null,
          note,
        }),
      () => {
        setNote("");
        setAmount("1");
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
        {tile.points} points{tile.quantity > 1 ? ` · needs ${tile.quantity}` : ""}
      </p>
      {tile.description && <p className="text-steel text-shadow-pixel">{tile.description}</p>}
      {tile.items.length > 0 && (
        <div>
          <p className="text-steel text-shadow-pixel">{tile.items.length > 1 ? "Any of these counts:" : "Item:"}</p>
          <ul className="mt-1 space-y-1">
            {tile.items.map((item) => (
              <li key={item.id} className="flex items-center gap-2">
                <ItemIcon item={item} />
                <span className="font-pixel text-pixel text-limestone text-shadow-pixel">{item.name}</span>
              </li>
            ))}
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
              {tile.quantity > 1
                ? `${team.name}: ${state.done}/${tile.quantity}, ${remaining} to go.`
                : `${team.name} hasn't completed this yet.`}
            </p>
          )}

          {state.entries.length > 0 && (
            <ul className="space-y-1.5">
              {state.entries.map((e) => (
                <li key={e.id} className="bg-obsidian/60 px-2 py-1.5 text-shadow-pixel">
                  <span className="font-pixel text-pixel text-limestone">{who(e.obtainedByName, e.obtainedRsn)}</span>{" "}
                  <span className="text-steel">
                    got {e.amount > 1 ? `${e.amount}× ` : ""}
                    {e.itemName ?? "it"} · {e.source === "dink" ? "Dink" : `added by ${e.addedByName ?? "an admin"}`} ·{" "}
                    {new Date(e.addedAt).toLocaleString()}
                  </span>
                  {e.note && <span className="block text-steel">{linkify(e.note)}</span>}
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
                        <option value="">Not specified</option>
                        {tile.items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {tile.quantity > 1 && (
                    <label className="block">
                      <span className="font-pixel text-pixel text-limestone text-shadow-pixel">How many</span>
                      <input
                        type="number"
                        min={1}
                        max={remaining}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={`mt-1 ${inputClass}`}
                      />
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
                    disabled={pending}
                    onClick={addDrop}
                    className="pixel-btn bg-gain text-obsidian [text-shadow:none] disabled:opacity-60"
                  >
                    {pending ? "Saving..." : tile.quantity > 1 ? `Add ${amount || 1} for ${team.name}` : `Mark complete for ${team.name}`}
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
