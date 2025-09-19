#!/usr/bin/env tsx

import postgres from 'postgres';

async function checkDatabaseURL() {
  const databaseUrl = process.env.DATABASE_URL;
  
  console.log('🔍 Checking DATABASE_URL...');
  console.log('📝 Current DATABASE_URL:', databaseUrl ? 'Set' : 'Not set');
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL environment variable is not set');
    console.log('💡 Please set DATABASE_URL in your .env.local file');
    return;
  }
  
  // Extract hostname from URL
  try {
    const url = new URL(databaseUrl);
    const hostname = url.hostname;
    console.log('🌐 Database hostname:', hostname);
    
    // Test DNS resolution
    console.log('🔍 Testing DNS resolution...');
    const dns = require('dns');
    const { promisify } = require('util');
    const lookup = promisify(dns.lookup);
    
    try {
      const result = await lookup(hostname);
      console.log('✅ DNS resolution successful:', result);
    } catch (dnsError) {
      console.log('❌ DNS resolution failed:', dnsError.message);
      console.log('💡 This is likely the cause of the Vercel error');
    }
    
  } catch (urlError) {
    console.log('❌ Invalid DATABASE_URL format:', urlError.message);
  }
  
  // Test database connection
  console.log('\n🔌 Testing database connection...');
  try {
    const client = postgres(databaseUrl, {
      max: 1,
      idle_timeout: 5,
      connect_timeout: 10,
    });
    
    const result = await client`SELECT 1 as test`;
    console.log('✅ Database connection successful:', result);
    
    await client.end();
  } catch (dbError) {
    console.log('❌ Database connection failed:', dbError.message);
    console.log('💡 This confirms the connection issue');
  }
}

checkDatabaseURL().catch(console.error);
