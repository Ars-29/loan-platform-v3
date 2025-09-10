import { NextRequest, NextResponse } from 'next/server';
import { resendCompanyInvite } from '@/lib/invite-system';
import { db } from '@/lib/db';
import { companies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const resendInviteSchema = z.object({
  companyId: z.string().uuid('Valid company ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId } = resendInviteSchema.parse(body);

    // Check company status and invite expiration
    const company = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!company.length) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const companyData = company[0];

    // Check if company is deactivated
    if (companyData.deactivated) {
      return NextResponse.json({ 
        success: false, 
        message: 'Cannot resend invite for deactivated company' 
      }, { status: 400 });
    }

    // Check if invite was already accepted
    if (companyData.inviteStatus === 'accepted') {
      return NextResponse.json({ 
        success: false, 
        message: 'Invite has already been accepted' 
      }, { status: 400 });
    }

    // Check if invite is still valid (not expired)
    if (companyData.inviteExpiresAt && new Date() < companyData.inviteExpiresAt) {
      const expirationTime = new Date(companyData.inviteExpiresAt).toLocaleString();
      return NextResponse.json({ 
        success: false, 
        message: `You can resend after ${expirationTime}` 
      }, { status: 400 });
    }

    const result = await resendCompanyInvite(companyId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API error resending invite:', error);
    
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