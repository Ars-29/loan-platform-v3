'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { SearchFilter } from '@/components/ui/SearchFilter';
import { Building2, TrendingUp, Users, DollarSign } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  totalOfficers: number;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalRevenue: number;
  avgLoanAmount: number;
}

interface CompanyStatsSelectorProps {
  onCompanySelect: (companyId: string, companyName: string) => void;
}

const CompanyStatsSelector: React.FC<CompanyStatsSelectorProps> = ({ onCompanySelect }) => {
  const { accessToken } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'conversionRate' | 'totalLeads' | 'totalRevenue'>('conversionRate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const itemsPerPage = 10;

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);


      if (!accessToken) {
        throw new Error('No access token available');
      }

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await fetch(`/api/analytics/companies-simple?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        throw new Error('Failed to fetch companies data');
      }

      const result = await response.json();
      setCompanies(result.companies || []);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchCompanies();
    }
  }, [accessToken, currentPage, searchQuery, sortBy, sortOrder]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSort = (field: 'name' | 'conversionRate' | 'totalLeads' | 'totalRevenue') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const columns = [
    {
      key: 'name',
      title: 'Company Name',
      render: (value: any, record: Company) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#01bcc6]/10 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#01bcc6]" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{record.name}</div>
            <div className="text-sm text-gray-500">{record.totalOfficers} officers</div>
          </div>
        </div>
      ),
    },
    {
      key: 'totalLeads',
      title: 'Total Leads',
      render: (value: any, record: Company) => (
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{record.totalLeads}</div>
          <div className="text-sm text-gray-500">leads</div>
        </div>
      ),
    },
    {
      key: 'conversionRate',
      title: 'Conversion Rate',
      render: (value: any, record: Company) => (
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">{(record.conversionRate || 0).toFixed(1)}%</div>
          <div className="text-sm text-gray-500">{record.convertedLeads} converted</div>
        </div>
      ),
    },
    {
      key: 'totalRevenue',
      title: 'Total Revenue',
      render: (value: any, record: Company) => (
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">${(record.totalRevenue || 0).toLocaleString()}</div>
          <div className="text-sm text-gray-500">${(record.avgLoanAmount || 0).toLocaleString()} avg</div>
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, record: Company) => (
        <button
          onClick={() => onCompanySelect(record.id, record.name)}
          className="px-4 py-2 text-sm font-medium text-white bg-[#005b7c] hover:bg-[#01bcc6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008eab] focus:ring-offset-2 transition-all duration-200"
        >
          View Stats
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01bcc6]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <Button
          onClick={fetchCompanies}
          variant="outline-white"
          size="sm"
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#F7F1E9]/30 p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-[#01bcc6]/20 rounded-lg">
              <Building2 className="w-6 h-6 text-[#008eab]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Companies</p>
              <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#F7F1E9]/30 p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-[#01bcc6]/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-[#008eab]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Conversion</p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.length > 0 
                  ? (companies.reduce((sum, c) => sum + (c.conversionRate || 0), 0) / companies.length).toFixed(1)
                  : '0.0'
                }%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#F7F1E9]/30 p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-[#01bcc6]/20 rounded-lg">
              <Users className="w-6 h-6 text-[#008eab]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Officers</p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.reduce((sum, c) => sum + c.totalOfficers, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#F7F1E9]/30 p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-[#01bcc6]/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-[#008eab]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${companies.reduce((sum, c) => sum + (c.totalRevenue || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-[#F7F1E9]/30 rounded-lg shadow-sm border border-gray-200">
        <DataTable
          data={companies}
          columns={columns}
          loading={loading}
        />
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={companies.length}
            pageSize={itemsPerPage}
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyStatsSelector;
