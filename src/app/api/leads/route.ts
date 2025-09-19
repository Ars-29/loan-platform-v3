// 

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leads, companies, users } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 GET /api/leads - Starting request');

    const allLeads = await db
      .select()
      .from(leads)
      .orderBy(desc(leads.createdAt));

    return NextResponse.json({
      success: true,
      leads: allLeads,
    });
  } catch (error) {
    console.error('❌ Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/leads - Starting request');

    const body = await request.json();
    const { firstName, lastName, email, phone, creditScore, loanDetails } = body;

    if (!firstName || !lastName || !email || !phone || !loanDetails) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    if (
      !loanDetails.monthlyPayment ||
      !loanDetails.loanTerm ||
      !loanDetails.loanProgram ||
      !loanDetails.lenderName
    ) {
      return NextResponse.json(
        { error: 'Invalid loan details provided' },
        { status: 400 },
      );
    }

    // 🔑 Ensure we have company + user references
    const [company] = await db.select().from(companies).limit(1);
    const [user] = await db.select().from(users).limit(1);

    if (!company || !user) {
      return NextResponse.json(
        { error: 'Database not initialized. Missing company or user.' },
        { status: 500 },
      );
    }

    const loanAmount = (() => {
      const monthlyPayment = parseFloat(loanDetails.monthlyPayment) || 0;
      const loanTerm = parseInt(loanDetails.loanTerm) || 30;
      const calculatedAmount = monthlyPayment * loanTerm;
      return isNaN(calculatedAmount) ? '0' : calculatedAmount.toString();
    })();

    const leadData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      companyId: company.id,
      officerId: user.id,
      source: 'rate_table',
      loanDetails,
      loanAmount,
      downPayment: '0',
      creditScore: creditScore
        ? parseInt(creditScore.replace(/[^0-9]/g, '')) || 0
        : 0,
      notes: `Lead generated from rate table. Product: ${loanDetails.loanProgram} from ${loanDetails.lenderName}`,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [newLead] = await db.insert(leads).values(leadData).returning();

    return NextResponse.json({
      success: true,
      lead: {
        id: newLead.id,
        firstName: newLead.firstName,
        lastName: newLead.lastName,
        email: newLead.email,
        phone: newLead.phone,
        status: newLead.status,
        createdAt: newLead.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Error creating lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
