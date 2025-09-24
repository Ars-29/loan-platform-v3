import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  getCompanyLeadsInsights, 
  getCompanyOfficerPerformance, 
  getLeadVolumeTrends, 
  getLeadSourceData,
  getConversionFunnelData,
  getLeadsData,
  getLeadsCount,
  AnalyticsFilters 
} from '@/lib/analytics/queries';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ Analytics API: Auth error:', authError);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user role and company info
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      console.error('❌ Analytics API: User not found:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { role } = userData;
    const isSuperAdmin = role === 'super_admin';
    const isCompanyAdmin = role === 'company_admin';

    if (!isSuperAdmin && !isCompanyAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const officerIds = searchParams.get('officerIds')?.split(',');
    const companyIds = searchParams.get('companyIds')?.split(',');
    const sources = searchParams.get('sources')?.split(',');
    const statuses = searchParams.get('statuses')?.split(',');
    const conversionStages = searchParams.get('conversionStages')?.split(',');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build filters
    const filters: AnalyticsFilters = {};
    
    if (startDate && endDate) {
      filters.dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    }

    if (officerIds && officerIds.length > 0) {
      filters.officerIds = officerIds;
    }

    if (companyIds && companyIds.length > 0) {
      filters.companyIds = companyIds;
    }

    if (sources && sources.length > 0) {
      filters.sources = sources;
    }

    if (statuses && statuses.length > 0) {
      filters.statuses = statuses;
    }

    if (conversionStages && conversionStages.length > 0) {
      filters.conversionStages = conversionStages;
    }

    // Get company ID for company admin
    let companyId: string | null = null;
    if (isCompanyAdmin) {
      const { data: userCompany, error: companyError } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (companyError || !userCompany) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }

      companyId = userCompany.company_id;
    }

    // Get data based on role
    let insightsData;
    let officerPerformance;
    let leadVolumeTrends;
    let leadSourceData;
    let conversionFunnelData;
    let leadsData;
    let totalCount;

    if (isSuperAdmin) {
      // Super admin can see all companies
      if (companyIds && companyIds.length > 0) {
        // Get data for specific companies
        const results = await Promise.all(
          companyIds.map(async (cid) => {
            const [
              insights,
              officers,
              trends,
              sources,
              funnel,
              leads,
              count
            ] = await Promise.all([
              getCompanyLeadsInsights(cid, filters),
              getCompanyOfficerPerformance(cid, filters),
              getLeadVolumeTrends(cid, filters),
              getLeadSourceData(cid, filters),
              getConversionFunnelData(cid, filters),
              getLeadsData(cid, filters, limit, offset),
              getLeadsCount(cid, filters)
            ]);

            return {
              companyId: cid,
              insights,
              officers,
              trends,
              sources,
              funnel,
              leads,
              count
            };
          })
        );

        // Aggregate data across companies
        insightsData = results.reduce((acc, result) => ({
          totalLeads: acc.totalLeads + result.insights.totalLeads,
          convertedLeads: acc.convertedLeads + result.insights.convertedLeads,
          applications: acc.applications + result.insights.applications,
          approvals: acc.approvals + result.insights.approvals,
          closings: acc.closings + result.insights.closings,
          conversionRate: 0, // Will calculate below
          avgResponseTime: (acc.avgResponseTime + result.insights.avgResponseTime) / 2,
          totalLoanVolume: acc.totalLoanVolume + result.insights.totalLoanVolume,
          totalCommission: acc.totalCommission + result.insights.totalCommission,
        }), {
          totalLeads: 0,
          convertedLeads: 0,
          applications: 0,
          approvals: 0,
          closings: 0,
          conversionRate: 0,
          avgResponseTime: 0,
          totalLoanVolume: 0,
          totalCommission: 0,
        });

        insightsData.conversionRate = insightsData.totalLeads > 0 
          ? (insightsData.closings / insightsData.totalLeads) * 100 
          : 0;

        officerPerformance = results.flatMap(result => result.officers);
        leadVolumeTrends = results.flatMap(result => result.trends);
        leadSourceData = results.flatMap(result => result.sources);
        conversionFunnelData = results.flatMap(result => result.funnel);
        leadsData = results.flatMap(result => result.leads);
        totalCount = results.reduce((sum, result) => sum + result.count, 0);
      } else {
        // Get aggregated data for all companies
        const { data: allCompanies, error: companiesError } = await supabase
          .from('companies')
          .select('id');

        if (companiesError || !allCompanies) {
          return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
        }

        const allCompanyIds = allCompanies.map(c => c.id);
        
        // Get data for all companies
        const results = await Promise.all(
          allCompanyIds.map(async (cid) => {
            const [
              insights,
              officers,
              trends,
              sources,
              funnel,
              leads,
              count
            ] = await Promise.all([
              getCompanyLeadsInsights(cid, filters),
              getCompanyOfficerPerformance(cid, filters),
              getLeadVolumeTrends(cid, filters),
              getLeadSourceData(cid, filters),
              getConversionFunnelData(cid, filters),
              getLeadsData(cid, filters, limit, offset),
              getLeadsCount(cid, filters)
            ]);

            return {
              companyId: cid,
              insights,
              officers,
              trends,
              sources,
              funnel,
              leads,
              count
            };
          })
        );

        // Aggregate data across companies
        insightsData = results.reduce((acc, result) => ({
          totalLeads: acc.totalLeads + result.insights.totalLeads,
          convertedLeads: acc.convertedLeads + result.insights.convertedLeads,
          applications: acc.applications + result.insights.applications,
          approvals: acc.approvals + result.insights.approvals,
          closings: acc.closings + result.insights.closings,
          conversionRate: 0, // Will calculate below
          avgResponseTime: (acc.avgResponseTime + result.insights.avgResponseTime) / 2,
          totalLoanVolume: acc.totalLoanVolume + result.insights.totalLoanVolume,
          totalCommission: acc.totalCommission + result.insights.totalCommission,
        }), {
          totalLeads: 0,
          convertedLeads: 0,
          applications: 0,
          approvals: 0,
          closings: 0,
          conversionRate: 0,
          avgResponseTime: 0,
          totalLoanVolume: 0,
          totalCommission: 0,
        });

        insightsData.conversionRate = insightsData.totalLeads > 0 
          ? (insightsData.closings / insightsData.totalLeads) * 100 
          : 0;

        officerPerformance = results.flatMap(result => result.officers);
        leadVolumeTrends = results.flatMap(result => result.trends);
        leadSourceData = results.flatMap(result => result.sources);
        conversionFunnelData = results.flatMap(result => result.funnel);
        leadsData = results.flatMap(result => result.leads);
        totalCount = results.reduce((sum, result) => sum + result.count, 0);
      }
    } else {
      // Company admin - single company
      if (!companyId) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }

      [
        insightsData,
        officerPerformance,
        leadVolumeTrends,
        leadSourceData,
        conversionFunnelData,
        leadsData,
        totalCount
      ] = await Promise.all([
        getCompanyLeadsInsights(companyId, filters),
        getCompanyOfficerPerformance(companyId, filters),
        getLeadVolumeTrends(companyId, filters),
        getLeadSourceData(companyId, filters),
        getConversionFunnelData(companyId, filters),
        getLeadsData(companyId, filters, limit, offset),
        getLeadsCount(companyId, filters)
      ]);
    }

    return NextResponse.json({
      success: true,
      data: {
        insights: insightsData,
        officerPerformance,
        leadVolumeTrends,
        leadSourceData,
        conversionFunnelData,
        leads: leadsData,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      }
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
