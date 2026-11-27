import Link from "next/link";
import { notFound } from "next/navigation";
import { container } from "@/composition/container";
import { requireAdmin } from "@/composition/require-admin";
import { formatDateTime } from "@/shared/lib/format";
import { SectionHeading } from "@/shared/ui/section-heading";
import { changeBoardStatusAction, updateBoardAction } from "../actions";
import { BoardForm } from "../_components/board-form";
import { StatusBadge } from "../_components/status-badge";

export const metadata = { title: "Bingo board | Rampart" };
export const dynamic = "force-dynamic";

const STATUS_ACTIONS = {
  draft: [{ to: "live", label: "Publish", hint: "Members can see it once it's live." }],
  live: [
    { to: "finished", label: "Finish", hint: "Locks the board and final scores." },
    { to: "draft", label: "Back to draft", hint: "Hides it from members again." },
  ],
  finished: [],
} as const;

export default async function AdminBoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  await requireAdmin(`/admin/bingo/${boardId}`);
  const overview = await container.bingo.getBoardOverview.execute(boardId, { includeDrafts: true }).catch(() => null);
  if (!overview) notFound();
  const { board, tiles, maxPoints } = overview;

  return (
    <section className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Admin · Bingo" title={board.title} />
        <div className="mb-6 flex items-center gap-3">
          <StatusBadge status={board.status} />
          <Link href="/admin/bingo" className="font-pixel text-pixel text-brass text-shadow-pixel hover:text-limestone">
            All boards
          </Link>
        </div>
      </div>

      <div className="pixel-box flex flex-wrap items-center justify-between gap-4 p-5">
        <p className="text-steel text-shadow-pixel">
          {board.size}×{board.size} · {formatDateTime(board.startsAt)} to {formatDateTime(board.endsAt)} ·{" "}
          {tiles.length} of {board.size * board.size} squares filled · {maxPoints} points possible
        </p>
        <div className="flex flex-wrap gap-3">
          {STATUS_ACTIONS[board.status].map((a) => (
            <form key={a.to} action={changeBoardStatusAction} title={a.hint}>
              <input type="hidden" name="boardId" value={board.id} />
              <input type="hidden" name="to" value={a.to} />
              <button
                type="submit"
                className={`pixel-btn ${a.to === "live" ? "bg-rune text-white" : "bg-granite text-brass"}`}
              >
                {a.label}
              </button>
            </form>
          ))}
        </div>
      </div>

      <div className="pixel-box p-6" id="board-editor">
        <h2 className="font-pixel text-pixel text-brass text-shadow-pixel">Squares</h2>
        <p className="mt-2 text-steel text-shadow-pixel">The board editor is coming next (#56).</p>
      </div>

      {board.status !== "finished" && (
        <details className="pixel-box p-6">
          <summary className="cursor-pointer font-pixel text-pixel text-brass text-shadow-pixel">Edit details</summary>
          <div className="mt-4">
            <BoardForm
              action={updateBoardAction}
              submitLabel="Save details"
              boardId={board.id}
              sizeLocked={board.status !== "draft"}
              initial={{
                title: board.title,
                rules: board.rules,
                size: board.size,
                startsAt: board.startsAt.toISOString(),
                endsAt: board.endsAt.toISOString(),
              }}
            />
          </div>
        </details>
      )}
    </section>
  );
}
