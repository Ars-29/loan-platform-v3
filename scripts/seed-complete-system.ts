#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';

// Import schema
import { templates } from '../src/lib/db/schema';

// Load environment variables
config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

// Template data matching your schema structure
const defaultTemplates = [
  {
    name: 'Blue Professional',
    slug: 'template1',
    description: 'Modern blue theme with clean design',
    previewImage: '/templates/template1-preview.png',
    isActive: true,
    isPremium: false,
    isDefault: true,
    userId: null, // Default templates have no user
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      background: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
    },
    typography: {
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
    content: {
      headline: 'Find the best loan for you',
      subheadline: 'Compare today\'s rates and apply directly with our loan officers',
      ctaText: 'Get rates',
      ctaSecondary: 'Learn more',
      companyName: 'LoanPro',
      tagline: 'Real-time demo',
    },
    layout: {
      alignment: 'center',
      spacing: 18,
      borderRadius: 8,
      padding: {
        small: 8,
        medium: 16,
        large: 24,
        xlarge: 32,
      },
    },
    advanced: {
      customCSS: '',
      accessibility: true,
    },
    classes: {
      button: {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-gray-300',
        outline: 'border-2 border-blue-200 hover:border-blue-300 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-all duration-200',
        ghost: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-all duration-200',
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
        base: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200',
        error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
        success: 'border-green-300 focus:ring-green-500 focus:border-green-500',
      },
      select: {
        base: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white',
      },
      status: {
        success: 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium',
        warning: 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium',
        error: 'bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium',
        info: 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium',
      },
      icon: {
        primary: 'w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4',
        secondary: 'w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3',
        small: 'w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center',
      },
      navigation: {
        container: 'flex flex-wrap gap-2 p-4',
        tab: {
          base: 'px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer',
          inactive: 'text-gray-600 hover:text-gray-800 hover:bg-gray-100',
          active: 'bg-blue-600 text-white shadow-md',
          hover: 'hover:bg-blue-50 hover:text-blue-700',
        },
      },
      hero: {
        background: 'bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900',
        overlay: 'bg-gradient-to-br from-blue-900/90 via-blue-800/90 to-indigo-900/90',
      },
      sidebar: {
        container: 'bg-white border-2 border-blue-200 rounded-lg p-6',
        logo: {
          background: 'bg-blue-600',
          text: 'text-white',
        },
      },
    },
    headerModifications: {
      officerName: 'John Smith',
      phone: '(555) 123-4567',
      email: 'john.smith@company.com',
      avatar: '/avatars/default.jpg',
      applyNowText: 'Apply Now',
      applyNowLink: '#apply',
    },
    bodyModifications: {
      enabledTabs: ['todays-rates', 'find-my-loan', 'get-custom-rate', 'calculators', 'about-us'],
      activeTab: 'todays-rates',
    },
    rightSidebarModifications: {
      companyName: 'Premier Mortgage Group',
      logo: '/logos/company-logo.png',
      phone: '(555) 123-4567',
      email: 'info@premiermortgage.com',
      address: '123 Main St, New York, NY 10001',
      facebook: 'https://facebook.com/company',
      twitter: 'https://twitter.com/company',
      linkedin: 'https://linkedin.com/company',
      instagram: 'https://instagram.com/company',
    },
  },
  {
    name: 'Purple Elegant',
    slug: 'template2',
    description: 'Elegant purple and red theme with professional look',
    previewImage: '/templates/template2-preview.png',
    isActive: true,
    isPremium: false,
    isDefault: true,
    userId: null,
    colors: {
      primary: '#9333ea',
      secondary: '#dc2626',
      background: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
    },
    typography: {
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
    content: {
      headline: 'Find the best loan for you',
      subheadline: 'Compare today\'s rates and apply directly with our loan officers',
      ctaText: 'Get rates',
      ctaSecondary: 'Learn more',
      companyName: 'LoanPro',
      tagline: 'Real-time demo',
    },
    layout: {
      alignment: 'center',
      spacing: 18,
      borderRadius: 8,
      padding: {
        small: 8,
        medium: 16,
        large: 24,
        xlarge: 32,
      },
    },
    advanced: {
      customCSS: '',
      accessibility: true,
    },
    classes: {
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
        background: 'bg-gradient-to-br from-purple-900 via-purple-800 to-violet-900',
        overlay: 'bg-gradient-to-br from-purple-900/90 via-purple-800/90 to-violet-900/90',
      },
      sidebar: {
        container: 'bg-white border-2 border-purple-200 rounded-lg p-6',
        logo: {
          background: 'bg-purple-600',
          text: 'text-white',
        },
      },
    },
    headerModifications: {
      officerName: 'Sarah Johnson',
      phone: '(555) 987-6543',
      email: 'sarah.johnson@company.com',
      avatar: '/avatars/default.jpg',
      applyNowText: 'Apply Now',
      applyNowLink: '#apply',
    },
    bodyModifications: {
      enabledTabs: ['todays-rates', 'find-my-loan', 'get-custom-rate', 'calculators', 'about-us'],
      activeTab: 'todays-rates',
    },
    rightSidebarModifications: {
      companyName: 'Elite Home Loans',
      logo: '/logos/company-logo.png',
      phone: '(555) 987-6543',
      email: 'info@elitehomeloans.com',
      address: '456 Oak Ave, Los Angeles, CA 90210',
      facebook: 'https://facebook.com/company',
      twitter: 'https://twitter.com/company',
      linkedin: 'https://linkedin.com/company',
      instagram: 'https://instagram.com/company',
    },
  },
];


async function seedTemplatesOnly() {
  try {
    console.log('🚀 Starting template seeding...');
    
    // Create default templates
    console.log('\n📝 Creating default templates...');
    const createdTemplates = [];
    
    for (const templateData of defaultTemplates) {
      // Check if template already exists
      const existingTemplate = await db
        .select()
        .from(templates)
        .where(eq(templates.slug, templateData.slug))
        .limit(1);

      if (existingTemplate.length > 0) {
        console.log(`⏭️ Template ${templateData.slug} already exists, skipping...`);
        createdTemplates.push(existingTemplate[0]);
        continue;
      }

      const [newTemplate] = await db
        .insert(templates)
        .values(templateData)
        .returning();

      createdTemplates.push(newTemplate);
      console.log(`✅ Created template: ${newTemplate.name} (${newTemplate.slug})`);
    }

    console.log('\n🎉 Template seeding finished successfully!');
    console.log('\n📋 Summary:');
    console.log(`✅ Templates created: ${createdTemplates.length}`);
    console.log('\n📝 Available Templates:');
    createdTemplates.forEach(template => {
      console.log(`- ${template.name} (${template.slug}) - ${template.description}`);
    });
    
    console.log('\n💡 Next Steps:');
    console.log('1. Create companies and officers through the app');
    console.log('2. Templates will be available for customization');
    console.log('3. Each officer can customize their own template');

  } catch (error) {
    console.error('❌ Error in template seeding:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the script
if (require.main === module) {
  seedTemplatesOnly()
    .then(() => {
      console.log('✅ Template seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Template seeding failed:', error);
      process.exit(1);
    });
}

export { seedTemplatesOnly };
