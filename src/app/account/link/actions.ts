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

export type ClaimFormState = { readonly tone: "ok" | "warn"; readonly message: string } | null;

const CLAIM_MESSAGES: Readonly<Record<string, (rsn: string) => string>> = {
  submitted: (rsn) => `Request sent for ${rsn}. An admin will review it.`,
  "not-in-clan": (rsn) => `${rsn} isn't in the Rampart clan on Wise Old Man. Check the spelling, or ask to be added to the clan first.`,
  "already-yours": (rsn) => `${rsn} is already linked to you.`,
  "owned-by-someone-else": (rsn) => `${rsn} is already linked to another member. Ask an admin on Discord if it's yours.`,
  "already-pending": (rsn) => `There's already a request waiting for ${rsn}.`,
};

/** Asks an admin to link an RSN without Dink. */
export async function requestManualLink(_prev: ClaimFormState, formData: FormData): Promise<ClaimFormState> {
  const userId = await requireUserId();
  const rsn = String(formData.get("rsn") ?? "").trim();
  if (rsn.length === 0 || rsn.length > 12) return { tone: "warn", message: "Enter your RSN (up to 12 characters)." };

  const result = await container.submitLinkClaim.execute(userId, rsn);
  revalidatePath("/account/link");
  const message = CLAIM_MESSAGES[result.outcome]?.(result.outcome === "submitted" ? result.claim.rsn : rsn);
  return { tone: result.outcome === "submitted" ? "ok" : "warn", message: message ?? "Something went wrong. Try again." };
}
