import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing companyId' 
      }, { status: 400 });
    }

    console.log(`🔄 Fetching enhanced officers data for company: ${companyId}`);

    // Get officers with their basic info
    const { data: officersData, error: officersError } = await supabase
      .from('user_companies')
      .select(`
        user_id,
        role,
        is_active,
        joined_at,
        users!inner(
          id,
          email,
          first_name,
          last_name,
          is_active
        )
      `)
      .eq('company_id', companyId)
      .eq('role', 'employee')
      .eq('is_active', true);

    if (officersError) {
      console.error('❌ Error fetching officers:', officersError);
      return NextResponse.json({ 
        success: false, 
        error: officersError.message 
      }, { status: 500 });
    }

    console.log(`👥 Found ${officersData.length} officers`);

    // Get leads count for each officer
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('officer_id')
      .eq('company_id', companyId);

    if (leadsError) {
      console.error('❌ Error fetching leads:', leadsError);
      return NextResponse.json({ 
        success: false, 
        error: leadsError.message 
      }, { status: 500 });
    }

    // Count leads per officer
    const leadsCount: Record<string, number> = {};
    leadsData.forEach(lead => {
      leadsCount[lead.officer_id] = (leadsCount[lead.officer_id] || 0) + 1;
    });

    // Get public links for each officer
    const { data: publicLinksData, error: publicLinksError } = await supabase
      .from('loan_officer_public_links')
      .select('user_id, is_active')
      .in('user_id', officersData.map(o => o.user_id));

    if (publicLinksError) {
      console.error('❌ Error fetching public links:', publicLinksError);
      return NextResponse.json({ 
        success: false, 
        error: publicLinksError.message 
      }, { status: 500 });
    }

    // Check which officers have active public links
    const hasPublicLink: Record<string, boolean> = {};
    publicLinksData.forEach(link => {
      if (link.is_active) {
        hasPublicLink[link.user_id] = true;
      }
    });

    // Get selected templates for each officer
    const { data: templatesData, error: templatesError } = await supabase
      .from('templates')
      .select('user_id, slug, is_selected')
      .in('user_id', officersData.map(o => o.user_id))
      .eq('is_selected', true);

    if (templatesError) {
      console.error('❌ Error fetching templates:', templatesError);
      return NextResponse.json({ 
        success: false, 
        error: templatesError.message 
      }, { status: 500 });
    }

    // Map selected templates
    const selectedTemplates: Record<string, string> = {};
    templatesData.forEach(template => {
      selectedTemplates[template.user_id] = template.slug;
    });

    // Combine all data
    const enhancedOfficers = officersData.map(officerCompany => {
      const user = officerCompany.users as any;
      const officerId = user.id;
      
      return {
        id: officerId,
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        isActive: user.is_active && officerCompany.is_active,
        createdAt: officerCompany.joined_at || user.created_at,
        totalLeads: leadsCount[officerId] || 0,
        hasPublicLink: hasPublicLink[officerId] || false,
        selectedTemplate: selectedTemplates[officerId] || null
      };
    });

    // Deduplicate officers by ID to prevent duplicate keys
    const uniqueOfficers = enhancedOfficers.reduce((acc: any[], officer: any) => {
      if (!acc.find(item => item.id === officer.id)) {
        acc.push(officer);
      } else {
        console.warn(`⚠️ Duplicate officer found: ${officer.email} (${officer.id})`);
      }
      return acc;
    }, []);

    console.log(`✅ Enhanced officers data prepared for ${uniqueOfficers.length} officers (${enhancedOfficers.length - uniqueOfficers.length} duplicates removed)`);

    return NextResponse.json({ 
      success: true, 
      data: uniqueOfficers 
    });

  } catch (error: any) {
    console.error('❌ Unexpected error fetching enhanced officers:', error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Server error' 
    }, { status: 500 });
  }
}
