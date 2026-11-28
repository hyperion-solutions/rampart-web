import { NextResponse } from "next/server";
import { container } from "@/composition/container";
import { createRateLimiter } from "@/shared/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Link secrets are 32 random bytes in base64url (43 characters). */
const SECRET_FORMAT = /^[A-Za-z0-9_-]{43}$/;
/** Dink fetches on start, on change, and at most every 3 hours: a few a day per member. */
const allow = createRateLimiter({ limit: 10, windowMs: 60_000 });

/**
 * EXPERIMENT (#106): Dink's "Dynamic Config URL". Dink imports this JSON when it starts, when the
 * URL is set, and at login every 3+ hours. Keys are Dink setting names; settings not listed are
 * left untouched, and `lootItemAllowlist` is merged into the member's own list (never replaced,
 * unless they tick Import Policy -> Overwrite Item Lists).
 *
 * For now it serves two harmless test lines, to see the import work end to end. Never add
 * webhook URLs or Min Loot Value here: members' own Dink setup must not change.
 */
const TEST_ALLOWLIST = ["Rampart test item A", "Rampart test item B"];

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!SECRET_FORMAT.test(token)) return NextResponse.json({ error: "Unknown link" }, { status: 404 });
  if (!allow(token)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  if (!(await container.findLinkOwner.execute(token))) return NextResponse.json({ error: "Unknown link" }, { status: 404 });

  console.info("[dink] dynamic config served (test allowlist)");
  return NextResponse.json({ lootItemAllowlist: TEST_ALLOWLIST.join("\n") }, { headers: { "Cache-Control": "no-store" } });
}
