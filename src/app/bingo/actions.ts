"use server";

import { revalidatePath } from "next/cache";
import { container } from "@/composition/container";
import { requireMember } from "@/composition/require-admin";

export type DropResult = { readonly ok: true } | { readonly ok: false; readonly error: string };

export interface DropInput {
  readonly amount: number;
  readonly itemId: number | null;
  readonly obtainedBy: string;
  readonly obtainedRsn: string | null;
  readonly note: string;
}

const isId = (v: unknown): v is string => typeof v === "string" && v.length > 0 && v.length < 64;

/** An admin or the team's captain adds drops to a tile, saying who got them. The use case checks who may. */
export async function addDropAction(boardId: string, teamId: string, tileId: string, drop: DropInput): Promise<DropResult> {
  const user = await requireMember(`/bingo/${boardId}`);
  const valid =
    isId(boardId) &&
    isId(teamId) &&
    isId(tileId) &&
    isId(drop.obtainedBy) &&
    Number.isInteger(drop.amount) &&
    (drop.itemId === null || Number.isInteger(drop.itemId)) &&
    (drop.obtainedRsn === null || typeof drop.obtainedRsn === "string") &&
    typeof drop.note === "string";
  if (!valid) return { ok: false, error: "That drop couldn't be read. Reload the page and try again." };

  const result = await container.bingo.addTileProgress.execute({
    boardId,
    teamId,
    tileId,
    amount: drop.amount,
    itemId: drop.itemId,
    obtainedBy: drop.obtainedBy,
    obtainedRsn: drop.obtainedRsn,
    source: "admin",
    actor: { userId: user.id, isAdmin: user.isAdmin === true },
    note: drop.note,
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath(`/bingo/${boardId}`);
  return { ok: true };
}

/** Removes the newest addition for a team's tile; reopens the tile if needed. */
export async function undoLastDropAction(boardId: string, teamId: string, tileId: string): Promise<DropResult> {
  const user = await requireMember(`/bingo/${boardId}`);
  if (!isId(boardId) || !isId(teamId) || !isId(tileId)) return { ok: false, error: "That tile couldn't be read." };
  const result = await container.bingo.undoLastProgress.execute({
    boardId,
    teamId,
    tileId,
    actor: { userId: user.id, isAdmin: user.isAdmin === true },
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath(`/bingo/${boardId}`);
  return { ok: true };
}
