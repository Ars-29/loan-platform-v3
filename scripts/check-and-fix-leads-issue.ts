#!/usr/bin/env tsx

import { db } from '../src/lib/db';
import { companies, users, leads } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function checkAndFixLeadsIssue() {
  try {
    console.log('🔍 Checking database for companies and users...');
    
    // Check existing companies
    const existingCompanies = await db.select().from(companies).limit(5);
    console.log('🏢 Found companies:', existingCompanies.length);
    if (existingCompanies.length > 0) {
      console.log('   Companies:', existingCompanies.map(c => ({ id: c.id, name: c.name, isActive: c.isActive })));
    }
    
    // Check existing users
    const existingUsers = await db.select().from(users).limit(5);
    console.log('👥 Found users:', existingUsers.length);
    if (existingUsers.length > 0) {
      console.log('   Users:', existingUsers.map(u => ({ id: u.id, email: u.email, role: u.role, isActive: u.isActive })));
    }
    
    // Check recent leads
    const recentLeads = await db.select().from(leads).orderBy(leads.createdAt).limit(5);
    console.log('📋 Recent leads:', recentLeads.length);
    if (recentLeads.length > 0) {
      console.log('   Recent leads:', recentLeads.map(l => ({ 
        id: l.id, 
        name: `${l.firstName} ${l.lastName}`, 
        email: l.email, 
        companyId: l.companyId, 
        officerId: l.officerId,
        createdAt: l.createdAt 
      })));
    }
    
    // If no companies or users exist, create a default one
    if (existingCompanies.length === 0 || existingUsers.length === 0) {
      console.log('⚠️  No companies or users found. Creating default entries...');
      
      // Create a default company if none exists
      if (existingCompanies.length === 0) {
        console.log('🏢 Creating default company...');
        const [defaultCompany] = await db.insert(companies).values({
          name: 'Default Company',
          slug: 'default-company',
          email: 'admin@defaultcompany.com',
          adminEmail: 'admin@defaultcompany.com',
          isActive: true,
        }).returning();
        console.log('✅ Created default company:', defaultCompany.id);
      }
      
      // Create a default user if none exists
      if (existingUsers.length === 0) {
        console.log('👥 Creating default user...');
        const [defaultUser] = await db.insert(users).values({
          id: '00000000-0000-0000-0000-000000000001', // Fixed UUID for consistency
          email: 'admin@defaultcompany.com',
          firstName: 'Default',
          lastName: 'Admin',
          role: 'super_admin',
          isActive: true,
        }).returning();
        console.log('✅ Created default user:', defaultUser.id);
      }
      
      console.log('✅ Database initialization complete!');
    } else {
      console.log('✅ Database has companies and users. Leads should work now.');
    }
    
    // Test lead creation
    console.log('\n🧪 Testing lead creation...');
    const testLeadData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '555-1234',
      companyId: existingCompanies[0]?.id || (await db.select().from(companies).limit(1))[0].id,
      officerId: existingUsers[0]?.id || (await db.select().from(users).limit(1))[0].id,
      source: 'test',
      loanDetails: {
        productId: 'test-product',
        lenderName: 'Test Lender',
        loanProgram: 'Test Program',
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
      notes: 'Test lead creation',
      status: 'new',
    };
    
    try {
      const [testLead] = await db.insert(leads).values(testLeadData).returning();
      console.log('✅ Test lead created successfully:', testLead.id);
      
      // Clean up test lead
      await db.delete(leads).where(eq(leads.id, testLead.id));
      console.log('🧹 Test lead cleaned up');
    } catch (error) {
      console.error('❌ Test lead creation failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    process.exit(0);
  }
}

checkAndFixLeadsIssue();
