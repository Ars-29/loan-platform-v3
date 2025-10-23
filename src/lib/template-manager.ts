import { createClient } from '@supabase/supabase-js';

// Define template type for better type safety
interface Template {
  id: string;
  name: string;
  slug: string;
  description: string;
  preview_image: string;
  is_active: boolean;
  is_premium: boolean;
  is_default: boolean;
  user_id: string | null;
  colors: any;
  typography: any;
  content: any;
  layout: any;
  advanced: any;
  classes: any;
  layout_config?: any; // Layout configuration for different template layouts
  created_at: string;
  updated_at: string;
}

// Initialize Supabase client - will be created when needed
let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing required environment variables');
      throw new Error('Missing required environment variables');
    }

    supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabase;
}

/**
 * Creates personalized template rows for a loan officer
 * @param userId - The user ID of the loan officer
 * @param firstName - First name for template naming
 * @param lastName - Last name for template naming
 */
export async function createPersonalTemplatesForUser(
  userId: string, 
  firstName?: string, 
  lastName?: string
): Promise<Template[]> {
  try {
    console.log('🎨 Creating personal templates for user:', userId);
    
    // Validate userId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new Error(`Invalid user ID format: ${userId}. Expected valid UUID.`);
    }

    // Get default templates to use as base
    const { data: defaultTemplates, error: defaultError } = await getSupabaseClient()
      .from('templates')
      .select('*')
      .eq('is_default', true)
      .is('user_id', null)
      .eq('is_active', true) as { data: Template[] | null; error: any };

    if (defaultError) {
      console.error('❌ Error fetching default templates:', defaultError);
      throw defaultError;
    }

    if (!defaultTemplates || defaultTemplates.length === 0) {
      console.error('❌ No default templates found');
      throw new Error('No default templates found');
    }

    const userName = firstName && lastName ? `${firstName} ${lastName}` : 'User';
    const templatesCreated: Template[] = [];

    // Create personal copies of each default template
    for (const defaultTemplate of defaultTemplates) {
      // Check if user already has this template
      const { data: existingTemplate } = await getSupabaseClient()
        .from('templates')
        .select('id')
        .eq('slug', defaultTemplate.slug)
        .eq('user_id', userId)
        .eq('is_default', false)
        .limit(1) as { data: { id: string }[] | null; error: any };

      if (existingTemplate && existingTemplate.length > 0) {
        console.log(`⚠️ User already has ${defaultTemplate.slug}, skipping...`);
        continue;
      }

      // Create personal template
      const personalTemplate: Omit<Template, 'id' | 'created_at' | 'updated_at'> = {
        name: `${defaultTemplate.name} - ${userName}`,
        slug: defaultTemplate.slug,
        description: `${defaultTemplate.description} (Personalized for ${userName})`,
        preview_image: defaultTemplate.preview_image,
        is_active: true,
        is_premium: defaultTemplate.is_premium,
        is_default: false,
        user_id: userId,
        colors: defaultTemplate.colors,
        typography: defaultTemplate.typography,
        content: defaultTemplate.content,
        layout: defaultTemplate.layout,
        advanced: defaultTemplate.advanced,
        classes: defaultTemplate.classes
      };

      const { data: createdTemplate, error: createError } = await getSupabaseClient()
        .from('templates')
        .insert(personalTemplate as any)
        .select() as { data: Template[] | null; error: any };

      if (createError) {
        console.error(`❌ Error creating ${defaultTemplate.slug} for user:`, createError);
        throw createError;
      }

      if (createdTemplate && createdTemplate.length > 0) {
        templatesCreated.push(createdTemplate[0]);
        console.log(`✅ Created ${defaultTemplate.slug} for user ${userId}`);
      }
    }

    console.log(`🎉 Successfully created ${templatesCreated.length} personal templates for user ${userId}`);
    return templatesCreated;

  } catch (error) {
    console.error('❌ Error creating personal templates:', error);
    throw error;
  }
}

// Export for use in other files
export default createPersonalTemplatesForUser;