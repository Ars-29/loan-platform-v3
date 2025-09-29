import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get all loan officers with their company information
    const { data: officersData, error: officersError } = await supabase
      .from('user_companies')
      .select(`
        id,
        user_id,
        company_id,
        is_active,
        joined_at,
        users!inner (
          id,
          email,
          first_name,
          last_name,
          created_at
        ),
        companies!inner (
          id,
          name,
          slug,
          email,
          admin_email,
          is_active,
          deactivated
        )
      `)
      .order('joined_at', { ascending: false });

    if (officersError) {
      console.error('❌ Error fetching officers:', officersError);
      return NextResponse.json({ 
        success: false, 
        error: officersError.message 
      }, { status: 500 });
    }

    // Process officers data
    const officers = officersData.map(officerCompany => {
      const user = officerCompany.users as any;
      const company = officerCompany.companies as any;
      
      return {
        id: officerCompany.id,
        userId: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isActive: officerCompany.is_active,
        joinedAt: officerCompany.joined_at,
        createdAt: user.created_at,
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          email: company.email,
          adminEmail: company.admin_email,
          isActive: company.is_active,
          deactivated: company.deactivated
        }
      };
    });

    // Get unique companies for filtering
    const companies = Array.from(
      new Map(
        officers.map(officer => [
          officer.company.id,
          {
            id: officer.company.id,
            name: officer.company.name,
            slug: officer.company.slug
          }
        ])
      ).values()
    ).sort((a, b) => a.name.localeCompare(b.name));

    console.log(`👥 Found ${officers.length} officers across ${companies.length} companies`);

    return NextResponse.json({ 
      success: true, 
      data: {
        officers,
        companies
      }
    });

  } catch (error) {
    console.error('❌ Error in super admin officers API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const { officerId, isActive } = body;

    if (!officerId || typeof isActive !== 'boolean') {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid request data' 
      }, { status: 400 });
    }

    // Update officer status
    const { data, error } = await supabase
      .from('user_companies')
      .update({ 
        is_active: isActive
      })
      .eq('id', officerId)
      .select();

    if (error) {
      console.error('❌ Error updating officer status:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    console.log(`✅ Officer ${officerId} status updated to ${isActive ? 'active' : 'inactive'}`);

    return NextResponse.json({ 
      success: true, 
      data: data[0]
    });

  } catch (error) {
    console.error('❌ Error in officer status update:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
