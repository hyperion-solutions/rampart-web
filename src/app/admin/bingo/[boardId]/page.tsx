import Link from "next/link";
import { notFound } from "next/navigation";
import { container } from "@/composition/container";
import { requireAdmin } from "@/composition/require-admin";
import { BACK_TO_DRAFT_BLOCKED, canGoBackToDraft, isLocked, lockedReason } from "@/modules/bingo/domain/board";
import { formatDateTime } from "@/shared/lib/format";
import { SectionHeading } from "@/shared/ui/section-heading";
import { changeBoardStatusAction, updateBoardAction } from "../actions";
import { BoardForm } from "../_components/board-form";
import { StatusBadge } from "../_components/status-badge";
import { BoardEditor } from "./board-editor";
import { BoardTools } from "./board-tools";
import { TeamsSection } from "./teams-section";

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
  const { board, tiles, maxPoints, teams, members, progress, completions } = overview;
  // Squares and scoring are fixed once the board is live and has started (or finished).
  const locked = isLocked(board);
  const draftAllowed = canGoBackToDraft(board, progress.length > 0 || completions.length > 0);
  const statusActions = STATUS_ACTIONS[board.status].filter((a) => a.to !== "draft" || draftAllowed);
  const players = new Map(
    (await container.bingo.getPlayers.execute(members.map((m) => m.userId))).map((p) => [p.userId, p]),
  );
  const itemIds = tiles.flatMap((t) => [...t.itemIds, ...(t.iconItemId === null ? [] : [t.iconItemId])]);
  const items = Object.fromEntries((await container.getItems.execute(itemIds)).map((i) => [i.id, i]));

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
          {board.bonuses.row + board.bonuses.column + board.bonuses.diagonal + board.bonuses.blackout > 0 &&
            ` · bonuses: row ${board.bonuses.row}, column ${board.bonuses.column}, diagonal ${board.bonuses.diagonal}, blackout ${board.bonuses.blackout}`}
        </p>
        <div className="flex flex-wrap gap-3">
          {statusActions.map((a) => (
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
        {board.status === "live" && !draftAllowed && (
          <p className="w-full text-steel text-shadow-pixel">{BACK_TO_DRAFT_BLOCKED}</p>
        )}
      </div>

      {!locked && tiles.length < board.size * board.size && (
        <p role="status" className="bg-brass/15 px-4 py-3 text-limestone text-shadow-pixel">
          {board.size * board.size - tiles.length} square{board.size * board.size - tiles.length === 1 ? " is" : "s are"} empty.
          Empty squares can&apos;t be completed, so rows, columns and diagonals through them never earn a bonus, and the
          blackout bonus is impossible. Fill them before publishing.
        </p>
      )}

      <div className="pixel-box p-6" id="board-editor">
        <h2 className="mb-4 font-pixel text-pixel text-brass text-shadow-pixel">Squares</h2>
        {board.status === "draft" && (
          <BoardTools boardId={board.id} filled={tiles.length} total={board.size * board.size} />
        )}
        <BoardEditor
          boardId={board.id}
          size={board.size}
          readOnly={locked}
          readOnlyReason={locked ? lockedReason(board) : undefined}
          items={items}
          tiles={tiles.map((t) => ({
            row: t.row,
            col: t.col,
            name: t.name,
            points: t.points,
            quantity: t.quantity,
            rule: t.rule,
            description: t.description,
            iconItemId: t.iconItemId,
            itemIds: t.itemIds,
          }))}
        />
      </div>

      <div className="pixel-box p-6">
        <h2 className="mb-4 font-pixel text-pixel text-brass text-shadow-pixel">Teams</h2>
        <TeamsSection
          boardId={board.id}
          teams={teams}
          members={members}
          players={players}
          readOnly={board.status === "finished"}
        />
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
              startLocked={locked}
              initial={{
                title: board.title,
                rules: board.rules,
                size: board.size,
                startsAt: board.startsAt.toISOString(),
                endsAt: board.endsAt.toISOString(),
                bonuses: board.bonuses,
              }}
            />
          </div>
        </details>
      )}
    </section>
  );
}
