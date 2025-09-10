import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface InviteResult {
  success: boolean;
  message: string;
  companyId?: string;
  inviteToken?: string;
}

export interface CompanyInviteStatus {
  id: string;
  name: string;
  admin_email: string;
  invite_status: 'pending' | 'sent' | 'accepted' | 'expired';
  invite_sent_at: string | null;
  invite_expires_at: string | null;
  created_at: string;
}

/**
 * Send invite to company admin email
 * Creates company with pending status and sends Supabase invite
 */
export async function sendCompanyAdminInvite(
  companyName: string,
  adminEmail: string,
  website?: string
): Promise<InviteResult> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      return {
        success: false,
        message: 'Please enter a valid email address.'
      };
    }

    // Check if company with this email already exists in our database
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id, invite_status, deactivated')
      .eq('admin_email', adminEmail)
      .single();

    if (existingCompany) {
      // If company exists and is active, show error
      if (existingCompany.invite_status === 'accepted' && !existingCompany.deactivated) {
        return {
          success: false,
          message: 'A company with this email already exists and is active. Please use a different email.'
        };
      }
      // If company exists but is pending/expired/deactivated, allow resending invite
      // We'll update the existing record instead of creating a new one
    }

    let companyData;
    let companyError;

    if (existingCompany) {
      // Update existing company record
      const { data, error } = await supabase
        .from('companies')
        .update({
          name: companyName,
          slug: companyName.toLowerCase().replace(/\s+/g, '-'),
          email: adminEmail,
          website: website || '',
          admin_email: adminEmail,
          admin_email_verified: false,
          invite_status: 'pending',
          invite_sent_at: new Date().toISOString(),
          invite_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          is_active: false,
          deactivated: false, // Reset deactivation status
        })
        .eq('id', existingCompany.id)
        .select()
        .single();
      
      companyData = data;
      companyError = error;
    } else {
      // Create new company with pending status
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          slug: companyName.toLowerCase().replace(/\s+/g, '-'),
          email: adminEmail,
          website: website || '',
          admin_email: adminEmail,
          admin_email_verified: false,
          invite_status: 'pending',
          invite_sent_at: new Date().toISOString(),
          invite_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          is_active: false, // Company is inactive until invite is accepted
        })
        .select()
        .single();
      
      companyData = data;
      companyError = error;
    }

    if (companyError) {
      throw companyError;
    }

    // Check if user exists in Supabase Auth and delete if needed
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(user => user.email === adminEmail);
    
    if (existingUser) {
      // Delete existing user from Supabase Auth to allow fresh invite
      await supabase.auth.admin.deleteUser(existingUser.id);
    }

    // Send Supabase invite
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      adminEmail,
      {
        data: {
          company_id: companyData.id,
          company_name: companyName,
          role: 'company_admin'
        },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/invite?company=${companyData.id}`
      }
    );

    if (inviteError) {
      // If invite fails, delete the company (only if it was newly created)
      if (!existingCompany) {
        await supabase.from('companies').delete().eq('id', companyData.id);
      }
      throw inviteError;
    }

    // Update company with invite token and status
    const inviteToken = crypto.randomBytes(32).toString('hex');
    await supabase
      .from('companies')
      .update({
        invite_status: 'sent',
        invite_token: inviteToken,
        admin_user_id: inviteData.user?.id
      })
      .eq('id', companyData.id);

    return {
      success: true,
      message: `🎉 Company "${companyName}" created successfully!\n\n📧 Invite sent to: ${adminEmail}\n\n⏳ The admin has 24 hours to accept the invite. You can track the status in your dashboard.`,
      companyId: companyData.id,
      inviteToken
    };

  } catch (error) {
    console.error('Error sending company admin invite:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send invite'
    };
  }
}

/**
 * Get companies with their invite status
 */
export async function getCompaniesWithInviteStatus(): Promise<CompanyInviteStatus[]> {
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, admin_email, invite_status, invite_sent_at, invite_expires_at, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return companies || [];
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
}

/**
 * Resend invite for a company
 */
export async function resendCompanyInvite(companyId: string): Promise<InviteResult> {
  try {
    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return {
        success: false,
        message: 'Company not found.'
      };
    }

    if (!company.admin_email) {
      return {
        success: false,
        message: 'No admin email found for this company.'
      };
    }

    // Check if invite is still valid (not expired)
    const now = new Date();
    const expiresAt = company.invite_expires_at ? new Date(company.invite_expires_at) : null;
    
    if (expiresAt && now > expiresAt) {
      return {
        success: false,
        message: 'Invite has expired. Please delete and recreate the company.'
      };
    }

    // Resend invite
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      company.admin_email,
      {
        data: {
          company_id: company.id,
          company_name: company.name,
          role: 'company_admin'
        },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/invite?company=${company.id}`
      }
    );

    if (inviteError) {
      throw inviteError;
    }

    // Update company with new invite details
    const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('companies')
      .update({
        invite_status: 'sent',
        invite_sent_at: new Date().toISOString(),
        invite_expires_at: newExpiresAt,
        admin_user_id: inviteData.user?.id
      })
      .eq('id', companyId);

    return {
      success: true,
      message: `📧 Invite resent to ${company.admin_email}. New expiry: 24 hours.`
    };

  } catch (error) {
    console.error('Error resending invite:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to resend invite'
    };
  }
}

/**
 * Delete company and cancel invite
 */
export async function deleteCompanyAndCancelInvite(companyId: string): Promise<InviteResult> {
  try {
    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('admin_user_id')
      .eq('id', companyId)
      .single();

    if (companyError) {
      return {
        success: false,
        message: 'Company not found.'
      };
    }

    // Delete user from Supabase Auth if exists
    if (company.admin_user_id) {
      await supabase.auth.admin.deleteUser(company.admin_user_id);
    }

    // Delete company from database
    await supabase.from('companies').delete().eq('id', companyId);

    return {
      success: true,
      message: 'Company deleted successfully and invite cancelled.'
    };

  } catch (error) {
    console.error('Error deleting company:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete company'
    };
  }
}

/**
 * Check if invite is expired
 */
export function isInviteExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date() > new Date(expiresAt);
}

/**
 * Get time remaining for invite
 */
export function getInviteTimeRemaining(expiresAt: string | null): string {
  if (!expiresAt) return 'No expiry';
  
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expired';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}
