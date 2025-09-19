import { NextRequest, NextResponse } from 'next/server';
import { db, templates } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

// GET /api/templates - Fetch all templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    console.log('🔍 Templates API: Request received:', {
      slug,
      activeOnly,
      url: request.url,
      timestamp: new Date().toISOString()
    });

    // Build conditions array
    const conditions = [];
    if (slug) {
      conditions.push(eq(templates.slug, slug));
    }
    if (activeOnly) {
      conditions.push(eq(templates.isActive, true));
    }

    console.log('🔍 Templates API: Query conditions:', {
      conditionsCount: conditions.length,
      conditions: conditions.map(c => c.toString())
    });

    // Execute query with proper conditions
    const result = conditions.length > 0 
      ? await db.select().from(templates).where(and(...conditions))
      : await db.select().from(templates);

    console.log('✅ Templates API: Query successful:', {
      resultCount: result.length,
      templates: result.map(t => ({ 
        slug: t.slug, 
        isActive: t.isActive, 
        primaryColor: (t.colors as any)?.primary 
      }))
    });

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length
    });

  } catch (error) {
    console.error('❌ Templates API: Error fetching templates:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

