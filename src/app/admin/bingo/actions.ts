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
