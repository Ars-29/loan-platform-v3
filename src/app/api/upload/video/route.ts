import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

type CloudinaryVideoUploadResult = {
  secure_url: string;
  public_id: string;
  duration: number;
  format: string;
  width: number;
  height: number;
};

// POST /api/upload/video - Upload video to Cloudinary
export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const thumbnailFile = formData.get('thumbnail') as File | null;
    const folder = 'officer-content/videos';
    
    if (!videoFile) {
      return NextResponse.json(
        { success: false, error: 'No video file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    const allowedExtensions = ['.mp4', '.webm', '.mov', '.avi'];
    const fileExtension = videoFile.name.toLowerCase().substring(videoFile.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(videoFile.type) && !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only MP4, WebM, MOV, and AVI are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (videoFile.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 100MB.' },
        { status: 400 }
      );
    }

    // Validate thumbnail if provided
    if (thumbnailFile) {
      const allowedThumbnailTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedThumbnailTypes.includes(thumbnailFile.type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid thumbnail file type. Only JPEG, PNG, and WebP are allowed.' },
          { status: 400 }
        );
      }
      const maxThumbnailSize = 5 * 1024 * 1024; // 5MB
      if (thumbnailFile.size > maxThumbnailSize) {
        return NextResponse.json(
          { success: false, error: 'Thumbnail too large. Maximum size is 5MB.' },
          { status: 400 }
        );
      }
    }

    console.log('🔍 Video Upload API: Processing upload:', {
      fileName: videoFile.name,
      fileSize: videoFile.size,
      fileType: videoFile.type,
      hasThumbnail: !!thumbnailFile
    });

    // Upload video to Cloudinary
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());

    const videoUploadResult = await new Promise<CloudinaryVideoUploadResult>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: 'video',
            overwrite: false,
            unique_filename: true,
            eager: [
              { width: 1280, height: 720, crop: 'limit', format: 'jpg' } // Generate thumbnail
            ]
          },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error || !result) {
              return reject(error || new Error('Cloudinary video upload failed'));
            }
            
            // Extract duration from video metadata
            const duration = result.duration || 0;
            const format = result.format || '';
            const width = result.width || 0;
            const height = result.height || 0;
            
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
              duration,
              format,
              width,
              height
            });
          }
        )
        .end(videoBuffer);
    });

    // Upload thumbnail if provided, otherwise use auto-generated one
    let thumbnailUrl = '';
    let thumbnailPublicId: string | null = null;
    if (thumbnailFile) {
      const thumbnailBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const thumbnailResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `${folder}/thumbnails`,
              resource_type: 'image',
              overwrite: false,
              unique_filename: true
            },
            (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
              if (error || !result) {
                return reject(error || new Error('Cloudinary thumbnail upload failed'));
              }
              resolve({
                secure_url: result.secure_url,
                public_id: result.public_id
              });
            }
          )
          .end(thumbnailBuffer);
      });
      thumbnailUrl = thumbnailResult.secure_url;
      thumbnailPublicId = thumbnailResult.public_id;
    } else {
      // Generate thumbnail from video using Cloudinary transformation
      // Use the eager transformation we set, or generate a frame at 1 second
      thumbnailUrl = cloudinary.url(videoUploadResult.public_id, {
        resource_type: 'video',
        format: 'jpg',
        transformation: [
          { width: 1280, height: 720, crop: 'limit' },
          { start_offset: '1' } // Frame at 1 second
        ]
      });
      // Auto-generated thumbnails are transformations, not separate assets, so no public_id to store
    }

    // Format duration as MM:SS or HH:MM:SS
    const formatDuration = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const formattedDuration = formatDuration(videoUploadResult.duration);

    console.log('✅ Video Upload API: Upload successful:', {
      publicId: videoUploadResult.public_id,
      url: videoUploadResult.secure_url,
      duration: formattedDuration,
      thumbnailUrl
    });

    return NextResponse.json({
      success: true,
      data: {
        video_url: videoUploadResult.secure_url,
        thumbnail_url: thumbnailUrl,
        thumbnail_public_id: thumbnailPublicId, // Only for custom thumbnails
        duration: formattedDuration,
        public_id: videoUploadResult.public_id,
        format: videoUploadResult.format,
        width: videoUploadResult.width,
        height: videoUploadResult.height
      },
      message: 'Video uploaded successfully'
    });

  } catch (error) {
    console.error('❌ Video Upload API: Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload video',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

