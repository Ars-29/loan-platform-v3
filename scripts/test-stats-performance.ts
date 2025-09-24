import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { leads, users, companies, userCompanies } from '../src/lib/db/schema';
import { eq, count, desc } from 'drizzle-orm';
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

async function testStatsPerformance() {
  try {
    console.log('🚀 Testing stats page performance...');
    
    // Test 1: Count total leads
    console.log('\n📊 Test 1: Counting total leads...');
    const start1 = Date.now();
    const totalLeads = await db.select({ count: count() }).from(leads);
    const time1 = Date.now() - start1;
    console.log(`✅ Total leads: ${totalLeads[0].count} (${time1}ms)`);
    
    // Test 2: Count total officers
    console.log('\n👤 Test 2: Counting total officers...');
    const start2 = Date.now();
    const totalOfficers = await db.select({ count: count() }).from(users).where(eq(users.role, 'employee'));
    const time2 = Date.now() - start2;
    console.log(`✅ Total officers: ${totalOfficers[0].count} (${time2}ms)`);
    
    // Test 3: Count total companies
    console.log('\n🏢 Test 3: Counting total companies...');
    const start3 = Date.now();
    const totalCompanies = await db.select({ count: count() }).from(companies);
    const time3 = Date.now() - start3;
    console.log(`✅ Total companies: ${totalCompanies[0].count} (${time3}ms)`);
    
    // Test 4: Test paginated query (20 officers)
    console.log('\n📄 Test 4: Testing paginated officer performance query...');
    const start4 = Date.now();
    const officerPerformance = await db
      .select({
        officerId: leads.officerId,
        officerName: users.firstName,
        totalLeads: count(),
      })
      .from(leads)
      .innerJoin(users, eq(leads.officerId, users.id))
      .groupBy(leads.officerId, users.firstName)
      .orderBy(desc(count()))
      .limit(20);
    const time4 = Date.now() - start4;
    console.log(`✅ Paginated query (20 officers): ${officerPerformance.length} results (${time4}ms)`);
    
    // Test 5: Test conversion funnel query
    console.log('\n🔄 Test 5: Testing conversion funnel query...');
    const start5 = Date.now();
    const conversionFunnel = await db
      .select({
        stage: leads.conversionStage,
        count: count(),
      })
      .from(leads)
      .groupBy(leads.conversionStage)
      .orderBy(desc(count()));
    const time5 = Date.now() - start5;
    console.log(`✅ Conversion funnel: ${conversionFunnel.length} stages (${time5}ms)`);
    
    // Performance summary
    console.log('\n📈 Performance Summary:');
    console.log(`  • Total leads: ${totalLeads[0].count}`);
    console.log(`  • Total officers: ${totalOfficers[0].count}`);
    console.log(`  • Total companies: ${totalCompanies[0].count}`);
    console.log(`  • Average query time: ${Math.round((time1 + time2 + time3 + time4 + time5) / 5)}ms`);
    
    if (time4 < 1000) {
      console.log('✅ Pagination optimization successful! Query time < 1s');
    } else {
      console.log('⚠️  Pagination query still slow, consider further optimization');
    }
    
  } catch (error) {
    console.error('❌ Performance test failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the test
testStatsPerformance()
  .then(() => {
    console.log('✅ Performance test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Performance test failed:', error);
    process.exit(1);
  });
