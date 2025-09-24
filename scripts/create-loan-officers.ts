import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = postgres(connectionString);
const db = drizzle(sql);

async function createLoanOfficers() {
  try {
    console.log('🚀 Creating additional loan officers for the company...');

    // First, get the company that hospisynai@gmail.com belongs to
    const companyResult = await sql`
      SELECT c.id as company_id, c.name as company_name
      FROM companies c
      JOIN user_companies uc ON c.id = uc.company_id
      JOIN users u ON uc.user_id = u.id
      WHERE u.email = 'hospisynai@gmail.com'
    `;

    if (companyResult.length === 0) {
      console.log('❌ Company not found for hospisynai@gmail.com');
      return;
    }

    const { company_id, company_name } = companyResult[0];
    console.log(`📊 Using company: ${company_name} (${company_id})`);

    // Create additional loan officers
    const officers = [
      {
        email: 'sarah.johnson@bestcompany.com',
        first_name: 'Sarah',
        last_name: 'Johnson',
        phone: '(555) 201-3001',
        role: 'employee',
        is_active: true,
      },
      {
        email: 'michael.brown@bestcompany.com',
        first_name: 'Michael',
        last_name: 'Brown',
        phone: '(555) 202-3002',
        role: 'employee',
        is_active: true,
      },
      {
        email: 'emily.davis@bestcompany.com',
        first_name: 'Emily',
        last_name: 'Davis',
        phone: '(555) 203-3003',
        role: 'employee',
        is_active: true,
      },
      {
        email: 'david.wilson@bestcompany.com',
        first_name: 'David',
        last_name: 'Wilson',
        phone: '(555) 204-3004',
        role: 'employee',
        is_active: true,
      },
      {
        email: 'lisa.anderson@bestcompany.com',
        first_name: 'Lisa',
        last_name: 'Anderson',
        phone: '(555) 205-3005',
        role: 'employee',
        is_active: true,
      },
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const officer of officers) {
      try {
        // Check if officer already exists
        const existingOfficer = await sql`
          SELECT id FROM users WHERE email = ${officer.email}
        `;

        if (existingOfficer.length > 0) {
          console.log(`⚠️ Officer already exists: ${officer.email}`);
          continue;
        }

        // Create the user
        const newUser = await sql`
          INSERT INTO users (
            id, email, first_name, last_name, phone, role, is_active, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), ${officer.email}, ${officer.first_name}, ${officer.last_name}, 
            ${officer.phone}, ${officer.role}, ${officer.is_active}, NOW(), NOW()
          ) RETURNING id
        `;

        if (!newUser || newUser.length === 0) {
          throw new Error('Failed to create user');
        }

        const userId = newUser[0].id;

        // Add user to company
        const companyAssociation = await sql`
          INSERT INTO user_companies (
            id, user_id, company_id, role, is_active, joined_at
          ) VALUES (
            gen_random_uuid(), ${userId}, ${company_id}, 'employee', true, NOW()
          ) RETURNING id
        `;

        if (!companyAssociation || companyAssociation.length === 0) {
          throw new Error('Failed to associate user with company');
        }

        console.log(`✅ Created officer: ${officer.first_name} ${officer.last_name} (${officer.email})`);
        successCount++;
      } catch (error) {
        console.log(`❌ Failed to create officer: ${officer.email} - ${error instanceof Error ? error.message : 'Unknown error'}`);
        errorCount++;
      }
    }

    console.log('');
    console.log('🎉 Loan officer creation completed!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`  ✅ Successfully created: ${successCount} officers`);
    console.log(`  ❌ Failed to create: ${errorCount} officers`);
    console.log(`  🏢 Company: ${company_name}`);
    console.log('');
    console.log('🔄 Next steps:');
    console.log('  1. Visit the loan officers page to see all officers');
    console.log('  2. Click "View Leads" for each officer to see their leads');
    console.log('  3. Test the hierarchical navigation system');
    console.log('  4. Create leads for the new officers using the existing script');

  } catch (error) {
    console.error('❌ Failed to create loan officers:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run the script
createLoanOfficers();
