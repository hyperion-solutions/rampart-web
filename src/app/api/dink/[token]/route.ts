import { NextResponse } from "next/server";
import { container } from "@/composition/container";
import { createRateLimiter } from "@/shared/lib/rate-limit";

/** Link secrets are 32 random bytes in base64url (43 characters). */
const SECRET_FORMAT = /^[A-Za-z0-9_-]{43}$/;
const allow = createRateLimiter({ limit: 30, windowMs: 60_000 });

/**
 * Receives Dink notifications for a member's personal link (see docs/dink/README.md).
 * LOGIN links the account; every other type is accepted and ignored for now.
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
  if (notification.kind === "other") return NextResponse.json({ ignored: notification.type });

  const result = await container.linkAccountFromDink.execute(token, notification.login);
  if (result.outcome === "unknown-token") return NextResponse.json({ error: "Unknown link" }, { status: 404 });

  console.info(`[dink] login ${result.outcome}`);
  return NextResponse.json({ outcome: result.outcome });
}
