"use client";

import { useActionState } from "react";
import { TEAM_SWATCH } from "@/app/_components/team-colour";
import { TEAM_COLOURS } from "@/modules/bingo/domain/team-colours";
import { createTeamAction, type TeamFormState } from "../actions";

export function CreateTeamForm({ boardId }: { boardId: string }) {
  const [state, action, pending] = useActionState<TeamFormState, FormData>(createTeamAction, null);
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="boardId" value={boardId} />
      <label className="block">
        <span className="font-pixel text-pixel text-limestone text-shadow-pixel">Team name</span>
        <input
          name="name"
          required
          maxLength={30}
          className="mt-1 block border-4 border-black bg-obsidian px-3 py-2 font-pixel text-pixel text-limestone outline-none focus:border-rune"
        />
      </label>
      <fieldset className="flex items-center gap-2 pb-2">
        <legend className="sr-only">Colour</legend>
        {TEAM_COLOURS.map((c, i) => (
          <label key={c} className="cursor-pointer" title={c}>
            <input type="radio" name="colour" value={c} defaultChecked={i === 0} className="peer sr-only" />
            <span className={`block size-6 border-4 border-black peer-checked:outline-4 peer-checked:outline-limestone ${TEAM_SWATCH[c]}`} />
          </label>
        ))}
      </fieldset>
      <button type="submit" disabled={pending} className="pixel-btn bg-rune text-white disabled:opacity-60">
        {pending ? "Adding..." : "Add team"}
      </button>
      {state?.error && <p className="w-full bg-banner/30 px-3 py-2 text-limestone text-shadow-pixel">{state.error}</p>}
    </form>
  );
}
