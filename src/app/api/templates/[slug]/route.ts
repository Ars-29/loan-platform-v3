import { NextRequest, NextResponse } from 'next/server';
import { db, templates } from '@/lib/db';
import { eq } from 'drizzle-orm';

// GET /api/templates/[slug] - Fetch specific template by slug
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const template = await db
      .select()
      .from(templates)
      .where(eq(templates.slug, slug))
      .limit(1);

    if (template.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Template not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template[0]
    });

  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}