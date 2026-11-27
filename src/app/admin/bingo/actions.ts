"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { container } from "@/composition/container";
import { requireAdmin } from "@/composition/require-admin";
import type { BoardDetails, BoardStatus } from "@/modules/bingo/domain/board";

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
