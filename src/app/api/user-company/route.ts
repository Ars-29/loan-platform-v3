import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userCompanies } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// GET: Get user's company information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's company ID using Drizzle ORM
    const userCompanyResult = await db
      .select({ 
        companyId: userCompanies.companyId,
        role: userCompanies.role,
        isActive: userCompanies.isActive
      })
      .from(userCompanies)
      .where(
        and(
          eq(userCompanies.userId, userId),
          eq(userCompanies.isActive, true)
        )
      )
      .limit(1);

    if (userCompanyResult.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No company found for user' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: userCompanyResult[0]
    });

  } catch (error) {
    console.error('Error fetching user company:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

