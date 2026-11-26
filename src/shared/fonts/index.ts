import localFont from "next/font/local";

/**
 * OSRS bitmap fonts, self-hosted. Bitmap fonts only render crisply at multiples
 * of their native size, so use the text-pixel-* sizes in globals.css (16/32/48px).
 */

/** Body text, like in-game chat. */
export const runescapePlain = localFont({
  src: "./RuneScape-Plain-12.ttf",
  variable: "--font-rs-plain",
  display: "swap",
});

/** Labels, buttons, stats, player names. */
export const runescapeBold = localFont({
  src: "./RuneScape-Bold-12.ttf",
  variable: "--font-rs-bold",
  display: "swap",
});

/** Headings and the wordmark: the OSRS quill script. */
export const runescapeQuill = localFont({
  src: "./RuneScape-Quill-8.ttf",
  variable: "--font-rs-quill",
  display: "swap",
});

export const fontVariables = [runescapePlain, runescapeBold, runescapeQuill]
  .map((f) => f.variable)
  .join(" ");
