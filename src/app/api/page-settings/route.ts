import { NextRequest, NextResponse } from 'next/server';
import { db, pageSettings, templates } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

// GET /api/page-settings - Get user's page settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const officerId = searchParams.get('officerId');
    
    if (!officerId) {
      return NextResponse.json(
        { success: false, error: 'Officer ID is required' },
        { status: 400 }
      );
    }

    const settings = await db
      .select()
      .from(pageSettings)
      .where(eq(pageSettings.officerId, officerId))
      .limit(1);

    if (settings.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No custom settings found'
      });
    }

    return NextResponse.json({
      success: true,
      data: settings[0]
    });

  } catch (error) {
    console.error('Error fetching page settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch page settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/page-settings - Save user's page settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, template, settings, companyId, officerId } = body;
    
    if (!officerId) {
      return NextResponse.json(
        { success: false, error: 'Officer ID is required' },
        { status: 400 }
      );
    }

    if (!templateId || !template || !settings) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if template exists
    const templateExists = await db
      .select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1);

    if (templateExists.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check if user already has settings
    const existingSettings = await db
      .select()
      .from(pageSettings)
      .where(eq(pageSettings.officerId, officerId))
      .limit(1);

    let result;
    if (existingSettings.length > 0) {
      // Update existing settings
      result = await db
        .update(pageSettings)
        .set({
          templateId,
          template,
          settings,
          isPublished: false,
          updatedAt: new Date()
        })
        .where(eq(pageSettings.officerId, officerId))
        .returning();
    } else {
      // Create new settings
      result = await db
        .insert(pageSettings)
        .values({
          companyId: companyId || null,
          officerId: officerId,
          templateId,
          template,
          settings,
          isPublished: false
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Page settings saved successfully'
    });

  } catch (error) {
    console.error('Error saving page settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save page settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/page-settings - Update user's page settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings, isPublished, officerId } = body;
    
    if (!officerId) {
      return NextResponse.json(
        { success: false, error: 'Officer ID is required' },
        { status: 400 }
      );
    }

    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'Settings are required' },
        { status: 400 }
      );
    }

    const result = await db
      .update(pageSettings)
      .set({
        settings,
        isPublished: isPublished ?? false,
        publishedAt: isPublished ? new Date() : null,
        updatedAt: new Date()
      })
      .where(eq(pageSettings.officerId, officerId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Page settings not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Page settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating page settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update page settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/page-settings - Delete user's page settings
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const officerId = searchParams.get('officerId');
    
    if (!officerId) {
      return NextResponse.json(
        { success: false, error: 'Officer ID is required' },
        { status: 400 }
      );
    }

    const result = await db
      .delete(pageSettings)
      .where(eq(pageSettings.officerId, officerId))
      .returning();

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Page settings deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting page settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete page settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
