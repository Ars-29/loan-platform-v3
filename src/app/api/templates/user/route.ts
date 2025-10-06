import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { redisCache } from '@/lib/redis';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/templates/user - Get user's templates (both default and customized)
export async function GET(request: NextRequest) {
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
      console.error('❌ Templates User API: Auth error:', authError);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('🔍 Templates User API: Getting templates for user:', user.id);

    // Get user's customized templates
    const { data: userTemplates, error: userTemplatesError } = await supabase
      .from('templates')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_default', false)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (userTemplatesError) {
      console.error('❌ Templates User API: User templates query error:', userTemplatesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user templates' },
        { status: 500 }
      );
    }

    // Get default templates
    const { data: defaultTemplates, error: defaultTemplatesError } = await supabase
      .from('templates')
      .select('*')
      .eq('is_default', true)
      .is('user_id', null)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (defaultTemplatesError) {
      console.error('❌ Templates User API: Default templates query error:', defaultTemplatesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch default templates' },
        { status: 500 }
      );
    }

    // Transform templates to include camelCase field names
    const transformedUserTemplates = userTemplates.map(template => ({
      ...template,
      headerModifications: template.header_modifications || {},
      bodyModifications: template.body_modifications || {},
      rightSidebarModifications: template.right_sidebar_modifications || {},
      layoutConfig: template.layout_config || {}
    }));

    const transformedDefaultTemplates = defaultTemplates.map(template => ({
      ...template,
      headerModifications: template.header_modifications || {},
      bodyModifications: template.body_modifications || {},
      rightSidebarModifications: template.right_sidebar_modifications || {},
      layoutConfig: template.layout_config || {}
    }));

    console.log('✅ Templates User API: Retrieved templates:', {
      userTemplates: transformedUserTemplates.length,
      defaultTemplates: transformedDefaultTemplates.length
    });

    return NextResponse.json({
      success: true,
      data: {
        userTemplates: transformedUserTemplates,
        defaultTemplates: transformedDefaultTemplates
      }
    });

  } catch (error) {
    console.error('❌ Templates User API: Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/templates/user - Save user's template customizations
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { templateSlug, customSettings, isPublished = false } = body;
    
    console.log('🔍 Templates User API: Save request received:', {
      templateSlug,
      isPublished,
      customSettingsKeys: customSettings ? Object.keys(customSettings) : [],
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
      console.error('❌ Templates User API: Auth error:', authError);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (!templateSlug || !customSettings) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: templateSlug and customSettings' },
        { status: 400 }
      );
    }

    console.log('🔍 Templates User API: Processing save for user:', user.id);

    // Get user's company information
    const { data: userCompanyData, error: userCompanyError } = await supabase
      .from('user_companies')
      .select(`
        user_id,
        company_id,
        companies!inner(name),
        role
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('companies.is_active', true)
      .limit(1);

    if (userCompanyError) {
      console.error('❌ Templates User API: User company query error:', userCompanyError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user company information' },
        { status: 500 }
      );
    }

    if (!userCompanyData || userCompanyData.length === 0) {
      console.log('⚠️ Templates User API: User not associated with any company');
      return NextResponse.json(
        { success: false, error: 'User not associated with any company' },
        { status: 403 }
      );
    }

    const userCompany = userCompanyData[0];
    const companyId = userCompany.company_id;
    const companyName = (userCompany.companies as any).name;

    // Check if user already has a customized version of this template
    const { data: existingUserTemplateData, error: existingTemplateError } = await supabase
      .from('templates')
      .select('*')
      .eq('slug', templateSlug)
      .eq('user_id', user.id)
      .eq('is_default', false)
      .eq('is_active', true)
      .limit(1);

    if (existingTemplateError) {
      console.error('❌ Templates User API: Existing template query error:', existingTemplateError);
      return NextResponse.json(
        { success: false, error: 'Failed to check existing template' },
        { status: 500 }
      );
    }

    // Get the base template to merge with customizations
    const { data: baseTemplateData, error: baseTemplateError } = await supabase
      .from('templates')
      .select('*')
      .eq('slug', templateSlug)
      .eq('is_default', true)
      .is('user_id', null)
      .eq('is_active', true)
      .limit(1);

    if (baseTemplateError) {
      console.error('❌ Templates User API: Base template query error:', baseTemplateError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch base template' },
        { status: 500 }
      );
    }

    if (!baseTemplateData || baseTemplateData.length === 0) {
      console.log('⚠️ Templates User API: Base template not found:', templateSlug);
      return NextResponse.json(
        { success: false, error: 'Base template not found' },
        { status: 404 }
      );
    }

    const baseTemplate = baseTemplateData[0];

    // Prepare template data for update/insert
    const templateData = {
      name: baseTemplate.name,
      slug: baseTemplate.slug,
      description: baseTemplate.description,
      preview_image: baseTemplate.preview_image,
      user_id: user.id,
      is_default: false,
      updated_at: new Date().toISOString(),
      // Merge custom settings with base template
      colors: { ...baseTemplate.colors, ...customSettings.colors },
      typography: { ...baseTemplate.typography, ...customSettings.typography },
      content: { ...baseTemplate.content, ...customSettings.content },
      layout: { ...baseTemplate.layout, ...customSettings.layout },
      advanced: { ...baseTemplate.advanced, ...customSettings.advanced },
      classes: { ...baseTemplate.classes, ...customSettings.classes },
      header_modifications: customSettings.headerModifications || {},
      body_modifications: customSettings.bodyModifications || {},
      right_sidebar_modifications: customSettings.rightSidebarModifications || {},
      layout_config: customSettings.layoutConfig || baseTemplate.layout_config || {}
    };

    console.log('🔍 Templates User API: Template data prepared:', {
      templateSlug,
      hasCustomColors: !!customSettings.colors,
      hasCustomTypography: !!customSettings.typography,
      hasCustomContent: !!customSettings.content,
      hasCustomLayout: !!customSettings.layout,
      hasCustomAdvanced: !!customSettings.advanced,
      hasCustomClasses: !!customSettings.classes,
      hasHeaderModifications: !!customSettings.headerModifications,
      hasBodyModifications: !!customSettings.bodyModifications,
      hasRightSidebarModifications: !!customSettings.rightSidebarModifications
    });

    let result;

    if (existingUserTemplateData && existingUserTemplateData.length > 0) {
      // Update existing customized template
      console.log('🔄 Templates User API: Updating existing customized template');
      
      const { data: updateResult, error: updateError } = await supabase
        .from('templates')
        .update(templateData)
        .eq('id', existingUserTemplateData[0].id)
        .select()
        .limit(1);

      if (updateError) {
        console.error('❌ Templates User API: Update error:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update template' },
          { status: 500 }
        );
      }

      result = updateResult;
    } else {
      // Create new customized template
      console.log('🔄 Templates User API: Creating new customized template');
      
      const { data: insertResult, error: insertError } = await supabase
        .from('templates')
        .insert(templateData)
        .select()
        .limit(1);

      if (insertError) {
        console.error('❌ Templates User API: Insert error:', insertError);
        return NextResponse.json(
          { success: false, error: 'Failed to create template' },
          { status: 500 }
        );
      }

      result = insertResult;
    }

    const endTime = Date.now();
    console.log('✅ Templates User API: Template saved successfully in', endTime - startTime, 'ms:', {
      templateSlug,
      userId: user.id,
      templateId: result[0].id,
      isUpdate: existingUserTemplateData && existingUserTemplateData.length > 0
    });

    // Invalidate Redis cache for this user's template
    const cacheKey = `${templateSlug}:${user.id}`;
    try {
      await redisCache.delete(cacheKey);
      console.log('🗑️ Templates User API: Invalidated Redis cache for:', cacheKey);
    } catch (error) {
      console.error('❌ Templates User API: Error invalidating Redis cache:', error);
    }

    console.log('🔄 Templates User API: Sending response...');
    return NextResponse.json({
      success: true,
      data: {
        template: result[0],
        isUpdate: existingUserTemplateData && existingUserTemplateData.length > 0
      },
      message: 'Template saved successfully'
    });

  } catch (error) {
    console.error('Error saving template:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}