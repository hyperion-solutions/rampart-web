"use client";

import { useEffect } from "react";

/**
 * Shown when a page fails. It never shows the error itself (it can hold database details):
 * the reference code lets an admin find it in the server logs.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="pixel-box mx-auto max-w-xl space-y-3 p-8 text-center">
      <h1 className="font-quill text-pixel-2x text-lightning text-shadow-pixel">Something went wrong</h1>
      <p className="text-steel text-shadow-pixel">
        Try again in a moment. If it keeps happening, tell an admin on Discord what you were doing.
      </p>
      {error.digest && <p className="text-steel text-shadow-pixel">Reference: {error.digest}</p>}
      <button type="button" onClick={reset} className="pixel-btn mt-3 bg-rune text-white">
        Try again
      </button>
    </div>
  );
}
