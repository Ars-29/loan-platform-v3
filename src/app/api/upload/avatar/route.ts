import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// POST /api/upload/avatar - Upload profile avatar image
export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ Avatar Upload API: Auth error:', authError);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    
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
      fileType: file.type,
      userId: user.id
    });

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Avatar Upload API: Upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    console.log('✅ Avatar Upload API: Upload successful:', {
      fileName,
      filePath,
      publicUrl,
      userId: user.id
    });

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        fileName,
        filePath
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
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ Avatar Delete API: Auth error:', authError);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { filePath } = await request.json();
    
    if (!filePath) {
      return NextResponse.json(
        { success: false, error: 'File path required' },
        { status: 400 }
      );
    }

    console.log('🔍 Avatar Delete API: Deleting file:', {
      filePath,
      userId: user.id
    });

    // Delete from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from('profile-images')
      .remove([filePath]);

    if (deleteError) {
      console.error('❌ Avatar Delete API: Delete error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete image' },
        { status: 500 }
      );
    }

    console.log('✅ Avatar Delete API: Delete successful:', {
      filePath,
      userId: user.id
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
