import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import { officerContentGuides } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cloudinary } from '@/lib/cloudinary';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// PUT /api/officers/content/guides/[id] - Update guide
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, category, funnel_url } = body;

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: 'Name and category are required' },
        { status: 400 }
      );
    }

    // Check if guide exists and belongs to the officer
    const existingGuide = await db
      .select()
      .from(officerContentGuides)
      .where(eq(officerContentGuides.id, id))
      .limit(1);

    if (existingGuide.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Guide not found' },
        { status: 404 }
      );
    }

    if (existingGuide[0].officerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update guide
    const updatedGuide = await db
      .update(officerContentGuides)
      .set({
        name,
        category,
        funnelUrl: funnel_url || null,
        updatedAt: new Date()
      })
      .where(eq(officerContentGuides.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedGuide[0],
      message: 'Guide updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating guide:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update guide',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/officers/content/guides/[id] - Delete guide (also delete from Cloudinary)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if guide exists and belongs to the officer
    const existingGuide = await db
      .select()
      .from(officerContentGuides)
      .where(eq(officerContentGuides.id, id))
      .limit(1);

    if (existingGuide.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Guide not found' },
        { status: 404 }
      );
    }

    if (existingGuide[0].officerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete from Cloudinary if public_id exists
    if (existingGuide[0].cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(existingGuide[0].cloudinaryPublicId, {
          resource_type: 'raw'
        });
        console.log('✅ Deleted guide from Cloudinary:', existingGuide[0].cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('❌ Error deleting guide from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Delete guide from database
    await db
      .delete(officerContentGuides)
      .where(eq(officerContentGuides.id, id));

    return NextResponse.json({
      success: true,
      message: 'Guide deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting guide:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete guide',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

