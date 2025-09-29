import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');

    if (!companyId || !firstName || !lastName) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required parameters' 
      }, { status: 400 });
    }

    console.log(`🔄 Fetching officer details for ${firstName} ${lastName} in company: ${companyId}`);

    // First, let's check what officers exist in this company
    const { data: allOfficers, error: allOfficersError } = await supabase
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

    if (allOfficersError) {
      console.error('❌ Error fetching all officers:', allOfficersError);
    } else {
      console.log('👥 All officers in company:', allOfficers?.map(o => ({
        id: o.user_id,
        name: `${(o.users as any).first_name} ${(o.users as any).last_name}`,
        email: (o.users as any).email
      })));
    }

    // Find the officer with case-insensitive matching (handle duplicates)
    const { data: officersData, error: officerError } = await supabase
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
      .eq('is_active', true)
      .ilike('users.first_name', firstName)
      .ilike('users.last_name', lastName);

    // Handle duplicates by taking the first match
    const officerData = officersData && officersData.length > 0 ? officersData[0] : null;
    
    if (officersData && officersData.length > 1) {
      console.log(`⚠️ Found ${officersData.length} duplicate records for ${firstName} ${lastName}, using first match`);
    }

    if (officerError || !officerData) {
      console.error('❌ Officer not found:', officerError);
      console.error('🔍 Search parameters:', { firstName, lastName, companyId });
      return NextResponse.json({ 
        success: false, 
        error: `Officer not found: ${firstName} ${lastName} in company ${companyId}`,
        debug: {
          firstName,
          lastName,
          companyId,
          allOfficers: allOfficers?.map(o => ({
            id: o.user_id,
            name: `${(o.users as any).first_name} ${(o.users as any).last_name}`,
            email: (o.users as any).email
          }))
        }
      }, { status: 404 });
    }

    const user = officerData.users as any;
    const officerId = user.id;

    console.log(`👤 Found officer: ${user.first_name} ${user.last_name} (${officerId})`);

    // Get leads data
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('id, first_name, last_name, status, priority, created_at')
      .eq('company_id', companyId)
      .eq('officer_id', officerId)
      .order('created_at', { ascending: false });

    if (leadsError) {
      console.error('❌ Error fetching leads:', leadsError);
      return NextResponse.json({ 
        success: false, 
        error: leadsError.message 
      }, { status: 500 });
    }

    // Calculate lead statistics
    const totalLeads = leadsData.length;
    const highPriorityLeads = leadsData.filter(lead => lead.priority === 'high').length;
    const urgentPriorityLeads = leadsData.filter(lead => lead.priority === 'urgent').length;
    const convertedLeads = leadsData.filter(lead => lead.status === 'converted').length;

    // Get recent leads (last 5)
    const recentLeads = leadsData.slice(0, 5).map(lead => ({
      id: lead.id,
      firstName: lead.first_name,
      lastName: lead.last_name,
      status: lead.status,
      priority: lead.priority,
      createdAt: lead.created_at
    }));

    // Get priority leads (high and urgent)
    const priorityLeads = leadsData
      .filter(lead => lead.priority === 'high' || lead.priority === 'urgent')
      .slice(0, 5)
      .map(lead => ({
        id: lead.id,
        firstName: lead.first_name,
        lastName: lead.last_name,
        status: lead.status,
        priority: lead.priority,
        createdAt: lead.created_at
      }));

    // Get public link information
    const { data: publicLinkData, error: publicLinkError } = await supabase
      .from('loan_officer_public_links')
      .select('is_active, public_slug')
      .eq('user_id', officerId)
      .eq('is_active', true)
      .single();

    const hasPublicLink = publicLinkData && publicLinkData.is_active;
    const publicLinkUrl = hasPublicLink ? 
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/public/profile/${publicLinkData.public_slug}` : 
      undefined;

    // Get selected template
    const { data: templateData, error: templateError } = await supabase
      .from('templates')
      .select('slug')
      .eq('user_id', officerId)
      .eq('is_selected', true)
      .single();

    const selectedTemplate = templateData?.slug || null;

    const officerDetails = {
      id: officerId,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      isActive: user.is_active && officerData.is_active,
      createdAt: officerData.joined_at || user.created_at,
      totalLeads,
      highPriorityLeads,
      urgentPriorityLeads,
      convertedLeads,
      hasPublicLink,
      publicLinkUrl,
      selectedTemplate,
      recentLeads,
      priorityLeads
    };

    console.log(`✅ Officer details prepared for ${user.first_name} ${user.last_name}`);

    return NextResponse.json({ 
      success: true, 
      data: officerDetails 
    });

  } catch (error: any) {
    console.error('❌ Unexpected error fetching officer details:', error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Server error' 
    }, { status: 500 });
  }
}
