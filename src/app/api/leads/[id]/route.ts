import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { status } = body;
    const { id: leadId } = await params;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Get the current user from Supabase auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's role to determine permissions
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('userId', user.id)
      .single();

    if (roleError || !userRole) {
      return NextResponse.json(
        { error: 'User role not found' },
        { status: 404 }
      );
    }

    // Check if user can update this lead
    let whereCondition;
    if (userRole.role === 'employee') {
      // Loan officers can only update their own leads
      whereCondition = and(eq(leads.id, leadId), eq(leads.officerId, user.id));
    } else if (userRole.role === 'company_admin') {
      // Company admins can update leads for their company
      const { data: companyData } = await supabase
        .from('user_companies')
        .select('companyId')
        .eq('userId', user.id)
        .single();

      if (!companyData) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }

      whereCondition = and(eq(leads.id, leadId), eq(leads.companyId, companyData.companyId));
    } else if (userRole.role === 'super_admin') {
      // Super admins can update any lead
      whereCondition = eq(leads.id, leadId);
    } else {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Update the lead
    const [updatedLead] = await db
      .update(leads)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(whereCondition)
      .returning();

    if (!updatedLead) {
      return NextResponse.json(
        { error: 'Lead not found or insufficient permissions' },
        { status: 404 }
      );
    }

    console.log('Lead status updated:', {
      leadId: updatedLead.id,
      newStatus: status,
      updatedBy: user.id,
      userRole: userRole.role
    });

    return NextResponse.json({
      success: true,
      lead: {
        id: updatedLead.id,
        status: updatedLead.status,
        updatedAt: updatedLead.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating lead status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
