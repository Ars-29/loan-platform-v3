'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { typography, colors, spacing, borderRadius } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';
import EnhancedLeadsTable from '@/components/analytics/tables/EnhancedLeadsTable';
import Breadcrumb, { BreadcrumbItem } from '@/components/ui/Breadcrumb';
import Pagination from '@/components/ui/Pagination';
import SearchFilter, { FilterOption } from '@/components/ui/SearchFilter';
import { useRouter } from 'next/navigation';
import Loader from '@/components/ui/Loader';

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
      // Get fresh session to ensure we have a valid token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication failed. Please refresh the page and try again.');
      }

      const response = await fetch(`/api/leads/${leadId}/analytics`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', response.status, errorData);
        
        if (response.status === 401) {
          throw new Error('Authentication expired. Please refresh the page and try again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to edit this lead.');
        } else {
          throw new Error(`Failed to update lead status: ${errorData.error || 'Unknown error'}`);
        }
      }

      // Update local state
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
      
      console.log('Lead status updated successfully');
    } catch (err) {
      console.error('Error updating lead status:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update lead status. Please try again.';
      alert(errorMessage);
    }
  };

  const handleConversionStageUpdate = async (leadId: string, newStage: Lead['conversionStage']) => {
    try {
      // Get fresh session to ensure we have a valid token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication failed. Please refresh the page and try again.');
      }

      const response = await fetch(`/api/leads/${leadId}/analytics`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ conversionStage: newStage }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', response.status, errorData);
        
        if (response.status === 401) {
          throw new Error('Authentication expired. Please refresh the page and try again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to edit this lead.');
        } else {
          throw new Error(`Failed to update conversion stage: ${errorData.error || 'Unknown error'}`);
        }
      }

      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, conversionStage: newStage } : lead
        )
      );
      
      console.log('Lead conversion stage updated successfully');
    } catch (err) {
      console.error('Error updating conversion stage:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update conversion stage. Please try again.';
      alert(errorMessage);
    }
  };

  const handlePriorityUpdate = async (leadId: string, newPriority: Lead['priority']) => {
    try {
      // Get fresh session to ensure we have a valid token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication failed. Please refresh the page and try again.');
      }

      const response = await fetch(`/api/leads/${leadId}/analytics`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priority: newPriority }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', response.status, errorData);
        
        if (response.status === 401) {
          throw new Error('Authentication expired. Please refresh the page and try again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to edit this lead.');
        } else {
          throw new Error(`Failed to update priority: ${errorData.error || 'Unknown error'}`);
        }
      }

      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, priority: newPriority } : lead
        )
      );
      
      console.log('Lead priority updated successfully');
    } catch (err) {
      console.error('Error updating priority:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update priority. Please try again.';
      alert(errorMessage);
    }
  };

  const handleQualityScoreUpdate = async (leadId: string, newScore: number) => {
    try {
      // Get fresh session to ensure we have a valid token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication failed. Please refresh the page and try again.');
      }

      const response = await fetch(`/api/leads/${leadId}/analytics`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ leadQualityScore: newScore }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', response.status, errorData);
        
        if (response.status === 401) {
          throw new Error('Authentication expired. Please refresh the page and try again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to edit this lead.');
        } else {
          throw new Error(`Failed to update quality score: ${errorData.error || 'Unknown error'}`);
        }
      }

      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, leadQualityScore: newScore } : lead
        )
      );
      
      console.log('Lead quality score updated successfully');
    } catch (err) {
      console.error('Error updating quality score:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update quality score. Please try again.';
      alert(errorMessage);
    }
  };

  const handleNotesUpdate = async (leadId: string, newNotes: string) => {
    try {
      // Get fresh session to ensure we have a valid token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication failed. Please refresh the page and try again.');
      }

      const response = await fetch(`/api/leads/${leadId}/analytics`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ notes: newNotes }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', response.status, errorData);
        
        if (response.status === 401) {
          throw new Error('Authentication expired. Please refresh the page and try again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to edit this lead.');
        } else {
          throw new Error(`Failed to update notes: ${errorData.error || 'Unknown error'}`);
        }
      }

      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, notes: newNotes } : lead
        )
      );
      
      console.log('Lead notes updated successfully');
    } catch (err) {
      console.error('Error updating notes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update notes. Please try again.';
      alert(errorMessage);
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
      <DashboardLayout showBreadcrumb={true}
        breadcrumbVariant="default"
        breadcrumbSize="md">
        <div className="flex flex-col items-center justify-center text-gray-600">
          <Loader />
          Loading leads...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout showBreadcrumb={true}
        breadcrumbVariant="default"
        breadcrumbSize="md">
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
    <DashboardLayout 
      showBreadcrumb={true}
      breadcrumbVariant="default"
      breadcrumbSize="md"
    >
      <div style={{ padding: spacing[6] }}>

        {/* Header with stats - Updated to use filtered data */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: spacing[4],
          marginBottom: spacing[6]
        }}>
          <div style={{
            padding: spacing[4],
            background: 'linear-gradient(135deg, #005b7c 0%, #007a9a 100%)',
            borderRadius: borderRadius.lg,
            border: 'none'
          }}>
            <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: 'white' }}>
              {filteredLeads.length}
            </div>
            <div style={{ fontSize: typography.fontSize.sm, color: 'white' }}>
              {searchQuery || statusFilter || stageFilter || priorityFilter || sourceFilter ? 'Filtered' : 'Total'} Leads
            </div>
          </div>
          
          <div style={{
            padding: spacing[4],
            background: 'linear-gradient(135deg, #005b7c 0%, #007a9a 100%)',
            borderRadius: borderRadius.lg,
            border: 'none'
          }}>
            <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: 'white' }}>
              {filteredLeads.filter(lead => lead.status === 'new').length}
            </div>
            <div style={{ fontSize: typography.fontSize.sm, color: 'white' }}>
              New Leads
            </div>
          </div>
          
          <div style={{
            padding: spacing[4],
            background: 'linear-gradient(135deg, #005b7c 0%, #007a9a 100%)',
            borderRadius: borderRadius.lg,
            border: 'none'
          }}>
            <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: 'white' }}>
              {filteredLeads.filter(lead => lead.status === 'converted').length}
            </div>
            <div style={{ fontSize: typography.fontSize.sm, color: 'white' }}>
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
