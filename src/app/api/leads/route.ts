import { NextRequest, NextResponse } from 'next/server';
import { db, leads, companies, users } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 GET /api/leads - Starting request');
    
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
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ Leads API: Auth error:', authError);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('✅ Authenticated user:', user.id);
    
    // Fetch leads only for the authenticated user
    const userLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.officerId, user.id))
      .orderBy(desc(leads.createdAt));

    console.log('✅ Found leads for user:', userLeads.length);

    // Transform snake_case to camelCase for frontend compatibility
    const transformedLeads = userLeads.map(lead => ({
      id: lead.id,
      companyId: lead.companyId,
      officerId: lead.officerId,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      priority: lead.priority,
      loanDetails: lead.loanDetails,
      propertyDetails: lead.propertyDetails,
      creditScore: lead.creditScore,
      loanAmount: lead.loanAmount,
      downPayment: lead.downPayment,
      notes: lead.notes,
      tags: lead.tags,
      customFields: lead.customFields,
      conversionStage: lead.conversionStage,
      conversionDate: lead.conversionDate,
      applicationDate: lead.applicationDate,
      approvalDate: lead.approvalDate,
      closingDate: lead.closingDate,
      loanAmountClosed: lead.loanAmountClosed,
      commissionEarned: lead.commissionEarned,
      responseTimeHours: lead.responseTimeHours,
      lastContactDate: lead.lastContactDate,
      contactCount: lead.contactCount,
      leadQualityScore: lead.leadQualityScore,
      geographicLocation: lead.geographicLocation,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt
    }));

    return NextResponse.json({
      success: true,
      leads: transformedLeads
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/leads - Starting request');
    
    const body = await request.json();
    const { firstName, lastName, email, phone, creditScore, loanDetails, userId, companyId } = body;

    console.log('📝 Request body:', { firstName, lastName, email, phone: phone ? '***' : 'missing', creditScore, loanDetails: loanDetails ? 'present' : 'missing', userId, companyId });

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !loanDetails) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate that we have the required user and company IDs
    if (!userId || !companyId) {
      console.log('❌ Missing userId or companyId');
      return NextResponse.json(
        { error: 'Missing user or company information' },
        { status: 400 }
      );
    }

    console.log('✅ Using provided company:', companyId, 'and officer:', userId);
    
    // Prepare lead data for insertion
    const leadData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      companyId,
      officerId: userId,
      source: 'rate_table',
      loanDetails: {
        productId: loanDetails.productId,
        lenderName: loanDetails.lenderName,
        loanProgram: loanDetails.loanProgram,
        loanType: loanDetails.loanType,
        loanTerm: loanDetails.loanTerm,
        interestRate: loanDetails.interestRate,
        apr: loanDetails.apr,
        monthlyPayment: loanDetails.monthlyPayment,
        fees: loanDetails.fees,
        points: loanDetails.points,
        credits: loanDetails.credits,
        lockPeriod: loanDetails.lockPeriod,
      },
      // Auto-populate loan amount, down payment, credit score, and notes from API data
      loanAmount: (loanDetails.monthlyPayment * loanDetails.loanTerm).toString(), // Convert to string for decimal field
      downPayment: '0', // Default to 0, can be updated later
      creditScore: creditScore ? parseInt(creditScore.replace(/[^0-9]/g, '')) || 0 : 0, // Parse credit score or default to 0
      notes: `Lead generated from rate table. Product: ${loanDetails.loanProgram} from ${loanDetails.lenderName}`,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('💾 Inserting lead into database...');
    
    // Insert lead into database using Drizzle
    const [newLead] = await db.insert(leads).values(leadData).returning();

    console.log('✅ Lead created successfully:', {
      leadId: newLead.id,
      borrowerName: `${firstName} ${lastName}`,
      email,
      source: 'rate_table'
    });

    return NextResponse.json({
      success: true,
      lead: {
        id: newLead.id,
        firstName: newLead.firstName,
        lastName: newLead.lastName,
        email: newLead.email,
        phone: newLead.phone,
        status: newLead.status,
        createdAt: newLead.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
