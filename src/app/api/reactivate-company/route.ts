import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { companies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { companyId } = await request.json();

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Check if company exists
    const company = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!company.length) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    if (!company[0].deactivated) {
      return NextResponse.json({ error: 'Company is not deactivated' }, { status: 400 });
    }

    // Reactivate the company
    await db
      .update(companies)
      .set({ 
        deactivated: false,
        updatedAt: new Date()
      })
      .where(eq(companies.id, companyId));

    return NextResponse.json({ 
      success: true, 
      message: 'Company reactivated successfully' 
    });

  } catch (error) {
    console.error('Error reactivating company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
