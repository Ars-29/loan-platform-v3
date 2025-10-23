#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';

// Import schema
import { users } from '../src/lib/db/schema';

// Load environment variables
config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL!;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const client = postgres(connectionString);
const db = drizzle(client);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSupabaseAuthUser(email: string, password: string, userData: any) {
  try {
    console.log(`🔐 Creating Supabase Auth user: ${email}`);
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        role: userData.role,
      },
    });

    if (authError) {
      console.error(`❌ Error creating auth user ${email}:`, authError);
      return null;
    }

    if (!authData.user) {
      console.error(`❌ No user data returned for ${email}`);
      return null;
    }

    console.log(`✅ Created Supabase Auth user: ${email} (ID: ${authData.user.id})`);
    return authData.user.id;
  } catch (error) {
    console.error(`❌ Error creating auth user ${email}:`, error);
    return null;
  }
}

async function seedSuperAdmin() {
  try {
    console.log('🚀 Starting Super Admin seeding...');
    
    const superAdminEmail = 'admin@loanplatform.com';
    const superAdminPassword = 'password123';
    
    // Check if super admin already exists
    console.log('🔍 Checking if super admin already exists...');
    const existingSuperAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, superAdminEmail))
      .limit(1);

    if (existingSuperAdmin.length > 0) {
      console.log('✅ Super admin already exists:', existingSuperAdmin[0].email);
      console.log('🆔 User ID:', existingSuperAdmin[0].id);
      console.log('👤 Name:', `${existingSuperAdmin[0].firstName} ${existingSuperAdmin[0].lastName}`);
      console.log('🔑 Role:', existingSuperAdmin[0].role);
      console.log('\n🎉 Super admin is ready to use!');
      console.log('\n📋 Login Credentials:');
      console.log(`📧 Email: ${superAdminEmail}`);
      console.log(`🔑 Password: ${superAdminPassword}`);
      return;
    }

    console.log('👤 Creating new super admin...');

    // Create Supabase Auth user
    const authUserId = await createSupabaseAuthUser(superAdminEmail, superAdminPassword, {
      firstName: 'Super',
      lastName: 'Admin',
      phone: '(555) 000-0000',
      role: 'super_admin',
    });
    
    if (!authUserId) {
      console.log('❌ Failed to create Supabase Auth user');
      return;
    }

    // Create database user with auth ID
    const [newSuperAdmin] = await db
      .insert(users)
      .values({
        id: authUserId,
        email: superAdminEmail,
        firstName: 'Super',
        lastName: 'Admin',
        phone: '(555) 000-0000',
        role: 'super_admin',
        isActive: true,
        inviteStatus: 'accepted',
      })
      .returning();

    console.log('✅ Super admin created successfully!');
    console.log('📧 Email:', newSuperAdmin.email);
    console.log('🆔 ID:', newSuperAdmin.id);
    console.log('👤 Name:', `${newSuperAdmin.firstName} ${newSuperAdmin.lastName}`);
    console.log('🔑 Role:', newSuperAdmin.role);
    console.log('✅ Status:', newSuperAdmin.isActive ? 'Active' : 'Inactive');

    console.log('\n🎉 Super Admin seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log(`📧 Email: ${superAdminEmail}`);
    console.log(`🔑 Password: ${superAdminPassword}`);
    console.log('\n🌐 Access URLs:');
    console.log('- Login: http://localhost:3000/auth');
    console.log('- Dashboard: http://localhost:3000/super-admin/dashboard');
    console.log('- Companies: http://localhost:3000/super-admin/companies');
    console.log('- Officers: http://localhost:3000/super-admin/officers');

  } catch (error) {
    console.error('❌ Error in super admin seeding:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the script
if (require.main === module) {
  seedSuperAdmin()
    .then(() => {
      console.log('✅ Super admin seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Super admin seeding failed:', error);
      process.exit(1);
    });
}

export { seedSuperAdmin };
