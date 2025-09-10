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

export interface LoanOfficer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
}

export async function sendLoanOfficerInvite(inviteData: LoanOfficerInviteData): Promise<LoanOfficerInviteResult> {
  try {
    const response = await fetch('/api/send-loan-officer-invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inviteData),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error in sendLoanOfficerInvite:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
}

export async function getLoanOfficersByCompany(companyId: string): Promise<LoanOfficer[]> {
  try {
    const response = await fetch(`/api/loan-officers?companyId=${companyId}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error fetching loan officers:', error);
    throw error;
  }
}

export async function resendLoanOfficerInvite(officerId: string): Promise<LoanOfficerInviteResult> {
  try {
    const response = await fetch('/api/resend-loan-officer-invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ officerId }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error in resendLoanOfficerInvite:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
}
