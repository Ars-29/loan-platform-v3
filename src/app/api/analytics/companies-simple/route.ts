import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { companies, users, userCompanies, leads } from '@/lib/db/schema';
import { eq, count, sum, avg, desc, asc, sql, and, gte, lte } from 'drizzle-orm';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Database connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header');
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
      console.error('❌ Companies Simple API: Auth error:', authError);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      console.error('❌ Companies Simple API: User not found:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { role } = userData;
    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(sql`${companies.name} ILIKE ${'%' + search + '%'}`);
    }

    // Get companies first (simple query)
    const companiesResult = await db
      .select({
        id: companies.id,
        name: companies.name,
      })
      .from(companies)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalCountResult = await db
      .select({ count: count() })
      .from(companies)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // For each company, get stats separately to avoid complex joins
    const processedCompanies = await Promise.all(
      companiesResult.map(async (company) => {
        try {
          // Get officer count
          const officerCount = await db
            .select({ count: count() })
            .from(userCompanies)
            .where(eq(userCompanies.companyId, company.id));

          // Get leads stats
          const leadsStats = await db
            .select({
              totalLeads: count(leads.id),
              convertedLeads: count(sql`CASE WHEN ${leads.conversionStage} = 'closing' THEN 1 END`),
              totalRevenue: sum(leads.commissionEarned),
              avgLoanAmount: avg(leads.loanAmountClosed),
            })
            .from(leads)
            .where(eq(leads.companyId, company.id));

          const stats = leadsStats[0] || {
            totalLeads: 0,
            convertedLeads: 0,
            totalRevenue: 0,
            avgLoanAmount: 0,
          };

          const conversionRate = Number(stats.totalLeads) > 0 
            ? (Number(stats.convertedLeads) / Number(stats.totalLeads)) * 100 
            : 0;

          return {
            id: company.id,
            name: company.name,
            totalOfficers: Number(officerCount[0]?.count || 0),
            totalLeads: Number(stats.totalLeads || 0),
            convertedLeads: Number(stats.convertedLeads || 0),
            conversionRate: Math.round(conversionRate * 100) / 100,
            totalRevenue: Number(stats.totalRevenue || 0),
            avgLoanAmount: Math.round((Number(stats.avgLoanAmount) || 0) * 100) / 100,
          };
        } catch (error) {
          console.error(`Error getting stats for company ${company.id}:`, error);
          // Return default values if stats query fails
          return {
            id: company.id,
            name: company.name,
            totalOfficers: 0,
            totalLeads: 0,
            convertedLeads: 0,
            conversionRate: 0,
            totalRevenue: 0,
            avgLoanAmount: 0,
          };
        }
      })
    );


    return NextResponse.json({
      success: true,
      companies: processedCompanies,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    });

  } catch (error) {
    console.error('Companies Simple API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
