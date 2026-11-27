import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "@/modules/accounts/infrastructure/db/schema";

/** Bingo tables (docs/decisions/0002-bingo.md). Deleting a user removes their team memberships. */

export const boardStatus = pgEnum("bingo_board_status", ["draft", "live", "finished"]);
export const completionSource = pgEnum("bingo_completion_source", ["admin", "dink"]);

export const bingoBoards = pgTable(
  "bingo_boards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    rules: text("rules").notNull().default(""),
    size: integer("size").notNull().default(5),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    status: boardStatus("status").notNull().default("draft"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    check("bingo_boards_size", sql`${t.size} between 3 and 7`),
    check("bingo_boards_dates", sql`${t.endsAt} > ${t.startsAt}`),
  ],
);

export const bingoTiles = pgTable(
  "bingo_tiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    boardId: uuid("board_id")
      .notNull()
      .references(() => bingoBoards.id, { onDelete: "cascade" }),
    row: integer("row").notNull(),
    col: integer("col").notNull(),
    name: text("name").notNull(),
    points: integer("points").notNull().default(0),
    quantity: integer("quantity").notNull().default(1),
    description: text("description"),
    /** Item shown on the tile; for text-only tiles it's just the picture. */
    iconItemId: integer("icon_item_id"),
  },
  (t) => [
    unique("bingo_tiles_position").on(t.boardId, t.row, t.col),
    check("bingo_tiles_points", sql`${t.points} >= 0`),
    check("bingo_tiles_quantity", sql`${t.quantity} >= 1`),
  ],
);

/** Items that complete a tile: any one of them. Item ids from the items catalog. */
export const bingoTileItems = pgTable(
  "bingo_tile_items",
  {
    tileId: uuid("tile_id")
      .notNull()
      .references(() => bingoTiles.id, { onDelete: "cascade" }),
    itemId: integer("item_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.tileId, t.itemId] }), index("bingo_tile_items_item_id").on(t.itemId)],
);

export const bingoTeams = pgTable(
  "bingo_teams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    boardId: uuid("board_id")
      .notNull()
      .references(() => bingoBoards.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    colour: text("colour"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("bingo_teams_name").on(t.boardId, t.name)],
);

export const bingoTeamMembers = pgTable(
  "bingo_team_members",
  {
    teamId: uuid("team_id")
      .notNull()
      .references(() => bingoTeams.id, { onDelete: "cascade" }),
    /** Repeated from the team so "one team per member per board" is a unique constraint. */
    boardId: uuid("board_id")
      .notNull()
      .references(() => bingoBoards.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.teamId, t.userId] }), unique("bingo_team_members_one_team").on(t.boardId, t.userId)],
);

export const bingoCompletions = pgTable(
  "bingo_completions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => bingoTeams.id, { onDelete: "cascade" }),
    tileId: uuid("tile_id")
      .notNull()
      .references(() => bingoTiles.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
    source: completionSource("source").notNull().default("admin"),
    markedBy: uuid("marked_by").references(() => users.id, { onDelete: "set null" }),
    /** e.g. a link to the Discord screenshot. */
    note: text("note"),
  },
  (t) => [unique("bingo_completions_once").on(t.teamId, t.tileId)],
);
