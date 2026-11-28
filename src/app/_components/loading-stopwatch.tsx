/**
 * The site's standard loading screen, for pages that load data on the server (Next.js
 * `loading.tsx`): the OSRS giant stopwatch running, with a short line of text. A still frame for
 * reduced motion. Static pages and plain forms don't need one.
 * Animation: OSRS Wiki (Giant_stopwatch_-_run_animation.gif), game art © Jagex; resized to WebP.
 */
export function LoadingStopwatch({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="mx-auto flex max-w-sm flex-col items-center gap-3 py-16 text-center">
      <picture>
        <source media="(prefers-reduced-motion: reduce)" srcSet="/loading/stopwatch-still.png" />
        {/* Tiny animated WebP: served as is, not through next/image. */}
        <img src="/loading/stopwatch.webp" alt="" width={150} height={150} className="block" />
      </picture>
      <p className="font-pixel text-pixel text-brass text-shadow-pixel">{label}</p>
    </div>
  );
}
