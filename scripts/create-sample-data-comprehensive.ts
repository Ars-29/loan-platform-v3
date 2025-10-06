import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { companies, users, userCompanies, leads, templates, pageSettings } from '../src/lib/db/schema';
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

// Sample companies data with enhanced information
const companiesData = [
  {
    name: 'Premier Mortgage Group',
    slug: `premier-mortgage-group-${Date.now()}`,
    website: 'https://premiermortgage.com',
    phone: '(555) 100-0001',
    email: 'info@premiermortgage.com',
    adminEmail: 'admin@premiermortgage.com',
    address: {
      street: '123 Financial District',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA'
    },
    companyTagline: 'Your Premier Choice for Home Loans',
    companyDescription: 'Premier Mortgage Group has been helping families achieve their homeownership dreams for over 20 years.',
    companyNmlsNumber: '123456',
    companyEstablishedYear: 2003,
    companyTeamSize: '50-100',
    companySpecialties: ['Conventional Loans', 'FHA Loans', 'VA Loans', 'Jumbo Loans'],
    companyServiceAreas: ['New York', 'New Jersey', 'Connecticut'],
    companyLanguages: ['English', 'Spanish', 'Mandarin'],
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
    address: {
      street: '456 Banking Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90210',
      country: 'USA'
    },
    companyTagline: 'Elite Service, Exceptional Results',
    companyDescription: 'Elite Home Loans specializes in providing personalized mortgage solutions for discerning clients.',
    companyNmlsNumber: '234567',
    companyEstablishedYear: 2010,
    companyTeamSize: '25-50',
    companySpecialties: ['Luxury Home Loans', 'Investment Properties', 'Refinancing'],
    companyServiceAreas: ['California', 'Nevada', 'Arizona'],
    companyLanguages: ['English', 'Spanish'],
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
    address: {
      street: '789 City Center',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      country: 'USA'
    },
    companyTagline: 'Connecting You to Your Dream Home',
    companyDescription: 'Metro Lending Solutions serves the greater Chicago area with competitive rates and exceptional service.',
    companyNmlsNumber: '345678',
    companyEstablishedYear: 2015,
    companyTeamSize: '10-25',
    companySpecialties: ['First-Time Homebuyers', 'FHA Loans', 'USDA Loans'],
    companyServiceAreas: ['Illinois', 'Indiana', 'Wisconsin'],
    companyLanguages: ['English', 'Polish', 'Spanish'],
    isActive: true,
    companyApprovalStatus: 'approved'
  },
  {
    name: 'Coastal Financial Partners',
    slug: `coastal-financial-partners-${Date.now()}`,
    website: 'https://coastalfinancial.com',
    phone: '(555) 400-0004',
    email: 'info@coastalfinancial.com',
    adminEmail: 'admin@coastalfinancial.com',
    address: {
      street: '321 Ocean Drive',
      city: 'Miami',
      state: 'FL',
      zip: '33101',
      country: 'USA'
    },
    companyTagline: 'Your Gateway to Coastal Living',
    companyDescription: 'Coastal Financial Partners specializes in waterfront and luxury properties throughout Florida.',
    companyNmlsNumber: '456789',
    companyEstablishedYear: 2008,
    companyTeamSize: '25-50',
    companySpecialties: ['Luxury Properties', 'Waterfront Homes', 'Investment Properties'],
    companyServiceAreas: ['Florida', 'Georgia', 'South Carolina'],
    companyLanguages: ['English', 'Spanish', 'Portuguese'],
    isActive: true,
    companyApprovalStatus: 'approved'
  },
  {
    name: 'Mountain Peak Lending',
    slug: `mountain-peak-lending-${Date.now()}`,
    website: 'https://mountainpeaklending.com',
    phone: '(555) 500-0005',
    email: 'info@mountainpeaklending.com',
    adminEmail: 'admin@mountainpeaklending.com',
    address: {
      street: '654 Summit Ave',
      city: 'Denver',
      state: 'CO',
      zip: '80202',
      country: 'USA'
    },
    companyTagline: 'Reaching New Heights in Home Financing',
    companyDescription: 'Mountain Peak Lending serves the Rocky Mountain region with expertise in mountain and rural properties.',
    companyNmlsNumber: '567890',
    companyEstablishedYear: 2012,
    companyTeamSize: '10-25',
    companySpecialties: ['Rural Properties', 'USDA Loans', 'Construction Loans'],
    companyServiceAreas: ['Colorado', 'Wyoming', 'Utah'],
    companyLanguages: ['English', 'Spanish'],
    isActive: true,
    companyApprovalStatus: 'approved'
  }
];

// Company admins data (one per company)
const companyAdminsData = [
  { firstName: 'Robert', lastName: 'Johnson', email: 'admin@premiermortgage.com', phone: '(555) 100-0001' },
  { firstName: 'Maria', lastName: 'Garcia', email: 'admin@elitehomeloans.com', phone: '(555) 200-0002' },
  { firstName: 'James', lastName: 'Smith', email: 'admin@metrolending.com', phone: '(555) 300-0003' },
  { firstName: 'Jennifer', lastName: 'Davis', email: 'admin@coastalfinancial.com', phone: '(555) 400-0004' },
  { firstName: 'Michael', lastName: 'Wilson', email: 'admin@mountainpeaklending.com', phone: '(555) 500-0005' }
];

// Loan officers data (3-4 per company)
const loanOfficersData = [
  // Premier Mortgage Group officers
  [
    { firstName: 'James', lastName: 'Wilson', email: 'james.wilson@premiermortgage.com', nmlsNumber: '1234567' },
    { firstName: 'Sarah', lastName: 'Martinez', email: 'sarah.martinez@premiermortgage.com', nmlsNumber: '1234568' },
    { firstName: 'David', lastName: 'Thompson', email: 'david.thompson@premiermortgage.com', nmlsNumber: '1234569' },
    { firstName: 'Lisa', lastName: 'Anderson', email: 'lisa.anderson@premiermortgage.com', nmlsNumber: '1234570' }
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
    { firstName: 'Christopher', lastName: 'Harris', email: 'christopher.harris@metrolending.com', nmlsNumber: '3456783' },
    { firstName: 'Michelle', lastName: 'Brown', email: 'michelle.brown@metrolending.com', nmlsNumber: '3456784' }
  ],
  // Coastal Financial Partners officers
  [
    { firstName: 'Jessica', lastName: 'Clark', email: 'jessica.clark@coastalfinancial.com', nmlsNumber: '4567891' },
    { firstName: 'Daniel', lastName: 'Lewis', email: 'daniel.lewis@coastalfinancial.com', nmlsNumber: '4567892' },
    { firstName: 'Ashley', lastName: 'Walker', email: 'ashley.walker@coastalfinancial.com', nmlsNumber: '4567893' }
  ],
  // Mountain Peak Lending officers
  [
    { firstName: 'Matthew', lastName: 'Hall', email: 'matthew.hall@mountainpeaklending.com', nmlsNumber: '5678901' },
    { firstName: 'Nicole', lastName: 'Allen', email: 'nicole.allen@mountainpeaklending.com', nmlsNumber: '5678902' },
    { firstName: 'Kevin', lastName: 'Young', email: 'kevin.young@mountainpeaklending.com', nmlsNumber: '5678903' }
  ]
];

// Sample leads data generator
const generateLeadsForOfficer = (officerId: string, companyId: string, officerName: string) => {
  const leadCount = Math.floor(Math.random() * 20) + 15; // 15-34 leads per officer
  const leads = [];
  
  const firstNames = ['Alex', 'Taylor', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage', 'Blake', 'Cameron', 'Drew', 'Emery', 'Finley', 'Hayden'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
  const sources = ['landing_page', 'rate_table', 'referral', 'social_media', 'advertising', 'direct_mail', 'open_house'];
  const statuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
  const stages = ['lead', 'application', 'underwriting', 'approval', 'closing'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const propertyTypes = ['single_family', 'condo', 'townhouse', 'multi_family', 'manufactured'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
  const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'CO', 'WA', 'GA'];
  
  for (let i = 0; i < leadCount; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const stage = stages[Math.floor(Math.random() * stages.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const state = states[Math.floor(Math.random() * states.length)];
    
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 120)); // Random date within last 120 days
    
    const loanAmount = Math.floor(Math.random() * 1000000) + 200000; // $200k - $1.2M
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
        interestRate: (3.5 + Math.random() * 2).toFixed(3),
        propertyType,
        occupancy: ['primary', 'secondary', 'investment'][Math.floor(Math.random() * 3)]
      },
      propertyDetails: {
        address: `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Pine', 'Cedar', 'Elm', 'Maple', 'First', 'Second', 'Third'][Math.floor(Math.random() * 9)]} St`,
        city,
        state,
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        propertyType,
        yearBuilt: 1990 + Math.floor(Math.random() * 30),
        squareFeet: Math.floor(Math.random() * 3000) + 1000
      },
      geographicLocation: `${city}, ${state}`,
      notes: `Lead generated for ${officerName} - ${source} source. ${priority} priority.`,
      tags: [priority, source, propertyType].filter((tag, index, arr) => arr.indexOf(tag) === index),
      customFields: {
        preferredContactTime: ['morning', 'afternoon', 'evening'][Math.floor(Math.random() * 3)],
        preferredContactMethod: ['phone', 'email', 'text'][Math.floor(Math.random() * 3)],
        referralSource: source === 'referral' ? 'Previous Client' : 'Direct',
        timeline: ['immediate', '1-3 months', '3-6 months', '6+ months'][Math.floor(Math.random() * 4)]
      },
      leadQualityScore: Math.floor(Math.random() * 5) + 6, // 6-10 quality score
      responseTimeHours: Math.floor(Math.random() * 24) + 1, // 1-24 hours response time
      contactCount: Math.floor(Math.random() * 5), // 0-4 contacts
      lastContactDate: new Date(createdDate.getTime() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
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

// Create default templates
const createDefaultTemplates = async () => {
  console.log('🎨 Creating default templates...');
  
  const defaultTemplates = [
    {
      name: 'Modern Blue',
      slug: 'modern-blue',
      description: 'Clean and professional template with blue accents',
      isDefault: true,
      isActive: true,
      colors: {
        primary: '#005b7c',
        secondary: '#01bcc6',
        background: '#ffffff',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb'
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        fontSize: {
          sm: '14px',
          base: '16px',
          lg: '18px',
          xl: '24px',
          '2xl': '30px'
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700'
        }
      },
      content: {
        headline: 'Find Your Perfect Home Loan',
        subheadline: 'Get pre-approved in minutes with competitive rates',
        ctaText: 'Apply Now',
        ctaSecondary: 'View Rates',
        companyName: 'Your Company Name',
        tagline: 'Your Trusted Mortgage Partner'
      },
      layout: {
        alignment: 'center',
        spacing: 'comfortable',
        borderRadius: '8px',
        padding: '24px'
      }
    },
    {
      name: 'Elegant Green',
      slug: 'elegant-green',
      description: 'Sophisticated template with green and gold accents',
      isDefault: true,
      isActive: true,
      colors: {
        primary: '#059669',
        secondary: '#10b981',
        background: '#ffffff',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb'
      },
      typography: {
        fontFamily: 'Georgia, serif',
        fontSize: {
          sm: '14px',
          base: '16px',
          lg: '18px',
          xl: '24px',
          '2xl': '30px'
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700'
        }
      },
      content: {
        headline: 'Your Dream Home Awaits',
        subheadline: 'Expert mortgage guidance with personalized service',
        ctaText: 'Start Application',
        ctaSecondary: 'Calculate Payment',
        companyName: 'Your Company Name',
        tagline: 'Excellence in Every Loan'
      },
      layout: {
        alignment: 'left',
        spacing: 'spacious',
        borderRadius: '12px',
        padding: '32px'
      }
    }
  ];
  
  const createdTemplates = [];
  for (const templateData of defaultTemplates) {
    const [template] = await db.insert(templates).values(templateData).returning();
    createdTemplates.push(template);
    console.log(`✅ Created template: ${template.name}`);
  }
  
  return createdTemplates;
};

async function createSampleDataComprehensive() {
  try {
    console.log('🚀 Starting comprehensive sample data creation...');
    
    const createdCompanies = [];
    const createdAdmins = [];
    const createdOfficers = [];
    const createdLeads = [];
    const createdTemplates = [];
    
    // Create default templates first
    const templates = await createDefaultTemplates();
    createdTemplates.push(...templates);
    
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
      
      const [admin] = await db.insert(users).values({
        id: uuidv4(),
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
      console.log(`✅ Created admin: ${admin.firstName} ${admin.lastName} (ID: ${admin.id})`);
      
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
        
        // Create page settings for this officer with a random template
        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
        await db.insert(pageSettings).values({
          companyId: company.id,
          officerId: user.id,
          templateId: randomTemplate.id,
          template: randomTemplate.slug,
          settings: {
            customizations: {
              officerName: `${user.firstName} ${user.lastName}`,
              phone: user.phone || adminData.phone,
              email: user.email,
              nmlsNumber: user.nmlsNumber
            }
          },
          isPublished: Math.random() > 0.3, // 70% chance of being published
          publishedAt: Math.random() > 0.3 ? new Date() : null
        });
      }
    }
    
    // Summary
    console.log('\n🎉 Comprehensive sample data creation completed successfully!');
    console.log(`📊 Companies created: ${createdCompanies.length}`);
    console.log(`👑 Company admins created: ${createdAdmins.length}`);
    console.log(`👤 Loan officers created: ${createdOfficers.length}`);
    console.log(`📝 Leads created: ${createdLeads.length}`);
    console.log(`🎨 Templates created: ${createdTemplates.length}`);
    
    console.log('\n📋 Company Summary:');
    for (let i = 0; i < createdCompanies.length; i++) {
      const company = createdCompanies[i];
      const officersCount = loanOfficersData[i].length;
      const leadsCount = createdLeads.filter(lead => lead.companyId === company.id).length;
      console.log(`  • ${company.name}: 1 admin, ${officersCount} officers, ${leadsCount} leads`);
    }
    
    console.log('\n🔗 You can now test the system with:');
    console.log('  • Super Admin: /super-admin/dashboard');
    console.log('  • Company Admin: /admin/dashboard (use any admin email)');
    console.log('  • Loan Officer: /officers/dashboard (use any officer email)');
    
    console.log('\n📧 Sample Login Credentials:');
    console.log('Company Admins:');
    for (let i = 0; i < createdAdmins.length; i++) {
      console.log(`  • ${createdAdmins[i].email} (${companiesData[i].name})`);
    }
    console.log('\nLoan Officers:');
    for (let i = 0; i < Math.min(3, createdOfficers.length); i++) {
      console.log(`  • ${createdOfficers[i].email} (${createdOfficers[i].firstName} ${createdOfficers[i].lastName})`);
    }
    
  } catch (error) {
    console.error('❌ Error creating comprehensive sample data:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the script
createSampleDataComprehensive()
  .then(() => {
    console.log('✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

