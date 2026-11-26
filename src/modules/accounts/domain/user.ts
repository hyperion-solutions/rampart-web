/** A person using the site, identified by their Discord account. */
export interface User {
  readonly id: string;
  readonly discordId: string;
  readonly discordName: string;
  /** Discord avatar hash, or null when they use a default avatar. */
  readonly discordAvatar: string | null;
}

/** What Discord tells us about someone signing in. */
export interface DiscordProfile {
  readonly discordId: string;
  readonly discordName: string;
  readonly discordAvatar: string | null;
}
