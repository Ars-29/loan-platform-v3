import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    console.log('🚀 GET /api/officers/by-slug/[slug] - Starting request');
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    console.log('✅ Authenticated user:', user.id, 'Requesting officer by slug:', slug);

          // Check if the requesting user is a company admin or super admin
          const { data: userRole } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

          if (!userRole || !['company_admin', 'super_admin'].includes(userRole.role)) {
            console.log('❌ User is not authorized (must be company_admin or super_admin)');
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
          }

    let allOfficers;
    let allOfficersError;

    if (userRole.role === 'super_admin') {
      // Super admin can access any officer
      const { data, error } = await supabase
        .from('users')
        .select(`
          id, email, first_name, last_name, is_active, created_at,
          user_companies!inner(company_id)
        `)
        .eq('role', 'employee');
      
      allOfficers = data;
      allOfficersError = error;
    } else {
      // Company admin can only access officers in their company
      const { data: userCompany } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!userCompany) {
        console.log('❌ User is not associated with any company');
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { data, error } = await supabase
        .from('users')
        .select(`
          id, email, first_name, last_name, is_active, created_at,
          user_companies!inner(company_id)
        `)
        .eq('role', 'employee')
        .eq('user_companies.company_id', userCompany.company_id);
      
      allOfficers = data;
      allOfficersError = error;
    }

    if (allOfficersError) {
      console.log('❌ Error fetching officers:', allOfficersError);
      return NextResponse.json({ error: 'Failed to fetch officers' }, { status: 500 });
    }

    // Find the officer that matches the slug
    const officer = allOfficers?.find(o => {
      // Generate slug from full name (first + last) with hyphens
      const fullName = `${o.first_name} ${o.last_name}`.toLowerCase().replace(/\s+/g, '-');
      return fullName === slug;
    });

    if (!officer) {
      console.log('❌ Officer not found for slug:', slug);
      console.log('Available officers:', allOfficers?.map(o => `${o.first_name} ${o.last_name}`.toLowerCase().replace(/\s+/g, '-')));
      return NextResponse.json({ error: 'Officer not found' }, { status: 404 });
    }

    console.log('✅ Found officer:', officer.email);

    // Transform to camelCase
    const transformedOfficer = {
      id: officer.id,
      email: officer.email,
      firstName: officer.first_name,
      lastName: officer.last_name,
      isActive: officer.is_active,
      createdAt: officer.created_at,
      slug: slug
    };

    return NextResponse.json({
      success: true,
      officer: transformedOfficer
    });
  } catch (error) {
    console.error('Error fetching officer by slug:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
