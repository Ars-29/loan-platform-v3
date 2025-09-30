'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { useNotification } from '@/components/ui/Notification';
import { useRouter } from 'next/navigation';
import SpotlightCard from '@/components/ui/SpotlightCard';
import Icon from '@/components/ui/Icon';

interface CompanyDetails {
  id: string;
  name: string;
  slug: string;
  email: string;
  admin_email?: string;
  invite_status?: string;
  invite_sent_at?: string;
  invite_expires_at?: string;
  admin_user_id?: string;
  is_active?: boolean;
  deactivated?: boolean;
  created_at: string;
  updated_at?: string;
  totalOfficers: number;
  activeOfficers: number;
  totalLeads: number;
  highPriorityLeads: number;
  urgentPriorityLeads: number;
  convertedLeads: number;
  activePublicLinks: number;
  officers: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    joinedAt: string;
    createdAt: string;
  }>;
  recentLeads: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    priority: string;
    status: string;
    source: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export default function CompanyDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { loading: authLoading } = useAuth();
  const { showNotification, clearAllNotifications } = useNotification();
  const router = useRouter();
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string>('');

  // Resolve params on component mount
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      console.log('📝 Resolved company slug from params:', resolvedParams.slug);
      setSlug(resolvedParams.slug);
    };
    resolveParams();
  }, [params]);

  const fetchCompanyDetails = useCallback(async () => {
    console.log('🔍 fetchCompanyDetails called with:', { slug, authLoading });
    
    if (!slug) {
      console.error('❌ Company slug not found. Please contact support.', { slug });
      return;
    }

    try {
      setLoading(true);
      
      // Extract company name from slug
      const companyName = slug.replace(/-/g, ' ');
      console.log('🔍 Parsing company details:', {
        slug,
        companyName
      });

      // First, get the company ID from the slug
      const companyResponse = await fetch(`/api/companies/by-slug/${slug}`);
      const companyResult = await companyResponse.json();

      if (!companyResult.success) {
        throw new Error(companyResult.error || 'Company not found');
      }

      const companyId = companyResult.data.id;

      // Fetch company details
      const response = await fetch(`/api/companies/details?companyId=${companyId}`);
      const result = await response.json();

      if (result.success) {
        setCompanyDetails(result.data);
        // Clear any existing notifications when successfully loaded
        clearAllNotifications();
      } else {
        console.error('❌ Company details API error:', result);
        throw new Error(result.error || 'Failed to fetch company details');
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch company details. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [slug, authLoading, clearAllNotifications, showNotification]);

  useEffect(() => {
    console.log('🔄 useEffect triggered with:', { slug, authLoading });
    
    if (slug && !authLoading) {
      console.log('✅ Calling fetchCompanyDetails');
      fetchCompanyDetails();
    } else {
      console.log('⏳ Not calling fetchCompanyDetails because:', {
        slug: slug ? 'available' : 'missing',
        authLoading: authLoading ? 'still loading' : 'finished'
      });
    }
  }, [slug, authLoading, fetchCompanyDetails]);

  // Clear any existing notifications when component mounts
  useEffect(() => {
    clearAllNotifications();
  }, [clearAllNotifications]);

  if (loading || authLoading) {
    return (
      <RouteGuard allowedRoles={['super_admin']}>
        <DashboardLayout 
          title="Company Details" 
          subtitle="Loading company information..."
          showBackButton={true}
        >
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  if (!companyDetails) {
    return (
      <RouteGuard allowedRoles={['super_admin']}>
        <DashboardLayout 
          title="Company Details" 
          subtitle="Company not found"
          showBackButton={true}
        >
          <div className="text-center py-12">
            <Icon name="error" className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Company not found</h3>
            <p className="text-gray-600 mb-4">The company you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={() => router.push('/super-admin/companies')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Back to Companies
            </button>
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['super_admin']}>
      <DashboardLayout 
        title="Company Details" 
        subtitle={`${companyDetails.name} - Complete Overview`}
        showBackButton={true}
      >
        <div className="space-y-6">
          {/* Company Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <SpotlightCard variant="primary" className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon name="user" className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Officers</p>
                  <p className="text-2xl font-bold text-gray-900">{companyDetails.totalOfficers}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard variant="secondary" className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Icon name="alertTriangle" className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">High Priority Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{companyDetails.highPriorityLeads}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard variant="secondary" className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Icon name="alertCircle" className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Urgent Priority Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{companyDetails.urgentPriorityLeads}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard variant="primary" className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Icon name="checkCircle" className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Converted</p>
                  <p className="text-2xl font-bold text-gray-900">{companyDetails.convertedLeads}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard variant="primary" className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon name="link" className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Public Links</p>
                  <p className="text-2xl font-bold text-gray-900">{companyDetails.activePublicLinks}</p>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Company Information */}
          <SpotlightCard variant="default" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Company Name</label>
                <p className="text-sm text-gray-900">{companyDetails.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Slug</label>
                <p className="text-sm text-gray-900">{companyDetails.slug}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-sm text-gray-900">{companyDetails.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Admin Email</label>
                <p className="text-sm text-gray-900">{companyDetails.admin_email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="flex items-center">
                  {companyDetails.deactivated ? (
                    <>
                      <Icon name="error" className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-sm text-red-600">Deactivated</span>
                    </>
                  ) : (
                    <>
                      <Icon name="checkCircle" className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-green-600">Active</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Invite Status</label>
                <p className="text-sm text-gray-900 capitalize">{companyDetails.invite_status || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-sm text-gray-900">
                  {new Date(companyDetails.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                <p className="text-sm text-gray-900">
                  {companyDetails.updated_at ? new Date(companyDetails.updated_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Invite Sent</label>
                <p className="text-sm text-gray-900">
                  {companyDetails.invite_sent_at ? new Date(companyDetails.invite_sent_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Invite Expires</label>
                <p className="text-sm text-gray-900">
                  {companyDetails.invite_expires_at ? new Date(companyDetails.invite_expires_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </SpotlightCard>

          {/* Officers Section */}
          <SpotlightCard variant="primary" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Loan Officers</h3>
              <button
                onClick={() => router.push(`/super-admin/officers?company=${companyDetails.slug}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                View All Officers
              </button>
            </div>
            <div className="space-y-3">
              {companyDetails.officers.slice(0, 5).map((officer) => (
                <div key={officer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {officer.firstName.charAt(0)}{officer.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {officer.firstName} {officer.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{officer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {officer.isActive ? (
                      <>
                        <Icon name="checkCircle" className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm text-green-600">Active</span>
                      </>
                    ) : (
                      <>
                        <Icon name="clock" className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">Inactive</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {companyDetails.officers.length === 0 && (
                <p className="text-gray-500 text-center py-4">No officers found for this company.</p>
              )}
            </div>
          </SpotlightCard>

          {/* Recent Leads Section */}
          <SpotlightCard variant="default" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
              <button
                onClick={() => router.push(`/super-admin/insights?company=${companyDetails.slug}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                View All Leads
              </button>
            </div>
            <div className="space-y-3">
              {companyDetails.recentLeads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-yellow-600">
                        {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {lead.firstName} {lead.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{lead.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      lead.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      lead.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lead.priority}
                    </span>
                  </div>
                </div>
              ))}
              {companyDetails.recentLeads.length === 0 && (
                <p className="text-gray-500 text-center py-4">No leads found for this company.</p>
              )}
            </div>
          </SpotlightCard>

        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
