import type { DiscordProfile, User } from "./user";

/** Port: stores users. */
export interface UserRepository {
  /** Creates the user on first sign-in, or refreshes their Discord name and avatar. */
  upsertFromDiscord(profile: DiscordProfile): Promise<User>;
  /** Deletes the user together with their linked accounts and link tokens. */
  delete(userId: string): Promise<void>;
}
