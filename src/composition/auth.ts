import "server-only";
import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { env } from "@/shared/config/env";
import { container } from "./container";

/**
 * Auth.js wiring: Discord sign-in, limited to Rampart Discord members.
 * Sessions are signed JWT cookies; our own user id (from the `users` table) is stored in the token.
 * Config is built per request, so env vars are only read when auth is actually used.
 */
export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  secret: env.authSecret,
  trustHost: true,
  redirectProxyUrl: env.authRedirectProxyUrl,
  providers: [
    Discord({
      clientId: env.authDiscordId,
      clientSecret: env.authDiscordSecret,
      // Discord returns `iss=https://discord.com` on the callback (RFC 9207). Without this,
      // Auth.js compares it to its placeholder issuer and rejects the sign-in.
      issuer: "https://discord.com",
      // No email: we only need who they are and whether they're in the Rampart server.
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
      return true;
    },
    jwt({ token, user }) {
      if (user?.id) token.userId = user.id;
      return token;
    },
    session({ session, token }) {
      if (typeof token.userId === "string") session.user.id = token.userId;
      return session;
    },
  },
}));
