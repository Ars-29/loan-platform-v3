import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { companies, users, userCompanies, leads } from '../src/lib/db/schema';
import { eq, count, sum, avg, desc, sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Database connection
const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(connectionString);
const db = drizzle(client);

async function testCompaniesSimpleAPI() {
  try {
    console.log('🚀 Testing companies simple API logic...');
    
    // Test the companies query first
    const companiesResult = await db
      .select({
        id: companies.id,
        name: companies.name,
      })
      .from(companies)
      .limit(5);

    console.log('✅ Companies query successful!');
    console.log(`📊 Found ${companiesResult.length} companies:`);
    
    companiesResult.forEach((company, index) => {
      console.log(`\n${index + 1}. ${company.name} (ID: ${company.id})`);
    });

    // Test getting stats for first company
    if (companiesResult.length > 0) {
      const firstCompany = companiesResult[0];
      console.log(`\n🔍 Testing stats for company: ${firstCompany.name}`);
      
      // Get officer count
      const officerCount = await db
        .select({ count: count() })
        .from(userCompanies)
        .where(eq(userCompanies.companyId, firstCompany.id));
      
      console.log(`   • Officers: ${officerCount[0]?.count || 0}`);

      // Get leads stats
      const leadsStats = await db
        .select({
          totalLeads: count(leads.id),
          convertedLeads: count(sql`CASE WHEN ${leads.conversionStage} = 'closing' THEN 1 END`),
          totalRevenue: sum(leads.commissionEarned),
          avgLoanAmount: avg(leads.loanAmountClosed),
        })
        .from(leads)
        .where(eq(leads.companyId, firstCompany.id));

      const stats = leadsStats[0] || {
        totalLeads: 0,
        convertedLeads: 0,
        totalRevenue: 0,
        avgLoanAmount: 0,
      };

      console.log(`   • Total Leads: ${stats.totalLeads}`);
      console.log(`   • Converted Leads: ${stats.convertedLeads}`);
      console.log(`   • Total Revenue: ${stats.totalRevenue}`);
      console.log(`   • Avg Loan Amount: ${stats.avgLoanAmount}`);
    }

  } catch (error) {
    console.error('❌ Companies simple API test failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the test
testCompaniesSimpleAPI()
  .then(() => {
    console.log('✅ Companies simple API test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Companies simple API test failed:', error);
    process.exit(1);
  });
