"use client";

import { useActionState } from "react";
import { requestManualLink, type ClaimFormState } from "../actions";

/** For members who can't or won't use Dink: an admin checks and approves the RSN. */
export function ManualLinkForm() {
  const [state, action, pending] = useActionState<ClaimFormState, FormData>(requestManualLink, null);

  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <span className="font-pixel text-pixel text-limestone text-shadow-pixel">Your RSN</span>
        <input
          name="rsn"
          required
          maxLength={12}
          autoComplete="off"
          className="mt-1 block w-full max-w-xs border-4 border-black bg-obsidian px-3 py-2 font-pixel text-pixel text-limestone outline-none focus:border-rune"
        />
      </label>
      <button type="submit" disabled={pending} className="pixel-btn bg-granite text-brass disabled:opacity-60">
        {pending ? "Sending..." : "Ask an admin to link it"}
      </button>
      {state && (
        <p
          role="status"
          className={`px-4 py-3 text-limestone text-shadow-pixel ${state.tone === "ok" ? "bg-gain/15" : "bg-banner/30"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
