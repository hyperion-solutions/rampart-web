import type { Board } from "../domain/board";
import type { BoardRepository, TeamRepository } from "../domain/repositories";
import type { Team } from "../domain/team";
import type { GetBoardOverview } from "./get-board-overview";

export interface MyDropShot {
  readonly tileName: string;
  readonly url: string;
  readonly thumbnailUrl: string;
}

/** A member's bingo at a glance, for My account. */
export interface MyBingo {
  readonly board: Pick<Board, "id" | "title" | "status" | "startsAt" | "endsAt">;
  readonly team: Pick<Team, "id" | "name" | "colour">;
  /** 1-based place on the scoreboard, and out of how many teams. */
  readonly place: number;
  readonly teams: number;
  readonly teamPoints: number;
  readonly maxPoints: number;
  /** Drops this member got (progress entries in their name). */
  readonly myDrops: number;
  /** Tiles their drop finished, and those tiles' points. */
  readonly myTiles: number;
  readonly myPoints: number;
  /** Their latest drop screenshots, newest first. */
  readonly screenshots: readonly MyDropShot[];
}

const SHOTS = 4;

/**
 * The board a member is playing (live, newest start first) or last played (finished), with their
 * team's place and what they contributed. Null when they're on no team of a published board.
 */
export class GetMyBingo {
  constructor(
    private readonly boards: BoardRepository,
    private readonly teams: TeamRepository,
    private readonly overview: GetBoardOverview,
  ) {}

  async execute(userId: string): Promise<MyBingo | null> {
    // Live boards first (they're what's happening now), then finished ones; each list is newest first.
    const [live, finished] = await Promise.all([this.boards.list(["live"]), this.boards.list(["finished"])]);
    for (const board of [...live, ...finished]) {
      const member = (await this.teams.listMembers(board.id)).find((m) => m.userId === userId);
      if (member) return this.summarise(board.id, member.teamId, userId);
    }
    return null;
  }

  private async summarise(boardId: string, teamId: string, userId: string): Promise<MyBingo | null> {
    const o = await this.overview.execute(boardId, { includeDrafts: false });
    if (!o) return null;
    const index = o.scores.findIndex((s) => s.team.id === teamId);
    const score = o.scores[index];
    if (!score) return null;

    const tileById = new Map(o.tiles.map((t) => [t.id, t]));
    const mine = o.progress.filter((p) => p.teamId === teamId && p.obtainedBy === userId);
    const finishedByMe = o.completions.filter((c) => c.teamId === teamId && c.completedBy === userId);
    const seen = new Set<string>();
    const screenshots = [...mine]
      .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
      .flatMap((p) => {
        // One loot can count on several tiles with the same picture: show each picture once.
        if (!p.screenshotUrl || !p.thumbnailUrl || seen.has(p.screenshotUrl)) return [];
        seen.add(p.screenshotUrl);
        return [{ tileName: tileById.get(p.tileId)?.name ?? "Drop", url: p.screenshotUrl, thumbnailUrl: p.thumbnailUrl }];
      })
      .slice(0, SHOTS);

    return {
      board: { id: o.board.id, title: o.board.title, status: o.board.status, startsAt: o.board.startsAt, endsAt: o.board.endsAt },
      team: { id: score.team.id, name: score.team.name, colour: score.team.colour },
      place: index + 1,
      teams: o.scores.length,
      teamPoints: score.points,
      maxPoints: o.maxPoints,
      myDrops: mine.length,
      myTiles: finishedByMe.length,
      myPoints: finishedByMe.reduce((sum, c) => sum + (tileById.get(c.tileId)?.points ?? 0), 0),
      screenshots,
    };
  }
}
