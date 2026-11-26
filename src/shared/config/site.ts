/** Public, non-secret site settings. Secrets and per-environment values belong in env.ts. */
export const site = {
  /** Production address, used to build absolute URLs for social previews. */
  url: "https://rampart-web-alpha.vercel.app",
  /** Permanent invite to the Rampart Discord server. */
  discordInviteUrl: "https://discord.gg/j6kYFNjNaa",
  /** Rampart Discord server id. Only its members can sign in. */
  discordGuildId: "1523846871708340294",
} as const;
