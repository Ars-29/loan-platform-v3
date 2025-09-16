import { NextRequest, NextResponse } from 'next/server';
import { createPersonalTemplatesForUser } from '@/lib/template-manager';

// POST /api/templates/create-personal - Create personal templates for a user
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

    const body = await request.json();
    const { userId, firstName, lastName } = body;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('🎨 API: Creating personal templates for user:', userId);

    // Create personal templates
    const createdTemplates = await createPersonalTemplatesForUser(userId, firstName, lastName);

    console.log('✅ API: Personal templates created successfully:', createdTemplates.length);

    return NextResponse.json({
      success: true,
      data: {
        templatesCreated: createdTemplates.length,
        templates: createdTemplates
      },
      message: 'Personal templates created successfully'
    });

  } catch (error) {
    console.error('❌ API: Error creating personal templates:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create personal templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


