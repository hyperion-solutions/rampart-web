CREATE TABLE "bingo_tile_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"tile_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"item_id" integer,
	"obtained_by" uuid,
	"obtained_rsn" text,
	"source" "bingo_completion_source" DEFAULT 'admin' NOT NULL,
	"added_by" uuid,
	"note" text,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bingo_tile_progress_amount" CHECK ("bingo_tile_progress"."amount" >= 1)
);
--> statement-breakpoint
ALTER TABLE "bingo_completions" ADD COLUMN "completed_by" uuid;--> statement-breakpoint
ALTER TABLE "bingo_completions" ADD COLUMN "completed_rsn" text;--> statement-breakpoint
ALTER TABLE "bingo_tile_progress" ADD CONSTRAINT "bingo_tile_progress_team_id_bingo_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."bingo_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bingo_tile_progress" ADD CONSTRAINT "bingo_tile_progress_tile_id_bingo_tiles_id_fk" FOREIGN KEY ("tile_id") REFERENCES "public"."bingo_tiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bingo_tile_progress" ADD CONSTRAINT "bingo_tile_progress_obtained_by_users_id_fk" FOREIGN KEY ("obtained_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bingo_tile_progress" ADD CONSTRAINT "bingo_tile_progress_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bingo_tile_progress_team_tile" ON "bingo_tile_progress" USING btree ("team_id","tile_id");--> statement-breakpoint
ALTER TABLE "bingo_completions" ADD CONSTRAINT "bingo_completions_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;