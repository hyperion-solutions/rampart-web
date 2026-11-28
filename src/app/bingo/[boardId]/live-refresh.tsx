"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/** Input that counts as someone using the page. */
const ACTIVITY_EVENTS = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart", "scroll"] as const;

/**
 * Keeps a live board up to date: every few seconds, while the tab is visible and someone is
 * using it, it asks the server for the board's change fingerprint and refreshes the page only
 * when it changed. Hidden tabs don't poll, and neither do tabs left alone for `idleAfterMs`
 * (each check is a function call); both catch up with one check as soon as they're used again.
 */
export function LiveRefresh({
  boardId,
  version,
  everyMs = 10_000,
  idleAfterMs = 20 * 60_000,
}: {
  boardId: string;
  version: string;
  everyMs?: number;
  idleAfterMs?: number;
}) {
  const router = useRouter();
  const known = useRef(version);

  // A refresh renders the page with the new fingerprint: take it as the latest known.
  useEffect(() => {
    known.current = version;
  }, [version]);

  useEffect(() => {
    let stopped = false;
    let busy = false;
    let lastActivity = Date.now();
    const idle = () => Date.now() - lastActivity > idleAfterMs;

    async function check() {
      if (stopped || busy || document.visibilityState !== "visible" || idle()) return;
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

    function onActivity() {
      const wasIdle = idle();
      lastActivity = Date.now();
      // Back after a pause: catch up straight away instead of waiting for the next tick.
      if (wasIdle) void check();
    }

    const id = setInterval(check, everyMs);
    document.addEventListener("visibilitychange", check);
    for (const event of ACTIVITY_EVENTS) window.addEventListener(event, onActivity, { passive: true });
    return () => {
      stopped = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", check);
      for (const event of ACTIVITY_EVENTS) window.removeEventListener(event, onActivity);
    };
  }, [boardId, everyMs, idleAfterMs, router]);

  return null;
}
