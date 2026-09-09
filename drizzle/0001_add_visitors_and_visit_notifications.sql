CREATE TABLE "visitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(191) NOT NULL,
	"name" varchar(191) DEFAULT '' NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"google_sub" varchar(255) DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp,
	CONSTRAINT "visitors_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "property_visits" ADD COLUMN "visitor_id" integer;--> statement-breakpoint
ALTER TABLE "property_visits" ADD COLUMN "admin_note" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "property_visits" ADD COLUMN "decided_at" timestamp;--> statement-breakpoint
ALTER TABLE "property_visits" ADD COLUMN "notified_at" timestamp;--> statement-breakpoint
ALTER TABLE "property_visits" ADD CONSTRAINT "property_visits_visitor_id_visitors_id_fk" FOREIGN KEY ("visitor_id") REFERENCES "public"."visitors"("id") ON DELETE set null ON UPDATE no action;