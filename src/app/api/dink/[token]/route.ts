import { NextResponse } from "next/server";
import { container } from "@/composition/container";
import { createRateLimiter } from "@/shared/lib/rate-limit";

/** Link secrets are 32 random bytes in base64url (43 characters). */
const SECRET_FORMAT = /^[A-Za-z0-9_-]{43}$/;
// Loot arrives once per kill or pickpocket, so allow a busy session (about one a second).
const allow = createRateLimiter({ limit: 60, windowMs: 60_000 });

/**
 * Receives Dink notifications for a member's personal link (see docs/dink/README.md).
 * LOGIN links the account; LOOT counts toward running bingo boards (#32); every other type is
 * accepted and ignored.
 * Responses are short JSON; payloads are never logged.
 */
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!SECRET_FORMAT.test(token)) return NextResponse.json({ error: "Unknown link" }, { status: 404 });
  if (!allow(token)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const notification = await container.readDinkNotification(request);
  if (notification.kind === "invalid") {
    return NextResponse.json({ error: `Invalid Dink payload: ${notification.reason}` }, { status: 400 });
  }
  if (notification.kind === "other") {
    console.info(`[dink] ${notification.type} ignored`);
    return NextResponse.json({ ignored: notification.type });
  }

  if (notification.kind === "loot") {
    const { loot } = notification;
    const sender = await container.identifyDinkAccount.execute(token, loot.dinkAccountHash);
    if (sender.status === "unknown-token") return NextResponse.json({ error: "Unknown link" }, { status: 404 });
    // Item ids aren't personal and show what Dink sent, so the log can explain a missed drop.
    const items = loot.items.map((i) => `${i.itemId}x${i.quantity}`).join(",");
    // Dink only needs a 2xx; say why nothing happened, for anyone testing their setup.
    if (sender.status === "not-linked") {
      console.info(`[dink] LOOT not counted: account not linked (items ${items})`);
      return NextResponse.json({ ignored: "LOOT", reason: "account not linked" });
    }

    const { outcome, recorded, screenshot } = await container.bingo.recordDinkDrops.execute({
      userId: sender.userId,
      rsn: sender.rsn,
      items: loot.items,
      source: loot.source,
      screenshot: loot.screenshot,
    });
    console.info(
      outcome === "counted"
        ? `[dink] LOOT counted on ${recorded.length} tile(s) (items ${items}; screenshot ${screenshot})`
        : `[dink] LOOT not counted: ${outcome} (items ${items})`,
    );
    return NextResponse.json({ counted: recorded.length, outcome });
  }

  const result = await container.linkAccountFromDink.execute(token, notification.login);
  if (result.outcome === "unknown-token") return NextResponse.json({ error: "Unknown link" }, { status: 404 });

  console.info(`[dink] login ${result.outcome}`);
  return NextResponse.json({ outcome: result.outcome });
}
