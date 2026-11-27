ALTER TABLE "bingo_boards" ADD COLUMN "bonus_row" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "bingo_boards" ADD COLUMN "bonus_column" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "bingo_boards" ADD COLUMN "bonus_diagonal" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "bingo_boards" ADD COLUMN "bonus_blackout" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "bingo_boards" ADD CONSTRAINT "bingo_boards_bonuses" CHECK ("bingo_boards"."bonus_row" >= 0 and "bingo_boards"."bonus_column" >= 0 and "bingo_boards"."bonus_diagonal" >= 0 and "bingo_boards"."bonus_blackout" >= 0);