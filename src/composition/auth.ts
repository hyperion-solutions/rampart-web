import "server-only";
import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { env } from "@/shared/config/env";
import { container } from "./container";

/** Ranks are checked again after this long, so losing a rank ends the session within a day. */
const RANK_RECHECK_MS = 24 * 60 * 60 * 1000;
/** Discord access tokens last 7 days; sessions end with them, then members sign in again. */
const SESSION_MAX_AGE_S = 7 * 24 * 60 * 60;

/**
 * Auth.js wiring: Discord sign-in, limited to Rampart Discord members with a clan rank role.
 * Sessions are encrypted JWT cookies holding our user id, the member's rank, and their Discord
 * access token (used only to re-check the rank).
 * Config is built per request, so env vars are only read when auth is actually used.
 */
export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  secret: env.authSecret,
  trustHost: true,
  redirectProxyUrl: env.authRedirectProxyUrl,
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_S },
  providers: [
    Discord({
      clientId: env.authDiscordId,
      clientSecret: env.authDiscordSecret,
      // Discord returns `iss=https://discord.com` on the callback (RFC 9207). Without this,
      // Auth.js compares it to its placeholder issuer and rejects the sign-in.
      issuer: "https://discord.com",
      // No email: we only need who they are and their roles in the Rampart server.
      authorization: { params: { scope: "identify guilds.members.read" } },
    }),
  ],
  pages: { signIn: "/signin", error: "/signin" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "discord" || !account.access_token || !profile?.id) return false;

      const result = await container.signInWithDiscord.execute(
        {
          discordId: String(profile.id),
          discordName: String(profile.global_name ?? profile.username ?? user.name ?? "Unknown"),
          discordAvatar: typeof profile.avatar === "string" ? profile.avatar : null,
        },
        account.access_token,
      );
      if (!result.ok) return `/signin?error=${result.reason}`;

      // Auth.js passes this same object to the jwt callback below.
      user.id = result.user.id;
      user.rank = result.rank;
      return true;
    },

    async jwt({ token, user, account }) {
      // Sign-in: remember who they are and how to re-check their rank.
      if (user?.id && account?.access_token) {
        token.userId = user.id;
        token.rank = user.rank;
        token.discordAccessToken = account.access_token;
        token.discordTokenExpiresAt = account.expires_at;
        token.rankCheckedAt = Date.now();
        return token;
      }

      if (Date.now() - (token.rankCheckedAt ?? 0) < RANK_RECHECK_MS) return token;

      // Older than a day: check the rank again. Without a usable Discord token, sign them out.
      const accessToken = token.discordAccessToken;
      if (!accessToken || (token.discordTokenExpiresAt ?? 0) * 1000 <= Date.now()) return null;

      try {
        const membership = await container.checkClanMembership.execute(accessToken);
        if (membership.status !== "ranked") return null;
        token.rank = membership.rank;
        token.rankCheckedAt = Date.now();
      } catch {
        // Discord unavailable: keep the session and try again on the next request.
      }
      return token;
    },

    session({ session, token }) {
      if (typeof token.userId === "string") session.user.id = token.userId;
      session.user.rank = token.rank;
      return session;
    },
  },
}));
