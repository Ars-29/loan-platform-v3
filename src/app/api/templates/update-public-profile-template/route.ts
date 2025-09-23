import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { templates } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
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
      console.error('❌ Authentication error:', authError);
      console.error('❌ User data:', user);
      return NextResponse.json(
        { success: false, message: 'Unauthorized', error: authError?.message },
        { status: 401 }
      );
    }

    const { templateSlug } = await request.json();

    if (!templateSlug || !['template1', 'template2'].includes(templateSlug)) {
      return NextResponse.json(
        { success: false, message: 'Invalid template slug' },
        { status: 400 }
      );
    }

    console.log('🔄 Updating public profile template for user:', user.id, 'to:', templateSlug);

    // First, set all templates for this user to not selected
    await db
      .update(templates)
      .set({ 
        isSelected: false,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(templates.userId, user.id),
          eq(templates.isActive, true)
        )
      );

    // Then, set the specific template to selected
    const result = await db
      .update(templates)
      .set({ 
        isSelected: true,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(templates.slug, templateSlug),
          eq(templates.userId, user.id),
          eq(templates.isActive, true)
        )
      );

    console.log('✅ Updated public profile template for user:', user.id);

    return NextResponse.json({
      success: true,
      message: 'Public profile template updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating public profile template:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
