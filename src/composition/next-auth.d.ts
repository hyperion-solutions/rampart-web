import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    /** Highest clan rank role, set during sign-in. */
    rank?: string;
  }

  interface Session {
    user: {
      id: string;
      rank?: string;
      /** 13x13 pixel-art icon for the rank, when one exists. */
      rankIconUrl?: string;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    /** Our `users.id`, set on sign-in. */
    userId?: string;
    rank?: string;
    /** Used only to re-check the rank; the session cookie is encrypted. */
    discordAccessToken?: string;
    /** Seconds since epoch, from Discord. */
    discordTokenExpiresAt?: number;
    /** Milliseconds since epoch. */
    rankCheckedAt?: number;
  }
}
