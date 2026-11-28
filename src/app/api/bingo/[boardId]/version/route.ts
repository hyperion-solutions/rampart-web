import { NextResponse } from "next/server";
import { auth } from "@/composition/auth";
import { container } from "@/composition/container";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A board's change fingerprint, polled by the board page while it's live (`LiveRefresh`).
 * Members only, like the board itself. `GET /api/bingo/<boardId>/version` -> `{ "version": "..." }`
 */
export async function GET(_request: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const { boardId } = await params;
  if (!UUID.test(boardId)) return NextResponse.json({ error: "No such board" }, { status: 404 });

  const version = await container.bingo.getBoardVersion.execute(boardId, { includeDrafts: session.user.isAdmin === true });
  if (version === null) return NextResponse.json({ error: "No such board" }, { status: 404 });
  return NextResponse.json({ version }, { headers: { "Cache-Control": "no-store" } });
}
