import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({
        success: false,
        message: 'Company ID is required.'
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_companies')
      .select(`
        user_id,
        is_active,
        joined_at,
        users!inner(
          id,
          email,
          first_name,
          last_name,
          is_active,
          deactivated,
          invite_status,
          invite_sent_at,
          invite_expires_at
        )
      `)
      .eq('company_id', companyId)
      .eq('role', 'employee')
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error fetching loan officers:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch loan officers.'
      }, { status: 500 });
    }

    const officers = data?.map((item: any) => ({
      id: item.users.id,
      email: item.users.email,
      firstName: item.users.first_name,
      lastName: item.users.last_name,
      isActive: item.is_active,
      deactivated: item.users.deactivated,
      inviteStatus: item.users.invite_status,
      inviteSentAt: item.users.invite_sent_at,
      inviteExpiresAt: item.users.invite_expires_at,
      createdAt: item.joined_at,
    })) || [];

    // Remove duplicates based on user ID (in case there are still duplicates in database)
    const uniqueOfficers = officers.filter((officer, index, self) => 
      index === self.findIndex(o => o.id === officer.id)
    );

    return NextResponse.json({
      success: true,
      data: uniqueOfficers
    });

  } catch (error) {
    console.error('Error in getLoanOfficers:', error);
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred.'
    }, { status: 500 });
  }
}
