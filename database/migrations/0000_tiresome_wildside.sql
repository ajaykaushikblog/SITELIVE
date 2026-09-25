CREATE TABLE "activity_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_name" text NOT NULL,
	"action" text NOT NULL,
	"target" text DEFAULT '' NOT NULL,
	"tone" text DEFAULT 'edited' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "authors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"profile_image" text DEFAULT '' NOT NULL,
	"professional_title" text DEFAULT '' NOT NULL,
	"short_bio" text DEFAULT '' NOT NULL,
	"long_bio" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"expertise" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"credentials" jsonb,
	"location" text,
	"website" text,
	"email" text,
	"social_links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"years_experience" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"seo" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "authors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"cover_image" text DEFAULT '' NOT NULL,
	"content_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"type" text DEFAULT 'editorial' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "content_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"author_id" uuid,
	"author_name" text DEFAULT '' NOT NULL,
	"featured_image" text DEFAULT '' NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"subcategories" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"occasions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"seasons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"styles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"colors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"audiences" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"views" integer,
	"detail" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"published_at" timestamp with time zone,
	"scheduled_for" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homepage_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"heading" text DEFAULT '' NOT NULL,
	"description" text,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" text NOT NULL,
	"kind" text DEFAULT 'image' NOT NULL,
	"format" text DEFAULT 'JPEG' NOT NULL,
	"role" text DEFAULT 'standard' NOT NULL,
	"url" text NOT NULL,
	"storage_key" text,
	"title" text DEFAULT '' NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"decorative" boolean DEFAULT false NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"width" integer DEFAULT 0 NOT NULL,
	"height" integer DEFAULT 0 NOT NULL,
	"size_kb" integer DEFAULT 0 NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nav_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"area" text NOT NULL,
	"label" text NOT NULL,
	"destination_type" text DEFAULT 'external' NOT NULL,
	"ref" text,
	"url" text,
	"parent_id" uuid,
	"order" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"menu" jsonb
);
--> statement-breakpoint
CREATE TABLE "redirects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"destination" text NOT NULL,
	"type" text DEFAULT '301' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "redirects_source_unique" UNIQUE("source")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taxonomy_terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"parent" text,
	"indexable" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role_id" uuid NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "content_type_slug_idx" ON "content_items" USING btree ("type","slug");--> statement-breakpoint
CREATE INDEX "content_status_idx" ON "content_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "content_scheduled_idx" ON "content_items" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "nav_area_order_idx" ON "nav_items" USING btree ("area","order");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "taxonomy_kind_slug_idx" ON "taxonomy_terms" USING btree ("kind","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");