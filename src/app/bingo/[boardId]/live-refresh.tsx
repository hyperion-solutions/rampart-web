"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Keeps a live board up to date: every few seconds, while the tab is visible, it asks the
 * server for the board's change fingerprint and refreshes the page only when it changed.
 * Hidden tabs don't poll, and they check once as soon as they're shown again.
 */
export function LiveRefresh({ boardId, version, everyMs = 10_000 }: { boardId: string; version: string; everyMs?: number }) {
  const router = useRouter();
  const known = useRef(version);

  // A refresh renders the page with the new fingerprint: take it as the latest known.
  useEffect(() => {
    known.current = version;
  }, [version]);

  useEffect(() => {
    let stopped = false;
    let busy = false;

    async function check() {
      if (stopped || busy || document.visibilityState !== "visible") return;
      busy = true;
      try {
        const res = await fetch(`/api/bingo/${boardId}/version`, { cache: "no-store" });
        if (!res.ok) return;
        const { version: latest } = (await res.json()) as { version?: string };
        if (latest && latest !== known.current) {
          known.current = latest;
          router.refresh();
        }
      } catch {
        // Offline or a deploy in progress: try again on the next tick.
      } finally {
        busy = false;
      }
    }

    const id = setInterval(check, everyMs);
    document.addEventListener("visibilitychange", check);
    return () => {
      stopped = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", check);
    };
  }, [boardId, everyMs, router]);

  return null;
}
