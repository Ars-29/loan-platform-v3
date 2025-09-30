'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useNotification } from '@/components/ui/Notification';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { Button } from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';

interface OfficerDetails {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  joinedAt: string;
  createdAt: string;
  company: {
    id: string;
    name: string;
    slug: string;
    email: string;
    adminEmail: string;
    isActive: boolean;
    deactivated: boolean;
  };
  stats: {
    totalLeads: number;
    highPriorityLeads: number;
    urgentPriorityLeads: number;
    convertedLeads: number;
    activePublicLinks: number;
  };
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

export default function OfficerDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { loading: authLoading } = useAuth();
  const { showNotification, clearAllNotifications } = useNotification();
  const router = useRouter();
  const [slug, setSlug] = useState<string>('');

  // Resolve params from Promise
  useEffect(() => {
    params.then(resolvedParams => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

  const [officerDetails, setOfficerDetails] = useState<OfficerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOfficerDetails = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching officer details for slug:', slug);
      
      // First, get the officer from the super admin officers API
      const officersResponse = await fetch('/api/super-admin/officers');
      const officersResult = await officersResponse.json();

      if (!officersResult.success) {
        throw new Error(officersResult.error || 'Failed to fetch officers');
      }

      console.log('📋 Total officers found:', officersResult.data.officers.length);

      // Find officer by slug (which is firstName-lastName format)
      const officer = officersResult.data.officers.find((o: any) => {
        const officerSlug = `${o.firstName}-${o.lastName}`.toLowerCase().replace(/\s+/g, '-');
        console.log(`🔍 Checking officer: ${o.firstName} ${o.lastName} -> slug: ${officerSlug} vs target: ${slug}`);
        return officerSlug === slug;
      });
      
      if (!officer) {
        console.error('❌ Officer not found for slug:', slug);
        console.log('Available officers:', officersResult.data.officers.map((o: any) => `${o.firstName}-${o.lastName}`.toLowerCase().replace(/\s+/g, '-')));
        throw new Error('Officer not found');
      }

      console.log('✅ Found officer:', officer.firstName, officer.lastName);

      // Get officer's leads and stats
      const leadsResponse = await fetch(`/api/super-admin/officers/${slug}/leads`);
      const leadsResult = await leadsResponse.json();

      if (!leadsResult.success) {
        throw new Error(leadsResult.error || 'Failed to fetch officer leads');
      }

      const leadsData = leadsResult.data;
      
      // Use the stats from the API response
      const stats = leadsData.stats;
      
      // Use the recent leads from the API response
      const recentLeads = leadsData.recentLeads;

      setOfficerDetails({
        ...officer,
        stats,
        recentLeads
      });

      console.log(`✅ Found officer: ${officer.firstName} ${officer.lastName} from ${officer.company.name}`);
    } catch (error) {
      console.error('❌ Error fetching officer details:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch officer details. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [slug, showNotification]);

  const handleStatusToggle = async () => {
    if (!officerDetails) return;

    try {
      setUpdating(true);
      
      const response = await fetch('/api/super-admin/officers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          officerId: officerDetails.id,
          isActive: !officerDetails.isActive,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update officer status');
      }

      // Update local state
      setOfficerDetails(prev => prev ? {
        ...prev,
        isActive: !prev.isActive
      } : null);

      showNotification({
        type: 'success',
        title: 'Success',
        message: `Officer ${!officerDetails.isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('❌ Error updating officer status:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update officer status. Please try again.',
      });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (slug && !authLoading) {
      fetchOfficerDetails();
    }
  }, [slug, authLoading, fetchOfficerDetails]);

  // Clear notifications on unmount
  useEffect(() => {
    return () => clearAllNotifications();
  }, [clearAllNotifications]);

  if (authLoading || loading) {
    return (
      <RouteGuard allowedRoles={['super_admin']}>
        <DashboardLayout
          title="Officer Details"
          subtitle="Loading officer information..."
          showBackButton={true}
        >
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Icon name="refresh" className="w-6 h-6 animate-spin text-[#01bcc6]" />
              <span className="text-gray-600">Loading officer details...</span>
            </div>
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  if (!officerDetails) {
    return (
      <RouteGuard allowedRoles={['super_admin']}>
        <DashboardLayout
          title="Officer Details"
          subtitle="Officer not found"
          showBackButton={true}
        >
          <div className="text-center py-8">
            <Icon name="user" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Officer not found or you don't have permission to view this officer.</p>
            <Button
              variant="primary"
              onClick={() => router.push('/super-admin/officers')}
              className="mt-4"
            >
              Back to Officers
            </Button>
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['super_admin']}>
      <DashboardLayout
        title="Officer Details"
        subtitle={`${officerDetails.firstName} ${officerDetails.lastName} - ${officerDetails.company.name}`}
        showBackButton={true}
      >
        <div className="space-y-6">
          {/* Officer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <SpotlightCard variant="primary" className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-[#01bcc6]/10 rounded-lg">
                  <Icon name="user" className="w-6 h-6 text-[#01bcc6]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{officerDetails.stats.totalLeads}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{officerDetails.stats.highPriorityLeads}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{officerDetails.stats.urgentPriorityLeads}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{officerDetails.stats.convertedLeads}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard variant="primary" className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-[#01bcc6]/10 rounded-lg">
                  <Icon name="link" className="w-6 h-6 text-[#01bcc6]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Public Links</p>
                  <p className="text-2xl font-bold text-gray-900">{officerDetails.stats.activePublicLinks}</p>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Officer Information */}
          <SpotlightCard variant="default" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Officer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-sm text-gray-900">{officerDetails.firstName} {officerDetails.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-sm text-gray-900">{officerDetails.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Company</label>
                <p className="text-sm text-gray-900">{officerDetails.company.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Company Email</label>
                <p className="text-sm text-gray-900">{officerDetails.company.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="flex items-center">
                  {officerDetails.isActive ? (
                    <>
                      <Icon name="checkCircle" className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-green-600">Active</span>
                    </>
                  ) : (
                    <>
                      <Icon name="error" className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-sm text-red-600">Inactive</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Joined</label>
                <p className="text-sm text-gray-900">
                  {new Date(officerDetails.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </SpotlightCard>

          {/* Recent Leads Section */}
          <SpotlightCard variant="primary" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/super-admin/officers/${slug}/leads`)}
              >
                View All Leads
              </Button>
            </div>
            <div className="space-y-3">
              {officerDetails.recentLeads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-[#01bcc6]/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-[#01bcc6]">
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
              {officerDetails.recentLeads.length === 0 && (
                <p className="text-gray-500 text-center py-4">No leads found for this officer.</p>
              )}
            </div>
          </SpotlightCard>

          {/* Actions */}
          <SpotlightCard variant="default" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="flex items-center space-x-4">
              <Button
                variant={officerDetails.isActive ? "danger" : "primary"}
                onClick={handleStatusToggle}
                disabled={updating}
              >
                {updating ? (
                  <Icon name="refresh" className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Icon 
                    name={officerDetails.isActive ? "user" : "user"} 
                    className="w-4 h-4 mr-2" 
                  />
                )}
                {officerDetails.isActive ? 'Deactivate Officer' : 'Activate Officer'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => router.push('/super-admin/officers')}
              >
                Back to Officers
              </Button>
            </div>
          </SpotlightCard>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
