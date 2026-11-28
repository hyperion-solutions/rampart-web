import { NextResponse } from "next/server";
import { container } from "@/composition/container";
import { env } from "@/shared/config/env";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Daily upkeep, called by Vercel Cron (vercel.json) with `Authorization: Bearer <CRON_SECRET>`.
 * One route for several jobs: the Hobby plan allows only a couple of cron jobs.
 * 1. Finish live boards 48 hours after their end, so results become final.
 * 2. Delete drop screenshots 30 days after a board finishes, and stored files no drop uses (0005).
 */
export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${env.cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const boards = await container.bingo.finishEndedBoards.execute();
  if (boards.finished.length > 0) console.info(`[boards] finished automatically: ${boards.finished.length}`);

  // Runs after finishing, so boards finished today start their 30 days today.
  const cleanUp = container.bingo.cleanUpScreenshots;
  const screenshots = cleanUp ? await cleanUp.execute() : { skipped: "no screenshot store configured" };
  if ("expired" in screenshots) {
    console.info(`[screenshots] deleted ${screenshots.expired} expired, ${screenshots.orphans} unused file(s)`);
  }

  return NextResponse.json({ boardsFinished: boards.finished.length, screenshots });
}
