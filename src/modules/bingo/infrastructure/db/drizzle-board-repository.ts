import "server-only";
import { desc, eq, inArray } from "drizzle-orm";
import type { Board, BoardDetails, BoardStatus } from "../../domain/board";
import type { BoardRepository } from "../../domain/repositories";
import type { BingoDb } from "./client";
import { bingoBoards } from "./schema";

type BoardRow = typeof bingoBoards.$inferSelect;

const toBoard = (r: BoardRow): Board => ({
  id: r.id,
  title: r.title,
  rules: r.rules,
  size: r.size,
  startsAt: r.startsAt,
  endsAt: r.endsAt,
  status: r.status,
  createdBy: r.createdBy,
});

export class DrizzleBoardRepository implements BoardRepository {
  constructor(private readonly db: () => BingoDb) {}

  async create(details: BoardDetails, createdBy: string): Promise<Board> {
    const [row] = await this.db().insert(bingoBoards).values({ ...details, createdBy }).returning();
    if (!row) throw new Error(`Could not create the board "${details.title}"`);
    return toBoard(row);
  }

  async findById(id: string): Promise<Board | null> {
    const [row] = await this.db().select().from(bingoBoards).where(eq(bingoBoards.id, id)).limit(1);
    return row ? toBoard(row) : null;
  }

  async list(statuses?: readonly BoardStatus[]): Promise<Board[]> {
    const query = this.db().select().from(bingoBoards);
    const rows = await (statuses ? query.where(inArray(bingoBoards.status, [...statuses])) : query).orderBy(
      desc(bingoBoards.startsAt),
    );
    return rows.map(toBoard);
  }

  async updateDetails(id: string, details: BoardDetails): Promise<Board> {
    const [row] = await this.db().update(bingoBoards).set(details).where(eq(bingoBoards.id, id)).returning();
    if (!row) throw new Error(`Board ${id} no longer exists`);
    return toBoard(row);
  }

  async setStatus(id: string, status: BoardStatus): Promise<Board> {
    const [row] = await this.db().update(bingoBoards).set({ status }).where(eq(bingoBoards.id, id)).returning();
    if (!row) throw new Error(`Board ${id} no longer exists`);
    return toBoard(row);
  }
}
