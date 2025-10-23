import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function enhanceCompaniesTable() {
  console.log('🚀 Enhancing companies table with new fields...');

  try {
    // Add new company profile fields one by one
    const fields = [
      'company_tagline text',
      'company_description text',
      'company_phone text',
      'company_email text',
      'company_website text',
      'company_logo text',
      "company_address jsonb DEFAULT '{}'",
      'company_nmls_number text',
      'company_license_number text',
      'company_established_year integer',
      'company_team_size text',
      "company_specialties jsonb DEFAULT '[]'",
      "company_awards jsonb DEFAULT '[]'",
      "company_testimonials jsonb DEFAULT '[]'",
      "company_social_media jsonb DEFAULT '{}'",
      "company_branding jsonb DEFAULT '{}'",
      "company_contact_info jsonb DEFAULT '{}'",
      "company_business_hours jsonb DEFAULT '{}'",
      "company_service_areas jsonb DEFAULT '[]'",
      "company_languages jsonb DEFAULT '[]'",
      "company_certifications jsonb DEFAULT '[]'",
      "company_insurance_info jsonb DEFAULT '{}'",
      "company_financial_info jsonb DEFAULT '{}'",
      "company_marketing_info jsonb DEFAULT '{}'",
      "company_privacy_settings jsonb DEFAULT '{}'",
      "company_seo_settings jsonb DEFAULT '{}'",
      "company_analytics_settings jsonb DEFAULT '{}'",
      "company_integration_settings jsonb DEFAULT '{}'",
      "company_notification_settings jsonb DEFAULT '{}'",
      "company_backup_settings jsonb DEFAULT '{}'",
      "company_security_settings jsonb DEFAULT '{}'",
      "company_compliance_settings jsonb DEFAULT '{}'",
      "company_custom_fields jsonb DEFAULT '{}'",
      "company_metadata jsonb DEFAULT '{}'",
      'company_version integer DEFAULT 1',
      'company_last_updated_by uuid',
      "company_approval_status text DEFAULT 'pending'",
      'company_approval_notes text',
      'company_approval_date timestamp',
      'company_approval_by uuid'
    ];

    for (const field of fields) {
      await db.execute(sql.raw(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS ${field}`));
    }
    console.log('✅ Added company profile fields');

    // Add indexes for performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS companies_nmls_number_idx ON companies (company_nmls_number);
      CREATE INDEX IF NOT EXISTS companies_license_number_idx ON companies (company_license_number);
      CREATE INDEX IF NOT EXISTS companies_approval_status_idx ON companies (company_approval_status);
      CREATE INDEX IF NOT EXISTS companies_version_idx ON companies (company_version);
    `);
    console.log('✅ Added performance indexes');

    // Update existing companies with default values
    await db.execute(sql`
      UPDATE companies SET 
        company_tagline = 'Professional Mortgage Services',
        company_description = 'Your trusted partner for home loans and mortgage solutions',
        company_phone = phone,
        company_email = email,
        company_website = website,
        company_logo = logo,
        company_address = COALESCE(address, '{}'),
        company_nmls_number = 'NMLS# ' || EXTRACT(YEAR FROM created_at) || LPAD(EXTRACT(DOY FROM created_at)::text, 3, '0'),
        company_license_number = license_number,
        company_established_year = EXTRACT(YEAR FROM created_at),
        company_team_size = '1-10',
        company_specialties = '["Residential Loans", "Refinancing", "First-Time Buyers"]'::jsonb,
        company_awards = '[]'::jsonb,
        company_testimonials = '[]'::jsonb,
        company_social_media = '{"facebook": "", "twitter": "", "linkedin": "", "instagram": ""}'::jsonb,
        company_branding = '{"primary_color": "#3b82f6", "secondary_color": "#1e40af", "logo_variations": []}'::jsonb,
        company_contact_info = jsonb_build_object('main_phone', phone, 'main_email', email, 'support_email', email),
        company_business_hours = '{"monday": "9:00 AM - 6:00 PM", "tuesday": "9:00 AM - 6:00 PM", "wednesday": "9:00 AM - 6:00 PM", "thursday": "9:00 AM - 6:00 PM", "friday": "9:00 AM - 6:00 PM", "saturday": "10:00 AM - 4:00 PM", "sunday": "Closed"}'::jsonb,
        company_service_areas = '["Local Area", "Statewide"]'::jsonb,
        company_languages = '["English"]'::jsonb,
        company_certifications = '[]'::jsonb,
        company_insurance_info = '{}'::jsonb,
        company_financial_info = '{}'::jsonb,
        company_marketing_info = '{}'::jsonb,
        company_privacy_settings = '{"data_collection": true, "marketing_emails": true, "analytics": true}'::jsonb,
        company_seo_settings = '{"meta_title": "", "meta_description": "", "keywords": []}'::jsonb,
        company_analytics_settings = '{"google_analytics": "", "facebook_pixel": "", "conversion_tracking": true}'::jsonb,
        company_integration_settings = '{"crm_integration": "", "email_marketing": "", "lead_generation": ""}'::jsonb,
        company_notification_settings = '{"email_notifications": true, "sms_notifications": false, "push_notifications": false}'::jsonb,
        company_backup_settings = '{"auto_backup": true, "backup_frequency": "daily", "retention_days": 30}'::jsonb,
        company_security_settings = '{"two_factor_auth": false, "password_policy": "standard", "session_timeout": 30}'::jsonb,
        company_compliance_settings = '{"gdpr_compliant": false, "ccpa_compliant": false, "industry_standards": []}'::jsonb,
        company_custom_fields = '{}'::jsonb,
        company_metadata = jsonb_build_object('last_profile_update', NOW(), 'profile_completeness', 25),
        company_version = 1,
        company_last_updated_by = admin_user_id,
        company_approval_status = 'approved',
        company_approval_notes = 'Auto-approved during migration',
        company_approval_date = NOW(),
        company_approval_by = admin_user_id
      WHERE company_tagline IS NULL
    `);
    console.log('✅ Updated existing companies with default values');

    console.log('🎉 Companies table enhancement completed successfully!');
  } catch (error: any) {
    console.error('❌ Error during companies table enhancement:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

enhanceCompaniesTable();
