'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useNotification } from '@/components/ui/Notification';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { Button } from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { Pagination } from '@/components/ui/Pagination';

interface Officer {
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
}

interface Company {
  id: string;
  name: string;
  slug: string;
}


export default function SuperAdminOfficersPage() {
  const { loading: authLoading } = useAuth();
  const { showNotification, clearAllNotifications } = useNotification();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [officers, setOfficers] = useState<Officer[]>([]);
  const [filteredOfficers, setFilteredOfficers] = useState<Officer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Filters
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchOfficers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/super-admin/officers');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch officers');
      }

      setOfficers(result.data.officers);
      setCompanies(result.data.companies);
      console.log(`✅ Fetched ${result.data.officers.length} officers`);
    } catch (error) {
      console.error('❌ Error fetching officers:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch officers. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Handle URL query parameters
  useEffect(() => {
    const companySlug = searchParams.get('company');
    if (companySlug && companies.length > 0) {
      // Find company by slug and set the filter
      const company = companies.find(c => c.slug === companySlug);
      if (company) {
        setSelectedCompany(company.id);
        console.log(`🔍 Applied company filter from URL: ${company.name}`);
      }
    }
  }, [searchParams, companies]);

  // Apply filters
  useEffect(() => {
    let filtered = officers;

    // Filter by company
    if (selectedCompany) {
      filtered = filtered.filter(officer => officer.company.id === selectedCompany);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(officer => 
        officer.firstName.toLowerCase().includes(term) ||
        officer.lastName.toLowerCase().includes(term) ||
        officer.email.toLowerCase().includes(term) ||
        officer.company.name.toLowerCase().includes(term)
      );
    }

    setFilteredOfficers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [officers, selectedCompany, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredOfficers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOfficers = filteredOfficers.slice(startIndex, startIndex + pageSize);

  const handleStatusToggle = async (officerId: string, currentStatus: boolean) => {
    try {
      setUpdating(officerId);
      
      const response = await fetch('/api/super-admin/officers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          officerId,
          isActive: !currentStatus,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update officer status');
      }

      // Update local state
      setOfficers(prev => 
        prev.map(officer => 
          officer.id === officerId 
            ? { ...officer, isActive: !currentStatus }
            : officer
        )
      );

      showNotification({
        type: 'success',
        title: 'Success',
        message: `Officer ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('❌ Error updating officer status:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update officer status. Please try again.',
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleViewDetails = (officer: Officer) => {
    const officerSlug = `${officer.firstName}-${officer.lastName}`.toLowerCase().replace(/\s+/g, '-');
    router.push(`/super-admin/officers/${officerSlug}/details`);
  };

  useEffect(() => {
    fetchOfficers();
  }, [fetchOfficers]);

  // Clear notifications on unmount
  useEffect(() => {
    return () => clearAllNotifications();
  }, [clearAllNotifications]);

  if (authLoading || loading) {
    return (
      <RouteGuard allowedRoles={['super_admin']}>
        <DashboardLayout
          title="Loan Officers"
          subtitle="Manage all loan officers across companies"
          showBackButton={true}
        >
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Icon name="refresh" className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading officers...</span>
            </div>
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }


  return (
    <RouteGuard allowedRoles={['super_admin']}>
      <DashboardLayout
        title="Loan Officers"
        subtitle="Manage all loan officers across companies"
        showBackButton={true}
      >
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="space-y-4">
              {/* Search Bar */}
              <div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or company..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Company Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Companies</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters Button */}
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCompany('');
                    }}
                    variant="secondary"
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Officers Table */}
          <SpotlightCard variant="primary" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Officers ({filteredOfficers.length})
              </h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchOfficers}
                disabled={loading}
              >
                <Icon name="refresh" className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {paginatedOfficers.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="user" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {filteredOfficers.length === 0 && officers.length === 0
                    ? 'No officers found.'
                    : 'No officers match your current filters.'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Officer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedOfficers.map((officer) => (
                        <tr key={officer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {officer.firstName.charAt(0)}{officer.lastName.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {officer.firstName} {officer.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{officer.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{officer.company.name}</div>
                            <div className="text-sm text-gray-500">{officer.company.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {officer.isActive ? (
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
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(officer.joinedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleViewDetails(officer)}
                                className="text-xs"
                              >
                                View Details
                              </Button>
                              <Button
                                variant={officer.isActive ? "danger" : "primary"}
                                size="sm"
                                onClick={() => handleStatusToggle(officer.id, officer.isActive)}
                                disabled={updating === officer.id}
                                className="text-xs"
                              >
                                {updating === officer.id ? (
                                  <Icon name="refresh" className="w-3 h-3 animate-spin mr-1" />
                                ) : (
                                  <Icon 
                                    name={officer.isActive ? "user" : "user"} 
                                    className="w-3 h-3 mr-1" 
                                  />
                                )}
                                {officer.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      pageSize={pageSize}
                      totalItems={filteredOfficers.length}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </SpotlightCard>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
