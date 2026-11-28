export type BoardStatus = "draft" | "live" | "finished";

export const MIN_BOARD_SIZE = 3;
export const MAX_BOARD_SIZE = 7;

/** Bonus points per completed line, and for completing every tile. 0 = no bonus. */
export interface LineBonuses {
  readonly row: number;
  readonly column: number;
  readonly diagonal: number;
  readonly blackout: number;
}

/** A bingo event: a square grid of tiles, played by teams between two dates. */
export interface Board {
  readonly id: string;
  readonly title: string;
  readonly rules: string;
  /** Tiles per side: 5 means a 5×5 board. */
  readonly size: number;
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly status: BoardStatus;
  readonly bonuses: LineBonuses;
  readonly createdBy: string | null;
}

export type BoardDetails = Pick<Board, "title" | "rules" | "size" | "startsAt" | "endsAt" | "bonuses">;

/** Returns a problem to show the admin, or null when the details are valid. */
export function validateBoardDetails(d: BoardDetails): string | null {
  if (d.title.trim().length === 0) return "Give the board a title.";
  if (d.title.length > 80) return "Keep the title under 80 characters.";
  if (!Number.isInteger(d.size) || d.size < MIN_BOARD_SIZE || d.size > MAX_BOARD_SIZE) {
    return `Pick a size from ${MIN_BOARD_SIZE}×${MIN_BOARD_SIZE} to ${MAX_BOARD_SIZE}×${MAX_BOARD_SIZE}.`;
  }
  if (Number.isNaN(d.startsAt.getTime()) || Number.isNaN(d.endsAt.getTime())) return "Set a start and end date.";
  if (d.endsAt <= d.startsAt) return "The end must be after the start.";
  const bonusOk = (n: number) => Number.isInteger(n) && n >= 0 && n <= 10_000;
  if (![d.bonuses.row, d.bonuses.column, d.bonuses.diagonal, d.bonuses.blackout].every(bonusOk)) {
    return "Bonuses must be whole numbers from 0 to 10,000.";
  }
  return null;
}

/** Past its end date. A live board stays open to admins for late screenshots until it's finished. */
export const hasEnded = (board: Pick<Board, "endsAt">, now: Date = new Date()) => board.endsAt <= now;

/** Live boards are finished automatically this long after their end (daily job), so results become final. */
export const AUTO_FINISH_AFTER_HOURS = 48;

/** Whether a live board is due to be finished automatically. */
export const dueToFinish = (board: Pick<Board, "status" | "endsAt">, now: Date = new Date()) =>
  board.status === "live" && now.getTime() - board.endsAt.getTime() >= AUTO_FINISH_AFTER_HOURS * 3_600_000;

export const ENDED_ADMINS_ONLY = "This board has ended. Only admins can add or undo the last drops now.";

/**
 * A board's squares and scoring are fixed once it's live and its start time has passed (and when
 * finished): changing a square mid-event would keep its completions on a different item, and
 * would change the rules teams are playing to. Drafts stay editable; so do live boards before the start.
 */
export const isLocked = (board: Pick<Board, "status" | "startsAt">, now: Date = new Date()) =>
  board.status === "finished" || (board.status === "live" && board.startsAt <= now);

/** Why a board's squares can't change, for admins. */
export const lockedReason = (board: Pick<Board, "status">) =>
  board.status === "finished"
    ? "This board is finished, so its squares can't change."
    : "This board has started, so its squares and scoring can't change. Teams can still be edited.";

/**
 * A live board can go back to draft (hidden, editable, nothing counts) until it has started and a
 * team has drops: after that it would hide progress, ignore drops while hidden and unlock squares
 * that already have completions. Mistakes mid-event are fixed with Undo, or by finishing the board.
 */
export const canGoBackToDraft = (board: Pick<Board, "startsAt">, hasDrops: boolean, now: Date = new Date()) =>
  !(board.startsAt <= now && hasDrops);

export const BACK_TO_DRAFT_BLOCKED =
  "Teams already have drops on this board, so it can't go back to draft. Undo a wrong drop on the board, or finish it.";

/** Which status changes are allowed: draft → live → finished, and back from live to draft. */
export const canChangeStatus = (from: BoardStatus, to: BoardStatus) =>
  (from === "draft" && to === "live") || (from === "live" && (to === "finished" || to === "draft"));
