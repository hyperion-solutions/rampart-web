"use client";

import { useActionState, useEffect } from "react";
import { createLink, type CreateLinkState } from "../actions";
import { CopyButton } from "./copy-button";

/**
 * Creates a Dink link and shows the full address once. After leaving the page it can't be shown
 * again (only a hash is stored), so members make a new link if they lose it.
 */
export function CreateLinkForm({ hasLink, onCreated }: { hasLink: boolean; onCreated?: (url: string) => void }) {
  const [state, action, pending] = useActionState<CreateLinkState, FormData>(createLink, null);

  useEffect(() => {
    if (state) onCreated?.(state.url);
  }, [state, onCreated]);

  if (state) {
    return (
      <div className="space-y-3">
        <p className="font-pixel text-pixel text-gain text-shadow-pixel">Your new Dink link is ready</p>
        <code className="block break-all bg-obsidian px-3 py-2 font-body text-limestone">{state.url}</code>
        <div className="flex flex-wrap items-center gap-4">
          <CopyButton text={state.url} />
          <p className="text-steel text-shadow-pixel">
            Copy it now: for your security it won&apos;t be shown again. Keep it private.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={action}>
      <button type="submit" disabled={pending} className="pixel-btn bg-rune text-white disabled:opacity-60">
        {pending ? "Creating..." : hasLink ? "Create a new link" : "Create my Dink link"}
      </button>
      {hasLink && (
        <p className="mt-2 text-steel text-shadow-pixel">Your current link stops working when you create a new one.</p>
      )}
    </form>
  );
}
