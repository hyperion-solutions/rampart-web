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

/** For admin route handlers (JSON APIs): the admin, or null when not signed in or not an admin. */
export async function getAdmin(): Promise<Session["user"] | null> {
  const session = await auth();
  return session?.user?.id && session.user.isAdmin ? session.user : null;
}

/** For member pages: signed-out visitors go to sign in. */
export async function requireMember(callbackUrl: string): Promise<Session["user"]> {
  const session = await auth();
  if (!session?.user?.id) redirect(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return session.user;
}
