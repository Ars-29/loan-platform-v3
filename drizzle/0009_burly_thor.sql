ALTER TABLE "users" ADD COLUMN "nmls_number" text;--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_nmls_number_idx" ON "users" USING btree ("nmls_number");--> statement-breakpoint
ALTER TABLE "user_companies" DROP COLUMN "nmls_number";