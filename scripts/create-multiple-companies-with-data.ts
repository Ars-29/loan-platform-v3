import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { companies, users, userCompanies, leads } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Database connection
const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(connectionString);
const db = drizzle(client);

// Generate unique slugs with timestamp
const timestamp = Date.now();
const companiesData = [
  {
    name: 'Premier Mortgage Group',
    slug: `premier-mortgage-group-${timestamp}`,
    website: 'https://premiermortgage.com',
    phone: '(555) 100-0001',
    address: '123 Financial District, New York, NY 10001'
  },
  {
    name: 'Elite Home Loans',
    slug: `elite-home-loans-${timestamp}`,
    website: 'https://elitehomeloans.com',
    phone: '(555) 200-0002',
    address: '456 Banking Blvd, Los Angeles, CA 90210'
  },
  {
    name: 'Metro Lending Solutions',
    slug: `metro-lending-solutions-${timestamp}`,
    website: 'https://metrolending.com',
    phone: '(555) 300-0003',
    address: '789 City Center, Chicago, IL 60601'
  },
  {
    name: 'Coastal Financial Partners',
    slug: `coastal-financial-partners-${timestamp}`,
    website: 'https://coastalfinancial.com',
    phone: '(555) 400-0004',
    address: '321 Ocean Drive, Miami, FL 33101'
  },
  {
    name: 'Mountain Peak Lending',
    slug: `mountain-peak-lending-${timestamp}`,
    website: 'https://mountainpeaklending.com',
    phone: '(555) 500-0005',
    address: '654 Summit Ave, Denver, CO 80202'
  }
];

// Sample loan officers data
const loanOfficersData = [
  // Premier Mortgage Group officers
  [
    { firstName: 'James', lastName: 'Wilson', email: 'james.wilson@premiermortgage.com' },
    { firstName: 'Sarah', lastName: 'Martinez', email: 'sarah.martinez@premiermortgage.com' },
    { firstName: 'David', lastName: 'Thompson', email: 'david.thompson@premiermortgage.com' }
  ],
  // Elite Home Loans officers
  [
    { firstName: 'Jennifer', lastName: 'Anderson', email: 'jennifer.anderson@elitehomeloans.com' },
    { firstName: 'Michael', lastName: 'Garcia', email: 'michael.garcia@elitehomeloans.com' },
    { firstName: 'Lisa', lastName: 'Rodriguez', email: 'lisa.rodriguez@elitehomeloans.com' }
  ],
  // Metro Lending Solutions officers
  [
    { firstName: 'Robert', lastName: 'Lee', email: 'robert.lee@metrolending.com' },
    { firstName: 'Amanda', lastName: 'White', email: 'amanda.white@metrolending.com' },
    { firstName: 'Christopher', lastName: 'Harris', email: 'christopher.harris@metrolending.com' }
  ],
  // Coastal Financial Partners officers
  [
    { firstName: 'Jessica', lastName: 'Clark', email: 'jessica.clark@coastalfinancial.com' },
    { firstName: 'Daniel', lastName: 'Lewis', email: 'daniel.lewis@coastalfinancial.com' },
    { firstName: 'Ashley', lastName: 'Walker', email: 'ashley.walker@coastalfinancial.com' }
  ],
  // Mountain Peak Lending officers
  [
    { firstName: 'Matthew', lastName: 'Hall', email: 'matthew.hall@mountainpeaklending.com' },
    { firstName: 'Nicole', lastName: 'Allen', email: 'nicole.allen@mountainpeaklending.com' },
    { firstName: 'Kevin', lastName: 'Young', email: 'kevin.young@mountainpeaklending.com' }
  ]
];

// Sample leads data for each officer
const generateLeadsForOfficer = (officerId: string, companyId: string, officerName: string) => {
  const leadCount = Math.floor(Math.random() * 15) + 10; // 10-24 leads per officer
  const leads = [];
  
  const firstNames = ['Alex', 'Taylor', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage', 'Blake'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const sources = ['WEBSITE', 'REFERRAL', 'RATE_TABLE', 'SOCIAL_MEDIA', 'ADVERTISING'];
  const statuses = ['new', 'contacted', 'qualified', 'converted', 'closed'];
  const stages = ['initial', 'application', 'underwriting', 'approval', 'closing'];
  const priorities = ['low', 'medium', 'high'];
  
  for (let i = 0; i < leadCount; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const stage = stages[Math.floor(Math.random() * stages.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90)); // Random date within last 90 days
    
    const lead = {
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
      loanAmount: (Math.floor(Math.random() * 800000) + 200000).toString(), // $200k - $1M
      downPayment: (Math.floor(Math.random() * 200000) + 20000).toString(), // $20k - $220k
      creditScore: Math.floor(Math.random() * 200) + 500, // 500-700
      propertyType: ['single_family', 'condo', 'townhouse', 'multi_family'][Math.floor(Math.random() * 4)],
      propertyAddress: `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Pine', 'Cedar', 'Elm'][Math.floor(Math.random() * 5)]} St`,
      city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
      state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
      zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
      notes: `Lead generated for ${officerName} - ${source} source`,
      createdAt: createdDate,
      updatedAt: createdDate
    };
    
    leads.push(lead);
  }
  
  return leads;
};

async function createMultipleCompaniesWithData() {
  try {
    console.log('🚀 Starting creation of multiple companies with loan officers and leads...');
    
    const createdCompanies = [];
    const createdOfficers = [];
    const createdLeads = [];
    
    // Create companies
    for (let i = 0; i < companiesData.length; i++) {
      const companyData = companiesData[i];
      console.log(`📊 Creating company: ${companyData.name}`);
      
      const [company] = await db.insert(companies).values(companyData).returning();
      createdCompanies.push(company);
      console.log(`✅ Created company: ${company.name} (ID: ${company.id})`);
      
      // Create loan officers for this company
      const officersForCompany = loanOfficersData[i];
      const companyOfficers = [];
      
      for (const officerData of officersForCompany) {
        console.log(`👤 Creating loan officer: ${officerData.firstName} ${officerData.lastName}`);
        
        const [user] = await db.insert(users).values({
          id: uuidv4(),
          firstName: officerData.firstName,
          lastName: officerData.lastName,
          email: officerData.email,
          role: 'employee',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        
        // Associate user with company
        await db.insert(userCompanies).values({
          userId: user.id,
          companyId: company.id,
          role: 'employee',
          joinedAt: new Date()
        });
        
        companyOfficers.push(user);
        createdOfficers.push(user);
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
    console.log('\n🎉 Data creation completed successfully!');
    console.log(`📊 Companies created: ${createdCompanies.length}`);
    console.log(`👤 Loan officers created: ${createdOfficers.length}`);
    console.log(`📝 Leads created: ${createdLeads.length}`);
    
    console.log('\n📋 Company Summary:');
    for (let i = 0; i < createdCompanies.length; i++) {
      const company = createdCompanies[i];
      const officersCount = loanOfficersData[i].length;
      const leadsCount = createdLeads.filter(lead => lead.companyId === company.id).length;
      console.log(`  • ${company.name}: ${officersCount} officers, ${leadsCount} leads`);
    }
    
    console.log('\n🔗 You can now test the hierarchical navigation:');
    console.log('  • Super Admin: /super-admin/insights');
    console.log('  • Company Admin: /admin/insights');
    console.log('  • Loan Officer: /officers/leads');
    
  } catch (error) {
    console.error('❌ Error creating companies with data:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the script
createMultipleCompaniesWithData()
  .then(() => {
    console.log('✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
