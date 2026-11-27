"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/composition/auth";
import { container } from "@/composition/container";

export type CreateLinkState = { readonly url: string } | null;

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/account/link");
  return session.user.id;
}

/** The address Dink should post to, on whichever site the member is using (production, or localhost while testing). */
async function dinkEndpoint(secret: string): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/api/dink/${secret}`;
}

/** Creates a new personal Dink link (replacing any old one). The full address is shown only this once. */
export async function createLink(): Promise<CreateLinkState> {
  const userId = await requireUserId();
  const { secret } = await container.createLinkToken.execute(userId);
  revalidatePath("/account/link");
  return { url: await dinkEndpoint(secret) };
}

/** Turns the member's Dink link off. Accounts already linked stay linked. */
export async function turnOffLink(): Promise<void> {
  const userId = await requireUserId();
  await container.revokeLinkToken.execute(userId);
  revalidatePath("/account/link");
}
