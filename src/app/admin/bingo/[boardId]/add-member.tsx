"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Player } from "@/modules/bingo/domain/player-directory";
import { addTeamMemberAction, searchPlayersAction } from "../actions";

/** Search members with linked clan accounts by Discord name or RSN, and add one to the team. */
export function AddMember({ boardId, teamId, teamName }: { boardId: string; teamId: string; teamName: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      const found = await searchPlayersAction(query);
      if (!cancelled) setResults(found);
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  function add(player: Player) {
    setError(null);
    startTransition(async () => {
      const result = await addTeamMemberAction(boardId, teamId, player.userId);
      if (!result.ok) setError(result.error);
      else {
        setQuery("");
        setResults([]);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Add to ${teamName}: Discord name or RSN`}
        className="block w-full border-4 border-black bg-obsidian px-3 py-2 font-pixel text-pixel text-limestone outline-none placeholder:text-steel/60 focus:border-rune"
      />
      {results.length > 0 && (
        <ul className="pixel-box max-h-56 overflow-y-auto">
          {results.map((p) => (
            <li key={p.userId}>
              <button
                type="button"
                disabled={pending}
                onClick={() => add(p)}
                className="flex w-full flex-wrap items-baseline gap-x-3 px-3 py-1.5 text-left hover:bg-rune/30"
              >
                <span className="font-pixel text-pixel text-limestone text-shadow-pixel">{p.displayName}</span>
                <span className="text-steel">{p.rsns.join(", ")}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {query.trim().length >= 2 && results.length === 0 && (
        <p className="text-steel text-shadow-pixel">No linked members match. Members need a linked clan account to play.</p>
      )}
      {error && <p className="bg-banner/30 px-3 py-2 text-limestone text-shadow-pixel">{error}</p>}
    </div>
  );
}
