"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ItemIcon, type PickedItem } from "@/app/_components/item-picker";
import { markTileAction, undoTileAction } from "../actions";

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

export interface ViewCompletion {
  /** ISO timestamp. */
  readonly completedAt: string;
  readonly note: string | null;
}

/** The board grid for one team. Admins can mark and undo tiles while the board is live. */
export function BoardView({
  boardId,
  size,
  tiles,
  team,
  completions,
  canMark,
}: {
  boardId: string;
  size: number;
  tiles: readonly ViewTile[];
  team: { id: string; name: string } | null;
  completions: Readonly<Record<string, ViewCompletion>>;
  canMark: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const byPosition = new Map(tiles.map((t) => [`${t.row}:${t.col}`, t]));
  const open = tiles.find((t) => t.id === openId);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
        {Array.from({ length: size * size }, (_, i) => {
          const tile = byPosition.get(`${Math.floor(i / size)}:${i % size}`);
          if (!tile) return <div key={i} className="aspect-square bg-obsidian/40" aria-hidden />;
          const done = completions[tile.id] !== undefined;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setOpenId(tile.id)}
              aria-label={`${tile.name}, ${tile.points} points${done ? ", completed" : ""}`}
              className={`relative flex aspect-square flex-col items-center justify-center gap-1 p-1 text-center shadow-[inset_0_0_0_4px] ${
                done ? "bg-gain/25 shadow-gain" : "bg-keep shadow-mortar hover:shadow-rune"
              } ${openId === tile.id ? "outline-4 outline-brass" : ""}`}
            >
              {done && (
                <span className="absolute top-1 right-1.5 font-pixel text-pixel text-gain text-shadow-pixel" aria-hidden>
                  ✓
                </span>
              )}
              {tile.icon ? <ItemIcon item={tile.icon} /> : <span className="font-pixel text-pixel-2x text-steel">?</span>}
              <span className="line-clamp-2 font-pixel text-pixel leading-tight text-limestone text-shadow-pixel">{tile.name}</span>
              <span className="font-pixel text-pixel text-brass text-shadow-pixel">{tile.points} pts</span>
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
            completion={completions[open.id] ?? null}
            canMark={canMark}
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

function TileDetails({
  boardId,
  tile,
  team,
  completion,
  canMark,
  onClose,
}: {
  boardId: string;
  tile: ViewTile;
  team: { id: string; name: string } | null;
  completion: ViewCompletion | null;
  canMark: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) router.refresh();
      else setError(result.error ?? "Something went wrong.");
    });
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
        <div className="border-t-4 border-obsidian pt-3">
          {completion ? (
            <p className="text-limestone text-shadow-pixel">
              <span className="font-pixel text-pixel text-gain">✓ {team.name}</span> completed it{" "}
              {new Date(completion.completedAt).toLocaleString()}.
              {completion.note && <span className="mt-1 block text-steel">{linkify(completion.note)}</span>}
            </p>
          ) : (
            <p className="text-steel text-shadow-pixel">{team.name} hasn&apos;t completed this yet.</p>
          )}

          {canMark &&
            (completion ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => undoTileAction(boardId, team.id, tile.id))}
                className="mt-3 font-pixel text-pixel text-steel hover:text-banner"
              >
                {pending ? "Undoing..." : "Undo completion"}
              </button>
            ) : (
              <div className="mt-3 space-y-2">
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={300}
                  placeholder="Note, e.g. link to the Discord screenshot"
                  className="block w-full border-4 border-black bg-obsidian px-3 py-2 font-body text-limestone outline-none focus:border-rune"
                />
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => markTileAction(boardId, team.id, tile.id, note))}
                  className="pixel-btn bg-gain/80 text-obsidian disabled:opacity-60"
                >
                  {pending ? "Marking..." : `Mark complete for ${team.name}`}
                </button>
              </div>
            ))}
        </div>
      )}
      {error && <p className="bg-banner/30 px-3 py-2 text-limestone text-shadow-pixel">{error}</p>}
    </div>
  );
}
