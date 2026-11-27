"use client";

import { useState, useTransition } from "react";
import { type BoardToolResult, clearBoardAction, fillBoardRandomlyAction } from "../actions";

/** Draft-board shortcuts: fill the empty squares with random items, or empty the whole board. */
export function BoardTools({ boardId, filled, total }: { boardId: string; filled: number; total: number }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<BoardToolResult | null>(null);

  const run = (action: (id: string) => Promise<BoardToolResult>) =>
    startTransition(async () => setResult(await action(boardId)));

  const clear = () => {
    if (window.confirm(`Empty all ${filled} filled squares? This can't be undone.`)) run(clearBoardAction);
  };

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => run(fillBoardRandomlyAction)}
          disabled={pending || filled === total}
          className="pixel-btn bg-rune text-white disabled:opacity-60"
        >
          {pending ? "Working..." : filled === 0 ? "Fill with random items" : "Fill empty squares at random"}
        </button>
        <button
          type="button"
          onClick={clear}
          disabled={pending || filled === 0}
          className="pixel-btn bg-granite text-brass disabled:opacity-60"
        >
          Clear the board
        </button>
      </div>
      <p className="text-steel text-shadow-pixel">
        Random squares get a random tradeable item worth 10 points. Squares you already filled are kept: clear the board
        first for a fully random one.
      </p>
      {result && (
        <p
          role="status"
          className={`px-4 py-3 text-limestone text-shadow-pixel ${result.ok ? "bg-gain/15" : "bg-banner/30"}`}
        >
          {result.ok ? result.message : result.error}
        </p>
      )}
    </div>
  );
}
