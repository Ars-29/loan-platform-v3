'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { sendLoanOfficerInvite, getLoanOfficersByCompany } from '@/lib/loan-officer-invite-system';
import { OfficerTable } from '@/components/ui/DataTable';
import { CreateButton } from '@/components/ui/Button';
import { FormModal, FormField } from '@/components/ui/Modal';
import { useNotification } from '@/components/ui/Notification';
import { useRouter } from 'next/navigation';

interface LoanOfficer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  deactivated?: boolean;
  inviteStatus?: string;
  inviteSentAt?: string;
  inviteExpiresAt?: string;
  createdAt: string;
  totalLeads?: number;
  hasPublicLink?: boolean;
  selectedTemplate?: string;
}

interface CreateOfficerForm {
  email: string;
  firstName: string;
  lastName: string;
}

export default function LoanOfficersPage() {
  const { companyId, loading: authLoading } = useAuth();
  const { showNotification, clearAllNotifications } = useNotification();
  const router = useRouter();
  const [officers, setOfficers] = useState<LoanOfficer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateOfficerForm>({
    email: '',
    firstName: '',
    lastName: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const fetchOfficers = useCallback(async () => {
    if (!companyId) {
      console.error('❌ Company ID not found. Please contact support.');
      setLoading(false);
      return;
    }

    try {
      // Fetch enhanced officers data
      const response = await fetch(`/api/officers/enhanced?companyId=${companyId}`);
      const result = await response.json();

      if (result.success) {
        console.log('📊 Fetched officers data:', result.data);
        
        // Additional client-side deduplication as a safety measure
        const uniqueOfficers = result.data.reduce((acc: LoanOfficer[], officer: LoanOfficer) => {
          if (!acc.find(item => item.id === officer.id)) {
            acc.push(officer);
          } else {
            console.warn(`⚠️ Client-side duplicate officer found: ${officer.email} (${officer.id})`);
          }
          return acc;
        }, []);
        
        console.log(`✅ Set ${uniqueOfficers.length} unique officers (${result.data.length - uniqueOfficers.length} duplicates removed)`);
        setOfficers(uniqueOfficers);
      } else {
        throw new Error(result.error || 'Failed to fetch officers');
      }
    } catch (error) {
      console.error('Error fetching officers:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch loan officers. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [companyId, showNotification]);

  useEffect(() => {
    if (companyId && !authLoading) {
      fetchOfficers();
    }
  }, [companyId, authLoading, fetchOfficers]);

  // Clear any existing notifications when component mounts
  useEffect(() => {
    clearAllNotifications();
  }, [clearAllNotifications]);

  const handleCreateOfficer = async () => {
    // Don't proceed if auth is still loading
    if (authLoading) {
      return;
    }

    setIsCreating(true);
    setValidationErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsCreating(false);
      return;
    }

    if (!companyId) {
      console.error('❌ Company ID not found. Please contact support.');
      setIsCreating(false);
      return;
    }

    try {
      const result = await sendLoanOfficerInvite({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyId: companyId
      });

      if (result.success) {
        showNotification({
          type: 'success',
          title: 'Invite Sent Successfully!',
          message: `An invitation has been sent to ${formData.email}.`,
        });
        setFormData({ email: '', firstName: '', lastName: '' });
        setShowCreateModal(false);
        fetchOfficers();
      } else {
        showNotification({
          type: 'error',
          title: 'Failed to Send Invite',
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Error creating officer:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleResendInvite = async (officer: LoanOfficer) => {
    try {
      const response = await fetch('/api/resend-loan-officer-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerId: officer.id })
      });
      
      const result = await response.json();
      if (result.success) {
        showNotification({
          type: 'success',
          title: 'Invite Resent',
          message: result.message || 'The invite has been resent to the loan officer.',
        });
        fetchOfficers(); // Refresh the data
      } else {
        showNotification({
          type: 'error',
          title: 'Error',
          message: result.message || 'Failed to resend invite. Please try again.',
        });
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to resend invite. Please try again.',
      });
    }
  };

  const handleDeactivateOfficer = async (officer: LoanOfficer) => {
    if (!confirm('Are you sure you want to deactivate this loan officer? They will not be able to sign in.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/deactivate-officer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerId: officer.id })
      });
      
      const result = await response.json();
      if (result.success) {
        showNotification({
          type: 'success',
          title: 'Officer Deactivated',
          message: 'The loan officer has been deactivated successfully.',
        });
        fetchOfficers(); // Refresh the data
      } else {
        showNotification({
          type: 'error',
          title: 'Error',
          message: result.error || result.message || 'Failed to deactivate officer',
        });
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to deactivate officer. Please try again.',
      });
    }
  };

  const handleReactivateOfficer = async (officer: LoanOfficer) => {
    if (!confirm('Are you sure you want to reactivate this loan officer? They will be able to sign in again.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/reactivate-officer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerId: officer.id })
      });
      
      const result = await response.json();
      if (result.success) {
        showNotification({
          type: 'success',
          title: 'Officer Reactivated',
          message: 'The loan officer has been reactivated successfully.',
        });
        fetchOfficers();
        // Force reload for accurate data
      } else {
        showNotification({
          type: 'error',
          title: 'Error',
          message: result.message,
        });
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to reactivate officer. Please try again.',
      });
    }
  };

  const handleDeleteOfficer = async (officer: LoanOfficer) => {
    if (!confirm('Are you sure you want to delete this loan officer? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/delete-officer', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officerId: officer.id })
      });
      
      const result = await response.json();
      if (result.success) {
        showNotification({
          type: 'success',
          title: 'Officer Deleted',
          message: 'The loan officer has been deleted successfully.',
        });
        fetchOfficers();
        window.location.reload(); // Force reload for accurate data
      } else {
        showNotification({
          type: 'error',
          title: 'Error',
          message: result.message,
        });
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete officer. Please try again.',
      });
    }
  };

  const handleViewLeads = (officerSlug: string) => {
    router.push(`/admin/loanofficers/${officerSlug}/leads`);
  };

  // Form fields configuration
  const formFields: FormField[] = [
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'officer@company.com',
    },
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      placeholder: 'John',
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
      placeholder: 'Doe',
    },
  ];

  const handleViewDetails = (officerSlug: string) => {
    router.push(`/admin/loanofficers/${officerSlug}/details`);
  };

  if (authLoading) {
    return (
      <RouteGuard allowedRoles={['super_admin', 'company_admin']}>
        <DashboardLayout 
          title="Loan Officers" 
          subtitle="Loading..."
          showBackButton={true}
        >
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['super_admin', 'company_admin']}>
      <DashboardLayout 
        title="Loan Officers" 
        subtitle="Manage loan officers for your company"
        showBackButton={true}
      >
        <div className="space-y-6">
          {/* Header with Create Button */}
          <div className="bg-[#F7F1E9]/30 rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Loan Officers</h2>
                <CreateButton
                  role="company_admin"
                  onClick={() => setShowCreateModal(true)}
                  disabled={authLoading}
                />
              </div>
            </div>

            {/* Data Table */}
            <div className="px-6 py-4">
              <OfficerTable
                data={officers}
                loading={loading}
                onResend={handleResendInvite}
                onDeactivate={handleDeactivateOfficer}
                onReactivate={handleReactivateOfficer}
                onDelete={handleDeleteOfficer}
                onViewDetails={handleViewDetails}
              />
            </div>
          </div>
        </div>

        {/* Create Officer Modal */}
        <FormModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setFormData({ email: '', firstName: '', lastName: '' });
            setValidationErrors({});
          }}
          title="Add New Loan Officer"
          role="company_admin"
          action="create"
          formData={formData}
          onFormDataChange={(data) => setFormData(data as CreateOfficerForm)}
          fields={formFields}
          validationErrors={validationErrors}
          onSubmit={handleCreateOfficer}
          loading={isCreating}
        />
      </DashboardLayout>
    </RouteGuard>
  );
}