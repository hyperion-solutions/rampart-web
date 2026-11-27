import type { Board } from "../domain/board";
import { type Completion, maxPoints, scoreTeams, type TeamScore } from "../domain/completion";
import type { ProgressEntry } from "../domain/progress";
import type {
  BoardRepository,
  CompletionRepository,
  ProgressRepository,
  TeamRepository,
  TileRepository,
} from "../domain/repositories";
import type { Team, TeamMember } from "../domain/team";
import type { Tile } from "../domain/tile";

export interface BoardOverview {
  readonly board: Board;
  readonly tiles: readonly Tile[];
  readonly teams: readonly Team[];
  readonly members: readonly TeamMember[];
  readonly completions: readonly Completion[];
  readonly progress: readonly ProgressEntry[];
  readonly scores: readonly TeamScore[];
  readonly maxPoints: number;
}

/** Everything a board page needs. Drafts are only returned for admins. */
export class GetBoardOverview {
  constructor(
    private readonly boards: BoardRepository,
    private readonly tiles: TileRepository,
    private readonly teams: TeamRepository,
    private readonly completions: CompletionRepository,
    private readonly progress: ProgressRepository,
  ) {}

  async execute(boardId: string, { includeDrafts }: { includeDrafts: boolean }): Promise<BoardOverview | null> {
    const board = await this.boards.findById(boardId);
    if (!board || (board.status === "draft" && !includeDrafts)) return null;

    const [tiles, teams, members, completions, progress] = await Promise.all([
      this.tiles.listForBoard(boardId),
      this.teams.listForBoard(boardId),
      this.teams.listMembers(boardId),
      this.completions.listForBoard(boardId),
      this.progress.listForBoard(boardId),
    ]);
    return {
      board,
      tiles,
      teams,
      members,
      completions,
      progress,
      scores: scoreTeams(board, teams, tiles, completions),
      maxPoints: maxPoints(board, tiles),
    };
  }
}
