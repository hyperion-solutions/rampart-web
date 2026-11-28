import { NextResponse } from "next/server";
import { container } from "@/composition/container";
import { env } from "@/shared/config/env";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Deletes drop screenshots 30 days after their board finishes, and stored files no drop uses
 * (docs/decisions/0005). Called daily by Vercel Cron (vercel.json) with `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${env.cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const cleanUp = container.bingo.cleanUpScreenshots;
  if (!cleanUp) return NextResponse.json({ skipped: "no screenshot store configured" });

  const result = await cleanUp.execute();
  console.info(`[screenshots] deleted ${result.expired} expired, ${result.orphans} unused file(s)`);
  return NextResponse.json(result);
}
