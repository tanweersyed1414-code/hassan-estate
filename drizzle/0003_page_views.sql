CREATE TABLE "page_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" varchar(512) NOT NULL,
	"referrer_host" varchar(191) DEFAULT '' NOT NULL,
	"visitor_hash" varchar(64) DEFAULT '' NOT NULL,
	"property_id" integer,
	"project_id" integer,
	"is_bot" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_project_id_construction_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."construction_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "page_views_created_idx" ON "page_views" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "page_views_path_idx" ON "page_views" USING btree ("path");