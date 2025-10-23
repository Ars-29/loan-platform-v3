import { createRouteClient } from '../src/lib/supabase/server';

async function testAuth() {
  try {
    console.log('🔍 Testing authentication...');
    
    const supabase = await createRouteClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('👤 User:', user);
    console.log('❌ Auth Error:', authError);
    
    if (authError) {
      console.log('❌ Authentication failed:', authError.message);
    } else if (user) {
      console.log('✅ Authentication successful for user:', user.id);
    } else {
      console.log('⚠️ No user found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAuth();
