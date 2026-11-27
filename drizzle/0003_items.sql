CREATE TABLE "items" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"canonical_id" integer NOT NULL,
	"members" boolean,
	"tradeable" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "items_canonical_id" ON "items" USING btree ("canonical_id");--> statement-breakpoint
CREATE INDEX "items_name_lower" ON "items" USING btree (lower("name"));