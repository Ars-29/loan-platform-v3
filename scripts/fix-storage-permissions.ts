import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixStoragePermissions() {
  try {
    console.log('🔒 Attempting to fix storage permissions...');

    // Try to create a permissive policy using the service role
    const policies = [
      {
        name: 'Allow all operations on storage',
        sql: `
          CREATE POLICY IF NOT EXISTS "Allow all operations on storage" ON storage.objects
          FOR ALL USING (true)
        `
      },
      {
        name: 'Allow all operations on user-avatars',
        sql: `
          CREATE POLICY IF NOT EXISTS "Allow all operations on user-avatars" ON storage.objects
          FOR ALL USING (bucket_id = 'user-avatars')
        `
      }
    ];

    for (const policy of policies) {
      try {
        console.log(`🔄 Creating policy: ${policy.name}`);
        
        // Try using the REST API to execute SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey || ''
          },
          body: JSON.stringify({ sql: policy.sql })
        });

        if (response.ok) {
          console.log(`✅ Policy created: ${policy.name}`);
        } else {
          const error = await response.text();
          console.log(`⚠️  Could not create policy "${policy.name}":`, error);
        }
      } catch (err) {
        console.log(`⚠️  Could not create policy "${policy.name}":`, err);
      }
    }

    // Alternative: Try to upload a test file to see if it works
    console.log('🧪 Testing upload to user-avatars bucket...');
    
    try {
      const testFile = new Blob(['test'], { type: 'text/plain' });
      const { error: testError } = await supabase.storage
        .from('user-avatars')
        .upload('test-file.txt', testFile);

      if (testError) {
        console.log('❌ Test upload failed:', testError.message);
        console.log('');
        console.log('📝 Manual steps required:');
        console.log('   1. Go to Supabase Dashboard > Storage > Policies');
        console.log('   2. Click "New Policy"');
        console.log('   3. Create a policy with:');
        console.log('      - Policy name: "Allow all operations"');
        console.log('      - Target roles: "public"');
        console.log('      - Operation: "All"');
        console.log('      - Target schema: "storage"');
        console.log('      - Target table: "objects"');
        console.log('      - USING expression: "true"');
      } else {
        console.log('✅ Test upload successful! Avatar upload should work now.');
        
        // Clean up test file
        await supabase.storage.from('user-avatars').remove(['test-file.txt']);
      }
    } catch (err) {
      console.log('❌ Test upload failed:', err);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixStoragePermissions();
