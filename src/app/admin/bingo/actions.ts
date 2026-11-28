"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { container } from "@/composition/container";
import { requireAdmin } from "@/composition/require-admin";
import type { BoardDetails, BoardStatus } from "@/modules/bingo/domain/board";
import type { TileInput } from "@/modules/bingo/domain/tile";

export type BoardFormState = { readonly error: string } | null;

function readDetails(formData: FormData): BoardDetails {
  return {
    title: String(formData.get("title") ?? ""),
    rules: String(formData.get("rules") ?? "").trim(),
    size: Number(formData.get("size")),
    // The form converts the admin's local time to an ISO timestamp before sending.
    startsAt: new Date(String(formData.get("startsAt") ?? "")),
    endsAt: new Date(String(formData.get("endsAt") ?? "")),
    bonuses: {
      row: Number(formData.get("bonusRow") || 0),
      column: Number(formData.get("bonusColumn") || 0),
      diagonal: Number(formData.get("bonusDiagonal") || 0),
      blackout: Number(formData.get("bonusBlackout") || 0),
    },
  };
}

export async function createBoardAction(_prev: BoardFormState, formData: FormData): Promise<BoardFormState> {
  const admin = await requireAdmin("/admin/bingo/new");
  const result = await container.bingo.createBoard.execute(readDetails(formData), admin.id);
  if (!result.ok) return { error: result.error };
  revalidatePath("/admin/bingo");
  redirect(`/admin/bingo/${result.value.id}`);
}

export async function updateBoardAction(_prev: BoardFormState, formData: FormData): Promise<BoardFormState> {
  const boardId = String(formData.get("boardId") ?? "");
  await requireAdmin(`/admin/bingo/${boardId}`);
  const result = await container.bingo.updateBoard.execute(boardId, readDetails(formData));
  if (!result.ok) return { error: result.error };
  revalidatePath(`/admin/bingo/${boardId}`);
  revalidatePath("/admin/bingo");
  return null;
}

export async function changeBoardStatusAction(formData: FormData): Promise<void> {
  const boardId = String(formData.get("boardId") ?? "");
  await requireAdmin(`/admin/bingo/${boardId}`);
  const to = String(formData.get("to") ?? "") as BoardStatus;
  await container.bingo.changeBoardStatus.execute(boardId, to);
  revalidatePath(`/admin/bingo/${boardId}`);
  revalidatePath("/admin/bingo");
}

export type TileActionResult = { readonly ok: true } | { readonly ok: false; readonly error: string };

const isInt = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v);

/** Saves one square. The input comes from the editor, so its shape is checked before use. */
export async function saveTileAction(boardId: string, input: TileInput): Promise<TileActionResult> {
  await requireAdmin(`/admin/bingo/${boardId}`);
  const valid =
    isInt(input.row) &&
    isInt(input.col) &&
    typeof input.name === "string" &&
    isInt(input.points) &&
    isInt(input.quantity) &&
    (input.rule === "any" || input.rule === "all") &&
    (input.description === null || typeof input.description === "string") &&
    (input.iconItemId === null || isInt(input.iconItemId)) &&
    Array.isArray(input.itemIds) &&
    input.itemIds.every(isInt);
  if (!valid) return { ok: false, error: "That tile couldn't be read. Reload the page and try again." };

  const result = await container.bingo.saveTile.execute(boardId, {
    row: input.row,
    col: input.col,
    name: input.name,
    points: input.points,
    quantity: input.quantity,
    rule: input.rule,
    description: input.description,
    iconItemId: input.iconItemId,
    itemIds: input.itemIds,
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath(`/admin/bingo/${boardId}`);
  return { ok: true };
}

export async function clearTileAction(boardId: string, row: number, col: number): Promise<TileActionResult> {
  await requireAdmin(`/admin/bingo/${boardId}`);
  if (!isInt(row) || !isInt(col)) return { ok: false, error: "That square isn't on the board." };
  const result = await container.bingo.clearTile.execute(boardId, row, col);
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath(`/admin/bingo/${boardId}`);
  return { ok: true };
}

export type BoardToolResult = { readonly ok: true; readonly message: string } | { readonly ok: false; readonly error: string };

/** Fills the empty squares of a draft board with random items. */
export async function fillBoardRandomlyAction(boardId: string): Promise<BoardToolResult> {
  await requireAdmin(`/admin/bingo/${boardId}`);
  const result = await container.bingo.fillBoardRandomly.execute(String(boardId));
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath(`/admin/bingo/${boardId}`);
  const n = result.value;
  return { ok: true, message: n === 0 ? "Every square is already filled." : `Filled ${n} square${n === 1 ? "" : "s"}.` };
}

/** Empties every square of a draft board. */
export async function clearBoardAction(boardId: string): Promise<BoardToolResult> {
  await requireAdmin(`/admin/bingo/${boardId}`);
  const result = await container.bingo.clearBoard.execute(String(boardId));
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath(`/admin/bingo/${boardId}`);
  const n = result.value;
  return { ok: true, message: `Cleared ${n} square${n === 1 ? "" : "s"}.` };
}

export type TeamFormState = { readonly error: string } | null;

export async function createTeamAction(_prev: TeamFormState, formData: FormData): Promise<TeamFormState> {
  const boardId = String(formData.get("boardId") ?? "");
  await requireAdmin(`/admin/bingo/${boardId}`);
  const result = await container.bingo.createTeam.execute(
    boardId,
    String(formData.get("name") ?? ""),
    String(formData.get("colour") ?? "") || null,
  );
  if (!result.ok) return { error: result.error };
  revalidatePath(`/admin/bingo/${boardId}`);
  return null;
}

export async function removeTeamAction(formData: FormData): Promise<void> {
  const boardId = String(formData.get("boardId") ?? "");
  await requireAdmin(`/admin/bingo/${boardId}`);
  await container.bingo.removeTeam.execute(boardId, String(formData.get("teamId") ?? ""));
  revalidatePath(`/admin/bingo/${boardId}`);
}

export async function searchPlayersAction(query: string) {
  await requireAdmin("/admin/bingo");
  return typeof query === "string" ? container.bingo.searchPlayers.execute(query) : [];
}

export async function addTeamMemberAction(boardId: string, teamId: string, userId: string): Promise<TileActionResult> {
  await requireAdmin(`/admin/bingo/${boardId}`);
  const result = await container.bingo.addTeamMember.execute(boardId, teamId, userId);
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath(`/admin/bingo/${boardId}`);
  return { ok: true };
}

export async function removeTeamMemberAction(formData: FormData): Promise<void> {
  const boardId = String(formData.get("boardId") ?? "");
  await requireAdmin(`/admin/bingo/${boardId}`);
  await container.bingo.removeTeamMember.execute(
    boardId,
    String(formData.get("teamId") ?? ""),
    String(formData.get("userId") ?? ""),
  );
  revalidatePath(`/admin/bingo/${boardId}`);
}

export async function setCaptainAction(formData: FormData): Promise<void> {
  const boardId = String(formData.get("boardId") ?? "");
  await requireAdmin(`/admin/bingo/${boardId}`);
  const userId = String(formData.get("userId") ?? "");
  await container.bingo.setTeamCaptain.execute(boardId, String(formData.get("teamId") ?? ""), userId || null);
  revalidatePath(`/admin/bingo/${boardId}`);
}
