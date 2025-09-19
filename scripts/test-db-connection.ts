#!/usr/bin/env tsx

import { db } from '../src/lib/db';
import { companies, users } from '../src/lib/db/schema';

async function testDatabaseConnection() {
  try {
    console.log('🔌 Testing database connection...');
    
    // Test basic connection
    const companiesCount = await db.select().from(companies);
    console.log('✅ Database connection successful');
    console.log('📊 Total companies:', companiesCount.length);
    
    // Test users table
    const usersCount = await db.select().from(users);
    console.log('📊 Total users:', usersCount.length);
    
    // Show sample data
    if (companiesCount.length > 0) {
      console.log('🏢 Sample company:', {
        id: companiesCount[0].id,
        name: companiesCount[0].name,
        isActive: companiesCount[0].isActive,
      });
    }
    
    if (usersCount.length > 0) {
      console.log('👥 Sample user:', {
        id: usersCount[0].id,
        email: usersCount[0].email,
        role: usersCount[0].role,
        isActive: usersCount[0].isActive,
      });
    }
    
    console.log('✅ Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  } finally {
    process.exit(0);
  }
}

testDatabaseConnection();
