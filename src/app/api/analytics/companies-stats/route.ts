import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { leads, users, companies, userCompanies } from '@/lib/db/schema';
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
      console.error('❌ Companies Stats API: Auth error:', authError);
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
      console.error('❌ Companies Stats API: User not found:', userError);
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
    const sortBy = searchParams.get('sortBy') || 'conversionRate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(sql`${companies.name} ILIKE ${'%' + search + '%'}`);
    }

    // Get companies with their stats - simplified query to avoid connection issues
    const companiesQuery = db
      .select({
        id: companies.id,
        name: companies.name,
        totalOfficers: count(sql`DISTINCT ${userCompanies.userId}`),
        totalLeads: count(leads.id),
        convertedLeads: count(sql`CASE WHEN ${leads.conversionStage} = 'closing' THEN 1 END`),
        totalRevenue: sum(leads.commissionEarned),
        avgLoanAmount: avg(leads.loanAmountClosed),
      })
      .from(companies)
      .leftJoin(userCompanies, eq(companies.id, userCompanies.companyId))
      .leftJoin(leads, eq(companies.id, leads.companyId))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .groupBy(companies.id, companies.name);

    // Add sorting - simplified to avoid complex SQL
    let sortedQuery;
    switch (sortBy) {
      case 'name':
        sortedQuery = sortOrder === 'asc' 
          ? companiesQuery.orderBy(asc(companies.name))
          : companiesQuery.orderBy(desc(companies.name));
        break;
      case 'totalLeads':
        sortedQuery = sortOrder === 'asc'
          ? companiesQuery.orderBy(asc(count(leads.id)))
          : companiesQuery.orderBy(desc(count(leads.id)));
        break;
      case 'totalRevenue':
        sortedQuery = sortOrder === 'asc'
          ? companiesQuery.orderBy(asc(sum(leads.commissionEarned)))
          : companiesQuery.orderBy(desc(sum(leads.commissionEarned)));
        break;
      case 'conversionRate':
      default:
        // Sort by total leads first, then by converted leads
        sortedQuery = sortOrder === 'asc'
          ? companiesQuery.orderBy(asc(count(leads.id)), asc(count(sql`CASE WHEN ${leads.conversionStage} = 'closing' THEN 1 END`)))
          : companiesQuery.orderBy(desc(count(leads.id)), desc(count(sql`CASE WHEN ${leads.conversionStage} = 'closing' THEN 1 END`)));
        break;
    }

    // Get total count for pagination
    const totalCountQuery = db
      .select({ count: count() })
      .from(companies)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    // Execute queries with better error handling
    let companiesResult, totalCountResult;
    
    try {
      [companiesResult, totalCountResult] = await Promise.all([
        sortedQuery.limit(limit).offset(offset),
        totalCountQuery
      ]);
    } catch (dbError) {
      console.error('❌ Database query error:', dbError);
      // Try a simpler fallback query
      try {
        companiesResult = await db
          .select({
            id: companies.id,
            name: companies.name,
            totalOfficers: sql`0`,
            totalLeads: sql`0`,
            convertedLeads: sql`0`,
            totalRevenue: sql`0`,
            avgLoanAmount: sql`0`,
          })
          .from(companies)
          .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
          .limit(limit)
          .offset(offset);
        
        totalCountResult = await db
          .select({ count: count() })
          .from(companies)
          .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
      } catch (fallbackError) {
        console.error('❌ Fallback query also failed:', fallbackError);
        throw new Error('Database connection failed');
      }
    }

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Process the results
    const processedCompanies = companiesResult.map(company => {
      const conversionRate = Number(company.totalLeads) > 0 
        ? (Number(company.convertedLeads) / Number(company.totalLeads)) * 100 
        : 0;

      return {
        id: company.id,
        name: company.name,
        totalOfficers: Number(company.totalOfficers),
        totalLeads: Number(company.totalLeads),
        convertedLeads: Number(company.convertedLeads),
        conversionRate: Math.round(conversionRate * 100) / 100,
        totalRevenue: Number(company.totalRevenue) || 0,
        avgLoanAmount: Math.round((Number(company.avgLoanAmount) || 0) * 100) / 100,
      };
    });

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
    console.error('Companies Stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    // Don't close the connection here as it's managed by the connection pool
    // await client.end();
  }
}
