'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import LeadVolumeChart from './charts/LeadVolumeChart';
import OfficerPerformanceChart from './charts/OfficerPerformanceChart';
import ConversionFunnelChart from './charts/ConversionFunnelChart';
import DateRangeFilter from './filters/DateRangeFilter';

interface ConversionStatsData {
  totalLeads: number;
  convertedLeads: number;
  applications: number;
  approvals: number;
  closings: number;
  conversionRate: number;
  avgResponseTime: number;
  totalLoanVolume: number;
  totalCommission: number;
}

interface OfficerPerformance {
  officerId: string;
  officerName: string;
  companyId: string;
  companyName: string;
  totalLeads: number;
  closedDeals: number;
  conversionRate: number;
  avgResponseTime: number;
  totalLoanVolume: number;
  totalCommission: number;
  lastActivity: Date | null;
}

interface LeadVolumeTrend {
  date: string;
  totalLeads: number;
  convertedLeads: number;
  applications: number;
  approvals: number;
  closings: number;
}

interface ConversionFunnelData {
  stage: string;
  count: number;
  percentage: number;
}

interface ConversionStatsDashboardProps {
  companyId?: string;
  isSuperAdmin?: boolean;
  selectedCompanyName?: string;
  onBackToCompanies?: () => void;
}

const ConversionStatsDashboard: React.FC<ConversionStatsDashboardProps> = ({
  companyId,
  isSuperAdmin = false,
  selectedCompanyName,
  onBackToCompanies
}) => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'totalLeads' | 'closedDeals' | 'conversionRate' | 'totalLoanVolume' | 'totalCommission'>('conversionRate');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [paginationLoading, setPaginationLoading] = useState(false);
  
  const [data, setData] = useState<{
    conversionStats: ConversionStatsData;
    officerPerformance: OfficerPerformance[];
    revenueTrends: LeadVolumeTrend[];
    conversionFunnelData: ConversionFunnelData[];
    companyComparison: OfficerPerformance[] | null;
    metrics: {
      leadToApplicationRate: number;
      applicationToApprovalRate: number;
      approvalToClosingRate: number;
      avgLoanAmount: number;
      avgCommission: number;
      leadsPerOfficer: number;
      closingsPerOfficer: number;
    };
  } | null>(null);

  const fetchData = async () => {
    try {
      if (currentPage === 1) {
        setLoading(true);
      } else {
        setPaginationLoading(true);
      }
      setError(null);

      if (!accessToken) {
        throw new Error('No access token available');
      }

      const params = new URLSearchParams();
      if (dateRange) {
        params.append('startDate', dateRange.start.toISOString());
        params.append('endDate', dateRange.end.toISOString());
      }
      if (companyId) {
        params.append('companyIds', companyId);
      }
      
      // Add pagination parameters - limit to top 10 officers
      params.append('limit', '10'); // Limit to top 10 officers
      params.append('offset', ((currentPage - 1) * 10).toString());

      const response = await fetch(`/api/analytics/conversion-stats?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversion stats');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchData();
    }
  }, [dateRange, companyId, accessToken, currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const { conversionStats, officerPerformance, revenueTrends, conversionFunnelData, companyComparison, metrics } = data;

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {isSuperAdmin && onBackToCompanies && (
            <button
              onClick={onBackToCompanies}
              className="mb-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg border-0 flex items-center transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Companies
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            {isSuperAdmin && selectedCompanyName 
              ? `${selectedCompanyName} - Conversion Stats`
              : 'Conversion Stats'
            }
          </h1>
          <p className="text-gray-600">
            {isSuperAdmin && selectedCompanyName
              ? `Top 10 officers performance for ${selectedCompanyName}`
              : 'Top 10 officers performance - Track conversion rates and revenue performance'
            }
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <DateRangeFilter
            value={dateRange || undefined}
            onChange={setDateRange}
          />
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Conversion</p>
              <p className="text-2xl font-bold text-green-600">{conversionStats.conversionRate.toFixed(3)}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Closed Deals</p>
              <p className="text-2xl font-bold text-blue-600">{conversionStats.closings.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Loan Amount</p>
              <p className="text-2xl font-bold text-purple-600">${metrics.avgLoanAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-orange-600">${conversionStats.totalCommission.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Rate Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Lead → Application</p>
            <p className="text-3xl font-bold text-blue-600">{metrics.leadToApplicationRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">{conversionStats.applications} applications</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Application → Approval</p>
            <p className="text-3xl font-bold text-green-600">{metrics.applicationToApprovalRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">{conversionStats.approvals} approvals</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Approval → Closing</p>
            <p className="text-3xl font-bold text-purple-600">{metrics.approvalToClosingRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">{conversionStats.closings} closings</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <ConversionFunnelChart
          data={conversionFunnelData}
          title="Conversion Funnel"
          height={400}
        />

        {/* Officer Performance */}
        <OfficerPerformanceChart
          data={officerPerformance}
          title="Officer Performance"
          height={400}
          metric={selectedMetric}
        />
      </div>

      {/* Revenue Trends */}
      <LeadVolumeChart
        data={revenueTrends}
        title="Revenue Trends Over Time"
        height={400}
      />

      {/* Metric Selector for Officer Performance */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Performance Metric</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'totalLeads', label: 'Total Leads' },
            { key: 'closedDeals', label: 'Closed Deals' },
            { key: 'conversionRate', label: 'Conversion Rate' },
            { key: 'totalLoanVolume', label: 'Loan Volume' },
            { key: 'totalCommission', label: 'Commission' },
          ].map((metric) => (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedMetric === metric.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
        
        {/* Officer Performance Chart */}
        {data?.officerPerformance && (
          <div className="mt-4">
            <OfficerPerformanceChart
              data={data.officerPerformance}
              title={`Officer Performance - ${selectedMetric === 'totalLeads' ? 'Total Leads' : 
                selectedMetric === 'closedDeals' ? 'Closed Deals' :
                selectedMetric === 'conversionRate' ? 'Conversion Rate' :
                selectedMetric === 'totalLoanVolume' ? 'Loan Volume' :
                'Commission'}`}
              height={400}
              metric={selectedMetric}
            />
            
            {/* Top 10 Officers Info */}
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {isSuperAdmin 
                  ? `Top 10 officers by ${selectedMetric === 'totalLeads' ? 'Total Leads' : 
                      selectedMetric === 'closedDeals' ? 'Closed Deals' :
                      selectedMetric === 'conversionRate' ? 'Conversion Rate' :
                      selectedMetric === 'totalLoanVolume' ? 'Loan Volume' :
                      'Commission'} performance`
                  : `Showing ${((currentPage - 1) * 10) + 1} to ${Math.min(currentPage * 10, data.officerPerformance.length)} of officers`
                }
              </div>
              {!isSuperAdmin && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || paginationLoading}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                  >
                    {paginationLoading ? '...' : 'Previous'}
                  </button>
                  <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || paginationLoading}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                  >
                    {paginationLoading ? '...' : 'Next'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loan Officer Comparison (Super Admin only) */}
      {isSuperAdmin && companyComparison && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Officer Comparison</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Officer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companyComparison.slice(0, 10).map((officer) => (
                  <tr key={`${officer.companyId}-${officer.officerId}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {officer.officerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {officer.totalLeads}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {officer.closedDeals}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        officer.conversionRate >= 20 
                          ? 'bg-green-100 text-green-800'
                          : officer.conversionRate >= 10
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {officer.conversionRate.toFixed(3)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${officer.totalCommission.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversionStatsDashboard;
