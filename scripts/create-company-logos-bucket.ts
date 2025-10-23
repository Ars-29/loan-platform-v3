import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createCompanyLogosBucket() {
  console.log('🚀 Creating company-logos storage bucket...');

  try {
    // Create the bucket
    const { data: bucketData, error: bucketError } = await supabase.storage
      .createBucket('company-logos', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5 * 1024 * 1024, // 5MB limit
      });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Company logos bucket already exists');
      } else {
        throw bucketError;
      }
    } else {
      console.log('✅ Created company-logos bucket');
    }

    // Set up RLS policies for the bucket
    const policies = [
      {
        name: 'Company admins can upload logos',
        policy: `
          CREATE POLICY "Company admins can upload logos" ON storage.objects
          FOR INSERT WITH CHECK (
            bucket_id = 'company-logos' AND
            auth.role() = 'authenticated' AND
            EXISTS (
              SELECT 1 FROM user_companies uc
              JOIN companies c ON c.id = uc.company_id
              WHERE uc.user_id = auth.uid() 
              AND uc.role = 'admin'
              AND c.id::text = (storage.foldername(name))[1]
            )
          )
        `
      },
      {
        name: 'Company admins can update logos',
        policy: `
          CREATE POLICY "Company admins can update logos" ON storage.objects
          FOR UPDATE USING (
            bucket_id = 'company-logos' AND
            auth.role() = 'authenticated' AND
            EXISTS (
              SELECT 1 FROM user_companies uc
              JOIN companies c ON c.id = uc.company_id
              WHERE uc.user_id = auth.uid() 
              AND uc.role = 'admin'
              AND c.id::text = (storage.foldername(name))[1]
            )
          )
        `
      },
      {
        name: 'Company admins can delete logos',
        policy: `
          CREATE POLICY "Company admins can delete logos" ON storage.objects
          FOR DELETE USING (
            bucket_id = 'company-logos' AND
            auth.role() = 'authenticated' AND
            EXISTS (
              SELECT 1 FROM user_companies uc
              JOIN companies c ON c.id = uc.company_id
              WHERE uc.user_id = auth.uid() 
              AND uc.role = 'admin'
              AND c.id::text = (storage.foldername(name))[1]
            )
          )
        `
      },
      {
        name: 'Public can view logos',
        policy: `
          CREATE POLICY "Public can view logos" ON storage.objects
          FOR SELECT USING (bucket_id = 'company-logos')
        `
      }
    ];

    for (const policy of policies) {
      try {
        await supabase.rpc('exec_sql', { sql: policy.policy });
        console.log(`✅ Created policy: ${policy.name}`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️ Policy already exists: ${policy.name}`);
        } else {
          console.error(`❌ Error creating policy ${policy.name}:`, error.message);
        }
      }
    }

    console.log('🎉 Company logos bucket setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up company logos bucket:', error);
    process.exit(1);
  }
}

createCompanyLogosBucket();
