ALTER TABLE "companies" ADD COLUMN "company_tagline" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_description" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_nmls_number" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_established_year" integer;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_team_size" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_specialties" jsonb DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_awards" jsonb DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_testimonials" jsonb DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_social_media" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_branding" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_contact_info" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_business_hours" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_service_areas" jsonb DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_languages" jsonb DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_certifications" jsonb DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_insurance_info" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_financial_info" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_marketing_info" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_privacy_settings" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_seo_settings" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_analytics_settings" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_integration_settings" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_notification_settings" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_backup_settings" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_security_settings" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_compliance_settings" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_custom_fields" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_metadata" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_version" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_last_updated_by" uuid;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_approval_status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_approval_notes" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_approval_date" timestamp;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "company_approval_by" uuid;--> statement-breakpoint
ALTER TABLE "user_companies" ADD COLUMN "nmls_number" text;--> statement-breakpoint
CREATE INDEX "companies_nmls_number_idx" ON "companies" USING btree ("company_nmls_number");--> statement-breakpoint
CREATE INDEX "companies_license_number_idx" ON "companies" USING btree ("license_number");--> statement-breakpoint
CREATE INDEX "companies_approval_status_idx" ON "companies" USING btree ("company_approval_status");--> statement-breakpoint
CREATE INDEX "companies_version_idx" ON "companies" USING btree ("company_version");