import "server-only";
import { notFound, redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "./auth";

/**
 * For admin pages and actions: signed-out visitors go to sign in, non-admins get a 404.
 * Admin status comes from the clan rank, which is re-checked with Discord at least daily.
 */
export async function requireAdmin(callbackUrl: string): Promise<Session["user"]> {
  const session = await auth();
  if (!session?.user?.id) redirect(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  if (!session.user.isAdmin) notFound();
  return session.user;
}
