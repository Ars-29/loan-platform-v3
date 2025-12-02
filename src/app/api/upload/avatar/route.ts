import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  resource_type: string;
};

// POST /api/upload/avatar - Upload profile avatar image
export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    const folder = 'avatars';
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    console.log('🔍 Avatar Upload API: Processing upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    // Upload to Cloudinary
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: 'image',
            overwrite: false,
            unique_filename: true
          },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error || !result) {
              return reject(error || new Error('Cloudinary upload failed'));
            }
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
              resource_type: result.resource_type
            });
          }
        )
        .end(fileBuffer);
    });

    console.log('✅ Avatar Upload API: Upload successful:', {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      resourceType: uploadResult.resource_type
    });

    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        resourceType: uploadResult.resource_type
      },
      message: 'Avatar uploaded successfully'
    });

  } catch (error) {
    console.error('❌ Avatar Upload API: Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload avatar',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/upload/avatar - Delete profile avatar image
export async function DELETE(request: NextRequest) {
  try {
    const { publicId } = await request.json();
    
    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'publicId required' },
        { status: 400 }
      );
    }

    console.log('🔍 Avatar Delete API: Deleting file:', {
      publicId
    });

    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image'
    });

    console.log('✅ Avatar Delete API: Delete successful:', {
      publicId
    });

    return NextResponse.json({
      success: true,
      message: 'Avatar deleted successfully'
    });

  } catch (error) {
    console.error('❌ Avatar Delete API: Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete avatar',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
