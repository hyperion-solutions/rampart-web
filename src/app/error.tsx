"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="pixel-box mx-auto max-w-xl p-8 text-center">
      <h1 className="font-quill text-pixel-2x text-lightning text-shadow-pixel">Couldn&apos;t load clan data</h1>
      <p className="mt-3 text-steel">{error.message}. Check WOM_GROUP_ID in .env.local, then try again.</p>
      <button
        onClick={reset}
        className="pixel-btn mt-6 bg-rune text-white"
      >
        Try again
      </button>
    </div>
  );
}
