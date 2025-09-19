#!/usr/bin/env tsx

import { db } from '../src/lib/db';
import { companies, users, leads } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function testLeadsAPI() {
  try {
    console.log('🧪 Testing leads API functionality...');
    
    // Check existing companies and users
    const existingCompanies = await db.select().from(companies).limit(1);
    const existingUsers = await db.select().from(users).limit(1);
    
    console.log('🏢 Found companies:', existingCompanies.length);
    console.log('👥 Found users:', existingUsers.length);
    
    if (existingCompanies.length === 0 || existingUsers.length === 0) {
      console.log('❌ No companies or users found. Cannot test leads creation.');
      return;
    }
    
    const companyId = existingCompanies[0].id;
    const officerId = existingUsers[0].id;
    
    console.log('✅ Using company:', companyId);
    console.log('✅ Using officer:', officerId);
    
    // Test lead data similar to what the API receives
    const testLeadData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '555-1234',
      companyId,
      officerId,
      source: 'rate_table',
      loanDetails: {
        productId: 'test-product-123',
        lenderName: 'Test Lender',
        loanProgram: 'FNMA Conforming 30 Yr Fixed',
        loanType: 'purchase',
        loanTerm: 30,
        interestRate: 3.5,
        apr: 3.6,
        monthlyPayment: 1000,
        fees: 0,
        points: 0,
        credits: 0,
        lockPeriod: 30,
      },
      loanAmount: '300000',
      downPayment: '60000',
      creditScore: 750,
      notes: 'Test lead from API test',
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log('💾 Testing lead insertion...');
    console.log('💾 Lead data:', JSON.stringify(testLeadData, null, 2));
    
    try {
      const [newLead] = await db.insert(leads).values(testLeadData).returning();
      console.log('✅ Test lead created successfully:', {
        id: newLead.id,
        name: `${newLead.firstName} ${newLead.lastName}`,
        email: newLead.email,
        companyId: newLead.companyId,
        officerId: newLead.officerId,
      });
      
      // Clean up test lead
      await db.delete(leads).where(eq(leads.id, newLead.id));
      console.log('🧹 Test lead cleaned up');
      
      console.log('✅ Leads API test passed!');
      
    } catch (error) {
      console.error('❌ Test lead creation failed:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testLeadsAPI();
