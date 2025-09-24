import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
      console.error('❌ Simple Leads API: Auth error:', authError);
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
      console.error('❌ Simple Leads API: User not found:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { role } = userData;
    const isSuperAdmin = role === 'super_admin';
    const isCompanyAdmin = role === 'company_admin';

    if (!isSuperAdmin && !isCompanyAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if requesting officers for a specific company
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    let companyIds: string[] = [];

    if (isSuperAdmin) {
      if (companyId) {
        // Return officers for specific company
        companyIds = [companyId];
      } else {
        // Get all companies
        const { data: allCompanies, error: companiesError } = await supabase
          .from('companies')
          .select('id');

        if (companiesError || !allCompanies) {
          return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
        }

        companyIds = allCompanies.map(c => c.id);
      }
    } else {
      // Get company admin's company
      const { data: userCompany, error: companyError } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (companyError || !userCompany) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }

      companyIds = [userCompany.company_id];
    }

    // Get companies with their loan officers and leads data
    const companiesData = await Promise.all(
      companyIds.map(async (companyId) => {
        // Get company info
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('id, name')
          .eq('id', companyId)
          .single();

        if (companyError || !company) {
          return null;
        }

        // Get loan officers for this company (deduplicated by user_id)
        const { data: userCompanyData, error: userCompanyError } = await supabase
          .from('user_companies')
          .select('user_id')
          .eq('company_id', companyId)
          .eq('role', 'employee');

        console.log('🔍 User companies query result:', { userCompanyData, userCompanyError });

        if (userCompanyError || !userCompanyData || userCompanyData.length === 0) {
          return {
            ...company,
            loanOfficers: [],
            totalLeads: 0,
            totalConverted: 0,
            conversionRate: 0
          };
        }

        // Get user details for each officer
        const userIds = userCompanyData.map(uc => uc.user_id);
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, first_name, last_name, email')
          .in('id', userIds);

        console.log('🔍 Users query result:', { users, usersError });

        if (usersError || !users) {
          return {
            ...company,
            loanOfficers: [],
            totalLeads: 0,
            totalConverted: 0,
            conversionRate: 0
          };
        }

        // Combine the data
        const officers = userCompanyData.map(uc => ({
          user_id: uc.user_id,
          users: users.find(u => u.id === uc.user_id)
        }));

        console.log('🔍 Combined officers data:', officers);

        // Deduplicate officers by user_id (in case there are multiple entries for the same user)
        const uniqueOfficers = officers.reduce((acc, officer) => {
          if (!acc.find(o => o.user_id === officer.user_id)) {
            acc.push(officer);
          }
          return acc;
        }, [] as typeof officers);

        // Get leads data for each officer
        const officersWithData = await Promise.all(
          uniqueOfficers.map(async (officer) => {
            const { data: leads, error: leadsError } = await supabase
              .from('leads')
              .select('id, status, conversion_stage, created_at, updated_at')
              .eq('officer_id', officer.user_id);

            if (leadsError || !leads) {
            return {
              id: officer.user_id,
              name: `${officer.users?.first_name || ''} ${officer.users?.last_name || ''}`.trim() || 'Unknown',
              email: officer.users?.email || '',
              totalLeads: 0,
              convertedLeads: 0,
              conversionRate: 0,
              lastActivity: 'Never'
            };
            }

            const totalLeads = leads.length;
            const convertedLeads = leads.filter(lead => 
              lead.status === 'converted' || 
              lead.conversion_stage === 'closing'
            ).length;
            const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
            
            const lastActivity = leads.length > 0 
              ? new Date(Math.max(...leads.map(l => new Date(l.updated_at || l.created_at).getTime()))).toLocaleDateString()
              : 'Never';

            return {
              id: officer.user_id,
              name: `${officer.users?.first_name || ''} ${officer.users?.last_name || ''}`.trim() || 'Unknown',
              email: officer.users?.email || '',
              totalLeads,
              convertedLeads,
              conversionRate,
              lastActivity
            };
          })
        );

        const totalLeads = officersWithData.reduce((sum, officer) => sum + officer.totalLeads, 0);
        const totalConverted = officersWithData.reduce((sum, officer) => sum + officer.convertedLeads, 0);
        const conversionRate = totalLeads > 0 ? (totalConverted / totalLeads) * 100 : 0;

        return {
          ...company,
          loanOfficers: officersWithData,
          totalLeads,
          totalConverted,
          conversionRate
        };
      })
    );

    // Filter out null companies and calculate totals
    const validCompanies = companiesData.filter(Boolean);
    
    if (companyId) {
      // Return officers for specific company (for both super admin and company admin)
      const company = validCompanies[0];
      if (!company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }
      
      const officersData = company.loanOfficers.map(officer => ({
        id: officer.id,
        firstName: officer.name.split(' ')[0] || '',
        lastName: officer.name.split(' ').slice(1).join(' ') || '',
        email: officer.email,
        companyId: company.id,
        companyName: company.name,
        totalLeads: officer.totalLeads,
        convertedLeads: officer.convertedLeads,
        conversionRate: officer.conversionRate,
        slug: officer.name.toLowerCase().replace(/\s+/g, '-')
      }));

      console.log('🔍 Officers API: Returning officers for company:', company.name);
      console.log('📊 Officers count:', officersData.length);
      console.log('👥 Officers data:', officersData);

      return NextResponse.json({
        success: true,
        officers: officersData
      });
    } else {
      // Return companies data
      const totalCompanies = validCompanies.length;
      const totalLoanOfficers = validCompanies.reduce((sum, company) => sum + (company?.loanOfficers?.length || 0), 0);
      const totalLeads = validCompanies.reduce((sum, company) => sum + (company?.totalLeads || 0), 0);
      const totalConverted = validCompanies.reduce((sum, company) => sum + (company?.totalConverted || 0), 0);
      const overallConversionRate = totalLeads > 0 ? (totalConverted / totalLeads) * 100 : 0;

      return NextResponse.json({
        success: true,
        companies: validCompanies.map(company => ({
          id: company?.id || '',
          name: company?.name || '',
          totalOfficers: company?.loanOfficers?.length || 0,
          totalLeads: company?.totalLeads || 0,
          convertedLeads: company?.totalConverted || 0,
          conversionRate: company?.conversionRate || 0
        })),
        totalCompanies,
        totalLoanOfficers,
        totalLeads,
        totalConverted,
        overallConversionRate
      });
    }

  } catch (error) {
    console.error('Simple Leads API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
