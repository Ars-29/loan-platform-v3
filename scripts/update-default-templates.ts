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

async function updateDefaultTemplates() {
  try {
    console.log('🚀 Updating existing templates to be default templates...');

    // Update template1 to be a default template
    const { data: result1, error: error1 } = await supabase
      .from('templates')
      .update({
        is_default: true,
        user_id: null,
        name: 'Red Theme',
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
      })
      .eq('slug', 'template1')
      .select();

    if (error1) {
      console.error('❌ Error updating template1:', error1);
    } else {
      console.log('✅ Updated template1:', result1[0].id);
    }

    // Update template2 to be a default template
    const { data: result2, error: error2 } = await supabase
      .from('templates')
      .update({
        is_default: true,
        user_id: null,
        name: 'Purple Theme',
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
      })
      .eq('slug', 'template2')
      .select();

    if (error2) {
      console.error('❌ Error updating template2:', error2);
    } else {
      console.log('✅ Updated template2:', result2[0].id);
    }

    console.log('🎉 Default templates update completed!');

  } catch (error) {
    console.error('❌ Error updating default templates:', error);
  }
}

// Run the script
updateDefaultTemplates();
