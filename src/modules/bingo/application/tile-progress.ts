import { tileProgress } from "../domain/progress";
import type { PlayerDirectory } from "../domain/player-directory";
import type {
  BingoHistoryEraser,
  BoardRepository,
  CompletionRepository,
  ProgressRepository,
  TeamRepository,
  TileRepository,
} from "../domain/repositories";
import type { CompletionSource } from "../domain/completion";
import { type Actor, canEditTeamProgress } from "../domain/team";
import { fail, ok, type Result } from "./board-result";

export interface AddProgressInput {
  readonly boardId: string;
  readonly teamId: string;
  readonly tileId: string;
  readonly amount: number;
  readonly itemId: number | null;
  /** The team member who got the drop. */
  readonly obtainedBy: string;
  readonly obtainedRsn: string | null;
  readonly source: CompletionSource;
  /** Who is adding it (an admin or the team's captain); null for Dink, which the system trusts. */
  readonly actor: Actor | null;
  readonly note: string | null;
}

/**
 * Adds drops to a tile for a team (by hand now, from Dink in #32). The tile completes when the
 * total reaches its quantity and is locked after that; the member whose drop finished it is recorded.
 */
export class AddTileProgress {
  constructor(
    private readonly boards: BoardRepository,
    private readonly tiles: TileRepository,
    private readonly teams: TeamRepository,
    private readonly progress: ProgressRepository,
    private readonly completions: CompletionRepository,
    private readonly players: PlayerDirectory,
  ) {}

  async execute(
    input: AddProgressInput,
    now: Date = new Date(),
  ): Promise<Result<{ done: number; quantity: number; complete: boolean }>> {
    const board = await this.boards.findById(input.boardId);
    if (!board) return fail("That board doesn't exist.");
    if (board.status !== "live") return fail("Drops can only be added while the board is live.");
    // Nothing counts before the start. After the end, admins can still catch up on late
    // screenshots until they finish the board; Dink (#32) only counts drops inside the window.
    if (now < board.startsAt) return fail("This board hasn't started yet. Drops can be added once it begins.");

    const [tiles, teams, members] = await Promise.all([
      this.tiles.listForBoard(input.boardId),
      this.teams.listForBoard(input.boardId),
      this.teams.listMembers(input.boardId),
    ]);
    const tile = tiles.find((t) => t.id === input.tileId);
    if (!tile) return fail("That tile isn't on this board.");
    const team = teams.find((t) => t.id === input.teamId);
    if (!team) return fail("That team isn't on this board.");
    if (input.actor && !canEditTeamProgress(input.actor, team)) {
      return fail("Only admins and this team's captain can add drops.");
    }
    if (!members.some((m) => m.teamId === input.teamId && m.userId === input.obtainedBy)) {
      return fail("Pick a member of this team as the one who got the drop.");
    }
    if (input.itemId !== null && tile.itemIds.length > 0 && !tile.itemIds.includes(input.itemId)) {
      return fail("That item doesn't count for this tile.");
    }
    if (input.obtainedRsn !== null) {
      const [player] = await this.players.findByUserIds([input.obtainedBy]);
      if (!player?.rsns.includes(input.obtainedRsn)) return fail("That RSN isn't linked to this member.");
    }
    if (!Number.isInteger(input.amount) || input.amount < 1) return fail("Add at least 1.");

    const [entries, completed] = await Promise.all([
      this.progress.listFor(input.teamId, input.tileId),
      this.completions.listForBoard(input.boardId).then((cs) => cs.some((c) => c.teamId === input.teamId && c.tileId === input.tileId)),
    ]);
    const before = tileProgress(tile.quantity, entries, completed);
    if (before.complete) return fail("This tile is already complete for the team.");

    const amount = Math.min(input.amount, before.remaining);
    const note = input.note?.trim().slice(0, 300) || null;
    const addedBy = input.actor?.userId ?? null;
    await this.progress.add({
      teamId: input.teamId,
      tileId: input.tileId,
      amount,
      itemId: input.itemId,
      obtainedBy: input.obtainedBy,
      obtainedRsn: input.obtainedRsn,
      source: input.source,
      addedBy,
      note,
    });

    const after = tileProgress(tile.quantity, [...entries, { amount }], false);
    if (after.complete) {
      await this.completions.mark({
        teamId: input.teamId,
        tileId: input.tileId,
        source: input.source,
        markedBy: addedBy,
        note,
        completedBy: input.obtainedBy,
        completedRsn: input.obtainedRsn,
      });
    }
    return ok({ done: after.done, quantity: tile.quantity, complete: after.complete });
  }
}

/** Removes the newest addition; reopens the tile if it drops below its quantity. */
export class UndoLastProgress {
  constructor(
    private readonly boards: BoardRepository,
    private readonly tiles: TileRepository,
    private readonly teams: TeamRepository,
    private readonly progress: ProgressRepository,
    private readonly completions: CompletionRepository,
  ) {}

  async execute(input: { boardId: string; teamId: string; tileId: string; actor: Actor }): Promise<Result<null>> {
    const board = await this.boards.findById(input.boardId);
    if (!board) return fail("That board doesn't exist.");
    if (board.status !== "live") return fail("Drops can only be changed while the board is live.");
    const team = (await this.teams.listForBoard(input.boardId)).find((t) => t.id === input.teamId);
    if (!team) return fail("That team isn't on this board.");
    if (!canEditTeamProgress(input.actor, team)) return fail("Only admins and this team's captain can undo drops.");
    const tile = (await this.tiles.listForBoard(input.boardId)).find((t) => t.id === input.tileId);
    if (!tile) return fail("That tile isn't on this board.");

    const removed = await this.progress.removeLast(input.teamId, input.tileId);
    const entries = await this.progress.listFor(input.teamId, input.tileId);
    // Below the quantity again (or a completion marked before progress existed): reopen.
    if (!removed || tileProgress(tile.quantity, entries, false).done < tile.quantity) {
      await this.completions.unmark(input.teamId, input.tileId);
    }
    return ok(null);
  }
}

/** Called when a member deletes their data: their name and RSNs leave bingo history; team points stay. */
export class ForgetBingoPlayer {
  constructor(private readonly eraser: BingoHistoryEraser) {}

  execute(userId: string): Promise<void> {
    return this.eraser.forget(userId);
  }
}
