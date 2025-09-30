'use client';

import React, { useState, useEffect } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { CompanyTable } from '@/components/ui/DataTable';
import { CreateButton } from '@/components/ui/Button';
import { FormModal, FormField } from '@/components/ui/Modal';
import { useNotification } from '@/components/ui/Notification';
import { useRouter } from 'next/navigation';

interface Company {
  id: string;
  name: string;
  slug: string;
  email: string;
  admin_email?: string;
  invite_status?: 'pending' | 'sent' | 'accepted' | 'expired';
  invite_sent_at?: string;
  invite_expires_at?: string;
  invite_token?: string;
  admin_user_id?: string;
  isActive?: boolean; // Optional due to schema cache issues
  created_at?: string;
  createdAt: string;
  totalOfficers?: number;
  activeOfficers?: number;
  totalLeads?: number;
  highPriorityLeads?: number;
  urgentPriorityLeads?: number;
  convertedLeads?: number;
}

interface CreateCompanyForm {
  name: string;
  email: string;
  website?: string;
}

export default function CompaniesPage() {
  const { showNotification } = useNotification();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateCompanyForm>({
    name: '',
    email: '',
    website: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Simple approach: try to fetch companies to check if user is authenticated
    const checkAuth = async () => {
      try {
        // Try to fetch companies - if this works, user is authenticated
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .limit(1);

        if (error && error.message.includes('JWT')) {
          // JWT error means not authenticated
          setIsAuthenticated(false);
        } else {
          // No JWT error means authenticated
          setIsAuthenticated(true);
          fetchCompanies();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    // REMOVED: onAuthStateChange listener - let useAuth hook handle this
    // Multiple listeners were causing conflicts
  }, []);

  const fetchCompanies = async () => {
    try {
      // Fetch enhanced companies data
      const response = await fetch('/api/companies/enhanced');
      const result = await response.json();

      if (result.success) {
        console.log(`✅ Fetched ${result.data.length} enhanced companies`);
        setCompanies(result.data);
      } else {
        console.error('❌ Error fetching enhanced companies:', result.error);
        // Fallback to basic companies data
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCompanies(data || []);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async () => {
    setIsCreating(true);
    setValidationErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Company name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsCreating(false);
      return;
    }

    try {
      // Send invite using new invite system
      const response = await fetch('/api/send-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: formData.name,
          adminEmail: formData.email,
          website: formData.website
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      showNotification({
        type: 'success',
        title: 'Company Created Successfully!',
        message: `🎉 Company "${formData.name}" created successfully!\n\n📧 Invite sent to: ${formData.email}\n\n⏳ Next Steps:\n1. The admin will receive an invite email\n2. They need to click the invite link in their email\n3. Create their password on the setup page\n4. They'll be redirected to their company dashboard\n5. They can then create loan officers\n\n⚠️ Note: Invites expire in 24 hours. You can resend or delete from the table below.`,
        persistent: true,
      });

      setFormData({ name: '', email: '', website: '' });
      setShowCreateModal(false);
      fetchCompanies();
    } catch (error: unknown) {
      console.error('Error creating company:', error);
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          showNotification({
            type: 'error',
            title: 'Email Already Exists',
            message: 'A user with this email already exists. Please use a different email or contact support.',
          });
        } else if (error.message.includes('Invalid email')) {
          showNotification({
            type: 'error',
            title: 'Invalid Email',
            message: 'Please enter a valid email address.',
          });
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          showNotification({
            type: 'error',
            title: 'Network Error',
            message: 'Network error. Please check your connection and try again.',
          });
        } else {
          showNotification({
            type: 'error',
            title: 'Error Creating Company',
            message: error.message,
          });
        }
      } else {
        showNotification({
          type: 'error',
          title: 'Unexpected Error',
          message: 'An unexpected error occurred. Please try again.',
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleResendInvite = async (company: Company) => {
    try {
      const response = await fetch('/api/resend-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId: company.id }),
      });

      const result = await response.json();

      if (result.success) {
        showNotification({
          type: 'success',
          title: 'Invite Resent',
          message: result.message,
        });
        fetchCompanies(); // Refresh the list
      } else {
        showNotification({
          type: 'error',
          title: 'Failed to Resend Invite',
          message: result.message,
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

  const handleDeactivateCompany = async (company: Company) => {
    if (!confirm('Are you sure you want to deactivate this company? The company admin will not be able to sign in.')) {
      return;
    }

    try {
      const response = await fetch('/api/deactivate-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId: company.id }),
      });

      const result = await response.json();

      if (result.success) {
        showNotification({
          type: 'success',
          title: 'Company Deactivated',
          message: result.message,
        });
        fetchCompanies(); // Refresh the list
        window.location.reload(); // Force reload for accurate data
      } else {
        showNotification({
          type: 'error',
          title: 'Failed to Deactivate Company',
          message: result.error || result.message || 'Failed to deactivate company',
        });
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to deactivate company. Please try again.',
      });
    }
  };

  const handleReactivateCompany = async (company: Company) => {
    if (!confirm('Are you sure you want to reactivate this company? The company admin will be able to sign in again.')) {
      return;
    }

    try {
      const response = await fetch('/api/reactivate-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId: company.id }),
      });

      const result = await response.json();

      if (result.success) {
        showNotification({
          type: 'success',
          title: 'Company Reactivated',
          message: result.message,
        });
        fetchCompanies(); // Refresh the list
      } else {
        showNotification({
          type: 'error',
          title: 'Failed to Reactivate Company',
          message: result.message,
        });
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to reactivate company. Please try again.',
      });
    }
  };

  const handleDeleteCompany = async (company: Company) => {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/delete-company', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId: company.id }),
      });

      const result = await response.json();

      if (result.success) {
        showNotification({
          type: 'success',
          title: 'Company Deleted',
          message: result.message,
        });
        fetchCompanies(); // Refresh the list
      } else {
        showNotification({
          type: 'error',
          title: 'Failed to Delete Company',
          message: result.message,
        });
      }
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete company. Please try again.',
      });
    }
  };

  const handleViewDetails = (companySlug: string) => {
    router.push(`/super-admin/companies/${companySlug}/details`);
  };

  // Temporarily bypass auth check for testing
  // TODO: Fix authentication detection for free Supabase plan
  
  // Show loading while checking authentication - removed spinner for consistency
  // if (authLoading) {
  //   return null; // Let the page load normally without spinner
  // }

  // Show authentication required if not authenticated (only after auth check is complete)
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access this page.</p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Form fields configuration
  const formFields: FormField[] = [
    {
      name: 'name',
      label: 'Company Name',
      type: 'text',
      required: true,
      placeholder: 'Enter company name',
    },
    {
      name: 'email',
      label: 'Admin Email',
      type: 'email',
      required: true,
      placeholder: 'admin@company.com',
    },
    {
      name: 'website',
      label: 'Website (Optional)',
      type: 'url',
      placeholder: 'https://example.com',
    },
  ];

  return (
    <RouteGuard allowedRoles={['super_admin']}>
      <DashboardLayout 
        title="Company Management" 
        subtitle="Manage companies and their administrators"
        showBackButton={true}
      >
        <div className="space-y-6">
          {/* Header with Create Button */}
          <div className="bg-[#F7F1E9]/30 rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Companies</h2>
                <CreateButton
                  role="super_admin"
                  onClick={() => setShowCreateModal(true)}
                />
              </div>
            </div>

            {/* Data Table */}
            <div className="px-6 py-4">
              <CompanyTable
                data={companies}
                loading={loading}
                onResend={handleResendInvite}
                onDeactivate={handleDeactivateCompany}
                onReactivate={handleReactivateCompany}
                onDelete={handleDeleteCompany}
                onViewDetails={handleViewDetails}
              />
            </div>
          </div>
        </div>

        {/* Create Company Modal */}
        <FormModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setFormData({ name: '', email: '', website: '' });
            setValidationErrors({});
          }}
          title="Create New Company"
          role="super_admin"
          action="create"
          formData={formData}
          onFormDataChange={(data) => setFormData(data as CreateCompanyForm)}
          fields={formFields}
          validationErrors={validationErrors}
          onSubmit={handleCreateCompany}
          loading={isCreating}
        />
      </DashboardLayout>
    </RouteGuard>
  );
}
