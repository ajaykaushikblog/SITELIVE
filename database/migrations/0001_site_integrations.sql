CREATE TABLE IF NOT EXISTS "site_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"head_code" text DEFAULT '' NOT NULL,
	"body_start_code" text DEFAULT '' NOT NULL,
	"body_end_code" text DEFAULT '' NOT NULL,
	"settings_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "site_integrations_service_idx" ON "site_integrations" USING btree ("service");
