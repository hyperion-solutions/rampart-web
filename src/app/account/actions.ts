"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/composition/auth";
import { container } from "@/composition/container";

/** Unlinks one of the signed-in member's own accounts. */
export async function unlinkAccount(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/account");

  const accountId = formData.get("accountId");
  if (typeof accountId !== "string" || accountId.length === 0) return;

  await container.unlinkAccount.execute(session.user.id, accountId);
  revalidatePath("/account");
}
