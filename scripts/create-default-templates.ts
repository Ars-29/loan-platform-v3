import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createDefaultTemplates() {
  try {
    console.log('🚀 Creating default templates...');

    // Template 1 - Red Theme
    const template1 = {
      name: 'Red Theme',
      slug: 'template1',
      description: 'Modern red-themed template with clean design',
      preview_image: null,
      is_active: true,
      is_premium: false,
      is_default: true,
      user_id: null,
      colors: {
        primary: '#ec4899',
        secondary: '#3b82f6',
        background: '#ffffff',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb'
      },
      typography: {
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        }
      },
      content: {
        headline: 'Welcome to Our Service',
        subheadline: 'Get started with our amazing platform today.',
        ctaText: 'Get Started',
        ctaSecondary: 'Learn More',
        companyName: 'Your Company',
        tagline: 'Your trusted partner'
      },
      layout: {
        alignment: 'center',
        spacing: 16,
        borderRadius: 8,
        padding: 24
      },
      advanced: {
        customCSS: '',
        accessibility: true
      },
      classes: {}
    };

    // Template 2 - Purple Theme
    const template2 = {
      name: 'Purple Theme',
      slug: 'template2',
      description: 'Elegant purple-themed template with professional look',
      preview_image: null,
      is_active: true,
      is_premium: false,
      is_default: true,
      user_id: null,
      colors: {
        primary: '#9333ea',
        secondary: '#06b6d4',
        background: '#ffffff',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb'
      },
      typography: {
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        }
      },
      content: {
        headline: 'Welcome to Our Service',
        subheadline: 'Get started with our amazing platform today.',
        ctaText: 'Get Started',
        ctaSecondary: 'Learn More',
        companyName: 'Your Company',
        tagline: 'Your trusted partner'
      },
      layout: {
        alignment: 'center',
        spacing: 16,
        borderRadius: 8,
        padding: 24
      },
      advanced: {
        customCSS: '',
        accessibility: true
      },
      classes: {}
    };

    // Check if templates already exist
    const { data: existingTemplates } = await supabase
      .from('templates')
      .select('slug')
      .eq('is_default', true)
      .is('user_id', null);

    const existingSlugs = existingTemplates?.map(t => t.slug) || [];

    // Insert template1 if it doesn't exist
    if (!existingSlugs.includes('template1')) {
      const { data: result1, error: error1 } = await supabase
        .from('templates')
        .insert(template1)
        .select();

      if (error1) {
        console.error('❌ Error creating template1:', error1);
      } else {
        console.log('✅ Created template1:', result1[0].id);
      }
    } else {
      console.log('⚠️ template1 already exists, skipping...');
    }

    // Insert template2 if it doesn't exist
    if (!existingSlugs.includes('template2')) {
      const { data: result2, error: error2 } = await supabase
        .from('templates')
        .insert(template2)
        .select();

      if (error2) {
        console.error('❌ Error creating template2:', error2);
      } else {
        console.log('✅ Created template2:', result2[0].id);
      }
    } else {
      console.log('⚠️ template2 already exists, skipping...');
    }

    console.log('🎉 Default templates creation completed!');

  } catch (error) {
    console.error('❌ Error creating default templates:', error);
  }
}

// Run the script
createDefaultTemplates();
