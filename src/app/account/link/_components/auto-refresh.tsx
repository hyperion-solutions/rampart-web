"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Re-renders the page every few seconds while waiting for Dink, for up to five minutes. */
export function AutoRefresh({ everyMs = 5000, forMs = 5 * 60 * 1000 }: { everyMs?: number; forMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => {
      if (Date.now() - started > forMs) clearInterval(id);
      else router.refresh();
    }, everyMs);
    return () => clearInterval(id);
  }, [router, everyMs, forMs]);
  return null;
}
