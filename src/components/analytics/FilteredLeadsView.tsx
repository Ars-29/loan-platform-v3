'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import SearchFilter, { FilterOption } from '@/components/ui/SearchFilter';
import Pagination from '@/components/ui/Pagination';
import { icons } from '@/components/ui/Icon';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: string;
  loanAmount?: number;
  creditScore?: number;
  leadQualityScore?: number;
  geographicLocation?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastContactDate?: string;
  contactCount: number;
  officerName?: string;
  companyName?: string;
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
}

interface FilteredLeadsViewProps {
  isSuperAdmin?: boolean;
  showCompanyFilter?: boolean;
  showOfficerFilter?: boolean;
}

export default function FilteredLeadsView({ 
  isSuperAdmin = false, 
  showCompanyFilter = false, 
  showOfficerFilter = true 
}: FilteredLeadsViewProps) {
  const { accessToken, companyId } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedOfficer, setSelectedOfficer] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 10;

  // Filter options
  const statusOptions: FilterOption[] = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'converted', label: 'Converted' },
    { value: 'lost', label: 'Lost' }
  ];
  
  // Note: conversionStage column doesn't exist in the database
  // const stageOptions: FilterOption[] = [
  //   { value: 'lead', label: 'Lead' },
  //   { value: 'application', label: 'Application' },
  //   { value: 'approval', label: 'Approval' },
  //   { value: 'closing', label: 'Closing' }
  // ];
  
  const priorityOptions: FilterOption[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  // Fetch companies (for Super Admin)
  const fetchCompanies = async () => {
    if (!showCompanyFilter || !accessToken) return;
    
    try {
      const response = await fetch('/api/analytics/simple-leads-insights', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch companies');
      
      const data = await response.json();
      if (data.success) {
        setCompanies(data.companies.map((company: any) => ({
          id: company.id,
          name: company.name
        })));
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  // Fetch officers based on selected company
  const fetchOfficers = async (companyId?: string) => {
    if (!showOfficerFilter || !accessToken) return;
    
    try {
      const url = companyId 
        ? `/api/analytics/simple-leads-insights?companyId=${companyId}`
        : '/api/analytics/simple-leads-insights';
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch officers');
      
      const data = await response.json();
      if (data.success) {
        const officersData = companyId ? data.officers : data.companies.flatMap((c: any) => c.loanOfficers || []);
        setOfficers(officersData.map((officer: any) => ({
          id: officer.id,
          name: officer.firstName && officer.lastName ? `${officer.firstName} ${officer.lastName}` : officer.name,
          email: officer.email,
          companyName: officer.companyName
        })));
      }
    } catch (err) {
      console.error('Error fetching officers:', err);
    }
  };

  // Fetch leads based on filters
  const fetchLeads = async () => {
    if (!accessToken) {
      console.log('❌ No access token available');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching leads with filters...');

      let url = '/api/leads/filtered';
      const params = new URLSearchParams();
      
      if (selectedCompany) params.append('companyId', selectedCompany);
      if (selectedOfficer) params.append('officerId', selectedOfficer);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      params.append('page', currentPage.toString());
      params.append('limit', ITEMS_PER_PAGE.toString());
      
      if (params.toString()) url += `?${params.toString()}`;

      console.log('🌐 Fetching from URL:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Failed to fetch leads: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Leads data received:', data);
      
      setLeads(data.leads || []);
      setTotalItems(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('❌ Error fetching leads:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    console.log('🔄 useEffect: Loading initial data', { accessToken: !!accessToken, companyId, isSuperAdmin });
    if (accessToken) {
      fetchCompanies();
      if (isSuperAdmin) {
        fetchOfficers();
      } else {
        fetchOfficers(companyId || undefined);
      }
    }
  }, [accessToken, companyId, isSuperAdmin]);

  // Fetch leads when filters change
  useEffect(() => {
    console.log('🔄 useEffect: Fetching leads', { 
      selectedCompany, 
      selectedOfficer, 
      searchQuery, 
      statusFilter, 
      priorityFilter, 
      currentPage,
      accessToken: !!accessToken 
    });
    if (accessToken) {
      fetchLeads();
    }
  }, [selectedCompany, selectedOfficer, searchQuery, statusFilter, priorityFilter, currentPage, accessToken]);

  // Handle company filter change
  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId);
    setSelectedOfficer(''); // Reset officer filter
    setCurrentPage(1);
  };

  // Handle officer filter change
  const handleOfficerChange = (officerId: string) => {
    setSelectedOfficer(officerId);
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
    setSelectedCompany('');
    setSelectedOfficer('');
    setCurrentPage(1);
  };

  // Get filtered leads for display
  const filteredLeads = leads;

  // Calculate stats
  const totalLeads = filteredLeads.length;
  const newLeads = filteredLeads.filter(lead => lead.status === 'new').length;
  const convertedLeads = filteredLeads.filter(lead => lead.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  // Data table columns
  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (lead: Lead) => (
        <div>
          <div className="font-medium text-gray-900">{lead.firstName} {lead.lastName}</div>
          <div className="text-sm text-gray-500">{lead.email}</div>
        </div>
      )
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (lead: Lead) => lead.phone || '-'
    },
    {
      key: 'status',
      title: 'Status',
      render: (lead: Lead) => {
        const statusColors = {
          new: 'bg-blue-100 text-blue-800',
          contacted: 'bg-yellow-100 text-yellow-800',
          qualified: 'bg-green-100 text-green-800',
          converted: 'bg-purple-100 text-purple-800',
          lost: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (lead: Lead) => {
        const priorityColors = {
          low: 'bg-gray-100 text-gray-800',
          medium: 'bg-blue-100 text-blue-800',
          high: 'bg-yellow-100 text-yellow-800',
          urgent: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[lead.priority]}`}>
            {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'officer',
      title: 'Officer',
      render: (lead: Lead) => lead.officerName || '-'
    },
    {
      key: 'company',
      title: 'Company',
      render: (lead: Lead) => lead.companyName || '-'
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (lead: Lead) => new Date(lead.createdAt).toLocaleDateString()
    }
  ];

  if (loading && leads.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{totalLeads}</div>
          <div className="text-sm text-gray-600">Total Leads</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{newLeads}</div>
          <div className="text-sm text-gray-600">New Leads</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{convertedLeads}</div>
          <div className="text-sm text-gray-600">Converted</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">{conversionRate}%</div>
          <div className="text-sm text-gray-600">Conversion Rate</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Company Filter (Super Admin only) */}
          {showCompanyFilter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <select
                value={selectedCompany}
                onChange={(e) => handleCompanyChange(e.target.value)}
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
          )}

          {/* Officer Filter */}
          {showOfficerFilter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loan Officer</label>
              <select
                value={selectedOfficer}
                onChange={(e) => handleOfficerChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Officers</option>
                {officers.map((officer) => (
                  <option key={officer.id} value={officer.id}>
                    {officer.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={handleClearFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Priorities</option>
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DataTable
          data={filteredLeads}
          columns={columns}
          loading={loading}
          emptyMessage="No leads found"
        />
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={ITEMS_PER_PAGE}
              totalItems={totalLeads}
            />
          </div>
        )}
      </div>
    </div>
  );
}
