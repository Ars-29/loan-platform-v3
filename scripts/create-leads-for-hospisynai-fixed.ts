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

async function createLeadsForHospisynai() {
  try {
    console.log('🚀 Creating 20 leads for hospisynai@gmail.com...');

    // First, get the user and company for hospisynai@gmail.com
    const userResult = await sql`
      SELECT u.id as user_id, c.id as company_id, c.name as company_name
      FROM users u
      LEFT JOIN user_companies uc ON u.id = uc.user_id
      LEFT JOIN companies c ON uc.company_id = c.id
      WHERE u.email = 'hospisynai@gmail.com'
    `;

    if (userResult.length === 0) {
      console.log('❌ User hospisynai@gmail.com not found. Please create the user first.');
      return;
    }

    const { user_id, company_id, company_name } = userResult[0];

    if (!company_id) {
      console.log('❌ User hospisynai@gmail.com is not associated with any company.');
      return;
    }

    console.log(`📊 Using company: ${company_name} (${company_id})`);
    console.log(`👤 Using user: hospisynai@gmail.com (${user_id})`);

    // Generate 20 diverse leads with realistic data
    const leads = [
      {
        company_id: company_id,
        officer_id: user_id,
        first_name: 'James',
        last_name: 'Rodriguez',
        email: 'james.rodriguez@email.com',
        phone: '(555) 101-2001',
        source: 'rate_table',
        status: 'new',
        conversion_stage: 'lead',
        priority: 'medium',
        credit_score: 720,
        loan_amount: 350000,
        loan_amount_closed: null,
        commission_earned: null,
        response_time_hours: null,
        lead_quality_score: 7,
        geographic_location: 'Los Angeles, CA',
        notes: 'Interested in conventional loan, first-time buyer',
        contact_count: 0,
        last_contact_date: null,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        company_id: company_id,
        officer_id: user_id,
        first_name: 'Maria',
        last_name: 'Garcia',
        email: 'maria.garcia@email.com',
        phone: '(555) 102-2002',
        source: 'landing_page',
        status: 'contacted',
        conversion_stage: 'lead',
        priority: 'high',
        credit_score: 780,
        loan_amount: 480000,
        loan_amount_closed: null,
        commission_earned: null,
        response_time_hours: 2,
        lead_quality_score: 8,
        geographic_location: 'Miami, FL',
        notes: 'High credit score, looking for jumbo loan',
        contact_count: 2,
        last_contact_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        company_id: company_id,
        officer_id: user_id,
        first_name: 'Robert',
        last_name: 'Chen',
        email: 'robert.chen@email.com',
        phone: '(555) 103-2003',
        source: 'referral',
        status: 'qualified',
        conversion_stage: 'application',
        priority: 'urgent',
        credit_score: 750,
        loan_amount: 420000,
        loan_amount_closed: null,
        commission_earned: null,
        response_time_hours: 1,
        lead_quality_score: 9,
        geographic_location: 'Seattle, WA',
        notes: 'Referral from satisfied customer, ready to apply',
        contact_count: 4,
        last_contact_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        company_id: company_id,
        officer_id: user_id,
        first_name: 'Jennifer',
        last_name: 'Williams',
        email: 'jennifer.williams@email.com',
        phone: '(555) 104-2004',
        source: 'rate_table',
        status: 'converted',
        conversion_stage: 'closing',
        priority: 'high',
        credit_score: 680,
        loan_amount: 320000,
        loan_amount_closed: 320000,
        commission_earned: 3200,
        response_time_hours: 1,
        lead_quality_score: 8,
        geographic_location: 'Austin, TX',
        notes: 'Closing scheduled for next week, excellent client',
        contact_count: 6,
        last_contact_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        company_id: company_id,
        officer_id: user_id,
        first_name: 'Michael',
        last_name: 'Brown',
        email: 'michael.brown@email.com',
        phone: '(555) 105-2005',
        source: 'landing_page',
        status: 'new',
        conversion_stage: 'lead',
        priority: 'low',
        credit_score: 650,
        loan_amount: 280000,
        loan_amount_closed: null,
        commission_earned: null,
        response_time_hours: null,
        lead_quality_score: 6,
        geographic_location: 'Denver, CO',
        notes: 'First-time buyer, needs guidance on programs',
        contact_count: 0,
        last_contact_date: null,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        company_id: company_id,
        officer_id: user_id,
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '(555) 106-2006',
        source: 'referral',
        status: 'contacted',
        conversion_stage: 'lead',
        priority: 'medium',
        credit_score: 710,
        loan_amount: 380000,
        loan_amount_closed: null,
        commission_earned: null,
        response_time_hours: 3,
        lead_quality_score: 7,
        geographic_location: 'Portland, OR',
        notes: 'Interested in refinancing current mortgage',
        contact_count: 1,
        last_contact_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        company_id: company_id,
        officer_id: user_id,
        first_name: 'David',
        last_name: 'Wilson',
        email: 'david.wilson@email.com',
        phone: '(555) 107-2007',
        source: 'rate_table',
        status: 'qualified',
        conversion_stage: 'approval',
        priority: 'high',
        credit_score: 760,
        loan_amount: 520000,
        loan_amount_closed: null,
        commission_earned: null,
        response_time_hours: 2,
        lead_quality_score: 9,
        geographic_location: 'San Francisco, CA',
        notes: 'High-value client, excellent credit history',
        contact_count: 5,
        last_contact_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        company_id: company_id,
        officer_id: user_id,
        first_name: 'Lisa',
        last_name: 'Anderson',
        email: 'lisa.anderson@email.com',
        phone: '(555) 108-2008',
        source: 'landing_page',
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
        last_contact_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        company_id: company_id,
        officer_id: user_id,
        first_name: 'Christopher',
        last_name: 'Taylor',
        email: 'christopher.taylor@email.com',
        phone: '(555) 109-2009',
        source: 'referral',
        status: 'new',
        conversion_stage: 'lead',
        priority: 'medium',
        credit_score: 690,
        loan_amount: 290000,
        loan_amount_closed: null,
        commission_earned: null,
        response_time_hours: null,
        lead_quality_score: 6,
        geographic_location: 'Nashville, TN',
        notes: 'Looking for investment property loan',
        contact_count: 0,
        last_contact_date: null,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        company_id: company_id,
        officer_id: user_id,
        first_name: 'Amanda',
        last_name: 'Martinez',
        email: 'amanda.martinez@email.com',
        phone: '(555) 110-2010',
        source: 'rate_table',
        status: 'contacted',
        conversion_stage: 'lead',
        priority: 'high',
        credit_score: 740,
        loan_amount: 410000,
        loan_amount_closed: null,
        commission_earned: null,
        response_time_hours: 2,
        lead_quality_score: 8,
        geographic_location: 'Chicago, IL',
        notes: 'Military veteran, eligible for VA loan benefits',
        contact_count: 2,
        last_contact_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        company_id: company_id,
        officer_id: user_id,
        first_name: 'Kevin',
        last_name: 'Lee',
        email: 'kevin.lee@email.com',
        phone: '(555) 111-2011',
        source: 'landing_page',
        status: 'qualified',
        conversion_stage: 'application',
        priority: 'urgent',
        credit_score: 770,
        loan_amount: 450000,
        loan_amount_closed: null,
        commission_earned: null,
        response_time_hours: 1,
        lead_quality_score: 9,
        geographic_location: 'Boston, MA',
        notes: 'Pre-approved, ready to make offer on house',
        contact_count: 3,
        last_contact_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        company_id: company_id,
        officer_id: user_id,
        first_name: 'Rachel',
        last_name: 'Davis',
        email: 'rachel.davis@email.com',
        phone: '(555) 112-2012',
        source: 'referral',
        status: 'converted',
        conversion_stage: 'closing',
        priority: 'high',
        credit_score: 720,
        loan_amount: 360000,
        loan_amount_closed: 360000,
        commission_earned: 3600,
        response_time_hours: 1,
        lead_quality_score: 8,
        geographic_location: 'Atlanta, GA',
        notes: 'Closing completed successfully, happy customer',
        contact_count: 7,
        last_contact_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        company_id: company_id,
        officer_id: user_id,
        first_name: 'Thomas',
        last_name: 'Miller',
        email: 'thomas.miller@email.com',
        phone: '(555) 113-2013',
        source: 'rate_table',
        status: 'new',
        conversion_stage: 'lead',
        priority: 'low',
        credit_score: 640,
        loan_amount: 220000,
        loan_amount_closed: null,
        commission_earned: null,
        response_time_hours: null,
        lead_quality_score: 5,
        geographic_location: 'Kansas City, MO',
        notes: 'Self-employed, needs documentation guidance',
        contact_count: 0,
        last_contact_date: null,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        company_id: company_id,
        officer_id: user_id,
        first_name: 'Jessica',
        last_name: 'Garcia',
        email: 'jessica.garcia@email.com',
        phone: '(555) 114-2014',
        source: 'landing_page',
        status: 'contacted',
        conversion_stage: 'lead',
        priority: 'medium',
        credit_score: 700,
        loan_amount: 330000,
        loan_amount_closed: null,
        commission_earned: null,
        response_time_hours: 4,
        lead_quality_score: 7,
        geographic_location: 'San Diego, CA',
        notes: 'Looking for FHA loan, first-time buyer',
        contact_count: 1,
        last_contact_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        company_id: company_id,
        officer_id: user_id,
        first_name: 'Daniel',
        last_name: 'Rodriguez',
        email: 'daniel.rodriguez@email.com',
        phone: '(555) 115-2015',
        source: 'referral',
        status: 'qualified',
        conversion_stage: 'approval',
        priority: 'high',
        credit_score: 750,
        loan_amount: 480000,
        loan_amount_closed: null,
        commission_earned: null,
        response_time_hours: 2,
        lead_quality_score: 8,
        geographic_location: 'Houston, TX',
        notes: 'High-income professional, excellent credit',
        contact_count: 4,
        last_contact_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        company_id: company_id,
        officer_id: user_id,
        first_name: 'Michelle',
        last_name: 'White',
        email: 'michelle.white@email.com',
        phone: '(555) 116-2016',
        source: 'rate_table',
        status: 'lost',
        conversion_stage: 'lead',
        priority: 'low',
        credit_score: 600,
        loan_amount: 180000,
        loan_amount_closed: null,
        commission_earned: null,
        response_time_hours: 12,
        lead_quality_score: 3,
        geographic_location: 'Detroit, MI',
        notes: 'Credit issues, went with subprime lender',
        contact_count: 1,
        last_contact_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        company_id: company_id,
        officer_id: user_id,
        first_name: 'Ryan',
        last_name: 'Thompson',
        email: 'ryan.thompson@email.com',
        phone: '(555) 117-2017',
        source: 'landing_page',
        status: 'new',
        conversion_stage: 'lead',
        priority: 'medium',
        credit_score: 680,
        loan_amount: 270000,
        loan_amount_closed: null,
        commission_earned: null,
        response_time_hours: null,
        lead_quality_score: 6,
        geographic_location: 'Minneapolis, MN',
        notes: 'Looking to refinance for better rate',
        contact_count: 0,
        last_contact_date: null,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        company_id: company_id,
        officer_id: user_id,
        first_name: 'Nicole',
        last_name: 'Harris',
        email: 'nicole.harris@email.com',
        phone: '(555) 118-2018',
        source: 'referral',
        status: 'contacted',
        conversion_stage: 'lead',
        priority: 'high',
        credit_score: 730,
        loan_amount: 390000,
        loan_amount_closed: null,
        commission_earned: null,
        response_time_hours: 2,
        lead_quality_score: 8,
        geographic_location: 'Tampa, FL',
        notes: 'Relocating for job, needs quick closing',
        contact_count: 2,
        last_contact_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        company_id: company_id,
        officer_id: user_id,
        first_name: 'Brandon',
        last_name: 'Clark',
        email: 'brandon.clark@email.com',
        phone: '(555) 119-2019',
        source: 'rate_table',
        status: 'qualified',
        conversion_stage: 'application',
        priority: 'urgent',
        credit_score: 760,
        loan_amount: 440000,
        loan_amount_closed: null,
        commission_earned: null,
        response_time_hours: 1,
        lead_quality_score: 9,
        geographic_location: 'Dallas, TX',
        notes: 'Investment property, experienced investor',
        contact_count: 3,
        last_contact_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        company_id: company_id,
        officer_id: user_id,
        first_name: 'Stephanie',
        last_name: 'Lewis',
        email: 'stephanie.lewis@email.com',
        phone: '(555) 120-2020',
        source: 'landing_page',
        status: 'converted',
        conversion_stage: 'closing',
        priority: 'high',
        credit_score: 710,
        loan_amount: 340000,
        loan_amount_closed: 340000,
        commission_earned: 3400,
        response_time_hours: 1,
        lead_quality_score: 8,
        geographic_location: 'Orlando, FL',
        notes: 'Closing completed, excellent customer service experience',
        contact_count: 5,
        last_contact_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Insert leads into database
    let successCount = 0;
    let errorCount = 0;

    for (const lead of leads) {
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
        console.log(`✅ Added lead: ${lead.first_name} ${lead.last_name} (${lead.status})`);
        successCount++;
      } catch (error) {
        console.log(`⚠️ Failed to add lead: ${lead.first_name} ${lead.last_name} - ${error instanceof Error ? error.message : 'Unknown error'}`);
        errorCount++;
      }
    }

    console.log('');
    console.log('🎉 Lead creation completed!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`  ✅ Successfully added: ${successCount} leads`);
    console.log(`  ❌ Failed to add: ${errorCount} leads`);
    console.log(`  👤 All leads assigned to: hospisynai@gmail.com`);
    console.log(`  🏢 Company: ${company_name}`);
    console.log('');
    console.log('📊 Lead Distribution:');
    const statusCounts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} leads`);
    });
    console.log('');
    console.log('🔄 Next steps:');
    console.log('  1. Visit the leads page to see all 20 leads');
    console.log('  2. Test the enhanced leads table functionality');
    console.log('  3. Try editing lead statuses, stages, and quality scores');
    console.log('  4. View lead details for comprehensive information');

  } catch (error) {
    console.error('❌ Failed to create leads:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run the script
createLeadsForHospisynai();
