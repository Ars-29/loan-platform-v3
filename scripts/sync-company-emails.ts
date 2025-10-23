import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

async function syncCompanyEmails() {
  try {
    console.log('🔄 Starting company email sync...');

    const response = await fetch('http://localhost:3000/api/company/sync-all-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Company email sync completed successfully!');
      console.log(`📊 Results: ${result.data.successCount} updated, ${result.data.errorCount} errors`);
      
      if (result.data.results.length > 0) {
        console.log('\n📋 Detailed Results:');
        result.data.results.forEach((item: any, index: number) => {
          console.log(`${index + 1}. ${item.companyName}: ${item.status}`);
          if (item.status === 'success') {
            console.log(`   ${item.oldEmail} → ${item.newEmail}`);
          } else if (item.status === 'error') {
            console.log(`   Error: ${item.error}`);
          }
        });
      }
    } else {
      console.error('❌ Company email sync failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the sync
syncCompanyEmails();
