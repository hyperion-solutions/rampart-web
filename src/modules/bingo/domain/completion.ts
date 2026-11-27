import type { Board } from "./board";
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

/** Which lines a team has fully completed. */
export interface CompletedLines {
  /** Row indexes (0 = top). */
  readonly rows: readonly number[];
  /** Column indexes (0 = left). */
  readonly columns: readonly number[];
  /** "main" = top-left to bottom-right, "anti" = top-right to bottom-left. */
  readonly diagonals: readonly ("main" | "anti")[];
  readonly blackout: boolean;
}

export interface TeamScore {
  readonly team: Team;
  /** Tile points + bonus points. */
  readonly points: number;
  readonly tilePoints: number;
  readonly bonusPoints: number;
  readonly tilesCompleted: number;
  readonly lines: CompletedLines;
}

type BoardShape = Pick<Board, "size" | "bonuses">;

/** The squares of every line on a board, keyed for scoring. */
function boardLines(size: number) {
  const range = Array.from({ length: size }, (_, i) => i);
  return {
    rows: range.map((r) => range.map((c) => [r, c] as const)),
    columns: range.map((c) => range.map((r) => [r, c] as const)),
    main: range.map((i) => [i, i] as const),
    anti: range.map((i) => [i, size - 1 - i] as const),
  };
}

/**
 * Lines whose every square has a tile the team completed. Empty squares can't be completed,
 * so a line through one never counts.
 */
export function completedLines(size: number, tiles: readonly Tile[], completedTileIds: ReadonlySet<string>): CompletedLines {
  const done = new Set(tiles.filter((t) => completedTileIds.has(t.id)).map((t) => `${t.row}:${t.col}`));
  const full = (squares: readonly (readonly [number, number])[]) => squares.every(([r, c]) => done.has(`${r}:${c}`));
  const lines = boardLines(size);
  return {
    rows: lines.rows.flatMap((sq, i) => (full(sq) ? [i] : [])),
    columns: lines.columns.flatMap((sq, i) => (full(sq) ? [i] : [])),
    diagonals: [...(full(lines.main) ? (["main"] as const) : []), ...(full(lines.anti) ? (["anti"] as const) : [])],
    blackout: done.size === size * size,
  };
}

const bonusFor = (lines: CompletedLines, bonuses: BoardShape["bonuses"]) =>
  lines.rows.length * bonuses.row +
  lines.columns.length * bonuses.column +
  lines.diagonals.length * bonuses.diagonal +
  (lines.blackout ? bonuses.blackout : 0);

/** Score = completed tile points + line and blackout bonuses. Highest first. */
export function scoreTeams(
  board: BoardShape,
  teams: readonly Team[],
  tiles: readonly Tile[],
  completions: readonly Completion[],
): TeamScore[] {
  const pointsByTile = new Map(tiles.map((t) => [t.id, t.points]));
  return teams
    .map((team) => {
      const doneIds = new Set(completions.filter((c) => c.teamId === team.id && pointsByTile.has(c.tileId)).map((c) => c.tileId));
      const tilePoints = [...doneIds].reduce((sum, id) => sum + (pointsByTile.get(id) ?? 0), 0);
      const lines = completedLines(board.size, tiles, doneIds);
      const bonusPoints = bonusFor(lines, board.bonuses);
      return { team, points: tilePoints + bonusPoints, tilePoints, bonusPoints, tilesCompleted: doneIds.size, lines };
    })
    .sort((a, b) => b.points - a.points || b.tilesCompleted - a.tilesCompleted || a.team.name.localeCompare(b.team.name));
}

/** The most a team can score: every tile plus every line that is fully filled with tiles. */
export function maxPoints(board: BoardShape, tiles: readonly Tile[]): number {
  const allTiles = new Set(tiles.map((t) => t.id));
  return tiles.reduce((sum, t) => sum + t.points, 0) + bonusFor(completedLines(board.size, tiles, allTiles), board.bonuses);
}
