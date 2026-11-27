import { NextResponse } from "next/server";
import { container } from "@/composition/container";
import { env } from "@/shared/config/env";

export const dynamic = "force-dynamic";
/** Downloads ~1.5 MB and writes ~22,000 rows in batches. */
export const maxDuration = 120;

/**
 * Refreshes the OSRS item catalog. Called weekly by Vercel Cron (vercel.json), which sends
 * `Authorization: Bearer <CRON_SECRET>`, and by `npm run items:import` locally.
 */
export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${env.cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const started = Date.now();
  const summary = await container.importItemCatalog.execute();
  console.info(`[items] imported ${summary.written} rows in ${Date.now() - started} ms`);
  return NextResponse.json({ ...summary, ms: Date.now() - started });
}
