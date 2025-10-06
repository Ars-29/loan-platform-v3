import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { companies, users, userCompanies, leads } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Database connection
const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(connectionString);
const db = drizzle(client);

// Supabase client for auth
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample companies data (simplified)
const companiesData = [
  {
    name: 'Premier Mortgage Group',
    slug: `premier-mortgage-group-${Date.now()}`,
    website: 'https://premiermortgage.com',
    phone: '(555) 100-0001',
    email: 'info@premiermortgage.com',
    adminEmail: 'admin@premiermortgage.com',
    isActive: true,
    companyApprovalStatus: 'approved'
  },
  {
    name: 'Elite Home Loans',
    slug: `elite-home-loans-${Date.now()}`,
    website: 'https://elitehomeloans.com',
    phone: '(555) 200-0002',
    email: 'info@elitehomeloans.com',
    adminEmail: 'admin@elitehomeloans.com',
    isActive: true,
    companyApprovalStatus: 'approved'
  },
  {
    name: 'Metro Lending Solutions',
    slug: `metro-lending-solutions-${Date.now()}`,
    website: 'https://metrolending.com',
    phone: '(555) 300-0003',
    email: 'info@metrolending.com',
    adminEmail: 'admin@metrolending.com',
    isActive: true,
    companyApprovalStatus: 'approved'
  }
];

// Company admins data (one per company)
const companyAdminsData = [
  { firstName: 'Robert', lastName: 'Johnson', email: 'admin@premiermortgage.com', phone: '(555) 100-0001' },
  { firstName: 'Maria', lastName: 'Garcia', email: 'admin@elitehomeloans.com', phone: '(555) 200-0002' },
  { firstName: 'James', lastName: 'Smith', email: 'admin@metrolending.com', phone: '(555) 300-0003' }
];

// Loan officers data (3 per company)
const loanOfficersData = [
  // Premier Mortgage Group officers
  [
    { firstName: 'James', lastName: 'Wilson', email: 'james.wilson@premiermortgage.com', nmlsNumber: '1234567' },
    { firstName: 'Sarah', lastName: 'Martinez', email: 'sarah.martinez@premiermortgage.com', nmlsNumber: '1234568' },
    { firstName: 'David', lastName: 'Thompson', email: 'david.thompson@premiermortgage.com', nmlsNumber: '1234569' }
  ],
  // Elite Home Loans officers
  [
    { firstName: 'Jennifer', lastName: 'Anderson', email: 'jennifer.anderson@elitehomeloans.com', nmlsNumber: '2345671' },
    { firstName: 'Michael', lastName: 'Garcia', email: 'michael.garcia@elitehomeloans.com', nmlsNumber: '2345672' },
    { firstName: 'Lisa', lastName: 'Rodriguez', email: 'lisa.rodriguez@elitehomeloans.com', nmlsNumber: '2345673' }
  ],
  // Metro Lending Solutions officers
  [
    { firstName: 'Robert', lastName: 'Lee', email: 'robert.lee@metrolending.com', nmlsNumber: '3456781' },
    { firstName: 'Amanda', lastName: 'White', email: 'amanda.white@metrolending.com', nmlsNumber: '3456782' },
    { firstName: 'Christopher', lastName: 'Harris', email: 'christopher.harris@metrolending.com', nmlsNumber: '3456783' }
  ]
];

// Sample leads data generator
const generateLeadsForOfficer = (officerId: string, companyId: string, officerName: string) => {
  const leadCount = Math.floor(Math.random() * 15) + 10; // 10-24 leads per officer
  const leads = [];
  
  const firstNames = ['Alex', 'Taylor', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage', 'Blake'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const sources = ['landing_page', 'rate_table', 'referral', 'social_media', 'advertising'];
  const statuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
  const stages = ['lead', 'application', 'underwriting', 'approval', 'closing'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  
  for (let i = 0; i < leadCount; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const stage = stages[Math.floor(Math.random() * stages.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90)); // Random date within last 90 days
    
    const loanAmount = Math.floor(Math.random() * 800000) + 200000; // $200k - $1M
    const downPayment = Math.floor(loanAmount * (0.05 + Math.random() * 0.15)); // 5-20% down payment
    const creditScore = Math.floor(Math.random() * 200) + 500; // 500-700
    
    const lead: any = {
      companyId,
      officerId,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      phone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      source,
      status,
      conversionStage: stage,
      priority,
      loanAmount: loanAmount.toString(),
      downPayment: downPayment.toString(),
      creditScore,
      loanDetails: {
        loanType: ['purchase', 'refinance', 'cash_out'][Math.floor(Math.random() * 3)],
        loanTerm: [15, 20, 30][Math.floor(Math.random() * 3)],
        interestRate: (3.5 + Math.random() * 2).toFixed(3)
      },
      propertyDetails: {
        address: `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Pine', 'Cedar', 'Elm'][Math.floor(Math.random() * 5)]} St`,
        city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
        state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        propertyType: ['single_family', 'condo', 'townhouse'][Math.floor(Math.random() * 3)]
      },
      notes: `Lead generated for ${officerName} - ${source} source. ${priority} priority.`,
      tags: [priority, source],
      leadQualityScore: Math.floor(Math.random() * 5) + 6, // 6-10 quality score
      responseTimeHours: Math.floor(Math.random() * 24) + 1, // 1-24 hours response time
      contactCount: Math.floor(Math.random() * 5), // 0-4 contacts
      createdAt: createdDate,
      updatedAt: createdDate
    };
    
    // Add conversion data for converted leads
    if (status === 'converted' && stage === 'closing') {
      lead.conversionDate = new Date(createdDate.getTime() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
      lead.closingDate = lead.conversionDate;
      lead.loanAmountClosed = loanAmount.toString();
      lead.commissionEarned = (loanAmount * 0.01).toString(); // 1% commission
    }
    
    leads.push(lead);
  }
  
  return leads;
};

// Create Supabase auth user
async function createAuthUser(email: string, password: string, userData: any) {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        nmls_number: userData.nmlsNumber
      }
    });

    if (error) {
      console.error(`❌ Error creating auth user for ${email}:`, error.message);
      return null;
    }

    console.log(`✅ Created auth user: ${email} (ID: ${data.user.id})`);
    return data.user;
  } catch (error) {
    console.error(`❌ Error creating auth user for ${email}:`, error);
    return null;
  }
}

async function createSampleDataWithAuth() {
  try {
    console.log('🚀 Starting sample data creation with auth users...');
    
    const createdCompanies = [];
    const createdAdmins = [];
    const createdOfficers = [];
    const createdLeads = [];
    const authUsers = [];
    
    // Create companies and their users
    for (let i = 0; i < companiesData.length; i++) {
      const companyData = companiesData[i];
      console.log(`\n📊 Creating company: ${companyData.name}`);
      
      const [company] = await db.insert(companies).values(companyData).returning();
      createdCompanies.push(company);
      console.log(`✅ Created company: ${company.name} (ID: ${company.id})`);
      
      // Create company admin
      const adminData = companyAdminsData[i];
      console.log(`👑 Creating company admin: ${adminData.firstName} ${adminData.lastName}`);
      
      // Create auth user for admin
      const adminAuthUser = await createAuthUser(adminData.email, 'password123', adminData);
      if (!adminAuthUser) {
        console.log(`⚠️ Skipping admin ${adminData.email} due to auth creation failure`);
        continue;
      }
      
      const [admin] = await db.insert(users).values({
        id: adminAuthUser.id, // Use auth user ID
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        email: adminData.email,
        phone: adminData.phone,
        role: 'company_admin',
        isActive: true,
        inviteStatus: 'accepted',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      // Associate admin with company
      await db.insert(userCompanies).values({
        userId: admin.id,
        companyId: company.id,
        role: 'admin',
        isActive: true,
        joinedAt: new Date()
      });
      
      // Update company with admin info
      await db.update(companies)
        .set({ 
          adminUserId: admin.id,
          adminEmailVerified: true,
          inviteStatus: 'accepted'
        })
        .where(eq(companies.id, company.id));
      
      createdAdmins.push(admin);
      authUsers.push(adminAuthUser);
      console.log(`✅ Created admin: ${admin.firstName} ${admin.lastName} (ID: ${admin.id})`);
      
      // Create loan officers for this company
      const officersForCompany = loanOfficersData[i];
      
      for (const officerData of officersForCompany) {
        console.log(`👤 Creating loan officer: ${officerData.firstName} ${officerData.lastName}`);
        
        // Create auth user for officer
        const officerAuthUser = await createAuthUser(officerData.email, 'password123', officerData);
        if (!officerAuthUser) {
          console.log(`⚠️ Skipping officer ${officerData.email} due to auth creation failure`);
          continue;
        }
        
        const [user] = await db.insert(users).values({
          id: officerAuthUser.id, // Use auth user ID
          firstName: officerData.firstName,
          lastName: officerData.lastName,
          email: officerData.email,
          nmlsNumber: officerData.nmlsNumber,
          role: 'employee',
          isActive: true,
          inviteStatus: 'accepted',
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        
        // Associate user with company
        await db.insert(userCompanies).values({
          userId: user.id,
          companyId: company.id,
          role: 'employee',
          isActive: true,
          joinedAt: new Date()
        });
        
        createdOfficers.push(user);
        authUsers.push(officerAuthUser);
        console.log(`✅ Created officer: ${user.firstName} ${user.lastName} (ID: ${user.id})`);
        
        // Generate leads for this officer
        const officerLeads = generateLeadsForOfficer(
          user.id, 
          company.id, 
          `${user.firstName} ${user.lastName}`
        );
        
        console.log(`📝 Generating ${officerLeads.length} leads for ${user.firstName} ${user.lastName}`);
        
        for (const leadData of officerLeads) {
          const [lead] = await db.insert(leads).values(leadData).returning();
          createdLeads.push(lead);
        }
        
        console.log(`✅ Created ${officerLeads.length} leads for ${user.firstName} ${user.lastName}`);
      }
    }
    
    // Summary
    console.log('\n🎉 Sample data creation with auth completed successfully!');
    console.log(`📊 Companies created: ${createdCompanies.length}`);
    console.log(`👑 Company admins created: ${createdAdmins.length}`);
    console.log(`👤 Loan officers created: ${createdOfficers.length}`);
    console.log(`📝 Leads created: ${createdLeads.length}`);
    console.log(`🔐 Auth users created: ${authUsers.length}`);
    
    console.log('\n📋 Company Summary:');
    for (let i = 0; i < createdCompanies.length; i++) {
      const company = createdCompanies[i];
      const officersCount = loanOfficersData[i].length;
      const leadsCount = createdLeads.filter(lead => lead.companyId === company.id).length;
      console.log(`  • ${company.name}: 1 admin, ${officersCount} officers, ${leadsCount} leads`);
    }
    
    console.log('\n🔐 Login Credentials (all users have password: password123):');
    console.log('Company Admins:');
    for (let i = 0; i < createdAdmins.length; i++) {
      console.log(`  • ${createdAdmins[i].email} (${companiesData[i].name})`);
    }
    console.log('\nLoan Officers:');
    for (let i = 0; i < Math.min(3, createdOfficers.length); i++) {
      console.log(`  • ${createdOfficers[i].email} (${createdOfficers[i].firstName} ${createdOfficers[i].lastName})`);
    }
    
    console.log('\n🔗 You can now test the system:');
    console.log('  • Super Admin: /super-admin/dashboard');
    console.log('  • Company Admin: /admin/dashboard (use any admin email)');
    console.log('  • Loan Officer: /officers/dashboard (use any officer email)');
    
  } catch (error) {
    console.error('❌ Error creating sample data with auth:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the script
createSampleDataWithAuth()
  .then(() => {
    console.log('✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

