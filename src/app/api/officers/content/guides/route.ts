import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import { officerContentGuides } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/officers/content/guides - Get all guides for logged-in officer
export async function GET(request: NextRequest) {
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

    // Fetch all guides for this officer
    const guides = await db
      .select()
      .from(officerContentGuides)
      .where(eq(officerContentGuides.officerId, user.id))
      .orderBy(desc(officerContentGuides.createdAt));

    return NextResponse.json({
      success: true,
      data: guides
    });

  } catch (error) {
    console.error('❌ Error fetching guides:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch guides',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/officers/content/guides - Create guide
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, category, file_url, file_name, file_type, cloudinary_public_id, funnel_url } = body;

    // Validate required fields
    if (!name || !category || !file_url || !file_name || !cloudinary_public_id) {
      return NextResponse.json(
        { success: false, error: 'Name, category, file_url, file_name, and cloudinary_public_id are required' },
        { status: 400 }
      );
    }

    // Insert guide
    const newGuide = {
      officerId: user.id,
      name,
      category,
      fileUrl: file_url,
      funnelUrl: funnel_url || null,
      fileName: file_name,
      fileType: file_type || null,
      cloudinaryPublicId: cloudinary_public_id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const insertedGuide = await db.insert(officerContentGuides).values(newGuide).returning();

    return NextResponse.json({
      success: true,
      data: insertedGuide[0],
      message: 'Guide created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating guide:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create guide',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

