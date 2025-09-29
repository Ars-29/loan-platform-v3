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

    console.log(`🔄 Syncing company email for user ${userId} with new email ${newEmail}`);

    // Find the company for this user (assuming they are a company admin)
    const { data: userCompany, error: userCompanyError } = await supabase
      .from('user_companies')
      .select(`
        company_id,
        role,
        companies!inner(id, name, email, slug)
      `)
      .eq('user_id', userId)
      .eq('role', 'admin')
      .eq('is_active', true)
      .single();

    if (userCompanyError || !userCompany) {
      console.error('❌ Error finding user company:', userCompanyError);
      return NextResponse.json({ 
        success: false, 
        error: 'User is not a company admin or company not found' 
      }, { status: 404 });
    }

    const company = userCompany.companies as any;
    console.log(`🏢 Found company: ${company.name} (${company.id})`);

    // Update the company's email and admin_email
    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update({ 
        email: newEmail,
        admin_email: newEmail,
        updated_at: new Date().toISOString()
      })
      .eq('id', company.id)
      .select('id, name, email, admin_email, slug')
      .single();

    if (updateError) {
      console.error('❌ Error updating company email:', updateError);
      return NextResponse.json({ 
        success: false, 
        error: updateError.message 
      }, { status: 500 });
    }

    if (!updatedCompany) {
      console.error('❌ No data returned after company email update');
      return NextResponse.json({ 
        success: false, 
        error: 'Company not found' 
      }, { status: 404 });
    }

    console.log('✅ Company email synced successfully:', updatedCompany);

    // Clear any company-related cache
    try {
      await redisCache.clearUserCache('*'); // Clear all user cache
    } catch (cacheError) {
      console.warn('⚠️ Could not clear cache:', cacheError);
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        companyId: updatedCompany.id,
        companyName: updatedCompany.name,
        oldEmail: company.email,
        newEmail: updatedCompany.email,
        adminEmail: updatedCompany.admin_email,
        slug: updatedCompany.slug
      }
    });

  } catch (error: any) {
    console.error('❌ Unexpected error syncing company email:', error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Server error' 
    }, { status: 500 });
  }
}
