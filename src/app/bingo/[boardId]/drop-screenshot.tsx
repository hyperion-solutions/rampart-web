"use client";

import Image from "next/image";
import { useRef } from "react";

/**
 * A drop's Dink screenshot: a small thumbnail that opens the full picture in a dialog.
 * Images are already resized WebP in Vercel Blob (docs/decisions/0005), so Next's image
 * optimizer is skipped (`unoptimized`): no second copy, no optimization quota.
 */
export function DropScreenshot({ url, thumbnailUrl, label }: { url: string; thumbnailUrl: string; label: string }) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="mt-1.5 block border-4 border-black hover:border-rune focus-visible:border-rune"
        aria-label={`Open the screenshot of ${label}`}
      >
        <Image src={thumbnailUrl} alt="" width={160} height={105} unoptimized className="block h-auto w-40" />
      </button>
      <dialog
        ref={dialog}
        aria-label={`Screenshot of ${label}`}
        // Clicking the dark backdrop (the dialog itself, outside the picture) closes it.
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="m-auto max-h-[90vh] max-w-[95vw] bg-transparent p-0 backdrop:bg-obsidian/85"
      >
        <div className="pixel-box space-y-3 p-3">
          <div className="flex items-center justify-between gap-4">
            <p className="font-pixel text-pixel text-brass text-shadow-pixel">{label}</p>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="font-pixel text-pixel text-steel hover:text-limestone"
            >
              Close
            </button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- full size, already resized; dimensions vary */}
          <img src={url} alt={`Screenshot of ${label}`} className="block max-h-[75vh] w-auto max-w-full" />
          <a href={url} target="_blank" rel="noopener noreferrer" className="font-pixel text-pixel text-lightning hover:text-limestone">
            Open in a new tab
          </a>
        </div>
      </dialog>
    </>
  );
}
