import { sql } from "drizzle-orm";
import { boolean, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** The OSRS item catalog (docs/decisions/0002-bingo.md). One row per game item id. */
export const items = pgTable(
  "items",
  {
    id: integer("id").primaryKey(),
    name: text("name").notNull(),
    /** Search shows rows where id = canonical_id. */
    canonicalId: integer("canonical_id").notNull(),
    members: boolean("members"),
    tradeable: boolean("tradeable").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("items_canonical_id").on(t.canonicalId),
    index("items_name_lower").on(sql`lower(${t.name})`),
  ],
);
