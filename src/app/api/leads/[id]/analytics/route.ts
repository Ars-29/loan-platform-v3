import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and } from 'drizzle-orm';
import { leads } from '@/lib/db/schema';

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = postgres(connectionString);
const db = drizzle(sql);

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      console.error('❌ Leads Analytics API: Auth error:', authError);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { id: leadId } = await params;
    const body = await request.json();

    // Validate that the user has access to this lead
    const lead = await db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    if (lead.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Check if user is the officer who owns this lead or has admin access
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isOwner = lead[0].officerId === user.id;
    const isAdmin = userData?.role === 'company_admin' || userData?.role === 'super_admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Handle different field updates
    if (body.status) {
      updateData.status = body.status;
    }

    if (body.conversionStage) {
      updateData.conversionStage = body.conversionStage;
      
      // Set conversion date when stage changes
      if (body.conversionStage === 'application') {
        updateData.applicationDate = new Date();
      } else if (body.conversionStage === 'approval') {
        updateData.approvalDate = new Date();
      } else if (body.conversionStage === 'closing') {
        updateData.closingDate = new Date();
        updateData.conversionDate = new Date();
      }
    }

    if (body.priority) {
      updateData.priority = body.priority;
    }

    if (body.leadQualityScore !== undefined) {
      updateData.leadQualityScore = body.leadQualityScore;
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    if (body.loanAmountClosed !== undefined) {
      updateData.loanAmountClosed = body.loanAmountClosed;
    }

    if (body.commissionEarned !== undefined) {
      updateData.commissionEarned = body.commissionEarned;
    }

    if (body.responseTimeHours !== undefined) {
      updateData.responseTimeHours = body.responseTimeHours;
    }

    if (body.lastContactDate) {
      updateData.lastContactDate = new Date(body.lastContactDate);
      updateData.contactCount = (lead[0].contactCount || 0) + 1;
    }

    if (body.geographicLocation !== undefined) {
      updateData.geographicLocation = body.geographicLocation;
    }

    // Update the lead
    const updatedLead = await db
      .update(leads)
      .set(updateData)
      .where(eq(leads.id, leadId))
      .returning();

    return NextResponse.json({
      success: true,
      lead: updatedLead[0]
    });

  } catch (error) {
    console.error('Lead analytics update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
