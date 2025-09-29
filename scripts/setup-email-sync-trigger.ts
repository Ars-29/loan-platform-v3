import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

async function setupEmailSyncTrigger() {
  try {
    console.log('🔧 Setting up email sync trigger...');

    // Create a function to sync email changes from auth.users to public.users
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION sync_user_email()
        RETURNS TRIGGER AS $$
        BEGIN
          -- Update the email in the public.users table when auth.users email changes
          UPDATE public.users 
          SET 
            email = NEW.email,
            updated_at = NOW()
          WHERE id = NEW.id;
          
          -- Return the new record
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    if (functionError) {
      console.error('❌ Error creating sync function:', functionError);
      return;
    }

    console.log('✅ Sync function created successfully');

    // Create the trigger
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP TRIGGER IF EXISTS sync_user_email_trigger ON auth.users;
        
        CREATE TRIGGER sync_user_email_trigger
          AFTER UPDATE OF email ON auth.users
          FOR EACH ROW
          EXECUTE FUNCTION sync_user_email();
      `
    });

    if (triggerError) {
      console.error('❌ Error creating trigger:', triggerError);
      return;
    }

    console.log('✅ Email sync trigger created successfully');
    console.log('🎉 Email changes will now automatically sync from auth.users to public.users');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the setup
setupEmailSyncTrigger();
