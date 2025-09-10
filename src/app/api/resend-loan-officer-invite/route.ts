import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, userCompanies } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resendInviteSchema = z.object({
  officerId: z.string().uuid('Valid officer ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { officerId } = resendInviteSchema.parse(body);

    // Check officer status and invite expiration
    const officer = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        isActive: users.isActive,
        deactivated: users.deactivated,
        inviteExpiresAt: users.inviteExpiresAt,
        inviteStatus: users.inviteStatus,
        companyId: userCompanies.companyId,
      })
      .from(users)
      .innerJoin(userCompanies, eq(users.id, userCompanies.userId))
      .where(eq(users.id, officerId))
      .limit(1);

    if (!officer.length) {
      return NextResponse.json({ error: 'Officer not found' }, { status: 404 });
    }

    const officerData = officer[0];

    // Check if officer is deactivated
    if (officerData.deactivated) {
      return NextResponse.json({ 
        success: false, 
        message: 'Cannot resend invite for deactivated officer' 
      }, { status: 400 });
    }

    // Check if invite was already accepted
    if (officerData.isActive) {
      return NextResponse.json({ 
        success: false, 
        message: 'Officer has already accepted the invite' 
      }, { status: 400 });
    }

    // Check if invite is still valid (not expired)
    if (officerData.inviteExpiresAt && new Date() < officerData.inviteExpiresAt) {
      const expirationTime = new Date(officerData.inviteExpiresAt).toLocaleString();
      return NextResponse.json({ 
        success: false, 
        message: `You can resend after ${expirationTime}` 
      }, { status: 400 });
    }

    // Resend the invite
    const { data: inviteResult, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      officerData.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/invite?officer=true&company=${officerData.companyId}`,
        data: {
          first_name: officerData.firstName,
          last_name: officerData.lastName,
          role: 'employee',
          company_id: officerData.companyId
        }
      }
    );

    if (inviteError) {
      console.error('Error resending loan officer invite:', inviteError);
      return NextResponse.json({
        success: false,
        message: `Failed to resend invite: ${inviteError.message}`
      }, { status: 500 });
    }

    // Update invite expiration time
    const newExpirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await db
      .update(users)
      .set({
        inviteExpiresAt: newExpirationTime,
        inviteStatus: 'sent'
      })
      .where(eq(users.id, officerId));

    return NextResponse.json({
      success: true,
      message: `Invite resent successfully to ${officerData.email}. The loan officer will receive an email to set up their account.`
    });
  } catch (error) {
    console.error('API error resending loan officer invite:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
