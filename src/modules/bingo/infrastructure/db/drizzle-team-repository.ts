import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { users } from "@/modules/accounts/infrastructure/db/schema";
import type { TeamRepository } from "../../domain/repositories";
import type { Team, TeamMember } from "../../domain/team";
import type { BingoDb } from "./client";
import { bingoTeamMembers, bingoTeams } from "./schema";

type TeamRow = typeof bingoTeams.$inferSelect;

const toTeam = (r: TeamRow): Team => ({ id: r.id, boardId: r.boardId, name: r.name, colour: r.colour });

export class DrizzleTeamRepository implements TeamRepository {
  constructor(private readonly db: () => BingoDb) {}

  async listForBoard(boardId: string): Promise<Team[]> {
    const rows = await this.db()
      .select()
      .from(bingoTeams)
      .where(eq(bingoTeams.boardId, boardId))
      .orderBy(asc(bingoTeams.createdAt));
    return rows.map(toTeam);
  }

  async create(boardId: string, name: string, colour: string | null): Promise<Team> {
    const [row] = await this.db().insert(bingoTeams).values({ boardId, name, colour }).returning();
    if (!row) throw new Error(`Could not create team "${name}"`);
    return toTeam(row);
  }

  async rename(teamId: string, name: string, colour: string | null): Promise<Team> {
    const [row] = await this.db().update(bingoTeams).set({ name, colour }).where(eq(bingoTeams.id, teamId)).returning();
    if (!row) throw new Error(`Team ${teamId} no longer exists`);
    return toTeam(row);
  }

  async remove(teamId: string): Promise<void> {
    await this.db().delete(bingoTeams).where(eq(bingoTeams.id, teamId));
  }

  async listMembers(boardId: string): Promise<TeamMember[]> {
    const rows = await this.db()
      .select({ teamId: bingoTeamMembers.teamId, userId: bingoTeamMembers.userId, displayName: users.discordName })
      .from(bingoTeamMembers)
      .innerJoin(users, eq(users.id, bingoTeamMembers.userId))
      .where(eq(bingoTeamMembers.boardId, boardId))
      .orderBy(asc(users.discordName));
    return rows;
  }

  async addMember(boardId: string, teamId: string, userId: string): Promise<void> {
    const db = this.db();
    // One batch = one transaction: leave any other team on this board, then join this one.
    await db.batch([
      db.delete(bingoTeamMembers).where(and(eq(bingoTeamMembers.boardId, boardId), eq(bingoTeamMembers.userId, userId))),
      db.insert(bingoTeamMembers).values({ boardId, teamId, userId }),
    ]);
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    await this.db()
      .delete(bingoTeamMembers)
      .where(and(eq(bingoTeamMembers.teamId, teamId), eq(bingoTeamMembers.userId, userId)));
  }
}
