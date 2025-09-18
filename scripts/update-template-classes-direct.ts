#!/usr/bin/env tsx

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables first
config({ path: '.env.local' });

// Get the classes data from theme
const template1Classes = {
  button: {
    primary: 'bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-gray-300',
    outline: 'border-2 border-pink-200 hover:border-pink-300 text-pink-600 hover:text-pink-700 hover:bg-pink-50 px-6 py-3 rounded-lg font-medium transition-all duration-200',
    ghost: 'text-pink-600 hover:text-pink-700 hover:bg-pink-50 px-4 py-2 rounded-lg font-medium transition-all duration-200',
  },
  card: {
    container: 'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200',
    header: 'px-6 py-4 border-b border-gray-200',
    body: 'px-6 py-4',
    footer: 'px-6 py-4 border-t border-gray-200 bg-gray-50',
  },
  heading: {
    h1: 'text-3xl font-bold text-gray-900 mb-4',
    h2: 'text-2xl font-bold text-gray-900 mb-3',
    h3: 'text-xl font-semibold text-gray-900 mb-2',
    h4: 'text-lg font-semibold text-gray-900 mb-2',
    h5: 'text-base font-semibold text-gray-900 mb-2',
    h6: 'text-sm font-semibold text-gray-900 mb-1',
  },
  body: {
    large: 'text-lg text-gray-700 leading-relaxed',
    base: 'text-base text-gray-700 leading-relaxed',
    small: 'text-sm text-gray-600 leading-relaxed',
    xs: 'text-xs text-gray-500 leading-normal',
  },
  input: {
    base: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200',
    error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
    success: 'border-green-300 focus:ring-green-500 focus:border-green-500',
  },
  select: {
    base: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-white',
  },
  status: {
    success: 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium',
    warning: 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium',
    error: 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium',
    info: 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium',
  },
  icon: {
    primary: 'w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4',
    secondary: 'w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3',
    small: 'w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center',
  },
  navigation: {
    container: 'flex flex-wrap gap-2 p-4',
    tab: {
      base: 'px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer',
      inactive: 'text-gray-600 hover:text-gray-800 hover:bg-gray-100',
      active: 'bg-pink-600 text-white shadow-md',
      hover: 'hover:bg-pink-50 hover:text-pink-700',
    },
  },
  hero: {
    background: 'bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900',
    overlay: 'bg-gradient-to-br from-blue-900/90 via-blue-800/90 to-indigo-900/90',
  },
  sidebar: {
    container: 'bg-white border-2 border-pink-200 rounded-lg p-6',
    logo: {
      background: 'bg-pink-600',
      text: 'text-white',
    },
  },
};

const template2Classes = {
  button: {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-gray-300',
    outline: 'border-2 border-purple-200 hover:border-purple-300 text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-6 py-3 rounded-lg font-medium transition-all duration-200',
    ghost: 'text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-4 py-2 rounded-lg font-medium transition-all duration-200',
  },
  card: {
    container: 'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200',
    header: 'px-6 py-4 border-b border-gray-200',
    body: 'px-6 py-4',
    footer: 'px-6 py-4 border-t border-gray-200 bg-gray-50',
  },
  heading: {
    h1: 'text-3xl font-bold text-gray-900 mb-4',
    h2: 'text-2xl font-bold text-gray-900 mb-3',
    h3: 'text-xl font-semibold text-gray-900 mb-2',
    h4: 'text-lg font-semibold text-gray-900 mb-2',
    h5: 'text-base font-semibold text-gray-900 mb-2',
    h6: 'text-sm font-semibold text-gray-900 mb-1',
  },
  body: {
    large: 'text-lg text-gray-700 leading-relaxed',
    base: 'text-base text-gray-700 leading-relaxed',
    small: 'text-sm text-gray-600 leading-relaxed',
    xs: 'text-xs text-gray-500 leading-normal',
  },
  input: {
    base: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200',
    error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
    success: 'border-green-300 focus:ring-green-500 focus:border-green-500',
  },
  select: {
    base: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white',
  },
  status: {
    success: 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium',
    warning: 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium',
    error: 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium',
    info: 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium',
  },
  icon: {
    primary: 'w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4',
    secondary: 'w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3',
    small: 'w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center',
  },
  navigation: {
    container: 'flex flex-wrap gap-2 p-4',
    tab: {
      base: 'px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer',
      inactive: 'text-gray-600 hover:text-gray-800 hover:bg-gray-100',
      active: 'bg-purple-600 text-white shadow-md',
      hover: 'hover:bg-purple-50 hover:text-purple-700',
    },
  },
  hero: {
    background: 'bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900',
    overlay: 'bg-gradient-to-br from-purple-900/90 via-purple-800/90 to-indigo-900/90',
  },
  sidebar: {
    container: 'bg-white border-2 border-purple-200 rounded-lg p-6',
    logo: {
      background: 'bg-purple-600',
      text: 'text-white',
    },
  },
};

async function updateTemplateClasses() {
  console.log('🚀 Starting template classes update...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Update template1 with proper classes
    console.log('📝 Updating template1 classes...');
    const { error: error1 } = await supabase
      .from('templates')
      .update({ classes: template1Classes })
      .eq('slug', 'template1')
      .eq('is_default', true);

    if (error1) {
      console.error('❌ Error updating template1:', error1);
    } else {
      console.log('✅ Updated template1 classes');
    }

    // Update template2 with proper classes
    console.log('📝 Updating template2 classes...');
    const { error: error2 } = await supabase
      .from('templates')
      .update({ classes: template2Classes })
      .eq('slug', 'template2')
      .eq('is_default', true);

    if (error2) {
      console.error('❌ Error updating template2:', error2);
    } else {
      console.log('✅ Updated template2 classes');
    }

    // Also update user templates
    console.log('📝 Updating user template1 classes...');
    const { error: error3 } = await supabase
      .from('templates')
      .update({ classes: template1Classes })
      .eq('slug', 'template1')
      .eq('is_default', false);

    if (error3) {
      console.error('❌ Error updating user template1:', error3);
    } else {
      console.log('✅ Updated user template1 classes');
    }

    console.log('📝 Updating user template2 classes...');
    const { error: error4 } = await supabase
      .from('templates')
      .update({ classes: template2Classes })
      .eq('slug', 'template2')
      .eq('is_default', false);

    if (error4) {
      console.error('❌ Error updating user template2:', error4);
    } else {
      console.log('✅ Updated user template2 classes');
    }

    console.log('🎉 All template classes updated successfully!');

    // Verify the updates
    console.log('🔍 Verifying updates...');
    const { data: templates, error: verifyError } = await supabase
      .from('templates')
      .select('slug, is_default, classes')
      .in('slug', ['template1', 'template2']);

    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError);
    } else {
      for (const template of templates || []) {
        console.log(`✅ ${template.slug} (${template.is_default ? 'default' : 'user'}):`, {
          hasClasses: !!template.classes,
          classesKeys: template.classes ? Object.keys(template.classes) : [],
        });
      }
    }

  } catch (error) {
    console.error('❌ Error updating template classes:', error);
    process.exit(1);
  }
}

// Run the script
updateTemplateClasses();










