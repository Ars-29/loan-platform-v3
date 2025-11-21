'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/use-auth';
import { typography, colors, spacing, borderRadius } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';
import EnhancedLeadsTable from '@/components/analytics/tables/EnhancedLeadsTable';
import Pagination from '@/components/ui/Pagination';
import SearchFilter, { FilterOption } from '@/components/ui/SearchFilter';
import { useRouter, useSearchParams } from 'next/navigation';
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
  officerName?: string;
  companyName?: string;
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

interface Company {
  id: string;
  name: string;
}

interface Officer {
  id: string;
  name: string;
  email: string;
  companyName?: string;
  companyId?: string;
}

interface AdminLeadsViewProps {
  isSuperAdmin?: boolean;
  showCompanyFilter?: boolean;
  showOfficerFilter?: boolean;
}

export default function AdminLeadsView({ 
  isSuperAdmin = false, 
  showCompanyFilter = false, 
  showOfficerFilter = true 
}: AdminLeadsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, accessToken, companyId } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Client-side pagination state
  const [allLeads, setAllLeads] = useState<Lead[]>([]); // All leads from server
  const [currentPage, setCurrentPage] = useState(1);
  
  // Pagination and filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedOfficer, setSelectedOfficer] = useState<string>('');
  
  const ITEMS_PER_PAGE = 10; // 10 leads per page as requested

  // Filter options
  const statusOptions: FilterOption[] = [
    { value: 'new', label: 'New', icon: 'plus' },
    { value: 'contacted', label: 'Contacted', icon: 'phone' },
    { value: 'qualified', label: 'Qualified', icon: 'checkCircle' },
    { value: 'converted', label: 'Converted', icon: 'success' },
    { value: 'lost', label: 'Lost', icon: 'error' }
  ];
  
  const stageOptions: FilterOption[] = [
    { value: 'lead', label: 'Lead', icon: 'target' },
    { value: 'application', label: 'Application', icon: 'document' },
    { value: 'approval', label: 'Approval', icon: 'checkCircle' },
    { value: 'closing', label: 'Closing', icon: 'calendar' }
  ];
  
  const priorityOptions: FilterOption[] = [
    { value: 'low', label: 'Low', icon: 'chevronsDown' },
    { value: 'medium', label: 'Medium', icon: 'filter' },
    { value: 'high', label: 'High', icon: 'chevronsUp' },
    { value: 'urgent', label: 'Urgent', icon: 'alertCircle' }
  ];

  // Get unique sources from leads for filter options
  const sourceOptions: FilterOption[] = useMemo(() => {
    const uniqueSources = Array.from(new Set(leads.map(lead => lead.source).filter(Boolean)));
    return uniqueSources.map(source => ({ 
      value: source, 
      label: source && typeof source === 'string' ? source.charAt(0).toUpperCase() + source.slice(1) : source
    }));
  }, [leads]);

  // Filtered and paginated leads
  // Client-side filtering
  const filteredLeads = useMemo(() => {
    return allLeads.filter(lead => {
      if (!lead) return false;
      
      const matchesSearch = !searchQuery || 
        `${lead.firstName || ''} ${lead.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.phone || '').includes(searchQuery);
      
      const matchesStatus = !statusFilter || lead.status === statusFilter;
      const matchesStage = !stageFilter || lead.conversionStage === stageFilter;
      const matchesPriority = !priorityFilter || lead.priority === priorityFilter;
      const matchesSource = !sourceFilter || lead.source === sourceFilter;
      const matchesCompany = !selectedCompany || lead.companyId === selectedCompany;
      const matchesOfficer = !selectedOfficer || lead.officerId === selectedOfficer;
      
      return matchesSearch && matchesStatus && matchesStage && matchesPriority && matchesSource && matchesCompany && matchesOfficer;
    });
  }, [allLeads, searchQuery, statusFilter, stageFilter, priorityFilter, sourceFilter, selectedCompany, selectedOfficer]);

  // Client-side pagination
  const calculatedTotalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLeads, currentPage]);


  // Fetch companies (for Super Admin)
  const fetchCompanies = async () => {
    if (!showCompanyFilter || !accessToken) {
      console.log('❌ fetchCompanies: Missing requirements', { showCompanyFilter, accessToken: !!accessToken });
      return;
    }
    
    try {
      console.log('🔄 fetchCompanies: Starting');
      
      const response = await fetch('/api/analytics/simple-leads-insights', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ fetchCompanies: API Error', response.status, errorText);
        throw new Error(`Failed to fetch companies: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ fetchCompanies: API Response', data);
      
      if (data.success) {
        const transformedCompanies = data.companies.map((company: any) => ({
          id: company.id,
          name: company.name
        }));
        console.log('✅ fetchCompanies: Transformed companies', transformedCompanies);
        setCompanies(transformedCompanies);
      } else {
        console.error('❌ fetchCompanies: API returned success=false', data);
      }
    } catch (err) {
      console.error('❌ Error fetching companies:', err);
    }
  };

  // Fetch officers based on selected company
  const fetchOfficers = async (companyId?: string) => {
    if (!showOfficerFilter || !accessToken) {
      console.log('❌ fetchOfficers: Missing requirements', { showOfficerFilter, accessToken: !!accessToken });
      return;
    }
    
    try {
      console.log('🔄 fetchOfficers: Starting', { companyId, isSuperAdmin });
      
      const url = companyId 
        ? `/api/analytics/simple-leads-insights?companyId=${companyId}`
        : '/api/analytics/simple-leads-insights';
        
      console.log('🌐 fetchOfficers: Fetching from URL:', url);
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ fetchOfficers: API Error', response.status, errorText);
        throw new Error(`Failed to fetch officers: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ fetchOfficers: API Response', data);
      
      if (data.success) {
        let officersData = [];
        
        if (companyId) {
          // For specific company - use officers array from response
          officersData = data.officers || [];
          console.log('📊 fetchOfficers: Officers for specific company', officersData);
        } else {
          // For all companies (Super Admin) - use officers array directly
          officersData = data.officers || [];
          console.log('📊 fetchOfficers: All officers from all companies', officersData);
        }
        
        const transformedOfficers = officersData.map((officer: any) => ({
          id: officer.id,
          name: officer.name || (officer.firstName && officer.lastName ? `${officer.firstName} ${officer.lastName}` : officer.email),
          email: officer.email,
          companyName: officer.companyName || 'Unknown Company',
          companyId: officer.companyId || officer.company_id
        }));
        
        console.log('✅ fetchOfficers: Transformed officers', transformedOfficers);
        setOfficers(transformedOfficers);
      } else {
        console.error('❌ fetchOfficers: API returned success=false', data);
      }
    } catch (err) {
      console.error('❌ Error fetching officers:', err);
    }
  };

  const fetchLeads = async () => {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      setError(null);

      // For admin roles, we need to fetch ALL leads from their scope (no pagination)
      let url = '/api/leads/filtered';
      const params = new URLSearchParams();
      
      // Only pass company filter to server (for company admin scope)
      if (selectedCompany) params.append('companyId', selectedCompany);
      
      // Set high limit to get all leads
      params.append('limit', '1000'); // High limit to get all leads
      params.append('page', '1');
      
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch leads: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      if (data.success) {
        // Ensure leads is an array and filter out any invalid entries
        const validLeads = (data.leads || []).filter((lead: any) => 
          lead && 
          typeof lead === 'object' && 
          lead.id && 
          lead.firstName && 
          lead.lastName
        );
        
        console.log('✅ fetchLeads: Valid leads received', validLeads.length);
        console.log('📊 All leads loaded for client-side filtering');
        
        setAllLeads(validLeads);
        setLeads(validLeads); // Keep for backward compatibility
      } else {
        throw new Error(data.error || 'Failed to fetch leads');
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data only once on mount
  useEffect(() => {
    if (accessToken) {
      fetchLeads();
      fetchCompanies();
      if (isSuperAdmin) {
        fetchOfficers();
      } else {
        fetchOfficers(companyId || undefined);
      }
    }
  }, [accessToken, companyId, isSuperAdmin]);

  // Handle URL query parameters
  useEffect(() => {
    const companySlug = searchParams.get('company');
    if (companySlug && companies.length > 0) {
      // Find company by slug and set the filter
      const company = companies.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === companySlug);
      if (company) {
        setSelectedCompany(company.id);
        console.log(`🔍 Applied company filter from URL: ${company.name}`);
      }
    }
  }, [searchParams, companies]);

  // Reset to page 1 when filters change (client-side)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, stageFilter, priorityFilter, sourceFilter, selectedCompany, selectedOfficer]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  // Handle company filter change
  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId);
    setSelectedOfficer(''); // Reset officer filter
    setCurrentPage(1);
  };

  // Filter officers based on selected company
  const filteredOfficers = useMemo(() => {
    if (!selectedCompany) {
      return officers; // Show all officers if no company selected
    }
    return officers.filter(officer => officer.companyId === selectedCompany);
  }, [officers, selectedCompany]);

  // Handle officer filter change
  const handleOfficerChange = (officerId: string) => {
    setSelectedOfficer(officerId);
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setStageFilter('');
    setPriorityFilter('');
    setSourceFilter('');
    setSelectedCompany('');
    setSelectedOfficer('');
    setCurrentPage(1);
  };

  // Calculate stats from filtered leads
  const newLeads = filteredLeads.filter(lead => lead.status === 'new').length;
  const convertedLeads = filteredLeads.filter(lead => lead.status === 'converted').length;
  const conversionRate = filteredLeads.length > 0 ? Math.round((convertedLeads / filteredLeads.length) * 100) : 0;

  // Handle lead updates (placeholder functions)
  const handleStatusUpdate = (leadId: string, newStatus: Lead['status']) => {
    console.log('Status update:', leadId, newStatus);
    // TODO: Implement status update
  };

  const handleConversionStageUpdate = (leadId: string, newStage: Lead['conversionStage']) => {
    console.log('Stage update:', leadId, newStage);
    // TODO: Implement stage update
  };

  const handlePriorityUpdate = (leadId: string, newPriority: Lead['priority']) => {
    console.log('Priority update:', leadId, newPriority);
    // TODO: Implement priority update
  };

  const handleQualityScoreUpdate = (leadId: string, newScore: number) => {
    console.log('Quality score update:', leadId, newScore);
    // TODO: Implement quality score update
  };

  const handleNotesUpdate = (leadId: string, newNotes: string) => {
    console.log('Notes update:', leadId, newNotes);
    // TODO: Implement notes update
  };

  const handleViewDetails = (lead: Lead) => {
    // Generate slug for navigation (same format as loan officer portal)
    const slug = `${lead.firstName.toLowerCase()}-${lead.lastName.toLowerCase()}-${lead.id.slice(-8)}`;
    
    // Navigate based on user role
    if (isSuperAdmin) {
      router.push(`/super-admin/officers/${lead.officerName?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}/leads/${slug}`);
    } else {
      router.push(`/admin/insights/loanofficers/${lead.officerName?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}/leads/${slug}`);
    }
  };

  if (loading) {
    return (
      <Loader />
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">Error loading leads</div>
        <div className="text-gray-500 text-sm">{error}</div>
        <Button onClick={fetchLeads} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards - Exact same as loan officers page */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl shadow-sm border" style={{ background: 'linear-gradient(135deg, #005b7c 0%, #007a9a 100%)' }}>
          <div className="text-sm font-medium text-white">Total Leads</div>
          <div className="text-2xl font-bold text-white">{filteredLeads.length}</div>
        </div>
        <div className="p-6 rounded-xl shadow-sm border" style={{ background: 'linear-gradient(135deg, #005b7c 0%, #007a9a 100%)' }}>
          <div className="text-sm font-medium text-white">New Leads</div>
          <div className="text-2xl font-bold text-white">{newLeads}</div>
        </div>
        <div className="p-6 rounded-xl shadow-sm border" style={{ background: 'linear-gradient(135deg, #005b7c 0%, #007a9a 100%)' }}>
          <div className="text-sm font-medium text-white">Converted</div>
          <div className="text-2xl font-bold text-white">{convertedLeads}</div>
        </div>
      </div>

      {/* Search and Filters - Enhanced with admin filters */}
      <div 
        className="bg-white p-6 shadow-sm border"
        style={{ borderRadius: borderRadius.lg }}
      >
        <div className="space-y-4">
          {/* Search Bar */}
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01bcc6]"
            />
          </div>

          {/* Filter Row 1: Admin-specific filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Company Filter (Super Admin only) */}
            {showCompanyFilter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <select
                  value={selectedCompany}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01bcc6]"
                >
                  <option value="">All Companies</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Officer Filter */}
            {showOfficerFilter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Officer 
                  {showCompanyFilter && !selectedCompany && (
                    <span className="text-xs text-gray-500 ml-1">(Select company first)</span>
                  )}
                  {selectedCompany && ` (${filteredOfficers.length} officers)`}
                </label>
                <select
                  value={selectedOfficer}
                  onChange={(e) => handleOfficerChange(e.target.value)}
                  disabled={showCompanyFilter && !selectedCompany}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#01bcc6] ${
                    showCompanyFilter && !selectedCompany
                      ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="">
                    {showCompanyFilter && !selectedCompany 
                      ? 'Select a company first' 
                      : 'All Officers'
                    }
                  </option>
                  {filteredOfficers.map((officer) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <Button
                variant="primary"
                onClick={handleClearFilters}
                className="w-full bg-[#01bcc6] hover:bg-[#008eab] text-white"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Filter Row 2: Standard filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01bcc6]"
              >
                <option value="">All Status</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01bcc6]"
              >
                <option value="">All Stage</option>
                {stageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01bcc6]"
              >
                <option value="">All Priority</option>
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01bcc6]"
              >
                <option value="">All Source</option>
                {sourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div 
        className="bg-white shadow-sm border"
        style={{ borderRadius: borderRadius.lg }}
      >
        <EnhancedLeadsTable
          leads={paginatedLeads}
          loading={loading}
          onStatusUpdate={handleStatusUpdate}
          onConversionStageUpdate={handleConversionStageUpdate}
          onPriorityUpdate={handlePriorityUpdate}
          onQualityScoreUpdate={handleQualityScoreUpdate}
          onNotesUpdate={handleNotesUpdate}
          onViewDetails={handleViewDetails}
          allowEditing={false} // Disable editing for Super Admins and Company Admins
        />
        
        {/* Client-side Pagination */}
        {!loading && filteredLeads.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage || 1) - 1) * ITEMS_PER_PAGE + 1} to {Math.min((currentPage || 1) * ITEMS_PER_PAGE, filteredLeads.length)} of {filteredLeads.length} results
              </div>
              <Pagination
                currentPage={currentPage || 1}
                totalPages={calculatedTotalPages || 1}
                onPageChange={handlePageChange}
                pageSize={ITEMS_PER_PAGE}
                totalItems={filteredLeads.length}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
