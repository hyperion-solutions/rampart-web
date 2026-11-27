"use server";

import { revalidatePath } from "next/cache";
import { container } from "@/composition/container";
import { requireAdmin } from "@/composition/require-admin";

export type MarkResult = { readonly ok: true } | { readonly ok: false; readonly error: string };

const isId = (v: unknown): v is string => typeof v === "string" && v.length > 0 && v.length < 64;

export async function markTileAction(boardId: string, teamId: string, tileId: string, note: string): Promise<MarkResult> {
  const admin = await requireAdmin(`/bingo/${boardId}`);
  if (!isId(boardId) || !isId(teamId) || !isId(tileId)) return { ok: false, error: "That tile couldn't be read." };
  const result = await container.bingo.markTileComplete.execute({
    boardId,
    teamId,
    tileId,
    adminUserId: admin.id,
    note: typeof note === "string" ? note : null,
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath(`/bingo/${boardId}`);
  return { ok: true };
}

export async function undoTileAction(boardId: string, teamId: string, tileId: string): Promise<MarkResult> {
  await requireAdmin(`/bingo/${boardId}`);
  if (!isId(boardId) || !isId(teamId) || !isId(tileId)) return { ok: false, error: "That tile couldn't be read." };
  const result = await container.bingo.undoTileCompletion.execute({ boardId, teamId, tileId });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath(`/bingo/${boardId}`);
  return { ok: true };
}
