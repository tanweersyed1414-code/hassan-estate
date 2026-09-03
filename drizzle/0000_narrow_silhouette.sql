CREATE TYPE "public"."area_unit" AS ENUM('MARLA', 'KANAL', 'SQFT', 'SQYD', 'ACRE');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('NEW', 'CONTACTED', 'INTERESTED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."inquiry_type" AS ENUM('PROPERTY', 'CONSTRUCTION', 'PAYMENT_PLAN', 'PROPERTY_VISIT', 'GENERAL');--> statement-breakpoint
CREATE TYPE "public"."knowledge_category" AS ENUM('COMPANY', 'PROPERTIES', 'CONSTRUCTION', 'PAYMENT', 'FAQ', 'POLICIES');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('IMAGE', 'VIDEO', 'DOCUMENT');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('PLANNING', 'UNDER_CONSTRUCTION', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."project_type" AS ENUM('RESIDENTIAL', 'COMMERCIAL', 'RENOVATION', 'INTERIOR', 'MIXED_USE');--> statement-breakpoint
CREATE TYPE "public"."property_category" AS ENUM('RESIDENTIAL_PLOT', 'COMMERCIAL_PLOT', 'HOUSE', 'APARTMENT', 'FARMHOUSE', 'SHOP', 'OFFICE', 'COMMERCIAL_BUILDING', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."property_status" AS ENUM('AVAILABLE', 'FOR_SALE', 'FOR_RENT', 'SOLD', 'BOOKING_OPEN', 'COMING_SOON');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('SUPER_ADMIN', 'ADMIN', 'EDITOR');--> statement-breakpoint
CREATE TYPE "public"."visit_status" AS ENUM('NEW', 'CONFIRMED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "ai_knowledge_base" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" "knowledge_category" DEFAULT 'FAQ' NOT NULL,
	"question" varchar(500) NOT NULL,
	"answer" text NOT NULL,
	"keywords" text DEFAULT '' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "construction_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"location" varchar(255) DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"project_type" "project_type" DEFAULT 'RESIDENTIAL' NOT NULL,
	"status" "project_status" DEFAULT 'PLANNING' NOT NULL,
	"completion_date" timestamp,
	"featured_image" text DEFAULT '' NOT NULL,
	"video_url" text DEFAULT '' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "construction_projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(191) NOT NULL,
	"phone" varchar(40) NOT NULL,
	"email" varchar(191) DEFAULT '' NOT NULL,
	"inquiry_type" "inquiry_type" DEFAULT 'GENERAL' NOT NULL,
	"property_id" integer,
	"project_id" integer,
	"message" text DEFAULT '' NOT NULL,
	"source" varchar(60) DEFAULT 'WEBSITE' NOT NULL,
	"status" "inquiry_status" DEFAULT 'NEW' NOT NULL,
	"internal_notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"type" "media_type" DEFAULT 'IMAGE' NOT NULL,
	"file_name" varchar(255) DEFAULT '' NOT NULL,
	"file_size" integer DEFAULT 0 NOT NULL,
	"uploaded_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_installments" (
	"id" serial PRIMARY KEY NOT NULL,
	"payment_plan_id" integer NOT NULL,
	"installment_number" integer NOT NULL,
	"label" varchar(120) DEFAULT '' NOT NULL,
	"amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"due_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "payment_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"property_id" integer,
	"project_id" integer,
	"total_price" numeric(14, 2) DEFAULT '0' NOT NULL,
	"booking_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"down_payment" numeric(14, 2) DEFAULT '0' NOT NULL,
	"remaining_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"monthly_installment" numeric(14, 2) DEFAULT '0' NOT NULL,
	"quarterly_installment" numeric(14, 2) DEFAULT '0' NOT NULL,
	"number_of_installments" integer DEFAULT 0 NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_features" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"label" varchar(120) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"url" text NOT NULL,
	"alt" varchar(255) DEFAULT '' NOT NULL,
	"kind" varchar(20) DEFAULT 'GALLERY' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"category" "property_category" NOT NULL,
	"status" "property_status" DEFAULT 'AVAILABLE' NOT NULL,
	"price" numeric(14, 2) DEFAULT '0' NOT NULL,
	"is_negotiable" boolean DEFAULT false NOT NULL,
	"currency" varchar(8) DEFAULT 'PKR' NOT NULL,
	"area" numeric(12, 2) DEFAULT '0' NOT NULL,
	"area_unit" "area_unit" DEFAULT 'MARLA' NOT NULL,
	"location" varchar(255) DEFAULT '' NOT NULL,
	"city" varchar(120) DEFAULT 'Islamabad' NOT NULL,
	"society" varchar(120) DEFAULT '' NOT NULL,
	"block" varchar(60) DEFAULT '' NOT NULL,
	"full_address" text DEFAULT '' NOT NULL,
	"latitude" numeric(10, 6),
	"longitude" numeric(10, 6),
	"bedrooms" integer DEFAULT 0 NOT NULL,
	"bathrooms" integer DEFAULT 0 NOT NULL,
	"parking" integer DEFAULT 0 NOT NULL,
	"amenities" text DEFAULT '[]' NOT NULL,
	"featured_image" text DEFAULT '' NOT NULL,
	"video_url" text DEFAULT '' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "properties_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "property_features" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"label" varchar(120) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"url" text NOT NULL,
	"alt" varchar(255) DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_visits" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(191) NOT NULL,
	"phone" varchar(40) NOT NULL,
	"email" varchar(191) DEFAULT '' NOT NULL,
	"property_id" integer,
	"preferred_date" timestamp,
	"preferred_time" varchar(40) DEFAULT '' NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"status" "visit_status" DEFAULT 'NEW' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(120) NOT NULL,
	"value" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(191) NOT NULL,
	"email" varchar(191) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'EDITOR' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_project_id_construction_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."construction_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_installments" ADD CONSTRAINT "payment_installments_payment_plan_id_payment_plans_id_fk" FOREIGN KEY ("payment_plan_id") REFERENCES "public"."payment_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plans" ADD CONSTRAINT "payment_plans_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_features" ADD CONSTRAINT "project_features_project_id_construction_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."construction_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_project_id_construction_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."construction_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_features" ADD CONSTRAINT "property_features_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_visits" ADD CONSTRAINT "property_visits_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "properties_city_idx" ON "properties" USING btree ("city");--> statement-breakpoint
CREATE INDEX "properties_category_idx" ON "properties" USING btree ("category");--> statement-breakpoint
CREATE INDEX "properties_status_idx" ON "properties" USING btree ("status");--> statement-breakpoint
CREATE INDEX "properties_price_idx" ON "properties" USING btree ("price");