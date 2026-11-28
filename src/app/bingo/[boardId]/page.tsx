import Link from "next/link";
import { notFound } from "next/navigation";
import { BoardCountdown } from "@/app/_components/board-countdown";
import { teamSwatch } from "@/app/_components/team-colour";
import { container } from "@/composition/container";
import { requireMember } from "@/composition/require-admin";
import { formatDateTime } from "@/shared/lib/format";
import { SectionHeading } from "@/shared/ui/section-heading";
import { AUTO_FINISH_AFTER_HOURS, hasEnded } from "@/modules/bingo/domain/board";
import type { CompletedLines, TeamScore } from "@/modules/bingo/domain/completion";
import { LiveRefresh } from "./live-refresh";
import { tileProgress } from "@/modules/bingo/domain/progress";
import { BoardView, type ViewTileState } from "./board-view";

export const metadata = { title: "Bingo board | Rampart" };

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** "2 rows, 1 diagonal, blackout" */
function describeLines(lines: CompletedLines): string {
  return [
    lines.rows.length > 0 && plural(lines.rows.length, "row"),
    lines.columns.length > 0 && plural(lines.columns.length, "column"),
    lines.diagonals.length > 0 && plural(lines.diagonals.length, "diagonal"),
    lines.blackout && "blackout",
  ]
    .filter(Boolean)
    .join(", ");
}

/** Squares ("row:col") on any completed line, to outline on the grid. */
function lineSquares(lines: CompletedLines, size: number): string[] {
  const range = Array.from({ length: size }, (_, i) => i);
  return [
    ...lines.rows.flatMap((r) => range.map((c) => `${r}:${c}`)),
    ...lines.columns.flatMap((c) => range.map((r) => `${r}:${c}`)),
    ...(lines.diagonals.includes("main") ? range.map((i) => `${i}:${i}`) : []),
    ...(lines.diagonals.includes("anti") ? range.map((i) => `${i}:${size - 1 - i}`) : []),
  ];
}
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
  const { board, tiles, teams, members, completions, progress, scores, maxPoints } = overview;

  const myTeamId = members.find((m) => m.userId === user.id)?.teamId;
  const selectedTeam =
    teams.find((t) => t.id === teamParam) ?? teams.find((t) => t.id === myTeamId) ?? scores[0]?.team ?? null;

  const itemIds = tiles.flatMap((t) => [...t.itemIds, ...(t.iconItemId === null ? [] : [t.iconItemId])]);
  const items = new Map((await container.getItems.execute(itemIds)).map((i) => [i.id, i]));
  const states: Record<string, ViewTileState> = Object.fromEntries(
    tiles.map((t) => {
      const completion = completions.find((c) => c.teamId === selectedTeam?.id && c.tileId === t.id);
      const entries = progress.filter((p) => p.teamId === selectedTeam?.id && p.tileId === t.id);
      const { done, complete, obtainedItemIds } = tileProgress(t, entries, completion !== undefined);
      return [
        t.id,
        {
          done,
          complete,
          obtainedItemIds,
          completedAt: completion?.completedAt.toISOString() ?? null,
          completedByName: completion?.completedByName ?? null,
          completedRsn: completion?.completedRsn ?? null,
          entries: entries.map((e) => ({
            id: e.id,
            amount: e.amount,
            itemName: e.itemId !== null ? (items.get(e.itemId)?.name ?? null) : null,
            obtainedByName: e.obtainedByName,
            obtainedRsn: e.obtainedRsn,
            source: e.source,
            addedByName: e.addedByName,
            addedByCaptain: e.addedBy !== null && e.addedBy === selectedTeam?.captainUserId,
            note: e.note,
            screenshotUrl: e.screenshotUrl,
            thumbnailUrl: e.thumbnailUrl,
            addedAt: e.addedAt.toISOString(),
          })),
        },
      ];
    }),
  );
  const teamPlayers = selectedTeam
    ? await container.bingo.getPlayers.execute(members.filter((m) => m.teamId === selectedTeam.id).map((m) => m.userId))
    : [];


  const now = new Date();
  const ended = board.status === "live" && hasEnded(board, now);
  const isCaptain = selectedTeam !== null && selectedTeam.captainUserId === user.id;
  // Captains add drops while the board runs; after the end only admins catch up on late screenshots.
  const canEdit = board.status === "live" && board.startsAt <= now && (isAdmin || (isCaptain && !ended));

  // Live boards update themselves as drops come in (from Dink or added by hand).
  const version = board.status === "live" ? await container.bingo.getBoardVersion.execute(board.id, { includeDrafts: isAdmin }) : null;

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      {version && <LiveRefresh boardId={board.id} version={version} />}
      <div>
        <SectionHeading eyebrow={`Bingo · ${board.status === "live" ? "Live" : board.status === "finished" ? "Finished" : "Draft (admins only)"}`} title={board.title} />
        <p className="text-steel text-shadow-pixel">
          {board.size}×{board.size} · {formatDateTime(board.startsAt)} to {formatDateTime(board.endsAt)}
        </p>
        <div className="mt-4">
          <BoardCountdown
            variant="title"
            startsAt={board.startsAt.toISOString()}
            endsAt={board.endsAt.toISOString()}
            status={board.status}
          />
        </div>
        {board.bonuses.row + board.bonuses.column + board.bonuses.diagonal + board.bonuses.blackout > 0 && (
          <p className="mt-2 font-pixel text-pixel text-brass text-shadow-pixel">
            Bonuses:{" "}
            {[
              ["Row", board.bonuses.row],
              ["Column", board.bonuses.column],
              ["Diagonal", board.bonuses.diagonal],
              ["Blackout", board.bonuses.blackout],
            ]
              .filter(([, pts]) => Number(pts) > 0)
              .map(([label, pts]) => `${label} ${pts} pts`)
              .join(" · ")}
          </p>
        )}
        {ended && (
          <p role="status" className="mt-4 bg-brass/15 px-4 py-3 text-limestone text-shadow-pixel">
            This board has ended. Admins are adding the last screenshots; results are final once it&apos;s finished
            (automatically {AUTO_FINISH_AFTER_HOURS} hours after the end).
          </p>
        )}
        {board.status === "finished" && <Results scores={scores} />}
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
                    {s.team.captainUserId && (
                      <span className="hidden text-steel md:inline">
                        {" "}
                        · ★ {members.find((m) => m.userId === s.team.captainUserId)?.displayName ?? "Captain"}
                      </span>
                    )}
                  </span>
                  <span className="hidden text-steel sm:inline">
                    {s.tilesCompleted} tiles
                    {s.bonusPoints > 0 && ` · ${s.tilePoints} + ${s.bonusPoints} bonus (${describeLines(s.lines)})`}
                  </span>
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
            {selectedTeam.captainUserId && (
              <span className="text-limestone">
                {" "}
                · Captain ★ {members.find((m) => m.userId === selectedTeam.captainUserId)?.displayName}
                {isCaptain && canEdit && " (you can add drops for your team)"}
              </span>
            )}
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
          states={states}
          lineSquares={lineSquares(
            scores.find((sc) => sc.team.id === selectedTeam?.id)?.lines ?? { rows: [], columns: [], diagonals: [], blackout: false },
            board.size,
          )}
          members={teamPlayers.map((p) => ({ userId: p.userId, displayName: p.displayName, rsns: p.rsns }))}
          canEdit={canEdit}
          notStartedYet={board.status === "live" && board.startsAt > now}
          tiles={tiles.map((t) => ({
            id: t.id,
            row: t.row,
            col: t.col,
            name: t.name,
            points: t.points,
            quantity: t.quantity,
            rule: t.rule,
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
          {board.status === "live" && board.startsAt > new Date()
            ? `. Drops can be added once it starts (${formatDateTime(board.startsAt)}).`
            : board.status === "live"
              ? ". Pick a team on the scoreboard, then click a tile to add a drop."
              : "."}
        </p>
      )}
    </section>
  );
}

/** The final result of a finished board: the winner, or the teams tied for first. */
function Results({ scores }: { scores: readonly TeamScore[] }) {
  const top = scores[0]?.points ?? 0;
  const winners = scores.filter((s) => s.points === top);
  const text =
    scores.length === 0
      ? "Finished. No teams played this board."
      : top === 0
        ? "Finished. No team completed a tile."
        : winners.length === 1
          ? `${winners[0]?.team.name} won with ${top} points!`
          : `${winners.map((w) => w.team.name).join(" and ")} tied for first with ${top} points!`;
  return (
    <div className="pixel-box mt-4 p-5 text-center [--edge:var(--color-brass)]">
      <p className="font-pixel text-pixel text-brass text-shadow-pixel">Final result</p>
      <p className="mt-1 font-quill text-pixel-2x text-limestone text-shadow-pixel">{text}</p>
    </div>
  );
}
