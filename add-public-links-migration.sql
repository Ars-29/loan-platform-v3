-- Migration: Add loan officer public links system
-- This creates tables for secure public profile sharing

-- Create loan_officer_public_links table
CREATE TABLE IF NOT EXISTS "loan_officer_public_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"public_slug" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"max_uses" integer,
	"current_uses" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loan_officer_public_links_public_slug_unique" UNIQUE("public_slug")
);

-- Create public_link_usage table for analytics
CREATE TABLE IF NOT EXISTS "public_link_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"link_id" uuid NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"referrer" text,
	"accessed_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "loan_officer_public_links" ADD CONSTRAINT "loan_officer_public_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "loan_officer_public_links" ADD CONSTRAINT "loan_officer_public_links_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "public_link_usage" ADD CONSTRAINT "public_link_usage_link_id_loan_officer_public_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "loan_officer_public_links"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "user_link_idx" ON "loan_officer_public_links" ("user_id");
CREATE INDEX IF NOT EXISTS "company_link_idx" ON "loan_officer_public_links" ("company_id");
CREATE INDEX IF NOT EXISTS "public_slug_idx" ON "loan_officer_public_links" ("public_slug");
CREATE INDEX IF NOT EXISTS "public_link_active_idx" ON "loan_officer_public_links" ("is_active");
CREATE INDEX IF NOT EXISTS "link_usage_idx" ON "public_link_usage" ("link_id");
CREATE INDEX IF NOT EXISTS "access_time_idx" ON "public_link_usage" ("accessed_at");

