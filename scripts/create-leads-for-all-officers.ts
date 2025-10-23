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

async function createLeadsForAllOfficers() {
  try {
    console.log('🚀 Creating leads for all loan officers...');

    // Get all officers for the company
    const officersResult = await sql`
      SELECT u.id as user_id, u.email, u.first_name, u.last_name, c.id as company_id, c.name as company_name
      FROM users u
      JOIN user_companies uc ON u.id = uc.user_id
      JOIN companies c ON uc.company_id = c.id
      WHERE u.role = 'employee' AND uc.role = 'employee'
      ORDER BY u.created_at
    `;

    if (officersResult.length === 0) {
      console.log('❌ No loan officers found');
      return;
    }

    console.log(`📊 Found ${officersResult.length} loan officers`);
    officersResult.forEach(officer => {
      console.log(`  👤 ${officer.first_name} ${officer.last_name} (${officer.email})`);
    });

    const { company_id, company_name } = officersResult[0];
    console.log(`🏢 Company: ${company_name}`);

    // Generate leads for each officer (5 leads per officer)
    const leadTemplates = [
      {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@email.com',
        phone: '(555) 101-2001',
        source: 'rate_table',
        status: 'new',
        conversion_stage: 'lead',
        priority: 'medium',
        credit_score: 720,
        loan_amount: 350000,
        geographic_location: 'Los Angeles, CA',
        notes: 'Interested in conventional loan, first-time buyer',
        contact_count: 0,
        loan_amount_closed: null,
        commission_earned: null,
      },
      {
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
        geographic_location: 'Miami, FL',
        notes: 'High credit score, looking for jumbo loan',
        contact_count: 2,
        loan_amount_closed: null,
        commission_earned: null,
      },
      {
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
        geographic_location: 'Seattle, WA',
        notes: 'Referral from satisfied customer, ready to apply',
        contact_count: 4,
        loan_amount_closed: null,
        commission_earned: null,
      },
      {
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
        geographic_location: 'Austin, TX',
        notes: 'Closing scheduled for next week, excellent client',
        contact_count: 6,
      },
      {
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
        geographic_location: 'Denver, CO',
        notes: 'First-time buyer, needs guidance on programs',
        contact_count: 0,
        loan_amount_closed: null,
        commission_earned: null,
      },
    ];

    let totalSuccessCount = 0;
    let totalErrorCount = 0;

    for (const officer of officersResult) {
      console.log(`\n👤 Creating leads for ${officer.first_name} ${officer.last_name}...`);
      
      let officerSuccessCount = 0;
      let officerErrorCount = 0;

      for (let i = 0; i < leadTemplates.length; i++) {
        const template = leadTemplates[i];
        
        // Make each lead unique by adding officer-specific variations
        const uniqueLead = {
          ...template,
          first_name: `${template.first_name}_${officer.first_name}`,
          last_name: `${template.last_name}_${officer.last_name}`,
          email: `${template.first_name.toLowerCase()}.${template.last_name.toLowerCase()}.${officer.first_name.toLowerCase()}@email.com`,
          phone: `(${555 + i}) ${101 + i}-${2001 + i}`,
          loan_amount: template.loan_amount + (i * 10000), // Vary loan amounts
          credit_score: template.credit_score + (i * 5), // Vary credit scores
          geographic_location: `${template.geographic_location.split(',')[0]}_${officer.first_name}, ${template.geographic_location.split(',')[1]}`,
          notes: `${template.notes} (Assigned to ${officer.first_name})`,
          response_time_hours: Math.floor(Math.random() * 12) + 1,
          lead_quality_score: Math.floor(Math.random() * 7) + 3,
          created_at: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
          last_contact_date: template.contact_count > 0 ? new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString() : null,
        };

        try {
          await sql`
            INSERT INTO leads (
              company_id, officer_id, first_name, last_name, email, phone,
              source, status, conversion_stage, priority, credit_score,
              loan_amount, loan_amount_closed, commission_earned, response_time_hours,
              lead_quality_score, geographic_location, notes, contact_count,
              last_contact_date, created_at, updated_at
            ) VALUES (
              ${company_id}, ${officer.user_id}, ${uniqueLead.first_name}, ${uniqueLead.last_name},
              ${uniqueLead.email}, ${uniqueLead.phone}, ${uniqueLead.source}, ${uniqueLead.status},
              ${uniqueLead.conversion_stage}, ${uniqueLead.priority}, ${uniqueLead.credit_score},
              ${uniqueLead.loan_amount}, ${uniqueLead.loan_amount_closed}, ${uniqueLead.commission_earned},
              ${uniqueLead.response_time_hours}, ${uniqueLead.lead_quality_score}, ${uniqueLead.geographic_location},
              ${uniqueLead.notes}, ${uniqueLead.contact_count}, ${uniqueLead.last_contact_date},
              ${uniqueLead.created_at}, ${uniqueLead.updated_at}
            )
          `;
          console.log(`  ✅ Added lead: ${uniqueLead.first_name} ${uniqueLead.last_name} (${uniqueLead.status})`);
          officerSuccessCount++;
        } catch (error) {
          console.log(`  ⚠️ Failed to add lead: ${uniqueLead.first_name} ${uniqueLead.last_name} - ${error instanceof Error ? error.message : 'Unknown error'}`);
          officerErrorCount++;
        }
      }

      console.log(`  📊 ${officer.first_name}: ${officerSuccessCount} successful, ${officerErrorCount} failed`);
      totalSuccessCount += officerSuccessCount;
      totalErrorCount += officerErrorCount;
    }

    console.log('');
    console.log('🎉 Lead creation completed!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`  ✅ Successfully added: ${totalSuccessCount} leads`);
    console.log(`  ❌ Failed to add: ${totalErrorCount} leads`);
    console.log(`  👥 Officers: ${officersResult.length}`);
    console.log(`  🏢 Company: ${company_name}`);
    console.log('');
    console.log('🔄 Next steps:');
    console.log('  1. Visit the loan officers page to see all officers');
    console.log('  2. Click "View Leads" for each officer to see their leads');
    console.log('  3. Test the hierarchical navigation system');
    console.log('  4. Check the company admin insights page');

  } catch (error) {
    console.error('❌ Failed to create leads:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run the script
createLeadsForAllOfficers();
