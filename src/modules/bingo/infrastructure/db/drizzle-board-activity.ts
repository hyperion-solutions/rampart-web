import "server-only";
import { sql } from "drizzle-orm";
import type { BoardActivity } from "../../domain/board-activity";
import type { BingoDb } from "./client";

/**
 * Adapter: one query of counts and latest timestamps. Counts catch removals (undo, a member
 * leaving); timestamps catch additions. Indexed lookups by board, so it's cheap to poll.
 */
export class DrizzleBoardActivity implements BoardActivity {
  constructor(private readonly db: () => BingoDb) {}

  async version(boardId: string): Promise<string | null> {
    const result = await this.db().execute<{ version: string | null }>(sql`
      select (
        select b.status || ':' || b.updated_at::text from bingo_boards b where b.id = ${boardId}
      ) || '|' || (
        select count(*)::text || ':' || coalesce(max(p.added_at)::text, '')
        from bingo_tile_progress p join bingo_teams t on t.id = p.team_id where t.board_id = ${boardId}
      ) || '|' || (
        select count(*)::text || ':' || coalesce(max(c.completed_at)::text, '')
        from bingo_completions c join bingo_teams t on t.id = c.team_id where t.board_id = ${boardId}
      ) || '|' || (
        select count(*)::text from bingo_team_members m where m.board_id = ${boardId}
      ) as version
    `);
    return result.rows[0]?.version ?? null;
  }
}
