import { NextResponse } from "next/server";
import { container } from "@/composition/container";
import { getAdmin } from "@/composition/require-admin";

export const dynamic = "force-dynamic";

/** Item search for the board editor. Admins only. `GET /api/items/search?q=whip` */
export async function GET(request: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: "Admins only" }, { status: 403 });
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const items = await container.searchItems.execute(q);
  return NextResponse.json({ items });
}
