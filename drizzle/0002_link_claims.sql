CREATE TYPE "public"."claim_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "link_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"rsn" text NOT NULL,
	"wom_player_id" integer NOT NULL,
	"account_type" text NOT NULL,
	"status" "claim_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone,
	"decided_by" uuid
);
--> statement-breakpoint
ALTER TABLE "link_claims" ADD CONSTRAINT "link_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "link_claims" ADD CONSTRAINT "link_claims_decided_by_users_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "link_claims_one_pending_per_player" ON "link_claims" USING btree ("wom_player_id") WHERE "link_claims"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "link_claims_user_id" ON "link_claims" USING btree ("user_id");