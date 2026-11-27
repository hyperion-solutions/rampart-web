CREATE TYPE "public"."bingo_board_status" AS ENUM('draft', 'live', 'finished');--> statement-breakpoint
CREATE TYPE "public"."bingo_completion_source" AS ENUM('admin', 'dink');--> statement-breakpoint
CREATE TABLE "bingo_boards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"rules" text DEFAULT '' NOT NULL,
	"size" integer DEFAULT 5 NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"status" "bingo_board_status" DEFAULT 'draft' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bingo_boards_size" CHECK ("bingo_boards"."size" between 3 and 7),
	CONSTRAINT "bingo_boards_dates" CHECK ("bingo_boards"."ends_at" > "bingo_boards"."starts_at")
);
--> statement-breakpoint
CREATE TABLE "bingo_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"tile_id" uuid NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" "bingo_completion_source" DEFAULT 'admin' NOT NULL,
	"marked_by" uuid,
	"note" text,
	CONSTRAINT "bingo_completions_once" UNIQUE("team_id","tile_id")
);
--> statement-breakpoint
CREATE TABLE "bingo_team_members" (
	"team_id" uuid NOT NULL,
	"board_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bingo_team_members_team_id_user_id_pk" PRIMARY KEY("team_id","user_id"),
	CONSTRAINT "bingo_team_members_one_team" UNIQUE("board_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "bingo_teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"board_id" uuid NOT NULL,
	"name" text NOT NULL,
	"colour" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bingo_teams_name" UNIQUE("board_id","name")
);
--> statement-breakpoint
CREATE TABLE "bingo_tile_items" (
	"tile_id" uuid NOT NULL,
	"item_id" integer NOT NULL,
	CONSTRAINT "bingo_tile_items_tile_id_item_id_pk" PRIMARY KEY("tile_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "bingo_tiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"board_id" uuid NOT NULL,
	"row" integer NOT NULL,
	"col" integer NOT NULL,
	"name" text NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"description" text,
	"icon_item_id" integer,
	CONSTRAINT "bingo_tiles_position" UNIQUE("board_id","row","col"),
	CONSTRAINT "bingo_tiles_points" CHECK ("bingo_tiles"."points" >= 0),
	CONSTRAINT "bingo_tiles_quantity" CHECK ("bingo_tiles"."quantity" >= 1)
);
--> statement-breakpoint
ALTER TABLE "bingo_boards" ADD CONSTRAINT "bingo_boards_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bingo_completions" ADD CONSTRAINT "bingo_completions_team_id_bingo_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."bingo_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bingo_completions" ADD CONSTRAINT "bingo_completions_tile_id_bingo_tiles_id_fk" FOREIGN KEY ("tile_id") REFERENCES "public"."bingo_tiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bingo_completions" ADD CONSTRAINT "bingo_completions_marked_by_users_id_fk" FOREIGN KEY ("marked_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bingo_team_members" ADD CONSTRAINT "bingo_team_members_team_id_bingo_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."bingo_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bingo_team_members" ADD CONSTRAINT "bingo_team_members_board_id_bingo_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."bingo_boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bingo_team_members" ADD CONSTRAINT "bingo_team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bingo_teams" ADD CONSTRAINT "bingo_teams_board_id_bingo_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."bingo_boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bingo_tile_items" ADD CONSTRAINT "bingo_tile_items_tile_id_bingo_tiles_id_fk" FOREIGN KEY ("tile_id") REFERENCES "public"."bingo_tiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bingo_tiles" ADD CONSTRAINT "bingo_tiles_board_id_bingo_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."bingo_boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bingo_tile_items_item_id" ON "bingo_tile_items" USING btree ("item_id");