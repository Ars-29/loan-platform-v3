import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

export async function GET(req: NextRequest) {
  try {
    console.log('🔄 Fetching enhanced companies data');

    // Get all companies with their basic info
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .select(`
        id,
        name,
        slug,
        email,
        admin_email,
        invite_status,
        invite_sent_at,
        invite_expires_at,
        invite_token,
        admin_user_id,
        is_active,
        deactivated,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (companiesError) {
      console.error('❌ Error fetching companies:', companiesError);
      return NextResponse.json({ 
        success: false, 
        error: companiesError.message 
      }, { status: 500 });
    }

    // Get all loan officers count for each company
    const { data: officersData, error: officersError } = await supabase
      .from('user_companies')
      .select(`
        company_id,
        user_id,
        users!inner(
          id,
          email,
          first_name,
          last_name,
          is_active
        )
      `)
      .eq('role', 'employee')
      .eq('is_active', true);

    if (officersError) {
      console.error('❌ Error fetching officers:', officersError);
      return NextResponse.json({ 
        success: false, 
        error: officersError.message 
      }, { status: 500 });
    }

    // Get all leads count for each company
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select(`
        company_id,
        id,
        priority,
        status
      `);

    if (leadsError) {
      console.error('❌ Error fetching leads:', leadsError);
      return NextResponse.json({ 
        success: false, 
        error: leadsError.message 
      }, { status: 500 });
    }

    // Process the data to calculate counts
    const enhancedCompanies = companiesData.map(company => {
      // Count officers for this company
      const companyOfficers = officersData.filter(officer => 
        officer.company_id === company.id
      );
      const totalOfficers = companyOfficers.length;
      const activeOfficers = companyOfficers.filter(officer => 
        (officer.users as any).is_active === true
      ).length;

      // Count leads for this company
      const companyLeads = leadsData.filter(lead => 
        lead.company_id === company.id
      );
      const totalLeads = companyLeads.length;
      const highPriorityLeads = companyLeads.filter(lead => 
        lead.priority === 'high'
      ).length;
      const urgentPriorityLeads = companyLeads.filter(lead => 
        lead.priority === 'urgent'
      ).length;
      const convertedLeads = companyLeads.filter(lead => 
        lead.status === 'converted'
      ).length;

      return {
        ...company,
        totalOfficers,
        activeOfficers,
        totalLeads,
        highPriorityLeads,
        urgentPriorityLeads,
        convertedLeads
      };
    });

    console.log(`✅ Enhanced companies data prepared for ${enhancedCompanies.length} companies`);

    return NextResponse.json({ 
      success: true, 
      data: enhancedCompanies 
    });

  } catch (error: any) {
    console.error('❌ Unexpected error fetching enhanced companies:', error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Server error' 
    }, { status: 500 });
  }
}
