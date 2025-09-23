import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { templates } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const templateSlug = searchParams.get('template') || 'template1';
    
    console.log('🔍 Fetching public template for userId:', userId, 'template:', templateSlug);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // First, try to get the user's selected template (isSelected = true)
    const selectedUserTemplate = await db
      .select()
      .from(templates)
      .where(
        and(
          eq(templates.userId, userId),
          eq(templates.isSelected, true),
          eq(templates.isActive, true)
        )
      )
      .limit(1);

    let selectedTemplate = selectedUserTemplate;

    // If no selected template, try to get template1 for this user
    if (selectedTemplate.length === 0) {
      const template1User = await db
        .select()
        .from(templates)
        .where(
          and(
            eq(templates.slug, 'template1'),
            eq(templates.userId, userId),
            eq(templates.isDefault, false),
            eq(templates.isActive, true)
          )
        )
        .limit(1);
      selectedTemplate = template1User;
    }

    // If still no template, get default template1
    if (selectedTemplate.length === 0) {
      const defaultTemplate1 = await db
        .select()
        .from(templates)
        .where(
          and(
            eq(templates.slug, 'template1'),
            eq(templates.isDefault, true),
            eq(templates.isActive, true)
          )
        )
        .limit(1);
      selectedTemplate = defaultTemplate1;
    }

    // If still no template, get any default template
    if (selectedTemplate.length === 0) {
      const anyDefaultTemplate = await db
        .select()
        .from(templates)
        .where(
          and(
            eq(templates.isDefault, true),
            eq(templates.isActive, true)
          )
        )
        .limit(1);
      selectedTemplate = anyDefaultTemplate;
    }

    if (selectedTemplate.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No template found' },
        { status: 404 }
      );
    }

    const template = selectedTemplate[0];

    return NextResponse.json({
      success: true,
      data: {
        template: template,
        pageSettings: null,
        metadata: {
          templateSlug: template.slug,
          isCustomized: !template.isDefault,
          isPublished: true,
        }
      },
    });
  } catch (error) {
    console.error('Error fetching public template:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
