import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🚀 GET /api/leads/[id] - Starting request');
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: leadId } = await params;
    console.log('✅ Authenticated user:', user.id, 'Requesting lead:', leadId);

    // Fetch the lead from database
    const leadResult = await db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    console.log('🔍 Lead query result:', leadResult.length, 'leads found');

    if (leadResult.length === 0) {
      console.log('❌ Lead not found for ID:', leadId);
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const lead = leadResult[0];
    console.log('✅ Found lead:', lead.id, 'Owner:', lead.officerId, 'User:', user.id);

    // Check if the user owns this lead
    if (lead.officerId !== user.id) {
      console.log('❌ User does not own this lead');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Transform snake_case to camelCase for frontend compatibility
    const transformedLead = {
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
    };

    return NextResponse.json({
      success: true,
      lead: transformedLead
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}