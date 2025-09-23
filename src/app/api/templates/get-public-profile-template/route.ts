import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { templates } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client and verify the token
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', error: authError?.message },
        { status: 401 }
      );
    }

    console.log('🔍 Getting public profile template for user:', user.id);

    // Get the user's selected template (isSelected = true)
    const selectedTemplate = await db
      .select({ slug: templates.slug })
      .from(templates)
      .where(
        and(
          eq(templates.userId, user.id),
          eq(templates.isSelected, true),
          eq(templates.isActive, true)
        )
      )
      .limit(1);

    let templateSlug = 'template1'; // default

    if (selectedTemplate.length > 0) {
      templateSlug = selectedTemplate[0].slug;
      console.log('✅ Found selected template:', templateSlug);
    } else {
      console.log('⚠️ No selected template found, using default template1');
    }

    return NextResponse.json({
      success: true,
      templateSlug: templateSlug
    });

  } catch (error) {
    console.error('❌ Error getting public profile template:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
