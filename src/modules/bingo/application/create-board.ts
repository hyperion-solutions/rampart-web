import { type Board, type BoardDetails, validateBoardDetails } from "../domain/board";
import type { BoardRepository } from "../domain/repositories";
import { fail, ok, type Result } from "./board-result";

/** An admin creates a draft board. */
export class CreateBoard {
  constructor(private readonly boards: BoardRepository) {}

  async execute(details: BoardDetails, adminUserId: string): Promise<Result<Board>> {
    const problem = validateBoardDetails(details);
    if (problem) return fail(problem);
    return ok(await this.boards.create({ ...details, title: details.title.trim() }, adminUserId));
  }
}
