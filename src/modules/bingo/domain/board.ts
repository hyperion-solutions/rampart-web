export type BoardStatus = "draft" | "live" | "finished";

export const MIN_BOARD_SIZE = 3;
export const MAX_BOARD_SIZE = 7;

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
  readonly createdBy: string | null;
}

export type BoardDetails = Pick<Board, "title" | "rules" | "size" | "startsAt" | "endsAt">;

/** Returns a problem to show the admin, or null when the details are valid. */
export function validateBoardDetails(d: BoardDetails): string | null {
  if (d.title.trim().length === 0) return "Give the board a title.";
  if (d.title.length > 80) return "Keep the title under 80 characters.";
  if (!Number.isInteger(d.size) || d.size < MIN_BOARD_SIZE || d.size > MAX_BOARD_SIZE) {
    return `Pick a size from ${MIN_BOARD_SIZE}×${MIN_BOARD_SIZE} to ${MAX_BOARD_SIZE}×${MAX_BOARD_SIZE}.`;
  }
  if (Number.isNaN(d.startsAt.getTime()) || Number.isNaN(d.endsAt.getTime())) return "Set a start and end date.";
  if (d.endsAt <= d.startsAt) return "The end must be after the start.";
  return null;
}

/** Which status changes are allowed: draft → live → finished, and back from live to draft. */
export const canChangeStatus = (from: BoardStatus, to: BoardStatus) =>
  (from === "draft" && to === "live") || (from === "live" && (to === "finished" || to === "draft"));
