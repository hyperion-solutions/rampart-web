import { type NextRequest, NextResponse } from "next/server";

/**
 * Sends signed-out visitors of member pages straight to sign in, before the page (and its
 * stopwatch loading screen) starts. Only checks that a session cookie exists: pages still verify
 * the session and rank with `requireMember` / `requireAdmin`, so a stale cookie is handled there.
 */
const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

export function middleware(request: NextRequest) {
  const signedIn = request.cookies.getAll().some((c) => SESSION_COOKIES.some((name) => c.name.startsWith(name)));
  if (signedIn) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const signIn = new URL("/signin", request.url);
  signIn.searchParams.set("callbackUrl", pathname + search);
  return NextResponse.redirect(signIn);
}

export const config = {
  // Member and admin pages. Not /api: those answer with JSON errors themselves.
  matcher: ["/account/:path*", "/bingo/:path*", "/admin/:path*"],
};
