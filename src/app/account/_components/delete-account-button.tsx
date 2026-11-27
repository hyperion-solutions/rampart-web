"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteMyData } from "../actions";

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="pixel-btn bg-banner text-white disabled:opacity-60">
      {pending ? "Deleting..." : "Yes, delete my data"}
    </button>
  );
}

/** Two steps, with a plain explanation of what goes. */
export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="pixel-btn bg-granite text-steel">
        Delete my data
      </button>
    );
  }

  return (
    <form action={deleteMyData} className="space-y-3">
      <p className="text-limestone text-shadow-pixel">
        This deletes your profile, all your linked accounts, link requests, bingo team places and your Dink link, and signs you out. It can&apos;t be
        undone. You can sign in again later to start fresh.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <ConfirmButton />
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="font-pixel text-pixel text-steel text-shadow-pixel hover:text-limestone"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
