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

    console.log(`🔄 Fetching company details for: ${companyId}`);

    // Get company comprehensive info including new profile fields
    const { data: companyData, error: companyError } = await supabase
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
        updated_at,
        logo,
        website,
        license_number,
        address,
        phone,
        company_tagline,
        company_description,
        company_nmls_number,
        company_established_year,
        company_team_size,
        company_specialties,
        company_awards,
        company_testimonials,
        company_social_media,
        company_branding,
        company_contact_info,
        company_business_hours,
        company_service_areas,
        company_languages,
        company_certifications,
        company_insurance_info,
        company_financial_info,
        company_marketing_info,
        company_privacy_settings,
        company_seo_settings,
        company_analytics_settings,
        company_integration_settings,
        company_notification_settings,
        company_backup_settings,
        company_security_settings,
        company_compliance_settings,
        company_custom_fields,
        company_metadata,
        company_version,
        company_last_updated_by,
        company_approval_status,
        company_approval_notes,
        company_approval_date,
        company_approval_by
      `)
      .eq('id', companyId)
      .single();

    if (companyError || !companyData) {
      console.error('❌ Company not found:', companyError);
      return NextResponse.json({ 
        success: false, 
        error: 'Company not found' 
      }, { status: 404 });
    }

    // Get all officers for this company
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
          is_active,
          created_at
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

    // Get all leads for this company
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        priority,
        status,
        source,
        created_at,
        updated_at
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    // Get public links count for this company
    const { data: publicLinksData, error: publicLinksError } = await supabase
      .from('loan_officer_public_links')
      .select(`
        id,
        is_active,
        created_at
      `)
      .eq('company_id', companyId)
      .eq('is_active', true);

    if (leadsError) {
      console.error('❌ Error fetching leads:', leadsError);
      return NextResponse.json({ 
        success: false, 
        error: leadsError.message 
      }, { status: 500 });
    }

    if (publicLinksError) {
      console.error('❌ Error fetching public links:', publicLinksError);
      return NextResponse.json({ 
        success: false, 
        error: publicLinksError.message 
      }, { status: 500 });
    }

    // Process officers data
    const officers = officersData.map(officerCompany => {
      const user = officerCompany.users as any;
      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isActive: user.is_active,
        joinedAt: officerCompany.joined_at,
        createdAt: user.created_at
      };
    });

    // Process leads data
    const leads = leadsData.map(lead => ({
      id: lead.id,
      firstName: lead.first_name,
      lastName: lead.last_name,
      email: lead.email,
      phone: lead.phone,
      priority: lead.priority,
      status: lead.status,
      source: lead.source,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at
    }));

    // Calculate statistics
    const totalOfficers = officers.length;
    const activeOfficers = officers.filter(officer => officer.isActive).length;
    const totalLeads = leads.length;
    const highPriorityLeads = leads.filter(lead => lead.priority === 'high').length;
    const urgentPriorityLeads = leads.filter(lead => lead.priority === 'urgent').length;
    const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
    const activePublicLinks = publicLinksData?.length || 0;

    // Get recent leads (last 10)
    const recentLeads = leads.slice(0, 10);

    const companyDetails = {
      ...companyData,
      totalOfficers,
      activeOfficers,
      totalLeads,
      highPriorityLeads,
      urgentPriorityLeads,
      convertedLeads,
      activePublicLinks,
      officers,
      recentLeads
    };

    console.log(`👤 Found company: ${companyData.name} with ${totalOfficers} officers and ${totalLeads} leads`);

    return NextResponse.json({ 
      success: true, 
      data: companyDetails 
    });

  } catch (error: any) {
    console.error('❌ Unexpected error fetching company details:', error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Server error' 
    }, { status: 500 });
  }
}
