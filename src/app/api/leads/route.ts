import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { leads, companies, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 GET /api/leads - Starting request');
    
    // For now, return all leads without authentication
    // In production, you'd want proper authentication and role-based filtering
    
    console.log('📝 Fetching all leads...');
    
    const allLeads = await db
      .select()
      .from(leads)
      .orderBy(desc(leads.createdAt));

    console.log('✅ Found leads:', allLeads.length);

    return NextResponse.json({
      success: true,
      leads: allLeads
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/leads - Starting request');
    
    const body = await request.json();
    const { firstName, lastName, email, phone, creditScore, loanDetails } = body;

    console.log('📝 Request body:', { firstName, lastName, email, phone: phone ? '***' : 'missing', creditScore, loanDetails: loanDetails ? 'present' : 'missing' });

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !loanDetails) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For now, we'll create leads without authentication
    // In a real scenario, you might want to require authentication
    // or associate leads with a specific company/officer
    
    console.log('📝 Creating lead without authentication...');
    
    // For now, we'll create leads without authentication
    // In a real scenario, you might want to require authentication
    // or associate leads with a specific company/officer
    
    console.log('📝 Creating lead without authentication...');
    
    // First, let's check if we have any companies and users to reference
    const existingCompanies = await db.select().from(companies).limit(1);
    const existingUsers = await db.select().from(users).limit(1);
    
    console.log('🏢 Existing companies:', existingCompanies.length);
    console.log('👥 Existing users:', existingUsers.length);
    
    // Use existing company/user IDs or create a fallback
    const companyId = existingCompanies.length > 0 ? existingCompanies[0].id : null;
    const officerId = existingUsers.length > 0 ? existingUsers[0].id : null;
    
    if (!companyId || !officerId) {
      console.log('❌ No companies or users found in database');
      return NextResponse.json(
        { error: 'Database not properly initialized. Please ensure companies and users exist.' },
        { status: 500 }
      );
    }
    
    console.log('✅ Using company:', companyId, 'and officer:', officerId);
    
    // Prepare lead data for insertion
    const leadData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      companyId,
      officerId,
      source: 'rate_table',
      loanDetails: {
        productId: loanDetails.productId,
        lenderName: loanDetails.lenderName,
        loanProgram: loanDetails.loanProgram,
        loanType: loanDetails.loanType,
        loanTerm: loanDetails.loanTerm,
        interestRate: loanDetails.interestRate,
        apr: loanDetails.apr,
        monthlyPayment: loanDetails.monthlyPayment,
        fees: loanDetails.fees,
        points: loanDetails.points,
        credits: loanDetails.credits,
        lockPeriod: loanDetails.lockPeriod,
      },
      // Auto-populate loan amount, down payment, credit score, and notes from API data
      loanAmount: (loanDetails.monthlyPayment * loanDetails.loanTerm).toString(), // Convert to string for decimal field
      downPayment: '0', // Default to 0, can be updated later
      creditScore: creditScore ? parseInt(creditScore.replace(/[^0-9]/g, '')) || 0 : 0, // Parse credit score or default to 0
      notes: `Lead generated from rate table. Product: ${loanDetails.loanProgram} from ${loanDetails.lenderName}`,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('💾 Inserting lead into database...');
    
    // Insert lead into database using Drizzle
    const [newLead] = await db.insert(leads).values(leadData).returning();

    console.log('✅ Lead created successfully:', {
      leadId: newLead.id,
      borrowerName: `${firstName} ${lastName}`,
      email,
      source: 'rate_table'
    });

    return NextResponse.json({
      success: true,
      lead: {
        id: newLead.id,
        firstName: newLead.firstName,
        lastName: newLead.lastName,
        email: newLead.email,
        phone: newLead.phone,
        status: newLead.status,
        createdAt: newLead.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
