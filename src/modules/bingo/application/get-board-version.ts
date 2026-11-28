import type { BoardActivity } from "../domain/board-activity";
import type { BoardRepository } from "../domain/repositories";

/** The board's change fingerprint, for pages that refresh themselves. Drafts only for admins. */
export class GetBoardVersion {
  constructor(
    private readonly boards: BoardRepository,
    private readonly activity: BoardActivity,
  ) {}

  async execute(boardId: string, { includeDrafts }: { includeDrafts: boolean }): Promise<string | null> {
    const board = await this.boards.findById(boardId);
    if (!board || (board.status === "draft" && !includeDrafts)) return null;
    return this.activity.version(boardId);
  }
}
