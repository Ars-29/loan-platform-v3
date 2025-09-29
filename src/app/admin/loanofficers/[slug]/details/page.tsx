'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { useNotification } from '@/components/ui/Notification';
import { useRouter } from 'next/navigation';
import SpotlightCard from '@/components/ui/SpotlightCard';
import Icon from '@/components/ui/Icon';

interface OfficerDetails {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  totalLeads: number;
  highPriorityLeads: number;
  urgentPriorityLeads: number;
  convertedLeads: number;
  hasPublicLink: boolean;
  publicLinkUrl?: string;
  selectedTemplate?: string;
  recentLeads: Array<{
    id: string;
    firstName: string;
    lastName: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
}

export default function OfficerDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { companyId, loading: authLoading } = useAuth();
  const { showNotification, clearAllNotifications } = useNotification();
  const router = useRouter();
  const [officerDetails, setOfficerDetails] = useState<OfficerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string>('');

  // Resolve params on component mount
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      console.log('📝 Resolved slug from params:', resolvedParams.slug);
      setSlug(resolvedParams.slug);
    };
    resolveParams();
  }, [params]);

  const fetchOfficerDetails = useCallback(async () => {
    console.log('🔍 fetchOfficerDetails called with:', { companyId, slug, authLoading });
    
    if (!companyId || !slug) {
      console.error('❌ Company ID or slug not found. Please contact support.', { companyId, slug });
      return;
    }

    try {
      setLoading(true);
      
      // Extract officer name from slug
      const officerName = slug.replace(/-/g, ' ');
      const nameParts = officerName.split(' ');
      const firstName = nameParts[0].toLowerCase();
      const lastName = nameParts.slice(1).join(' ').toLowerCase();

      console.log('🔍 Parsing officer details:', {
        slug,
        officerName,
        firstName,
        lastName,
        companyId
      });

      // Fetch officer details
      const response = await fetch(`/api/officers/details?companyId=${companyId}&firstName=${firstName}&lastName=${lastName}`);
      const result = await response.json();

      if (result.success) {
        setOfficerDetails(result.data);
        // Clear any existing notifications when successfully loaded
        clearAllNotifications();
      } else {
        console.error('❌ Officer details API error:', result);
        throw new Error(result.error || 'Failed to fetch officer details');
      }
    } catch (error) {
      console.error('Error fetching officer details:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch officer details. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [companyId, slug, authLoading, clearAllNotifications, showNotification]);

  useEffect(() => {
    console.log('🔄 useEffect triggered with:', { companyId, slug, authLoading });
    
    if (slug && companyId && !authLoading) {
      console.log('✅ Calling fetchOfficerDetails');
      fetchOfficerDetails();
    } else {
      console.log('⏳ Not calling fetchOfficerDetails because:', {
        slug: slug ? 'available' : 'missing',
        companyId: companyId ? 'available' : 'missing',
        authLoading: authLoading ? 'still loading' : 'finished'
      });
    }
  }, [companyId, slug, authLoading, fetchOfficerDetails]);

  // Clear any existing notifications when component mounts
  useEffect(() => {
    clearAllNotifications();
  }, [clearAllNotifications]);

  // Clear any existing notifications when auth is ready and we have companyId
  useEffect(() => {
    if (!authLoading && companyId) {
      clearAllNotifications();
    }
  }, [authLoading, companyId, clearAllNotifications]);

  if (loading || authLoading) {
    return (
      <RouteGuard allowedRoles={['super_admin', 'company_admin']}>
        <DashboardLayout 
          title="Officer Details" 
          subtitle="Loading officer information..."
          showBackButton={true}
        >
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  if (!officerDetails) {
    return (
      <RouteGuard allowedRoles={['super_admin', 'company_admin']}>
        <DashboardLayout 
          title="Officer Details" 
          subtitle="Officer not found"
          showBackButton={true}
        >
          <div className="text-center py-12">
            <p className="text-gray-500">Officer not found or you don't have permission to view this officer.</p>
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['super_admin', 'company_admin']}>
      <DashboardLayout 
        title={`${officerDetails.firstName} ${officerDetails.lastName}`}
        subtitle="Officer Details"
        showBackButton={true}
      >
        <div className="space-y-6">
          {/* Officer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SpotlightCard variant="primary" className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon name="user" className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{officerDetails.totalLeads}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard variant="warning" className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon name="alertTriangle" className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">High Priority</p>
                  <p className="text-2xl font-bold text-gray-900">{officerDetails.highPriorityLeads}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard variant="warning" className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon name="alertCircle" className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Urgent Priority</p>
                  <p className="text-2xl font-bold text-gray-900">{officerDetails.urgentPriorityLeads}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard variant="success" className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon name="checkCircle" className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Converted</p>
                  <p className="text-2xl font-bold text-gray-900">{officerDetails.convertedLeads}</p>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Officer Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <SpotlightCard variant="neutral" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Name:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {officerDetails.firstName} {officerDetails.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Email:</span>
                  <span className="text-sm font-medium text-gray-900">{officerDetails.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Status:</span>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                    officerDetails.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {officerDetails.isActive ? (
                      <>
                        <Icon name="checkCircle" className="w-3 h-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <Icon name="clock" className="w-3 h-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Joined:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(officerDetails.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </SpotlightCard>

            {/* Public Profile */}
            <SpotlightCard variant="neutral" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Public Profile</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Public Link:</span>
                  {officerDetails.hasPublicLink ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      <Icon name="checkCircle" className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      <Icon name="error" className="w-3 h-3 mr-1" />
                      None
                    </span>
                  )}
                </div>
                {officerDetails.publicLinkUrl && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">URL:</span>
                    <a 
                      href={officerDetails.publicLinkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 truncate max-w-xs"
                    >
                      {officerDetails.publicLinkUrl}
                    </a>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Template:</span>
                  {officerDetails.selectedTemplate ? (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {officerDetails.selectedTemplate}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">Not selected</span>
                  )}
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Recent Leads */}
          <SpotlightCard variant="neutral" className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
              <button
                onClick={() => router.push(`/admin/loanofficers/${slug}/leads`)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
              >
                View All Leads
              </button>
            </div>
            {officerDetails.recentLeads.length > 0 ? (
              <div className="space-y-2">
                {officerDetails.recentLeads.map((lead) => (
                  <div key={lead.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{lead.firstName} {lead.lastName}</p>
                      <p className="text-xs text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        lead.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        lead.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.priority}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                        lead.status === 'qualified' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent leads found.</p>
            )}
          </SpotlightCard>

        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
