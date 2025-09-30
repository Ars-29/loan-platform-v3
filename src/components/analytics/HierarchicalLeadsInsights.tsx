'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import Breadcrumb, { BreadcrumbItem } from '@/components/ui/Breadcrumb';
import Pagination from '@/components/ui/Pagination';
import SearchFilter, { FilterOption } from '@/components/ui/SearchFilter';

// Types
interface Company {
  id: string;
  name: string;
  totalOfficers: number;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
}

interface Officer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId: string;
  companyName: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  slug: string;
}

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  conversionStage: 'lead' | 'application' | 'approval' | 'closing';
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
  slug: string;
}

interface LeadDetails extends Lead {
  loanAmountClosed?: number;
  commissionEarned?: number;
  responseTimeHours?: number;
  conversionDate?: string;
  applicationDate?: string;
  approvalDate?: string;
  closingDate?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  propertyDetails?: Record<string, any>;
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

// Navigation levels
type NavigationLevel = 'companies' | 'officers' | 'leads' | 'lead-details';

export default function HierarchicalLeadsInsights() {
  const { accessToken } = useAuth();
  const router = useRouter();
  
  // Navigation state
  const [currentLevel, setCurrentLevel] = useState<NavigationLevel>('companies');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadDetails | null>(null);
  
  // Data state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 10;
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Filter options for leads
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

  // Breadcrumb generation
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: 'Leads Insights', href: '/super-admin/insights', icon: 'home' }
    ];

    if (currentLevel === 'officers' && selectedCompany) {
      items.push({ label: selectedCompany.name, icon: 'home' });
    } else if (currentLevel === 'leads' && selectedCompany && selectedOfficer) {
      items.push({ label: selectedCompany.name, icon: 'home' });
      items.push({ label: `${selectedOfficer.firstName} ${selectedOfficer.lastName}`, icon: 'user' });
    } else if (currentLevel === 'lead-details' && selectedCompany && selectedOfficer && selectedLead) {
      items.push({ label: selectedCompany.name, icon: 'home' });
      items.push({ label: `${selectedOfficer.firstName} ${selectedOfficer.lastName}`, icon: 'user' });
      items.push({ label: `${selectedLead.firstName} ${selectedLead.lastName}`, icon: 'profile' });
    }

    return items;
  };

  // Navigation functions
  const navigateToOfficers = (company: Company) => {
    setSelectedCompany(company);
    setCurrentLevel('officers');
    setCurrentPage(1);
    setSearchQuery('');
    fetchOfficers(company.id);
  };

  const navigateToLeads = (officer: Officer) => {
    console.log('Navigating to leads for officer:', officer);
    console.log('Officer slug:', officer.slug);
    setSelectedOfficer(officer);
    setCurrentLevel('leads');
    setCurrentPage(1);
    setSearchQuery('');
    setStatusFilter('');
    setStageFilter('');
    setPriorityFilter('');
    fetchLeads(officer.slug);
  };

  const navigateToLeadDetails = (lead: Lead) => {
    // Generate lead slug from lead data (firstName-lastName-{8-character-id})
    const leadSlug = `${lead.firstName}-${lead.lastName}-${lead.id.slice(-8)}`.toLowerCase().replace(/\s+/g, '-');
    console.log('Navigating to lead details for:', lead);
    console.log('Generated lead slug:', leadSlug);
    setSelectedLead(lead as LeadDetails);
    setCurrentLevel('lead-details');
    fetchLeadDetails(leadSlug);
  };

  const navigateBack = () => {
    if (currentLevel === 'officers') {
      setCurrentLevel('companies');
      setSelectedCompany(null);
      setCurrentPage(1);
      fetchCompanies();
    } else if (currentLevel === 'leads') {
      setCurrentLevel('officers');
      setSelectedOfficer(null);
      setCurrentPage(1);
      if (selectedCompany) {
        fetchOfficers(selectedCompany.id);
      }
    } else if (currentLevel === 'lead-details') {
      setCurrentLevel('leads');
      setSelectedLead(null);
      if (selectedOfficer?.slug) {
        fetchLeads(selectedOfficer.slug);
      }
    }
  };

  // Data fetching functions
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/analytics/simple-leads-insights', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch companies data');
      }

      const data = await response.json();
      setCompanies(data.companies || []);
      setTotalItems(data.companies?.length || 0);
      setTotalPages(Math.ceil((data.companies?.length || 0) / ITEMS_PER_PAGE));
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async (companyId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/analytics/simple-leads-insights?companyId=${companyId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch officers data');
      }

      const data = await response.json();
      console.log('Officers data received:', data);
      setOfficers(data.officers || []);
      setTotalItems(data.officers?.length || 0);
      setTotalPages(Math.ceil((data.officers?.length || 0) / ITEMS_PER_PAGE));
    } catch (err) {
      console.error('Error fetching officers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch officers');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async (officerSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!officerSlug) {
        throw new Error('Officer slug not available');
      }

      const response = await fetch(`/api/officers/by-slug/${officerSlug}/leads`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leads data');
      }

      const data = await response.json();
      setLeads(data.leads || []);
      setTotalItems(data.leads?.length || 0);
      setTotalPages(Math.ceil((data.leads?.length || 0) / ITEMS_PER_PAGE));
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadDetails = async (leadSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!leadSlug) {
        throw new Error('Lead slug not available');
      }

      const response = await fetch(`/api/leads/by-slug/${leadSlug}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lead details');
      }

      const data = await response.json();
      setSelectedLead(data.lead);
    } catch (err) {
      console.error('Error fetching lead details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch lead details');
    } finally {
      setLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    if (accessToken && currentLevel === 'companies') {
      fetchCompanies();
    }
  }, [accessToken, currentLevel]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, stageFilter, priorityFilter]);

  // Filter and paginate data
  const getFilteredData = () => {
    let data: any[] = [];
    
    if (currentLevel === 'companies') {
      data = companies;
    } else if (currentLevel === 'officers') {
      data = officers;
    } else if (currentLevel === 'leads') {
      data = leads.filter(lead => {
        const matchesSearch = !searchQuery || 
          `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.phone?.includes(searchQuery);
        
        const matchesStatus = !statusFilter || lead.status === statusFilter;
        const matchesStage = !stageFilter || lead.conversionStage === stageFilter;
        const matchesPriority = !priorityFilter || lead.priority === priorityFilter;
        
        return matchesSearch && matchesStatus && matchesStage && matchesPriority;
      });
    }

    return data;
  };

  const filteredData = getFilteredData();
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Update pagination when data changes
  useEffect(() => {
    const filtered = getFilteredData();
    setTotalItems(filtered.length);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
  }, [companies, officers, leads, searchQuery, statusFilter, stageFilter, priorityFilter]);

  // Render functions
  const renderCompanies = () => {
    const columns = [
      {
        key: 'name',
        title: 'Company Name',
        render: (value: any, company: Company) => (
          <div>
            <div className="font-medium text-gray-900">{company.name}</div>
          </div>
        )
      },
      {
        key: 'totalOfficers',
        title: 'Loan Officers',
        render: (value: any, company: Company) => (
          <span className="text-gray-900">{company.totalOfficers} officers</span>
        )
      },
      {
        key: 'totalLeads',
        title: 'Total Leads',
        render: (value: any, company: Company) => (
          <span className="text-gray-900">{company.totalLeads}</span>
        )
      },
      {
        key: 'convertedLeads',
        title: 'Converted',
        render: (value: any, company: Company) => (
          <span className="text-gray-900">{company.convertedLeads}</span>
        )
      },
      {
        key: 'conversionRate',
        title: 'Conversion Rate',
        render: (value: any, company: Company) => (
          <span className="text-gray-900">{company.conversionRate.toFixed(1)}%</span>
        )
      },
      {
        key: 'actions',
        title: 'Actions',
        render: (value: any, company: Company) => (
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigateToOfficers(company)}
          >
            View Officers
          </Button>
        )
      }
    ];

    return (
      <DataTable
        data={paginatedData}
        columns={columns}
        loading={loading}
        emptyMessage="No companies found"
      />
    );
  };

  const renderOfficers = () => {
    const columns = [
      {
        key: 'name',
        title: 'Officer Name',
        render: (value: any, officer: Officer) => (
          <div>
            <div className="font-medium text-gray-900">{officer.firstName} {officer.lastName}</div>
            <div className="text-sm text-gray-500">{officer.email}</div>
          </div>
        )
      },
      {
        key: 'companyName',
        title: 'Company',
        render: (value: any, officer: Officer) => (
          <span className="text-gray-900">{officer.companyName}</span>
        )
      },
      {
        key: 'totalLeads',
        title: 'Total Leads',
        render: (value: any, officer: Officer) => (
          <span className="text-gray-900">{officer.totalLeads}</span>
        )
      },
      {
        key: 'convertedLeads',
        title: 'Converted',
        render: (value: any, officer: Officer) => (
          <span className="text-gray-900">{officer.convertedLeads}</span>
        )
      },
      {
        key: 'conversionRate',
        title: 'Conversion Rate',
        render: (value: any, officer: Officer) => (
          <span className="text-gray-900">{officer.conversionRate.toFixed(1)}%</span>
        )
      },
      {
        key: 'actions',
        title: 'Actions',
        render: (value: any, officer: Officer) => (
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigateToLeads(officer)}
          >
            View Leads
          </Button>
        )
      }
    ];

    return (
      <DataTable
        data={paginatedData}
        columns={columns}
        loading={loading}
        emptyMessage="No officers found"
      />
    );
  };

  const renderLeads = () => {
    const getStatusColor = (status: Lead['status']) => {
      switch (status) {
        case 'new': return 'bg-blue-100 text-blue-800';
        case 'contacted': return 'bg-yellow-100 text-yellow-800';
        case 'qualified': return 'bg-green-100 text-green-800';
        case 'converted': return 'bg-purple-100 text-purple-800';
        case 'lost': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getStageColor = (stage: Lead['conversionStage']) => {
      switch (stage) {
        case 'lead': return 'bg-blue-100 text-blue-800';
        case 'application': return 'bg-yellow-100 text-yellow-800';
        case 'approval': return 'bg-green-100 text-green-800';
        case 'closing': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getPriorityColor = (priority: Lead['priority']) => {
      switch (priority) {
        case 'low': return 'bg-gray-100 text-gray-800';
        case 'medium': return 'bg-blue-100 text-blue-800';
        case 'high': return 'bg-yellow-100 text-yellow-800';
        case 'urgent': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const columns = [
      {
        key: 'name',
        title: 'Name',
        render: (value: any, lead: Lead) => (
          <div>
            <div className="font-medium text-gray-900">{lead.firstName} {lead.lastName}</div>
            <div className="text-sm text-gray-500">{lead.email}</div>
            <div className="text-sm text-gray-500">{lead.phone}</div>
          </div>
        )
      },
      {
        key: 'source',
        title: 'Source',
        render: (value: any, lead: Lead) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {lead.source?.replace('_', ' ').toUpperCase() || 'Unknown'}
          </span>
        )
      },
      {
        key: 'status',
        title: 'Status',
        render: (value: any, lead: Lead) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
          </span>
        )
      },
      {
        key: 'conversionStage',
        title: 'Stage',
        render: (value: any, lead: Lead) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(lead.conversionStage)}`}>
            {lead.conversionStage.charAt(0).toUpperCase() + lead.conversionStage.slice(1)}
          </span>
        )
      },
      {
        key: 'priority',
        title: 'Priority',
        render: (value: any, lead: Lead) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
            {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
          </span>
        )
      },
      {
        key: 'actions',
        title: 'Actions',
        render: (value: any, lead: Lead) => (
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigateToLeadDetails(lead)}
          >
            View Details
          </Button>
        )
      }
    ];

    return (
      <DataTable
        data={paginatedData}
        columns={columns}
        loading={loading}
        emptyMessage="No leads found"
      />
    );
  };

  const renderLeadDetails = () => {
    if (!selectedLead) return null;

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
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const getStatusColor = (status: Lead['status']) => {
      switch (status) {
        case 'new': return 'bg-blue-100 text-blue-800';
        case 'contacted': return 'bg-yellow-100 text-yellow-800';
        case 'qualified': return 'bg-green-100 text-green-800';
        case 'converted': return 'bg-purple-100 text-purple-800';
        case 'lost': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getStageColor = (stage: Lead['conversionStage']) => {
      switch (stage) {
        case 'lead': return 'bg-blue-100 text-blue-800';
        case 'application': return 'bg-yellow-100 text-yellow-800';
        case 'approval': return 'bg-green-100 text-green-800';
        case 'closing': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getPriorityColor = (priority: Lead['priority']) => {
      switch (priority) {
        case 'low': return 'bg-gray-100 text-gray-800';
        case 'medium': return 'bg-blue-100 text-blue-800';
        case 'high': return 'bg-yellow-100 text-yellow-800';
        case 'urgent': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl font-medium text-blue-600">
                {selectedLead.firstName.charAt(0)}{selectedLead.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedLead.firstName} {selectedLead.lastName}</h1>
              <p className="text-gray-600">{selectedLead.email}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline-white"
              onClick={navigateBack}
            >
              Back to Leads
            </Button>
            <Button variant="primary">
              Edit Lead
            </Button>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex space-x-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedLead.status)}`}>
            {selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1)}
          </span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStageColor(selectedLead.conversionStage)}`}>
            {selectedLead.conversionStage.charAt(0).toUpperCase() + selectedLead.conversionStage.slice(1)}
          </span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedLead.priority)}`}>
            {selectedLead.priority.charAt(0).toUpperCase() + selectedLead.priority.slice(1)}
          </span>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact & Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact & Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">First Name</label>
                  <p className="text-gray-900">{selectedLead.firstName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Name</label>
                  <p className="text-gray-900">{selectedLead.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{selectedLead.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{selectedLead.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Source</label>
                  <p className="text-gray-900">{selectedLead.source?.replace('_', ' ').toUpperCase() || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Geographic Location</label>
                  <p className="text-gray-900">{selectedLead.geographicLocation || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Loan Amount</label>
                  <p className="text-gray-900">{formatCurrency(selectedLead.loanAmount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Credit Score</label>
                  <p className="text-gray-900">{selectedLead.creditScore || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Loan Amount Closed</label>
                  <p className="text-gray-900">{formatCurrency(selectedLead.loanAmountClosed)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Commission Earned</label>
                  <p className="text-gray-900">{formatCurrency(selectedLead.commissionEarned)}</p>
                </div>
              </div>
            </div>

            {/* Performance & Analytics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance & Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Lead Quality Score</label>
                  <p className="text-gray-900">{selectedLead.leadQualityScore || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Response Time (Hours)</label>
                  <p className="text-gray-900">{selectedLead.responseTimeHours || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Count</label>
                  <p className="text-gray-900">{selectedLead.contactCount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Contact Date</label>
                  <p className="text-gray-900">{selectedLead.lastContactDate ? formatDate(selectedLead.lastContactDate) : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
              <div className="bg-gray-50 rounded-md p-4 min-h-[100px]">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedLead.notes || 'No notes available'}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-gray-900">{formatDate(selectedLead.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-gray-900">{formatDate(selectedLead.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="primary" className="w-full">
                  Send Email
                </Button>
                <Button variant="outline-white" className="w-full">
                  Schedule Call
                </Button>
                <Button variant="outline-white" className="w-full">
                  Add Note
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Get current page title and subtitle
  const getPageTitle = () => {
    switch (currentLevel) {
      case 'companies': return 'Companies';
      case 'officers': return selectedCompany ? `${selectedCompany.name} - Officers` : 'Officers';
      case 'leads': return selectedOfficer ? `${selectedOfficer.firstName} ${selectedOfficer.lastName} - Leads` : 'Leads';
      case 'lead-details': return selectedLead ? `${selectedLead.firstName} ${selectedLead.lastName} - Details` : 'Lead Details';
      default: return 'Leads Insights';
    }
  };

  const getPageSubtitle = () => {
    switch (currentLevel) {
      case 'companies': return 'View all companies and their loan officers\' leads data';
      case 'officers': return `Loan officers for ${selectedCompany?.name}`;
      case 'leads': return `Leads for ${selectedOfficer?.firstName} ${selectedOfficer?.lastName}`;
      case 'lead-details': return 'Complete lead analysis and details';
      default: return 'View all companies and their loan officers\' leads data';
    }
  };

  // Get summary stats
  const getSummaryStats = () => {
    if (currentLevel === 'companies') {
      const totalOfficers = companies.reduce((sum, company) => sum + company.totalOfficers, 0);
      const totalLeads = companies.reduce((sum, company) => sum + company.totalLeads, 0);
      const totalConverted = companies.reduce((sum, company) => sum + company.convertedLeads, 0);
      const overallConversionRate = totalLeads > 0 ? (totalConverted / totalLeads) * 100 : 0;

      return [
        { label: 'Total Companies', value: companies.length, color: 'text-blue-600' },
        { label: 'Total Loan Officers', value: totalOfficers, color: 'text-green-600' },
        { label: 'Total Leads', value: totalLeads, color: 'text-purple-600' },
        { label: 'Overall Conversion Rate', value: `${overallConversionRate.toFixed(1)}%`, color: 'text-orange-600' }
      ];
    } else if (currentLevel === 'officers') {
      const totalLeads = officers.reduce((sum, officer) => sum + officer.totalLeads, 0);
      const totalConverted = officers.reduce((sum, officer) => sum + officer.convertedLeads, 0);
      const conversionRate = totalLeads > 0 ? (totalConverted / totalLeads) * 100 : 0;

      return [
        { label: 'Total Officers', value: officers.length, color: 'text-blue-600' },
        { label: 'Total Leads', value: totalLeads, color: 'text-green-600' },
        { label: 'Converted Leads', value: totalConverted, color: 'text-purple-600' },
        { label: 'Conversion Rate', value: `${conversionRate.toFixed(1)}%`, color: 'text-orange-600' }
      ];
    } else if (currentLevel === 'leads') {
      const newLeads = filteredData.filter(lead => lead.status === 'new').length;
      const convertedLeads = filteredData.filter(lead => lead.status === 'converted').length;
      const conversionRate = filteredData.length > 0 ? (convertedLeads / filteredData.length) * 100 : 0;

      return [
        { label: 'Total Leads', value: filteredData.length, color: 'text-blue-600' },
        { label: 'New Leads', value: newLeads, color: 'text-green-600' },
        { label: 'Converted', value: convertedLeads, color: 'text-purple-600' },
        { label: 'Conversion Rate', value: `${conversionRate.toFixed(1)}%`, color: 'text-orange-600' }
      ];
    }
    return [];
  };

  if (loading && currentLevel === 'lead-details') {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
        Loading lead details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => {
          setError(null);
          if (currentLevel === 'companies') fetchCompanies();
          else if (currentLevel === 'officers' && selectedCompany) fetchOfficers(selectedCompany.id);
          else if (currentLevel === 'leads' && selectedOfficer?.slug) fetchLeads(selectedOfficer.slug);
        }} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={getBreadcrumbItems()} />

      {/* Header with back button */}
      {currentLevel !== 'companies' && (
        <div className="flex justify-between items-center">
          <Button
            variant="primary"
            onClick={navigateBack}
            className="flex items-center bg-[#005b7c] hover:bg-[#01bcc6] text-white border-0"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
        </div>
      )}

      {/* Summary Stats */}
      {getSummaryStats().length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {getSummaryStats().map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search and Filter (only for leads) */}
      {currentLevel === 'leads' && (
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
            }
          ]}
          onClearFilters={() => {
            setSearchQuery('');
            setStatusFilter('');
            setStageFilter('');
            setPriorityFilter('');
          }}
          placeholder="Search by name, email, or phone..."
          className="mb-6"
        />
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h3>
        </div>
        <div className="px-6 py-4">
          {currentLevel === 'companies' && renderCompanies()}
          {currentLevel === 'officers' && renderOfficers()}
          {currentLevel === 'leads' && renderLeads()}
          {currentLevel === 'lead-details' && renderLeadDetails()}
        </div>
      </div>

      {/* Pagination (not for lead details) */}
      {currentLevel !== 'lead-details' && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={ITEMS_PER_PAGE}
          totalItems={totalItems}
          className="mt-6"
        />
      )}
    </div>
  );
}
