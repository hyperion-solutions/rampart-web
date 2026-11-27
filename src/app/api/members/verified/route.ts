import { NextResponse } from "next/server";
import { container } from "@/composition/container";

// Read from the database per request (never at build time), and let the CDN cache it briefly.
export const dynamic = "force-dynamic";

/** Wise Old Man ids of RSNs linked to a member. Public: the members page shows them as "Verified". */
export async function GET() {
  const womPlayerIds = await container.listVerifiedPlayerIds.execute();
  return NextResponse.json(
    { womPlayerIds },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
