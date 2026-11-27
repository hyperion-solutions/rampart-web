"use client";

import { createContext, useContext, useEffect, useState } from "react";

const VerifiedContext = createContext<ReadonlySet<number>>(new Set());

/**
 * Loads which Wise Old Man player ids are linked to a member, in the browser, so pages
 * that show it (members list) stay static. Until it loads, no badges show.
 */
export function VerifiedAccountsProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<ReadonlySet<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetch("/api/members/verified")
      .then((res) => (res.ok ? (res.json() as Promise<{ womPlayerIds: number[] }>) : { womPlayerIds: [] }))
      .then(({ womPlayerIds }) => !cancelled && setIds(new Set(womPlayerIds)))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return <VerifiedContext.Provider value={ids}>{children}</VerifiedContext.Provider>;
}

/** Small "Verified" tag for an RSN linked to a member's Discord account through Dink or an admin. */
export function VerifiedBadge({ womPlayerId }: { womPlayerId: number }) {
  const verified = useContext(VerifiedContext).has(womPlayerId);
  if (!verified) return null;
  return (
    <span
      title="This RSN is linked to a member's Discord account"
      className="inline-flex shrink-0 items-center gap-1 bg-gain/15 px-1.5 font-pixel text-pixel text-gain text-shadow-pixel"
    >
      <span aria-hidden>✓</span>
      Verified
    </span>
  );
}
