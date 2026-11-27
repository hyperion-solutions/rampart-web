import type { DiscordProfile, User } from "./user";

/** Port: stores users. */
export interface UserRepository {
  /** Creates the user on first sign-in, or refreshes their Discord name and avatar. */
  upsertFromDiscord(profile: DiscordProfile): Promise<User>;
  /** Whether the user is still stored (they may have deleted their account, or data was reset). */
  exists(userId: string): Promise<boolean>;
  /** Deletes the user together with their linked accounts and link tokens. */
  delete(userId: string): Promise<void>;
}
