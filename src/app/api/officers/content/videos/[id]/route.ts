import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import { officerContentVideos } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cloudinary } from '@/lib/cloudinary';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// PUT /api/officers/content/videos/[id] - Update video
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
    const { title, description, category, thumbnail_url } = body;

    // Validate required fields
    if (!title || !category) {
      return NextResponse.json(
        { success: false, error: 'Title and category are required' },
        { status: 400 }
      );
    }

    // Check if video exists and belongs to the officer
    const existingVideo = await db
      .select()
      .from(officerContentVideos)
      .where(eq(officerContentVideos.id, id))
      .limit(1);

    if (existingVideo.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    if (existingVideo[0].officerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update video
    const updateData: any = {
      title,
      category,
      updatedAt: new Date()
    };

    if (description !== undefined) {
      updateData.description = description;
    }
    if (thumbnail_url !== undefined) {
      updateData.thumbnailUrl = thumbnail_url;
    }

    const updatedVideo = await db
      .update(officerContentVideos)
      .set(updateData)
      .where(eq(officerContentVideos.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedVideo[0],
      message: 'Video updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating video:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update video',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/officers/content/videos/[id] - Delete video (also delete from Cloudinary)
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

    // Check if video exists and belongs to the officer
    const existingVideo = await db
      .select()
      .from(officerContentVideos)
      .where(eq(officerContentVideos.id, id))
      .limit(1);

    if (existingVideo.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    if (existingVideo[0].officerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const video = existingVideo[0];

    // Delete video from Cloudinary if public_id exists
    if (video.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(video.cloudinaryPublicId, {
          resource_type: 'video'
        });
        console.log('✅ Deleted video from Cloudinary:', video.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('❌ Error deleting video from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Delete thumbnail from Cloudinary if it exists and is a custom upload
    // Custom thumbnails are in the format: https://res.cloudinary.com/.../upload/v1234567890/officer-content/videos/thumbnails/[public_id].[ext]
    // Auto-generated thumbnails are transformations and don't need separate deletion
    if (video.thumbnailUrl) {
      try {
        // Check if thumbnail is a custom upload (contains '/thumbnails/' in the path)
        const thumbnailUrl = video.thumbnailUrl;
        if (thumbnailUrl.includes('/thumbnails/')) {
          // Extract public_id from Cloudinary URL
          // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/officer-content/videos/thumbnails/public_id.jpg
          const urlMatch = thumbnailUrl.match(/\/upload\/v\d+\/(.+)$/);
          if (urlMatch && urlMatch[1]) {
            // Remove file extension to get the public_id
            const publicId = urlMatch[1].split('.')[0];
            
            try {
              await cloudinary.uploader.destroy(publicId, {
                resource_type: 'image'
              });
              console.log('✅ Deleted thumbnail from Cloudinary:', publicId);
            } catch (thumbError) {
              console.error('❌ Error deleting thumbnail from Cloudinary:', thumbError);
              // Continue even if thumbnail deletion fails
            }
          }
        }
        // Auto-generated thumbnails (transformations) don't need separate deletion
      } catch (thumbnailError) {
        console.error('❌ Error processing thumbnail deletion:', thumbnailError);
        // Continue with database deletion
      }
    }

    // Delete video from database
    await db
      .delete(officerContentVideos)
      .where(eq(officerContentVideos.id, id));

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting video:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete video',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

