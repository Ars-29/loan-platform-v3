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

async function addSampleLeads() {
  try {
    console.log('🚀 Adding sample leads data...');

    // First, get a company and user to use for sample data
    const companies = await sql`SELECT id FROM companies LIMIT 1`;
    const users = await sql`SELECT id FROM users WHERE role = 'employee' LIMIT 1`;

    if (companies.length === 0 || users.length === 0) {
      console.log('❌ No companies or users found. Please create a company and user first.');
      return;
    }

    const companyId = companies[0].id;
    const userId = users[0].id;

    console.log(`📊 Using company: ${companyId}`);
    console.log(`👤 Using user: ${userId}`);

    // Sample leads data with analytics fields
    const sampleLeads = [
      {
        company_id: companyId,
        officer_id: userId,
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@email.com',
        phone: '(555) 123-4567',
        source: 'landing_page',
        status: 'qualified',
        conversion_stage: 'application',
        priority: 'high',
        credit_score: 750,
        loan_amount: 450000,
        loan_amount_closed: null,
        commission_earned: null,
        response_time_hours: 2,
        lead_quality_score: 8,
        geographic_location: 'San Francisco, CA',
        notes: 'Excellent credit score, pre-approved for conventional loan',
        contact_count: 3,
        last_contact_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        company_id: companyId,
        officer_id: userId,
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '(555) 234-5678',
        source: 'referral',
        status: 'converted',
        conversion_stage: 'closing',
        priority: 'urgent',
        credit_score: 680,
        loan_amount: 320000,
        loan_amount_closed: 320000,
        commission_earned: 3200,
        response_time_hours: 1,
        lead_quality_score: 9,
        geographic_location: 'Austin, TX',
        notes: 'Referral from satisfied customer, closing scheduled for next week',
        contact_count: 8,
        last_contact_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        company_id: companyId,
        officer_id: userId,
        first_name: 'Michael',
        last_name: 'Brown',
        email: 'michael.brown@email.com',
        phone: '(555) 345-6789',
        source: 'rate_table',
        status: 'contacted',
        conversion_stage: 'lead',
        priority: 'medium',
        credit_score: 720,
        loan_amount: 280000,
        loan_amount_closed: null,
        commission_earned: null,
        response_time_hours: 4,
        lead_quality_score: 7,
        geographic_location: 'Denver, CO',
        notes: 'Interested in refinancing, needs rate comparison',
        contact_count: 2,
        last_contact_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        company_id: companyId,
        officer_id: userId,
        first_name: 'Emily',
        last_name: 'Davis',
        email: 'emily.davis@email.com',
        phone: '(555) 456-7890',
        source: 'landing_page',
        status: 'new',
        conversion_stage: 'lead',
        priority: 'low',
        credit_score: 650,
        loan_amount: 180000,
        loan_amount_closed: null,
        commission_earned: null,
        response_time_hours: null,
        lead_quality_score: 5,
        geographic_location: 'Portland, OR',
        notes: 'First-time homebuyer, needs guidance on loan programs',
        contact_count: 0,
        last_contact_date: null,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        company_id: companyId,
        officer_id: userId,
        first_name: 'David',
        last_name: 'Wilson',
        email: 'david.wilson@email.com',
        phone: '(555) 567-8901',
        source: 'referral',
        status: 'qualified',
        conversion_stage: 'approval',
        priority: 'high',
        credit_score: 780,
        loan_amount: 520000,
        loan_amount_closed: null,
        commission_earned: null,
        response_time_hours: 1,
        lead_quality_score: 9,
        geographic_location: 'Seattle, WA',
        notes: 'High-value client, excellent credit, pre-approved for jumbo loan',
        contact_count: 5,
        last_contact_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      },
      {
        company_id: companyId,
        officer_id: userId,
        first_name: 'Lisa',
        last_name: 'Anderson',
        email: 'lisa.anderson@email.com',
        phone: '(555) 678-9012',
        source: 'rate_table',
        status: 'lost',
        conversion_stage: 'lead',
        priority: 'low',
        credit_score: 620,
        loan_amount: 150000,
        loan_amount_closed: null,
        commission_earned: null,
        response_time_hours: 8,
        lead_quality_score: 4,
        geographic_location: 'Phoenix, AZ',
        notes: 'Went with competitor due to better rate offer',
        contact_count: 1,
        last_contact_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      },
    ];

    // Insert sample leads
    for (const lead of sampleLeads) {
      try {
        await sql`
          INSERT INTO leads (
            company_id, officer_id, first_name, last_name, email, phone,
            source, status, conversion_stage, priority, credit_score,
            loan_amount, loan_amount_closed, commission_earned, response_time_hours,
            lead_quality_score, geographic_location, notes, contact_count,
            last_contact_date, created_at, updated_at
          ) VALUES (
            ${lead.company_id}, ${lead.officer_id}, ${lead.first_name}, ${lead.last_name},
            ${lead.email}, ${lead.phone}, ${lead.source}, ${lead.status},
            ${lead.conversion_stage}, ${lead.priority}, ${lead.credit_score},
            ${lead.loan_amount}, ${lead.loan_amount_closed}, ${lead.commission_earned},
            ${lead.response_time_hours}, ${lead.lead_quality_score}, ${lead.geographic_location},
            ${lead.notes}, ${lead.contact_count}, ${lead.last_contact_date},
            ${lead.created_at}, ${lead.updated_at}
          )
        `;
        console.log(`✅ Added lead: ${lead.first_name} ${lead.last_name}`);
      } catch (error) {
        console.log(`⚠️ Lead might already exist: ${lead.first_name} ${lead.last_name}`);
      }
    }

    console.log('🎉 Sample leads data added successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('  ✅ Added 6 sample leads with analytics data');
    console.log('  ✅ Includes various statuses and conversion stages');
    console.log('  ✅ Different quality scores and response times');
    console.log('  ✅ Mix of sources (landing_page, referral, rate_table)');
    console.log('');
    console.log('🔄 Next steps:');
    console.log('  1. Visit the analytics pages to see the data');
    console.log('  2. Test the enhanced leads table functionality');
    console.log('  3. Try updating lead statuses and quality scores');

  } catch (error) {
    console.error('❌ Failed to add sample leads:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run the script
addSampleLeads();
