import type { BoardRepository, TeamRepository } from "../domain/repositories";
import type { PlayerDirectory } from "../domain/player-directory";
import type { Team } from "../domain/team";
import { isTeamColour, validateTeamName } from "../domain/team-colours";
import { fail, ok, type Result } from "./board-result";

/** Checks the board exists and can still change. */
async function editableBoard(boards: BoardRepository, boardId: string): Promise<Result<null>> {
  const board = await boards.findById(boardId);
  if (!board) return fail("That board doesn't exist.");
  if (board.status === "finished") return fail("Finished boards can't be changed.");
  return ok(null);
}

export class CreateTeam {
  constructor(
    private readonly boards: BoardRepository,
    private readonly teams: TeamRepository,
  ) {}

  async execute(boardId: string, name: string, colour: string | null): Promise<Result<Team>> {
    const editable = await editableBoard(this.boards, boardId);
    if (!editable.ok) return fail(editable.error);
    const problem = validateTeamName(name);
    if (problem) return fail(problem);
    const existing = await this.teams.listForBoard(boardId);
    if (existing.some((t) => t.name.toLowerCase() === name.trim().toLowerCase())) {
      return fail("There's already a team with that name.");
    }
    return ok(await this.teams.create(boardId, name.trim(), isTeamColour(colour) ? colour : null));
  }
}

export class RemoveTeam {
  constructor(
    private readonly boards: BoardRepository,
    private readonly teams: TeamRepository,
  ) {}

  async execute(boardId: string, teamId: string): Promise<Result<null>> {
    const editable = await editableBoard(this.boards, boardId);
    if (!editable.ok) return editable;
    const teams = await this.teams.listForBoard(boardId);
    if (!teams.some((t) => t.id === teamId)) return fail("That team isn't on this board.");
    await this.teams.remove(teamId);
    return ok(null);
  }
}

/** Adds a member to a team, moving them off any other team on the board. Only eligible players. */
export class AddTeamMember {
  constructor(
    private readonly boards: BoardRepository,
    private readonly teams: TeamRepository,
    private readonly players: PlayerDirectory,
  ) {}

  async execute(boardId: string, teamId: string, userId: string): Promise<Result<null>> {
    const editable = await editableBoard(this.boards, boardId);
    if (!editable.ok) return editable;
    const teams = await this.teams.listForBoard(boardId);
    if (!teams.some((t) => t.id === teamId)) return fail("That team isn't on this board.");
    const [player] = await this.players.findByUserIds([userId]);
    if (!player) return fail("Only members with a linked clan account can join a team.");
    await this.teams.addMember(boardId, teamId, userId);
    return ok(null);
  }
}

export class RemoveTeamMember {
  constructor(
    private readonly boards: BoardRepository,
    private readonly teams: TeamRepository,
  ) {}

  async execute(boardId: string, teamId: string, userId: string): Promise<Result<null>> {
    const editable = await editableBoard(this.boards, boardId);
    if (!editable.ok) return editable;
    await this.teams.removeMember(teamId, userId);
    return ok(null);
  }
}

/** Search for the "add member" box. */
export class SearchPlayers {
  constructor(private readonly players: PlayerDirectory) {}

  execute(query: string) {
    const q = query.trim();
    return q.length < 2 ? Promise.resolve([]) : this.players.search(q.slice(0, 40), 10);
  }
}

/** Discord names and RSNs for members already on teams. */
export class GetPlayers {
  constructor(private readonly players: PlayerDirectory) {}

  execute(userIds: readonly string[]) {
    return this.players.findByUserIds([...new Set(userIds)]);
  }
}

/** An admin picks a team's captain (one of its members), or clears it with null. */
export class SetTeamCaptain {
  constructor(
    private readonly boards: BoardRepository,
    private readonly teams: TeamRepository,
  ) {}

  async execute(boardId: string, teamId: string, userId: string | null): Promise<Result<null>> {
    const editable = await editableBoard(this.boards, boardId);
    if (!editable.ok) return editable;
    const teams = await this.teams.listForBoard(boardId);
    if (!teams.some((t) => t.id === teamId)) return fail("That team isn't on this board.");
    if (userId !== null) {
      const members = await this.teams.listMembers(boardId);
      if (!members.some((m) => m.teamId === teamId && m.userId === userId)) {
        return fail("The captain must be a member of the team.");
      }
    }
    await this.teams.setCaptain(teamId, userId);
    return ok(null);
  }
}
