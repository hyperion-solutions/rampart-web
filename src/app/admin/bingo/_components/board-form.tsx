"use client";

import { useActionState, useState } from "react";
import type { BoardFormState } from "../actions";

type Action = (prev: BoardFormState, formData: FormData) => Promise<BoardFormState>;

/** "2026-12-01T18:00" in the browser's time zone, for datetime-local inputs. */
const toLocalInput = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const inputClass =
  "mt-1 block w-full border-4 border-black bg-obsidian px-3 py-2 font-pixel text-pixel text-limestone outline-none focus:border-rune";

/**
 * Create or edit a board. Dates are entered in the admin's local time and sent as ISO timestamps,
 * so the server never guesses a time zone.
 */
export function BoardForm({
  action,
  submitLabel,
  boardId,
  initial,
  sizeLocked = false,
}: {
  action: Action;
  submitLabel: string;
  boardId?: string;
  initial?: {
    title: string;
    rules: string;
    size: number;
    startsAt: string;
    endsAt: string;
    bonuses: { row: number; column: number; diagonal: number; blackout: number };
  };
  sizeLocked?: boolean;
}) {
  const [state, formAction, pending] = useActionState<BoardFormState, FormData>(action, null);
  const [startsAt, setStartsAt] = useState(() =>
    toLocalInput(initial ? new Date(initial.startsAt) : new Date(Date.now() + 24 * 3600_000)),
  );
  const [endsAt, setEndsAt] = useState(() =>
    toLocalInput(initial ? new Date(initial.endsAt) : new Date(Date.now() + 8 * 24 * 3600_000)),
  );
  const toIso = (local: string) => (local ? new Date(local).toISOString() : "");

  return (
    <form action={formAction} className="space-y-4">
      {boardId && <input type="hidden" name="boardId" value={boardId} />}
      <input type="hidden" name="startsAt" value={toIso(startsAt)} />
      <input type="hidden" name="endsAt" value={toIso(endsAt)} />

      <label className="block">
        <span className="font-pixel text-pixel text-brass text-shadow-pixel">Title</span>
        <input name="title" required maxLength={80} defaultValue={initial?.title} className={inputClass} />
      </label>

      <label className="block">
        <span className="font-pixel text-pixel text-brass text-shadow-pixel">Rules</span>
        <textarea
          name="rules"
          rows={4}
          defaultValue={initial?.rules}
          placeholder="How tiles count, proof needed, team rules..."
          className={`${inputClass} font-body`}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="font-pixel text-pixel text-brass text-shadow-pixel">Size</span>
          <select name="size" defaultValue={initial?.size ?? 5} disabled={sizeLocked} className={inputClass}>
            {[3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n} × {n}
              </option>
            ))}
          </select>
          {/* Disabled selects aren't submitted; keep the current size. */}
          {sizeLocked && <input type="hidden" name="size" value={initial?.size} />}
        </label>
        <label className="block">
          <span className="font-pixel text-pixel text-brass text-shadow-pixel">Starts</span>
          <input type="datetime-local" required value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <span className="font-pixel text-pixel text-brass text-shadow-pixel">Ends</span>
          <input type="datetime-local" required value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={inputClass} />
        </label>
      </div>
      <p className="text-steel text-shadow-pixel">Times are in your local time zone; members see them in UTC.</p>

      <fieldset className="space-y-2">
        <legend className="font-pixel text-pixel text-brass text-shadow-pixel">Line bonuses (points, 0 = none)</legend>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(
            [
              ["bonusRow", "Each row", initial?.bonuses.row],
              ["bonusColumn", "Each column", initial?.bonuses.column],
              ["bonusDiagonal", "Each diagonal", initial?.bonuses.diagonal],
              ["bonusBlackout", "Blackout", initial?.bonuses.blackout],
            ] as const
          ).map(([name, label, value]) => (
            <label key={name} className="block">
              <span className="font-pixel text-pixel text-limestone text-shadow-pixel">{label}</span>
              <input type="number" name={name} min={0} max={10000} defaultValue={value ?? 0} className={inputClass} />
            </label>
          ))}
        </div>
        <p className="text-steel text-shadow-pixel">
          A team gets a bonus once for each full row, column or diagonal it completes, and the blackout bonus for
          completing every tile.
        </p>
      </fieldset>
      {sizeLocked && <p className="text-steel text-shadow-pixel">The size can only change while the board is a draft.</p>}

      {state?.error && (
        <p role="alert" className="bg-banner/30 px-4 py-3 text-limestone text-shadow-pixel">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="pixel-btn bg-rune text-white disabled:opacity-60">
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
