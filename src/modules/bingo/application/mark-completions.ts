import type { BoardRepository, CompletionRepository, TeamRepository, TileRepository } from "../domain/repositories";
import { fail, ok, type Result } from "./board-result";

/** Checks the board is live and the team and tile belong to it. */
async function checkLive(
  boards: BoardRepository,
  teams: TeamRepository,
  tiles: TileRepository,
  boardId: string,
  teamId: string,
  tileId: string,
): Promise<Result<null>> {
  const board = await boards.findById(boardId);
  if (!board) return fail("That board doesn't exist.");
  if (board.status !== "live") return fail("Tiles can only be marked while the board is live.");
  const [boardTeams, boardTiles] = await Promise.all([teams.listForBoard(boardId), tiles.listForBoard(boardId)]);
  if (!boardTeams.some((t) => t.id === teamId)) return fail("That team isn't on this board.");
  if (!boardTiles.some((t) => t.id === tileId)) return fail("That tile isn't on this board.");
  return ok(null);
}

/** An admin marks a tile complete for a team (from a screenshot in Discord, for now). */
export class MarkTileComplete {
  constructor(
    private readonly boards: BoardRepository,
    private readonly teams: TeamRepository,
    private readonly tiles: TileRepository,
    private readonly completions: CompletionRepository,
  ) {}

  async execute(input: { boardId: string; teamId: string; tileId: string; adminUserId: string; note: string | null }): Promise<Result<null>> {
    const check = await checkLive(this.boards, this.teams, this.tiles, input.boardId, input.teamId, input.tileId);
    if (!check.ok) return check;
    const note = input.note?.trim().slice(0, 300) || null;
    await this.completions.mark({ teamId: input.teamId, tileId: input.tileId, source: "admin", markedBy: input.adminUserId, note });
    return ok(null);
  }
}

/** An admin undoes a completion marked by mistake. */
export class UndoTileCompletion {
  constructor(
    private readonly boards: BoardRepository,
    private readonly teams: TeamRepository,
    private readonly tiles: TileRepository,
    private readonly completions: CompletionRepository,
  ) {}

  async execute(input: { boardId: string; teamId: string; tileId: string }): Promise<Result<null>> {
    const check = await checkLive(this.boards, this.teams, this.tiles, input.boardId, input.teamId, input.tileId);
    if (!check.ok) return check;
    await this.completions.unmark(input.teamId, input.tileId);
    return ok(null);
  }
}
