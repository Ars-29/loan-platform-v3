import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, userCompanies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const deleteOfficerSchema = z.object({
  officerId: z.string().uuid('Valid officer ID is required'),
});

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { officerId } = deleteOfficerSchema.parse(body);

    // Check if officer exists
    const officer = await db
      .select()
      .from(users)
      .where(eq(users.id, officerId))
      .limit(1);

    if (!officer.length) {
      return NextResponse.json({
        success: false,
        message: 'Officer not found'
      }, { status: 404 });
    }

    // Delete user from Supabase Auth if exists (for pending invites)
    try {
      await supabase.auth.admin.deleteUser(officerId);
    } catch (authError) {
      // User might not exist in auth, which is fine for pending invites
      console.log('User not found in auth (likely pending invite):', officerId);
    }

    // Delete user-company relationship first
    await db
      .delete(userCompanies)
      .where(eq(userCompanies.userId, officerId));

    // Delete user from database
    await db
      .delete(users)
      .where(eq(users.id, officerId));

    return NextResponse.json({
      success: true,
      message: 'Officer deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting officer:', error);
    
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