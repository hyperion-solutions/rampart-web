import { sql } from "drizzle-orm";
import { index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

/** Database tables for the accounts module. See docs/decisions/0001-account-linking.md. */

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/** A person, identified by their Discord account. */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  discordId: text("discord_id").notNull().unique(),
  discordName: text("discord_name").notNull(),
  discordAvatar: text("discord_avatar"),
  ...timestamps,
});

/**
 * Personal Dink webhook tokens. Only a hash of the token is stored.
 * A user has at most one active (not revoked) token.
 */
export const linkTokens = pgTable(
  "link_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    /** Last Dink login seen with this token, shown on the link page. */
    lastAttemptRsn: text("last_attempt_rsn"),
    lastAttemptOutcome: text("last_attempt_outcome"),
  },
  (t) => [uniqueIndex("link_tokens_one_active_per_user").on(t.userId).where(sql`${t.revokedAt} is null`)],
);

export const verificationMethod = pgEnum("verification_method", ["dink", "admin"]);

/** An OSRS account linked to a user, proven through Dink or approved by an admin. */
export const linkedAccounts = pgTable(
  "linked_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Stable across name changes. Null for admin-approved links made without Dink. */
    dinkAccountHash: text("dink_account_hash").unique(),
    rsn: text("rsn").notNull(),
    /** Wise Old Man player id, also stable across name changes. */
    womPlayerId: integer("wom_player_id").unique(),
    accountType: text("account_type").notNull(),
    verifiedVia: verificationMethod("verified_via").notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("linked_accounts_user_id").on(t.userId)],
);
