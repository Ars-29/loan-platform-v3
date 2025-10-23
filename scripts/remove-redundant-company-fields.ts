import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function removeRedundantFields() {
  console.log('🚀 Removing redundant company fields...');

  try {
    // Remove redundant fields that already exist in legacy columns
    const redundantFields = [
      'company_phone',
      'company_email', 
      'company_website',
      'company_logo',
      'company_address',
      'company_license_number'
    ];

    for (const field of redundantFields) {
      await db.execute(sql.raw(`ALTER TABLE companies DROP COLUMN IF EXISTS ${field}`));
      console.log(`✅ Removed redundant field: ${field}`);
    }

    console.log('🎉 Redundant company fields removal completed successfully!');
  } catch (error: any) {
    console.error('❌ Error during redundant fields removal:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

removeRedundantFields();
