'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import LeadVolumeChart from './charts/LeadVolumeChart';
import OfficerPerformanceChart from './charts/OfficerPerformanceChart';
import ConversionFunnelChart from './charts/ConversionFunnelChart';
import SimpleTrendChart from './charts/SimpleTrendChart';
import CleanBarChart from './charts/CleanBarChart';
import DateRangeFilter from './filters/DateRangeFilter';
import { TableLoadingState } from '@/components/ui/LoadingState';

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
  color: string;
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
      <TableLoadingState />
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

  // Debug logging
  console.log('ConversionStatsDashboard data:', {
    conversionStats,
    revenueTrends: revenueTrends?.length,
    officerPerformance: officerPerformance?.length
  });

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {isSuperAdmin && onBackToCompanies && (
            <button
              onClick={onBackToCompanies}
              className="mb-2 px-4 py-2 text-sm font-medium text-white bg-[#005b7c] hover:bg-[#01bcc6] rounded-lg border-0 flex items-center transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Companies
            </button>
          )}
          
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
        <div className="bg-[#F7F1E9]/30 p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Conversion</p>
              <p className="text-2xl font-bold text-[#01bcc6]">{conversionStats.conversionRate.toFixed(3)}%</p>
            </div>
            <div className="w-12 h-12 bg-[#01bcc6]/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-[#01bcc6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-[#F7F1E9]/30 p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Closed Deals</p>
              <p className="text-2xl font-bold text-[#008eab]">{conversionStats.closings.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-[#008eab]/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-[#008eab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-[#F7F1E9]/30 p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Loan Amount</p>
              <p className="text-2xl font-bold text-[#005b7c]">${metrics.avgLoanAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-[#005b7c]/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-[#005b7c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-[#F7F1E9]/30 p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-[#008eab]">${conversionStats.totalCommission.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-[#008eab]/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-[#008eab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Rate Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#F7F1E9]/30 p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Lead → Application</p>
            <p className="text-3xl font-bold text-[#005b7c]">{metrics.leadToApplicationRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">{conversionStats.applications} applications</p>
          </div>
        </div>
        <div className="bg-[#F7F1E9]/30 p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Application → Approval</p>
            <p className="text-3xl font-bold text-[#008eab]">{metrics.applicationToApprovalRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">{conversionStats.approvals} approvals</p>
          </div>
        </div>
        <div className="bg-[#F7F1E9]/30 p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Approval → Closing</p>
            <p className="text-3xl font-bold text-[#01bcc6]">{metrics.approvalToClosingRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">{conversionStats.closings} closings</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      

      {/* Conversion Funnel */}
      <ConversionFunnelChart
        data={conversionStats ? (() => {
          // Create proper funnel progression - each stage shows cumulative count
          const totalLeads = conversionStats.totalLeads || 0;
          const applications = conversionStats.applications || 0;
          const approvals = conversionStats.approvals || 0;
          const closings = conversionStats.closings || 0;
          
          const funnelData = [
            {
              stage: 'Total Leads',
              count: totalLeads,
              percentage: 100,
              color: '#005b7c'
            },
            {
              stage: 'Applications',
              count: applications,
              percentage: totalLeads ? Math.round((applications / totalLeads) * 100) : 0,
              color: '#008eab'
            },
            {
              stage: 'Approvals',
              count: approvals,
              percentage: totalLeads ? Math.round((approvals / totalLeads) * 100) : 0,
              color: '#01bcc6'
            },
            {
              stage: 'Closings',
              count: closings,
              percentage: totalLeads ? Math.round((closings / totalLeads) * 100) : 0,
              color: '#01bcc6'
            }
          ];
          
          console.log('Conversion Funnel data being passed:', funnelData);
          return funnelData;
        })() : [
          // Fallback test data with proper funnel progression
          { stage: 'Total Leads', count: 47, percentage: 100, color: '#005b7c' },
          { stage: 'Applications', count: 11, percentage: 23, color: '#008eab' },
          { stage: 'Approvals', count: 3, percentage: 6, color: '#01bcc6' },
          { stage: 'Closings', count: 8, percentage: 17, color: '#01bcc6' }
        ]}
        title="Lead Conversion Funnel"
        height={400}
      />

      {/* Performance Trends */}
      <SimpleTrendChart
        data={revenueTrends && revenueTrends.length > 0 ? revenueTrends.map(item => ({
          date: item.date,
          totalLeads: item.totalLeads,
          convertedLeads: item.convertedLeads,
          conversionRate: item.totalLeads > 0 ? Math.round((item.convertedLeads / item.totalLeads) * 100) : 0
        })) : []}
        title="Lead Performance Trends"
        height={400}
        chartType="area"
      />

      {/* Metric Selector for Officer Performance */}
      <div className="bg-[#F7F1E9]/30 p-4 rounded-lg shadow-sm border border-gray-200">
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
                  ? 'bg-[#005b7c] text-white'
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
                    className="px-3 py-1 text-sm bg-[#01bcc6] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#008eab] disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    {paginationLoading ? '...' : 'Previous'}
                  </button>
                  <span className="px-3 py-1 text-sm bg-[#01bcc6]/10 text-[#01bcc6] rounded">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || paginationLoading}
                    className="px-3 py-1 text-sm bg-[#01bcc6] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#008eab] disabled:bg-gray-300 disabled:text-gray-500"
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
        <div className="bg-[#F7F1E9]/30 p-6 rounded-lg shadow-sm border border-gray-200">
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
              <tbody className="bg-[#F7F1E9]/30 divide-y divide-gray-200">
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
                          ? 'bg-[#01bcc6]/10 text-[#01bcc6]'
                          : officer.conversionRate >= 10
                          ? 'bg-[#008eab]/10 text-[#008eab]'
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
