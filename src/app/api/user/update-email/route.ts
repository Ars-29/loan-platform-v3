import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { redisCache } from '@/lib/redis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

export async function POST(req: NextRequest) {
  try {
    const { userId, newEmail } = await req.json();

    if (!userId || !newEmail) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing userId or newEmail' 
      }, { status: 400 });
    }

    console.log(`🔄 Updating email for user ${userId} to ${newEmail}`);

    // Update the email in the users table
    const { data, error } = await supabase
      .from('users')
      .update({ 
        email: newEmail,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, email, first_name, last_name')
      .single();

    if (error) {
      console.error('❌ Error updating user email:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    if (!data) {
      console.error('❌ No data returned after email update');
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    console.log('✅ Email updated successfully:', data);

    // Clear the user's profile cache to force refresh
    await redisCache.clearProfile(userId);

    return NextResponse.json({ 
      success: true, 
      data: {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name
      }
    });

  } catch (error: any) {
    console.error('❌ Unexpected error updating email:', error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Server error' 
    }, { status: 500 });
  }
}
