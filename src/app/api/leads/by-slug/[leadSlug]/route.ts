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
  { params }: { params: Promise<{ leadSlug: string }> }
) {
  try {
    console.log('🚀 GET /api/leads/by-slug/[leadSlug] - Starting request');
    
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

    const { leadSlug } = await params;
    console.log('✅ Authenticated user:', user.id, 'Requesting lead by slug:', leadSlug);

    // Check if the requesting user is a company admin or employee
    const { data: userRole } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userRole || !['company_admin', 'employee', 'super_admin'].includes(userRole.role)) {
      console.log('❌ User is not authorized (must be company_admin, employee, or super_admin)');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Extract lead ID from slug (last 8 characters)
    const leadId = leadSlug.split('-').pop();
    if (!leadId || leadId.length !== 8) {
      console.log('❌ Invalid lead slug format');
      return NextResponse.json({ error: 'Invalid lead slug format' }, { status: 400 });
    }

    let allLeads;

    if (userRole.role === 'super_admin') {
      // Super admin can see all leads
      allLeads = await db
        .select()
        .from(leads);
    } else if (userRole.role === 'company_admin') {
      // Company admin can see all leads in their company
      const { data: userCompany } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!userCompany) {
        console.log('❌ User is not associated with any company');
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      allLeads = await db
        .select()
        .from(leads)
        .where(eq(leads.companyId, userCompany.company_id));
    } else {
      // Employee can only see their own leads
      allLeads = await db
        .select()
        .from(leads)
        .where(eq(leads.officerId, user.id));
    }

    // Find the lead that matches the slug pattern
    const lead = allLeads.find(l => {
      const expectedSlug = `${l.firstName.toLowerCase()}-${l.lastName.toLowerCase()}-${l.id.slice(-8)}`;
      return expectedSlug === leadSlug;
    });

    if (!lead) {
      console.log('❌ Lead not found');
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    console.log('✅ Found lead:', lead.firstName, lead.lastName);

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
    console.error('Error fetching lead by slug:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
