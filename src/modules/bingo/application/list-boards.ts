import type { Board } from "../domain/board";
import type { BoardRepository } from "../domain/repositories";

/** Boards newest first. Members see live and finished boards; admins also see drafts. */
export class ListBoards {
  constructor(private readonly boards: BoardRepository) {}

  execute({ includeDrafts }: { includeDrafts: boolean }): Promise<Board[]> {
    return this.boards.list(includeDrafts ? undefined : ["live", "finished"]);
  }
}
