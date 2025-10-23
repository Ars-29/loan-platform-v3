import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import { leads, users, companies, userCompanies } from '@/lib/db/schema';
import { eq, and, or, like, desc, asc } from 'drizzle-orm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 GET /api/leads/filtered - Starting request');
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role and company
    const { data: userData } = await supabase
      .from('users')
      .select('role, first_name, last_name')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { role } = userData;
    console.log('✅ User role:', role);

    // Check if user has permission to view filtered leads
    if (!['company_admin', 'super_admin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const officerId = searchParams.get('officerId');
    const status = searchParams.get('status');
    const stage = searchParams.get('stage');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    // Use 10 leads per page as requested
    const defaultLimit = '10';
    const limit = parseInt(searchParams.get('limit') || defaultLimit);
    const offset = (page - 1) * limit;

    console.log('🔍 Filters:', { companyId, officerId, status, stage, priority, search, page, limit });

    // Build query conditions
    const conditions = [];

    // For company admin, only show leads from their company
    if (role === 'company_admin') {
      console.log('🔍 Company Admin: Looking for company for user:', user.id);
      
      // First, let's see what roles exist for this user
      const { data: allUserCompanies } = await supabase
        .from('user_companies')
        .select('company_id, role')
        .eq('user_id', user.id);
      
      console.log('🔍 All user_companies entries for user:', allUserCompanies);
      
      // Try multiple role variations in user_companies table
      // Note: In user_companies table, company admin role is stored as 'admin'
      const { data: userCompany } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user.id)
        .in('role', ['admin', 'company_admin'])
        .single();

      if (userCompany) {
        conditions.push(eq(leads.companyId, userCompany.company_id));
        console.log('✅ Company Admin: Found company in user_companies:', userCompany.company_id);
      } else {
        console.log('❌ Company Admin: No company found in user_companies, trying users table');
        
        // Try to get company from users table directly
        const { data: userData } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', user.id)
          .single();
        
        console.log('🔍 Users table data:', userData);
        
        if (userData?.company_id) {
          conditions.push(eq(leads.companyId, userData.company_id));
          console.log('✅ Company Admin: Using company_id from users table:', userData.company_id);
        } else {
          // Try to find any company association for this user
          const { data: anyCompany } = await supabase
            .from('user_companies')
            .select('company_id')
            .eq('user_id', user.id)
            .single();
            
          if (anyCompany) {
            conditions.push(eq(leads.companyId, anyCompany.company_id));
            console.log('✅ Company Admin: Found company with any role:', anyCompany.company_id);
          } else {
            console.log('❌ Company Admin: No company found anywhere for user:', user.id);
            return NextResponse.json({ error: 'Company not found for user' }, { status: 404 });
          }
        }
      }
    }

    // Apply filters
    if (companyId) {
      conditions.push(eq(leads.companyId, companyId));
    }
    if (officerId) {
      conditions.push(eq(leads.officerId, officerId));
    }
    if (status) {
      conditions.push(eq(leads.status, status));
    }
    // Note: conversionStage column doesn't exist in the database
    // if (stage) {
    //   conditions.push(eq(leads.conversionStage, stage));
    // }
    if (priority) {
      conditions.push(eq(leads.priority, priority));
    }
    if (search) {
      conditions.push(
        or(
          like(leads.firstName, `%${search}%`),
          like(leads.lastName, `%${search}%`),
          like(leads.email, `%${search}%`),
          like(leads.phone, `%${search}%`)
        )
      );
    }

    // Build the main query with joins
    const baseQuery = db
      .select({
        id: leads.id,
        companyId: leads.companyId,
        officerId: leads.officerId,
        firstName: leads.firstName,
        lastName: leads.lastName,
        email: leads.email,
        phone: leads.phone,
        source: leads.source,
        status: leads.status,
        priority: leads.priority,
        loanAmount: leads.loanAmount,
        creditScore: leads.creditScore,
        leadQualityScore: leads.leadQualityScore,
        geographicLocation: leads.geographicLocation,
        notes: leads.notes,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
        lastContactDate: leads.lastContactDate,
        contactCount: leads.contactCount,
        // Officer info
        officerFirstName: users.firstName,
        officerLastName: users.lastName,
        officerEmail: users.email,
        // Company info
        companyName: companies.name
      })
      .from(leads)
      .leftJoin(users, eq(leads.officerId, users.id))
      .leftJoin(companies, eq(leads.companyId, companies.id));

    // Apply conditions to main query
    console.log('🔍 Final conditions applied:', conditions);
    const query = conditions.length > 0 
      ? baseQuery.where(and(...conditions))
      : baseQuery;

    // Get total count for pagination
    const countBaseQuery = db
      .select({ count: leads.id })
      .from(leads)
      .leftJoin(users, eq(leads.officerId, users.id))
      .leftJoin(companies, eq(leads.companyId, companies.id));

    const countQuery = conditions.length > 0 
      ? countBaseQuery.where(and(...conditions))
      : countBaseQuery;

    // Execute queries
    const [leadsResult, countResult] = await Promise.all([
      query
        .orderBy(desc(leads.createdAt))
        .limit(limit)
        .offset(offset),
      countQuery
    ]);

    const total = countResult.length;
    const totalPages = Math.ceil(total / limit);

    console.log('✅ Found leads:', leadsResult.length, 'Total filtered:', total);
    console.log('🔍 Pagination:', { page, limit, offset, totalPages });
    console.log('🔍 Filter summary:', { 
      hasCompanyFilter: !!companyId, 
      hasOfficerFilter: !!officerId, 
      hasStatusFilter: !!status, 
      hasPriorityFilter: !!priority, 
      hasSearchFilter: !!search 
    });

    // Transform results with null checks
    const transformedLeads = leadsResult.map(lead => ({
      id: lead.id || '',
      firstName: lead.firstName || '',
      lastName: lead.lastName || '',
      email: lead.email || '',
      phone: lead.phone || '',
      source: lead.source || '',
      status: lead.status || 'new',
      priority: lead.priority || 'medium',
      conversionStage: 'lead', // Default value since column doesn't exist
      loanAmount: lead.loanAmount || 0,
      creditScore: lead.creditScore || 0,
      leadQualityScore: lead.leadQualityScore || 0,
      geographicLocation: lead.geographicLocation || '',
      notes: lead.notes || '',
      createdAt: lead.createdAt || new Date().toISOString(),
      updatedAt: lead.updatedAt || new Date().toISOString(),
      lastContactDate: lead.lastContactDate || null,
      contactCount: lead.contactCount || 0,
      officerName: lead.officerFirstName && lead.officerLastName 
        ? `${lead.officerFirstName} ${lead.officerLastName}` 
        : lead.officerEmail || '',
      companyName: lead.companyName || '',
      companyId: lead.companyId || '',
      officerId: lead.officerId || ''
    }));

    return NextResponse.json({
      success: true,
      leads: transformedLeads,
      total,
      totalPages,
      currentPage: page,
      limit
    });

  } catch (error) {
    console.error('❌ Error fetching filtered leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
