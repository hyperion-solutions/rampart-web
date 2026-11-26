import "server-only";
import type { DiscordProfile, User } from "../../domain/user";
import type { UserRepository } from "../../domain/user-repository";
import type { AccountsDb } from "./client";
import { users } from "./schema";

type UserRow = typeof users.$inferSelect;

const toUser = (row: UserRow): User => ({
  id: row.id,
  discordId: row.discordId,
  discordName: row.discordName,
  discordAvatar: row.discordAvatar,
});

/** Adapter: UserRepository on Postgres via Drizzle. */
export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: () => AccountsDb) {}

  async upsertFromDiscord(profile: DiscordProfile): Promise<User> {
    const [row] = await this.db()
      .insert(users)
      .values(profile)
      .onConflictDoUpdate({
        target: users.discordId,
        set: { discordName: profile.discordName, discordAvatar: profile.discordAvatar },
      })
      .returning();
    if (!row) throw new Error(`Could not save the user for Discord account ${profile.discordId}`);
    return toUser(row);
  }
}
