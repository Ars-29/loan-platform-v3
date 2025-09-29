'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/use-auth';
import { typography, colors, spacing, borderRadius } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';
import EnhancedLeadsTable from '@/components/analytics/tables/EnhancedLeadsTable';
import Breadcrumb, { BreadcrumbItem } from '@/components/ui/Breadcrumb';
import Pagination from '@/components/ui/Pagination';
import SearchFilter, { FilterOption } from '@/components/ui/SearchFilter';
import { useRouter } from 'next/navigation';

interface Lead {
  id: string;
  companyId: string;
  officerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  conversionStage: 'lead' | 'application' | 'approval' | 'closing';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: string;
  loanAmount?: number;
  loanAmountClosed?: number;
  commissionEarned?: number;
  downPayment?: number;
  creditScore?: number;
  responseTimeHours?: number;
  leadQualityScore?: number;
  geographicLocation?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastContactDate?: string;
  contactCount: number;
  loanDetails?: {
    productId: string;
    lenderName: string;
    loanProgram: string;
    loanType: string;
    loanTerm: number;
    interestRate: number;
    apr: number;
    monthlyPayment: number;
    fees: number;
    points: number;
    credits: number;
    lockPeriod: number;
  };
}

export default function LeadsPage() {
  const router = useRouter();
  const { user, accessToken } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  
  const ITEMS_PER_PAGE = 10;

  // Filter options
  const statusOptions: FilterOption[] = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'converted', label: 'Converted' },
    { value: 'lost', label: 'Lost' }
  ];
  
  const stageOptions: FilterOption[] = [
    { value: 'lead', label: 'Lead' },
    { value: 'application', label: 'Application' },
    { value: 'approval', label: 'Approval' },
    { value: 'closing', label: 'Closing' }
  ];
  
  const priorityOptions: FilterOption[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  // Get unique sources from leads for filter options
  const sourceOptions: FilterOption[] = useMemo(() => {
    const uniqueSources = Array.from(new Set(leads.map(lead => lead.source).filter(Boolean)));
    return uniqueSources.map(source => ({ value: source, label: source.charAt(0).toUpperCase() + source.slice(1) }));
  }, [leads]);

  // Filtered and paginated leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = !searchQuery || 
        `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone?.includes(searchQuery);
      
      const matchesStatus = !statusFilter || lead.status === statusFilter;
      const matchesStage = !stageFilter || lead.conversionStage === stageFilter;
      const matchesPriority = !priorityFilter || lead.priority === priorityFilter;
      const matchesSource = !sourceFilter || lead.source === sourceFilter;
      
      return matchesSearch && matchesStatus && matchesStage && matchesPriority && matchesSource;
    });
  }, [leads, searchQuery, statusFilter, stageFilter, priorityFilter, sourceFilter]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLeads, currentPage]);

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Leads', href: '/officers/leads', icon: 'home' }
  ];

  useEffect(() => {
    if (accessToken) {
      fetchLeads();
    }
  }, [accessToken]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, stageFilter, priorityFilter, sourceFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch('/api/leads', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const data = await response.json();
      setLeads(data.leads || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (leadId: string, newStatus: Lead['status']) => {
    try {
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(`/api/leads/${leadId}/analytics`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead status');
      }

      // Update local state
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
    } catch (err) {
      console.error('Error updating lead status:', err);
      alert('Failed to update lead status. Please try again.');
    }
  };

  const handleConversionStageUpdate = async (leadId: string, newStage: Lead['conversionStage']) => {
    try {
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(`/api/leads/${leadId}/analytics`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ conversionStage: newStage }),
      });

      if (!response.ok) {
        throw new Error('Failed to update conversion stage');
      }

      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, conversionStage: newStage } : lead
        )
      );
    } catch (err) {
      console.error('Error updating conversion stage:', err);
      alert('Failed to update conversion stage. Please try again.');
    }
  };

  const handlePriorityUpdate = async (leadId: string, newPriority: Lead['priority']) => {
    try {
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(`/api/leads/${leadId}/analytics`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ priority: newPriority }),
      });

      if (!response.ok) {
        throw new Error('Failed to update priority');
      }

      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, priority: newPriority } : lead
        )
      );
    } catch (err) {
      console.error('Error updating priority:', err);
      alert('Failed to update priority. Please try again.');
    }
  };

  const handleQualityScoreUpdate = async (leadId: string, newScore: number) => {
    try {
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(`/api/leads/${leadId}/analytics`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ leadQualityScore: newScore }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quality score');
      }

      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, leadQualityScore: newScore } : lead
        )
      );
    } catch (err) {
      console.error('Error updating quality score:', err);
      alert('Failed to update quality score. Please try again.');
    }
  };

  const handleNotesUpdate = async (leadId: string, newNotes: string) => {
    try {
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(`/api/leads/${leadId}/analytics`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ notes: newNotes }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notes');
      }

      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, notes: newNotes } : lead
        )
      );
    } catch (err) {
      console.error('Error updating notes:', err);
      alert('Failed to update notes. Please try again.');
    }
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new':
        return 'blue';
      case 'contacted':
        return 'yellow';
      case 'qualified':
        return 'green';
      case 'converted':
        return 'purple';
      case 'lost':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handler functions for new functionality
  const handleViewDetails = (lead: Lead) => {
    // Create a slug from the lead's name and ID for better UX
    const leadSlug = `${lead.firstName.toLowerCase()}-${lead.lastName.toLowerCase()}-${lead.id.slice(-8)}`;
    router.push(`/officers/leads/${leadSlug}`);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setStageFilter('');
    setPriorityFilter('');
    setSourceFilter('');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  if (loading) {
    return (
      <DashboardLayout title="Leads" subtitle="Manage your leads" showBackButton={true}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          fontSize: typography.fontSize.lg,
          color: colors.gray[600]
        }}>
          Loading leads...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Leads" subtitle="Manage your leads" showBackButton={true}>
        <div style={{
          padding: spacing[6],
          backgroundColor: colors.red[50],
          border: `1px solid ${colors.red[200]}`,
          borderRadius: borderRadius.md,
          color: colors.red[600]
        }}>
          <h3 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[2] }}>
            Error Loading Leads
          </h3>
          <p style={{ marginBottom: spacing[4] }}>{error}</p>
          <Button onClick={fetchLeads} variant="primary">
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Leads" subtitle="Manage your leads" showBackButton={true}>
      <div style={{ padding: spacing[6] }}>
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header with stats - Updated to use filtered data */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: spacing[4],
          marginBottom: spacing[6]
        }}>
          <div style={{
            padding: spacing[4],
            backgroundColor: colors.blue[50],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.blue[200]}`
          }}>
            <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.blue[600] }}>
              {filteredLeads.length}
            </div>
            <div style={{ fontSize: typography.fontSize.sm, color: colors.blue[600] }}>
              {searchQuery || statusFilter || stageFilter || priorityFilter || sourceFilter ? 'Filtered' : 'Total'} Leads
            </div>
          </div>
          
          <div style={{
            padding: spacing[4],
            backgroundColor: colors.green[50],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.green[200]}`
          }}>
            <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.green[600] }}>
              {filteredLeads.filter(lead => lead.status === 'new').length}
            </div>
            <div style={{ fontSize: typography.fontSize.sm, color: colors.green[600] }}>
              New Leads
            </div>
          </div>
          
          <div style={{
            padding: spacing[4],
            backgroundColor: colors.darkPurple[50],
            borderRadius: borderRadius.lg,
            border: `1px solid ${colors.darkPurple[200]}`
          }}>
            <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.darkPurple[600] }}>
              {filteredLeads.filter(lead => lead.status === 'converted').length}
            </div>
            <div style={{ fontSize: typography.fontSize.sm, color: colors.darkPurple[600] }}>
              Converted
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <SearchFilter
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filters={[
            {
              label: 'Status',
              key: 'status',
              value: statusFilter,
              options: statusOptions,
              onChange: setStatusFilter
            },
            {
              label: 'Stage',
              key: 'stage',
              value: stageFilter,
              options: stageOptions,
              onChange: setStageFilter
            },
            {
              label: 'Priority',
              key: 'priority',
              value: priorityFilter,
              options: priorityOptions,
              onChange: setPriorityFilter
            },
            {
              label: 'Source',
              key: 'source',
              value: sourceFilter,
              options: sourceOptions,
              onChange: setSourceFilter
            }
          ]}
          onClearFilters={handleClearFilters}
          placeholder="Search by name, email, or phone..."
          className="mb-6"
        />

        {/* Enhanced Leads Table with Pagination */}
        <EnhancedLeadsTable
          leads={paginatedLeads}
          loading={loading}
          onStatusUpdate={handleStatusUpdate}
          onConversionStageUpdate={handleConversionStageUpdate}
          onPriorityUpdate={handlePriorityUpdate}
          onQualityScoreUpdate={handleQualityScoreUpdate}
          onNotesUpdate={handleNotesUpdate}
          onViewDetails={handleViewDetails}
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          pageSize={ITEMS_PER_PAGE}
          totalItems={filteredLeads.length}
          className="mt-6"
        />
      </div>
    </DashboardLayout>
  );
}
