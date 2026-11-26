/** Public, non-secret site settings. Secrets and per-environment values belong in env.ts. */
export const site = {
  /** Production address, used to build absolute URLs for social previews. */
  url: "https://rampart-web-alpha.vercel.app",
  /** Permanent invite to the Rampart Discord server. */
  discordInviteUrl: "https://discord.gg/j6kYFNjNaa",
} as const;
