import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching NMLS# for user:', userId);

    const user = await db
      .select({
        nmlsNumber: users.nmlsNumber,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ User NMLS# fetched:', user[0].nmlsNumber);

    return NextResponse.json({
      success: true,
      data: {
        nmlsNumber: user[0].nmlsNumber
      }
    });

  } catch (error) {
    console.error('❌ Error fetching user NMLS#:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { nmlsNumber } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!nmlsNumber) {
      return NextResponse.json(
        { success: false, message: 'NMLS number is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Updating NMLS# for user:', userId, 'to:', nmlsNumber);

    const updatedUser = await db
      .update(users)
      .set({ 
        nmlsNumber: nmlsNumber,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        nmlsNumber: users.nmlsNumber
      });

    if (updatedUser.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ User NMLS# updated:', updatedUser[0].nmlsNumber);

    return NextResponse.json({
      success: true,
      data: {
        nmlsNumber: updatedUser[0].nmlsNumber
      }
    });

  } catch (error) {
    console.error('❌ Error updating user NMLS#:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}