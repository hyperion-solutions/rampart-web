"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { unlinkAccount } from "../actions";

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="pixel-btn bg-banner px-3 py-1.5 text-white disabled:opacity-60">
      {pending ? "Unlinking..." : "Yes, unlink"}
    </button>
  );
}

/** Two steps, so an account isn't unlinked by a stray click. */
export function UnlinkButton({ accountId, rsn }: { accountId: string; rsn: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="font-pixel text-pixel text-steel underline-offset-4 text-shadow-pixel hover:text-limestone hover:underline"
      >
        Unlink
      </button>
    );
  }

  return (
    <form action={unlinkAccount} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="accountId" value={accountId} />
      <span className="text-limestone text-shadow-pixel">Unlink {rsn}?</span>
      <ConfirmButton />
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="font-pixel text-pixel text-steel text-shadow-pixel hover:text-limestone"
      >
        Cancel
      </button>
    </form>
  );
}
