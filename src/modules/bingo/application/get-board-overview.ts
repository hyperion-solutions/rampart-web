import type { Board } from "../domain/board";
import { type Completion, maxPoints, scoreTeams, type TeamScore } from "../domain/completion";
import type { BoardRepository, CompletionRepository, TeamRepository, TileRepository } from "../domain/repositories";
import type { Team, TeamMember } from "../domain/team";
import type { Tile } from "../domain/tile";

export interface BoardOverview {
  readonly board: Board;
  readonly tiles: readonly Tile[];
  readonly teams: readonly Team[];
  readonly members: readonly TeamMember[];
  readonly completions: readonly Completion[];
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
  ) {}

  async execute(boardId: string, { includeDrafts }: { includeDrafts: boolean }): Promise<BoardOverview | null> {
    const board = await this.boards.findById(boardId);
    if (!board || (board.status === "draft" && !includeDrafts)) return null;

    const [tiles, teams, members, completions] = await Promise.all([
      this.tiles.listForBoard(boardId),
      this.teams.listForBoard(boardId),
      this.teams.listMembers(boardId),
      this.completions.listForBoard(boardId),
    ]);
    return {
      board,
      tiles,
      teams,
      members,
      completions,
      scores: scoreTeams(teams, tiles, completions),
      maxPoints: maxPoints(tiles),
    };
  }
}
