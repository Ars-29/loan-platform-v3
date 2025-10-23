import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { redisCache } from '@/lib/redis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

export async function POST(req: NextRequest) {
  try {
    const { companyId, newEmail } = await req.json();

    if (!companyId || !newEmail) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing companyId or newEmail' 
      }, { status: 400 });
    }

    console.log(`🔄 Updating email for company ${companyId} to ${newEmail}`);

    // Update the email and admin_email in the companies table
    const { data, error } = await supabase
      .from('companies')
      .update({ 
        email: newEmail,
        admin_email: newEmail,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)
      .select('id, name, email, admin_email, slug')
      .single();

    if (error) {
      console.error('❌ Error updating company email:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    if (!data) {
      console.error('❌ No data returned after company email update');
      return NextResponse.json({ 
        success: false, 
        error: 'Company not found' 
      }, { status: 404 });
    }

    console.log('✅ Company email updated successfully:', data);

    // Clear any company-related cache (if we have company-specific caching)
    // For now, we'll clear all profile cache as companies might be cached in user profiles
    try {
      await redisCache.clearUserCache('*'); // Clear all user cache
    } catch (cacheError) {
      console.warn('⚠️ Could not clear cache:', cacheError);
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        adminEmail: data.admin_email,
        slug: data.slug
      }
    });

  } catch (error: any) {
    console.error('❌ Unexpected error updating company email:', error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Server error' 
    }, { status: 500 });
  }
}
