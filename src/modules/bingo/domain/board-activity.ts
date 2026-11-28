/** Port: a cheap fingerprint of a board's state, so pages can tell when something changed. */
export interface BoardActivity {
  /** Changes whenever drops, completions, team members or the board itself change; null if no such board. */
  version(boardId: string): Promise<string | null>;
}
