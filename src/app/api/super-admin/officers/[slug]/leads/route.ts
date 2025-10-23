import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log('🚀 GET /api/super-admin/officers/[slug]/leads - Requesting leads for officer slug:', slug);

    // First, get all officers to find the one with matching slug
    const { data: allOfficers, error: officersError } = await supabase
      .from('user_companies')
      .select(`
        id,
        user_id,
        company_id,
        users!inner (
          id,
          email,
          first_name,
          last_name
        ),
        companies!inner (
          id,
          name,
          slug
        )
      `)
      .eq('role', 'employee');

    if (officersError) {
      console.error('❌ Error fetching officers:', officersError);
      return NextResponse.json({ 
        success: false, 
        error: officersError.message 
      }, { status: 500 });
    }

    // Find the officer with matching slug (firstName-lastName format)
    const targetOfficer = allOfficers.find(officer => {
      const user = officer.users as any;
      const officerSlug = `${user.first_name}-${user.last_name}`.toLowerCase().replace(/\s+/g, '-');
      return officerSlug === slug;
    });

    if (!targetOfficer) {
      console.error('❌ Officer not found for slug:', slug);
      return NextResponse.json({ 
        success: false, 
        error: 'Officer not found' 
      }, { status: 404 });
    }

    const user = targetOfficer.users as any;
    const company = targetOfficer.companies as any;
    
    console.log(`✅ Found officer: ${user.first_name} ${user.last_name} from ${company.name}`);

    // Get leads for this specific officer only
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('officer_id', user.id)
      .order('created_at', { ascending: false });

    if (leadsError) {
      console.error('❌ Error fetching leads:', leadsError);
      return NextResponse.json({ 
        success: false, 
        error: leadsError.message 
      }, { status: 500 });
    }

    // Get public links for this specific officer
    const { data: publicLinksData, error: publicLinksError } = await supabase
      .from('loan_officer_public_links')
      .select('is_active')
      .eq('officer_id', user.id);

    if (publicLinksError) {
      console.error('❌ Error fetching public links:', publicLinksError);
    }

    const activePublicLinks = publicLinksData?.filter(link => link.is_active).length || 0;

    // Calculate statistics for this officer only
    const stats = {
      totalLeads: leadsData.length,
      highPriorityLeads: leadsData.filter(lead => lead.priority === 'high').length,
      urgentPriorityLeads: leadsData.filter(lead => lead.priority === 'urgent').length,
      convertedLeads: leadsData.filter(lead => lead.status === 'converted').length,
      activePublicLinks
    };

    // Get recent leads (last 10) for this officer only
    const recentLeads = leadsData.slice(0, 10).map(lead => ({
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

    console.log(`✅ Found ${leadsData.length} leads for officer ${user.first_name} ${user.last_name}`);

    return NextResponse.json({
      success: true,
      data: {
        officer: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email
        },
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug
        },
        stats,
        recentLeads,
        totalLeads: leadsData.length
      }
    });

  } catch (error: any) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
