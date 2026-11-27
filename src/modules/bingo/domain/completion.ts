import type { Team } from "./team";
import type { Tile } from "./tile";

export type CompletionSource = "admin" | "dink";

export interface Completion {
  readonly id: string;
  readonly teamId: string;
  readonly tileId: string;
  readonly completedAt: Date;
  readonly source: CompletionSource;
  readonly markedBy: string | null;
  readonly note: string | null;
  /** The member whose drop finished the tile (unknown for completions before progress existed). */
  readonly completedBy: string | null;
  readonly completedByName: string | null;
  readonly completedRsn: string | null;
}

export interface TeamScore {
  readonly team: Team;
  readonly points: number;
  readonly tilesCompleted: number;
}

/** MVP scoring: the sum of each team's completed tiles, highest first. Bonuses come later (v0.4). */
export function scoreTeams(teams: readonly Team[], tiles: readonly Tile[], completions: readonly Completion[]): TeamScore[] {
  const pointsByTile = new Map(tiles.map((t) => [t.id, t.points]));
  return teams
    .map((team) => {
      const done = completions.filter((c) => c.teamId === team.id && pointsByTile.has(c.tileId));
      return {
        team,
        points: done.reduce((sum, c) => sum + (pointsByTile.get(c.tileId) ?? 0), 0),
        tilesCompleted: done.length,
      };
    })
    .sort((a, b) => b.points - a.points || b.tilesCompleted - a.tilesCompleted || a.team.name.localeCompare(b.team.name));
}

/** The most a team can score on a board. */
export const maxPoints = (tiles: readonly Tile[]) => tiles.reduce((sum, t) => sum + t.points, 0);
