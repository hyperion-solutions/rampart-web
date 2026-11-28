import Link from "next/link";

export const metadata = { title: "Page not found | Rampart" };

/**
 * Shown for unknown pages, and for pages someone can't see (e.g. admin pages for members).
 * Crob the crab: OSRS Wiki animation (Crob.gif), game art © Jagex; still frame for reduced motion.
 */
export default function NotFound() {
  return (
    <section className="pixel-box mx-auto flex max-w-xl flex-col items-center gap-4 p-8 text-center">
      <picture>
        <source media="(prefers-reduced-motion: reduce)" srcSet="/sprites/crob-still.png" />
        <img src="/sprites/crob.webp" alt="" width={84} height={96} className="block" />
      </picture>
      <h1 className="font-quill text-pixel-2x text-lightning text-shadow-pixel">Nothing here</h1>
      <p className="text-steel text-shadow-pixel">Nothing here but this crab. The page may have moved, or you may not have access to it.</p>
      <Link href="/" className="pixel-btn bg-rune text-white">
        Back to the clan page
      </Link>
    </section>
  );
}
