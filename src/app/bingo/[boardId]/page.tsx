import Link from "next/link";
import { notFound } from "next/navigation";
import { teamSwatch } from "@/app/_components/team-colour";
import { container } from "@/composition/container";
import { requireMember } from "@/composition/require-admin";
import { formatDateTime } from "@/shared/lib/format";
import { SectionHeading } from "@/shared/ui/section-heading";
import { BoardView, type ViewCompletion } from "./board-view";

export const metadata = { title: "Bingo board | Rampart" };
export const dynamic = "force-dynamic";

export default async function BingoBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ boardId: string }>;
  searchParams: Promise<{ team?: string }>;
}) {
  const { boardId } = await params;
  const { team: teamParam } = await searchParams;
  const user = await requireMember(`/bingo/${boardId}`);
  const isAdmin = user.isAdmin === true;

  // Admins can preview drafts here; members only see live and finished boards.
  const overview = await container.bingo.getBoardOverview.execute(boardId, { includeDrafts: isAdmin }).catch(() => null);
  if (!overview) notFound();
  const { board, tiles, teams, members, completions, scores, maxPoints } = overview;

  const myTeamId = members.find((m) => m.userId === user.id)?.teamId;
  const selectedTeam =
    teams.find((t) => t.id === teamParam) ?? teams.find((t) => t.id === myTeamId) ?? scores[0]?.team ?? null;

  const itemIds = tiles.flatMap((t) => [...t.itemIds, ...(t.iconItemId === null ? [] : [t.iconItemId])]);
  const items = new Map((await container.getItems.execute(itemIds)).map((i) => [i.id, i]));
  const teamCompletions: Record<string, ViewCompletion> = Object.fromEntries(
    completions
      .filter((c) => c.teamId === selectedTeam?.id)
      .map((c) => [c.tileId, { completedAt: c.completedAt.toISOString(), note: c.note }]),
  );

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <div>
        <SectionHeading eyebrow={`Bingo · ${board.status === "live" ? "Live" : board.status === "finished" ? "Finished" : "Draft (admins only)"}`} title={board.title} />
        <p className="text-steel text-shadow-pixel">
          {board.size}×{board.size} · {formatDateTime(board.startsAt)} to {formatDateTime(board.endsAt)}
        </p>
        {board.rules && (
          <details className="pixel-box mt-4 p-4">
            <summary className="cursor-pointer font-pixel text-pixel text-brass text-shadow-pixel">Rules</summary>
            <p className="mt-2 whitespace-pre-line text-steel text-shadow-pixel">{board.rules}</p>
          </details>
        )}
      </div>

      <div className="pixel-box p-5">
        <h2 className="mb-3 font-pixel text-pixel text-brass text-shadow-pixel">Scoreboard</h2>
        {scores.length === 0 ? (
          <p className="text-steel text-shadow-pixel">Teams haven&apos;t been set up yet.</p>
        ) : (
          <ol className="divide-y-4 divide-obsidian">
            {scores.map((s, i) => (
              <li key={s.team.id}>
                <Link
                  href={`/bingo/${board.id}?team=${s.team.id}`}
                  className={`flex items-center gap-3 px-2 py-2 hover:bg-rune/20 ${s.team.id === selectedTeam?.id ? "bg-rune/15" : ""}`}
                >
                  <span className="w-6 font-pixel text-pixel text-steel">{i + 1}</span>
                  <span className={`size-4 border-2 border-black ${teamSwatch(s.team.colour)}`} aria-hidden />
                  <span className="flex-1 font-pixel text-pixel text-limestone text-shadow-pixel">
                    {s.team.name}
                    {s.team.id === myTeamId && <span className="text-brass"> (your team)</span>}
                  </span>
                  <span className="text-steel">{s.tilesCompleted} tiles</span>
                  <span className="w-28 text-right font-pixel text-pixel text-gain text-shadow-pixel">
                    {s.points} / {maxPoints}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="space-y-3">
        {selectedTeam && (
          <p className="font-pixel text-pixel text-limestone text-shadow-pixel">
            Showing <span className="text-brass">{selectedTeam.name}</span>
            <span className="text-steel">
              {" "}
              ({members.filter((m) => m.teamId === selectedTeam.id).map((m) => m.displayName).join(", ") || "no members yet"})
            </span>
          </p>
        )}
        <BoardView
          boardId={board.id}
          size={board.size}
          team={selectedTeam ? { id: selectedTeam.id, name: selectedTeam.name } : null}
          completions={teamCompletions}
          canMark={isAdmin && board.status === "live"}
          tiles={tiles.map((t) => ({
            id: t.id,
            row: t.row,
            col: t.col,
            name: t.name,
            points: t.points,
            quantity: t.quantity,
            description: t.description,
            icon: (t.iconItemId !== null ? items.get(t.iconItemId) : undefined) ?? null,
            items: t.itemIds.flatMap((id) => {
              const item = items.get(id);
              return item ? [item] : [];
            }),
          }))}
        />
      </div>

      {isAdmin && (
        <p className="text-steel text-shadow-pixel">
          Admin:{" "}
          <Link href={`/admin/bingo/${board.id}`} className="text-brass hover:text-limestone">
            edit this board
          </Link>
          {board.status === "live" ? ". Pick a team on the scoreboard, then click a tile to mark it." : "."}
        </p>
      )}
    </section>
  );
}
