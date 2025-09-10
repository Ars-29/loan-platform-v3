import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface LoanOfficerInviteData {
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
}

export interface LoanOfficerInviteResult {
  success: boolean;
  message: string;
  officerId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, companyId }: LoanOfficerInviteData = await request.json();

    // Validate required fields
    if (!email || !firstName || !lastName || !companyId) {
      return NextResponse.json({
        success: false,
        message: 'All fields are required.'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: 'Please enter a valid email address.'
      }, { status: 400 });
    }

    // Check if user already exists in our database
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, is_active, deactivated')
      .eq('email', email)
      .single();

    if (existingUser) {
      // If user exists and is active, show error
      if (existingUser.is_active && !existingUser.deactivated) {
        return NextResponse.json({
          success: false,
          message: 'A user with this email already exists and is active. Please use a different email address.'
        }, { status: 400 });
      }
      // If user exists but is inactive/pending/deactivated, allow resending invite
      // We'll update the existing record instead of creating a new one
    }

    // Check if user exists in Supabase Auth and delete if needed
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingAuthUser = existingUsers?.users?.find(user => user.email === email);
    
    if (existingAuthUser) {
      // Delete existing user from Supabase Auth to allow fresh invite
      await supabase.auth.admin.deleteUser(existingAuthUser.id);
    }

    // Create the loan officer user via invite
    const { data: inviteResult, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/invite?officer=true&company=${companyId}`,
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'employee',
          company_id: companyId
        }
      }
    );

    if (inviteError) {
      console.error('Error sending loan officer invite:', inviteError);
      return NextResponse.json({
        success: false,
        message: `Failed to send invite: ${inviteError.message}`
      }, { status: 500 });
    }

    if (inviteResult?.user) {
      let userError;
      
      if (existingUser) {
        // Update existing user record
        const { error } = await supabase
          .from('users')
          .update({
            id: inviteResult.user.id,
            email: email,
            first_name: firstName,
            last_name: lastName,
            role: 'employee',
            is_active: false, // Will be activated when they accept the invite
            deactivated: false, // Reset deactivation status
            invite_status: 'sent',
            invite_sent_at: new Date().toISOString(),
            invite_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          })
          .eq('id', existingUser.id);
        
        userError = error;
      } else {
        // Create new user record in database
        const { error } = await supabase
          .from('users')
          .insert({
            id: inviteResult.user.id,
            email: email,
            first_name: firstName,
            last_name: lastName,
            role: 'employee',
            is_active: false, // Will be activated when they accept the invite
            invite_status: 'sent',
            invite_sent_at: new Date().toISOString(),
            invite_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          });
        
        userError = error;
      }

      if (userError) {
        console.error('Error creating/updating user record:', userError);
        return NextResponse.json({
          success: false,
          message: 'Failed to create user record. Please try again.'
        }, { status: 500 });
      }

      // Delete existing user-company relationships and create new one
      await supabase
        .from('user_companies')
        .delete()
        .eq('user_id', inviteResult.user.id);

      // Create user-company relationship
      const { error: companyError } = await supabase
        .from('user_companies')
        .insert({
          user_id: inviteResult.user.id,
          company_id: companyId,
          role: 'employee',
          is_active: false, // Will be activated when they accept the invite
        });

      if (companyError) {
        console.error('Error creating user-company relationship:', companyError);
        return NextResponse.json({
          success: false,
          message: 'Failed to create company relationship. Please try again.'
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Invite sent successfully to ${email}. The loan officer will receive an email to set up their account.`,
        officerId: inviteResult.user.id
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to create invite. Please try again.'
    }, { status: 500 });

  } catch (error) {
    console.error('Error in sendLoanOfficerInvite:', error);
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    }, { status: 500 });
  }
}
