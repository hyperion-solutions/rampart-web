"use server";

import { revalidatePath } from "next/cache";
import { container } from "@/composition/container";
import { requireAdmin } from "@/composition/require-admin";

/** Approves or rejects a link request. Admins only. */
export async function decideClaim(formData: FormData): Promise<void> {
  const admin = await requireAdmin("/admin/claims");
  const claimId = formData.get("claimId");
  const decision = formData.get("decision");
  if (typeof claimId !== "string" || (decision !== "approve" && decision !== "reject")) return;

  await container.decideLinkClaim.execute(claimId, admin.id, decision === "approve");
  revalidatePath("/admin/claims");
}
