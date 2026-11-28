import { NextResponse } from "next/server";
import { container } from "@/composition/container";
import { createRateLimiter } from "@/shared/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Link secrets are 32 random bytes in base64url (43 characters). */
const SECRET_FORMAT = /^[A-Za-z0-9_-]{43}$/;
/** Dink fetches on start, on change, and at most every 3 hours: a few a day per member. */
const allow = createRateLimiter({ limit: 10, windowMs: 60_000 });

/**
 * Dink's "Dynamic Config URL" (docs/decisions/0006-dink-dynamic-allowlist.md). Dink imports this
 * JSON when it starts, when the URL is set, and at login every 3+ hours. Keys are Dink setting
 * names; settings not listed are left untouched. We send only `lootItemAllowlist`: the names of
 * every item on boards that are published and not over, so bingo drops are always reported even
 * with a high Min Loot Value. With Import Policy -> Overwrite Item Lists ticked, the member's
 * allowlist becomes exactly this list (old boards' items drop off); otherwise Dink merges it in.
 *
 * Never add webhook URLs, Min Loot Value or other settings here: members' own Dink setup must not change.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!SECRET_FORMAT.test(token)) return NextResponse.json({ error: "Unknown link" }, { status: 404 });
  if (!allow(token)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  if (!(await container.findLinkOwner.execute(token))) return NextResponse.json({ error: "Unknown link" }, { status: 404 });

  const names = await container.listItemNames.execute(await container.bingo.listTrackedItemIds.execute());
  console.info(`[dink] dynamic config served (${names.length} allowlist names)`);
  // An empty list is sent too: with Overwrite Item Lists it clears items from boards that ended.
  return NextResponse.json({ lootItemAllowlist: names.join("\n") }, { headers: { "Cache-Control": "no-store" } });
}
