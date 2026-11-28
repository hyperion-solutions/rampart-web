import type { Board, BoardDetails, BoardStatus } from "./board";
import type { NewProgressEntry, ProgressEntry } from "./progress";
import type { StoredScreenshot } from "./screenshot-store";
import type { Completion, CompletionSource } from "./completion";
import type { Team, TeamMember } from "./team";
import type { Tile, TileInput } from "./tile";

/** Port: boards. */
export interface BoardRepository {
  create(details: BoardDetails, createdBy: string): Promise<Board>;
  findById(id: string): Promise<Board | null>;
  /** Newest first. Pass statuses to filter (members never see drafts). */
  list(statuses?: readonly BoardStatus[]): Promise<Board[]>;
  updateDetails(id: string, details: BoardDetails): Promise<Board>;
  setStatus(id: string, status: BoardStatus): Promise<Board>;
}

/** Port: tiles and the items that complete them. */
export interface TileRepository {
  listForBoard(boardId: string): Promise<Tile[]>;
  /** Creates or replaces the tile at (row, col), including its item list. */
  save(boardId: string, tile: TileInput): Promise<Tile>;
  /** Empties the square at (row, col). */
  clear(boardId: string, row: number, col: number): Promise<void>;
  /** Empties every square. Returns how many were removed. */
  clearAll(boardId: string): Promise<number>;
  /** Removes tiles outside a smaller grid. */
  removeOutside(boardId: string, size: number): Promise<number>;
}

/** Port: teams and members. A user is on at most one team per board. */
export interface TeamRepository {
  listForBoard(boardId: string): Promise<Team[]>;
  create(boardId: string, name: string, colour: string | null): Promise<Team>;
  rename(teamId: string, name: string, colour: string | null): Promise<Team>;
  remove(teamId: string): Promise<void>;
  listMembers(boardId: string): Promise<TeamMember[]>;
  /** Adds the user to the team, moving them off any other team on the same board (and its captaincy). */
  addMember(boardId: string, teamId: string, userId: string): Promise<void>;
  /** Also clears the captain if it was them. */
  removeMember(teamId: string, userId: string): Promise<void>;
  /** Sets or clears (null) the team's captain. */
  setCaptain(teamId: string, userId: string | null): Promise<void>;
}

/** Port: completed tiles. A team completes a tile at most once. */
export interface CompletionRepository {
  listForBoard(boardId: string): Promise<Completion[]>;
  mark(input: {
    teamId: string;
    tileId: string;
    source: CompletionSource;
    markedBy: string | null;
    note: string | null;
    completedBy: string | null;
    completedRsn: string | null;
  }): Promise<Completion | null>;
  unmark(teamId: string, tileId: string): Promise<void>;
}

/** Port: progress entries toward tiles. */
export interface ProgressRepository {
  listForBoard(boardId: string): Promise<ProgressEntry[]>;
  listFor(teamId: string, tileId: string): Promise<ProgressEntry[]>;
  /** Returns the new entry's id. */
  add(entry: NewProgressEntry): Promise<string>;
  /** Links a stored screenshot to entries (one loot can count on several tiles). */
  attachScreenshot(entryIds: readonly string[], screenshot: StoredScreenshot): Promise<void>;
  /** Removes the newest entry for the team and tile. Returns whether one existed. */
  removeLast(teamId: string, tileId: string): Promise<boolean>;
}

/** Port: removes a member's name and RSNs from bingo history when they delete their data. */
export interface BingoHistoryEraser {
  forget(userId: string): Promise<void>;
}
