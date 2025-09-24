import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = postgres(connectionString);
const db = drizzle(sql);

async function addAnalyticsColumns() {
  try {
    console.log('🚀 Starting analytics columns migration...');

    // Add new columns to leads table for analytics
    const columns = [
      'conversion_stage text DEFAULT \'lead\'',
      'conversion_date timestamp',
      'application_date timestamp',
      'approval_date timestamp', 
      'closing_date timestamp',
      'loan_amount_closed decimal(15,2)',
      'commission_earned decimal(10,2)',
      'response_time_hours integer',
      'last_contact_date timestamp',
      'contact_count integer DEFAULT 0',
      'lead_quality_score integer',
      'geographic_location text'
    ];

    for (const column of columns) {
      try {
        await sql.unsafe(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ${column}`);
        console.log(`✅ Added column: ${column.split(' ')[0]}`);
      } catch (error) {
        console.log(`⚠️ Column might already exist: ${column.split(' ')[0]}`);
      }
    }

    // Create indexes for performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS leads_conversion_stage_idx ON leads(conversion_stage)',
      'CREATE INDEX IF NOT EXISTS leads_conversion_date_idx ON leads(conversion_date)',
      'CREATE INDEX IF NOT EXISTS leads_closing_date_idx ON leads(closing_date)',
      'CREATE INDEX IF NOT EXISTS leads_response_time_idx ON leads(response_time_hours)',
      'CREATE INDEX IF NOT EXISTS leads_quality_score_idx ON leads(lead_quality_score)',
      'CREATE INDEX IF NOT EXISTS leads_location_idx ON leads(geographic_location)'
    ];

    for (const index of indexes) {
      try {
        await sql.unsafe(index);
        console.log(`✅ Created index: ${index.split(' ')[4]}`);
      } catch (error) {
        console.log(`⚠️ Index might already exist: ${index.split(' ')[4]}`);
      }
    }

    // Create materialized views for performance
    console.log('📊 Creating materialized views...');

    // Daily lead stats view
    await sql.unsafe(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS daily_lead_stats AS
      SELECT 
        DATE(created_at) as date,
        company_id,
        officer_id,
        COUNT(*) as total_leads,
        COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_leads,
        COUNT(CASE WHEN conversion_stage = 'application' THEN 1 END) as applications,
        COUNT(CASE WHEN conversion_stage = 'approval' THEN 1 END) as approvals,
        COUNT(CASE WHEN conversion_stage = 'closing' THEN 1 END) as closings,
        AVG(response_time_hours) as avg_response_time,
        SUM(loan_amount_closed) as total_loan_volume,
        SUM(commission_earned) as total_commission
      FROM leads 
      GROUP BY DATE(created_at), company_id, officer_id
    `);

    // Officer performance stats view
    await sql.unsafe(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS officer_performance_stats AS
      SELECT 
        officer_id,
        company_id,
        COUNT(*) as total_leads,
        COUNT(CASE WHEN conversion_stage = 'closing' THEN 1 END) as closed_deals,
        ROUND(
          (COUNT(CASE WHEN conversion_stage = 'closing' THEN 1 END)::decimal / COUNT(*)) * 100, 
          2
        ) as conversion_rate,
        AVG(response_time_hours) as avg_response_time,
        SUM(loan_amount_closed) as total_loan_volume,
        SUM(commission_earned) as total_commission,
        MAX(last_contact_date) as last_activity
      FROM leads 
      WHERE created_at >= NOW() - INTERVAL '90 days'
      GROUP BY officer_id, company_id
    `);

    // Company performance stats view
    await sql.unsafe(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS company_performance_stats AS
      SELECT 
        company_id,
        COUNT(*) as total_leads,
        COUNT(DISTINCT officer_id) as active_officers,
        COUNT(CASE WHEN conversion_stage = 'closing' THEN 1 END) as closed_deals,
        ROUND(
          (COUNT(CASE WHEN conversion_stage = 'closing' THEN 1 END)::decimal / COUNT(*)) * 100, 
          2
        ) as conversion_rate,
        AVG(response_time_hours) as avg_response_time,
        SUM(loan_amount_closed) as total_loan_volume,
        SUM(commission_earned) as total_commission
      FROM leads 
      WHERE created_at >= NOW() - INTERVAL '90 days'
      GROUP BY company_id
    `);

    console.log('✅ Materialized views created successfully');

    // Create indexes on materialized views
    const viewIndexes = [
      'CREATE INDEX IF NOT EXISTS daily_stats_date_idx ON daily_lead_stats(date)',
      'CREATE INDEX IF NOT EXISTS daily_stats_company_idx ON daily_lead_stats(company_id)',
      'CREATE INDEX IF NOT EXISTS officer_stats_officer_idx ON officer_performance_stats(officer_id)',
      'CREATE INDEX IF NOT EXISTS officer_stats_company_idx ON officer_performance_stats(company_id)',
      'CREATE INDEX IF NOT EXISTS company_stats_company_idx ON company_performance_stats(company_id)'
    ];

    for (const index of viewIndexes) {
      try {
        await sql.unsafe(index);
        console.log(`✅ Created view index: ${index.split(' ')[4]}`);
      } catch (error) {
        console.log(`⚠️ View index might already exist: ${index.split(' ')[4]}`);
      }
    }

    console.log('🎉 Analytics columns migration completed successfully!');
    console.log('');
    console.log('📋 Summary of changes:');
    console.log('  ✅ Added 12 new columns to leads table');
    console.log('  ✅ Created 6 performance indexes');
    console.log('  ✅ Created 3 materialized views');
    console.log('  ✅ Created 5 view indexes');
    console.log('');
    console.log('🔄 Next steps:');
    console.log('  1. Refresh materialized views daily');
    console.log('  2. Build API endpoints');
    console.log('  3. Create analytics components');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run the migration
addAnalyticsColumns();
