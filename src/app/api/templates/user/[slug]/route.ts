import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { redisCache } from '@/lib/redis';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to get cache key
function getCacheKey(slug: string, userId: string): string {
  return `${slug}:${userId}`;
}

// Helper function to get cached data from Redis
async function getCachedTemplate(cacheKey: string) {
  try {
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      console.log('✅ User Template API: Using Redis cached data for:', cacheKey);
      return cached;
    }
  } catch (error) {
    console.error('❌ User Template API: Error getting Redis cache:', error);
  }
  return null;
}

// Helper function to set cached data in Redis
async function setCachedTemplate(cacheKey: string, data: any) {
  try {
    await redisCache.set(cacheKey, data, 600); // 10 minutes TTL
    console.log('💾 User Template API: Cached data in Redis for:', cacheKey);
  } catch (error) {
    console.error('❌ User Template API: Error setting Redis cache:', error);
  }
}

// GET /api/templates/user/[slug] - Get specific user template (customized or default)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('🔍 User Template API: Request received:', {
      slug,
      userId,
      timestamp: new Date().toISOString()
    });

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
      console.error('❌ User Template API: Auth error:', authError);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Use provided userId or authenticated user's ID
    const targetUserId = userId || user.id;

    console.log('🔍 User Template API: Target user:', {
      targetUserId,
      authenticatedUserId: user.id,
      slug
    });

    // Check Redis cache first
    const cacheKey = getCacheKey(slug, targetUserId);
    const cachedData = await getCachedTemplate(cacheKey);
    // ETag based on latest updated timestamp + user + slug
    const cachedTs = (cachedData as any)?.data?.template?.updated_at || (cachedData as any)?.data?.template?.updatedAt || null;
    const baseVersion = `${slug}:${targetUserId}:${cachedTs ?? 'nover'}`;
    const etag = `"${Buffer.from(baseVersion).toString('base64')}"`;

    const ifNoneMatch = request.headers.get('if-none-match');
    if (cachedData && ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304, headers: { ETag: etag, 'Cache-Control': 'private, max-age=0, stale-while-revalidate=60' } });
    }
    if (cachedData && !ifNoneMatch) {
      const res = NextResponse.json(cachedData);
      res.headers.set('ETag', etag);
      res.headers.set('Cache-Control', 'private, max-age=0, stale-while-revalidate=60');
      return res;
    }

    // Get user's company information
    const { data: userCompanyData, error: userCompanyError } = await supabase
      .from('user_companies')
      .select(`
        user_id,
        company_id,
        companies!inner(name),
        role
      `)
      .eq('user_id', targetUserId)
      .eq('is_active', true)
      .eq('companies.is_active', true)
      .limit(1);

    if (userCompanyError) {
      console.error('❌ User Template API: User company query error:', userCompanyError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user company information' },
        { status: 500 }
      );
    }

    if (!userCompanyData || userCompanyData.length === 0) {
      console.log('⚠️ User Template API: User not associated with any company');
      return NextResponse.json(
        { success: false, error: 'User not associated with any company' },
        { status: 403 }
      );
    }

    const userCompany = userCompanyData[0];
    const companyId = userCompany.company_id;
    const companyName = (userCompany.companies as any).name;
    const userRole = userCompany.role;

    // First, try to get user's customized template
    const { data: userTemplateData, error: userTemplateError } = await supabase
      .from('templates')
      .select('*')
      .eq('slug', slug)
      .eq('user_id', targetUserId)
      .eq('is_default', false)
      .eq('is_active', true)
      .limit(1);

    if (userTemplateError) {
      console.error('❌ User Template API: User template query error:', userTemplateError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user template' },
        { status: 500 }
      );
    }

    let finalTemplate;
    let isCustomized = false;

    if (userTemplateData && userTemplateData.length > 0) {
      // User has a customized version
      finalTemplate = userTemplateData[0];
      isCustomized = true;
      console.log('🔍 User Template API: Found user customized template');
    } else {
      // Fall back to default template
      const { data: defaultTemplateData, error: defaultTemplateError } = await supabase
        .from('templates')
        .select('*')
        .eq('slug', slug)
        .eq('is_default', true)
        .is('user_id', null)
        .eq('is_active', true)
        .limit(1);

      if (defaultTemplateError) {
        console.error('❌ User Template API: Default template query error:', defaultTemplateError);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch default template' },
          { status: 500 }
        );
      }

      if (!defaultTemplateData || defaultTemplateData.length === 0) {
        console.log('⚠️ User Template API: Template not found:', slug);
        return NextResponse.json(
          { success: false, error: 'Template not found' },
          { status: 404 }
        );
      }

      finalTemplate = defaultTemplateData[0];
      isCustomized = false;
      console.log('🔍 User Template API: Using default template');
    }

    // Transform database field names to camelCase for frontend
    const transformedTemplate = {
      ...finalTemplate,
      headerModifications: finalTemplate.header_modifications || {},
      bodyModifications: finalTemplate.body_modifications || {},
      rightSidebarModifications: finalTemplate.right_sidebar_modifications || {},
      layoutConfig: finalTemplate.layout_config || {}
    };

    console.log('🔍 User Template API: Final template modification fields:', {
      header_modifications: finalTemplate.header_modifications,
      body_modifications: finalTemplate.body_modifications,
      right_sidebar_modifications: finalTemplate.right_sidebar_modifications
    });

    console.log('🔍 User Template API: Transformed template modification fields:', {
      headerModifications: transformedTemplate.headerModifications,
      bodyModifications: transformedTemplate.bodyModifications,
      rightSidebarModifications: transformedTemplate.rightSidebarModifications
    });

    // Prepare response
    const response = {
      success: true,
      data: {
        template: transformedTemplate,
        userInfo: {
          userId: targetUserId,
          companyId,
          companyName,
          userRole,
          hasCustomSettings: isCustomized
        },
        metadata: {
          templateSlug: slug,
          isCustomized,
          isPublished: false // We'll add this later if needed
        }
      }
    };

    console.log('✅ User Template API: Response prepared:', {
      templateSlug: slug,
      isCustomized,
      templateId: finalTemplate.id
    });

    // Cache the response in Redis
    await setCachedTemplate(cacheKey, response);

    const latestVersion = `${slug}:${targetUserId}:${(finalTemplate as any)?.updated_at ?? 'nover'}`;
    const latestEtag = `"${Buffer.from(latestVersion).toString('base64')}"`;
    const res = NextResponse.json(response);
    res.headers.set('ETag', latestEtag);
    res.headers.set('Cache-Control', 'private, max-age=0, stale-while-revalidate=60');
    return res;

  } catch (error) {
    console.error('❌ User Template API: Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch user template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}