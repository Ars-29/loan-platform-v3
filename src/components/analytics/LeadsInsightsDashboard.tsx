'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import LeadVolumeChart from './charts/LeadVolumeChart';
import LeadSourceChart from './charts/LeadSourceChart';
import OfficerPerformanceChart from './charts/OfficerPerformanceChart';
import DateRangeFilter from './filters/DateRangeFilter';

interface LeadInsightsData {
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

interface LeadSourceData {
  source: string;
  count: number;
  conversionRate: number;
}

interface LeadsInsightsDashboardProps {
  companyId?: string;
  isSuperAdmin?: boolean;
}

const LeadsInsightsDashboard: React.FC<LeadsInsightsDashboardProps> = ({
  companyId,
  isSuperAdmin = false
}) => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'totalLeads' | 'closedDeals' | 'conversionRate' | 'totalLoanVolume' | 'totalCommission'>('totalLeads');
  
  const [data, setData] = useState<{
    insights: LeadInsightsData;
    officerPerformance: OfficerPerformance[];
    leadVolumeTrends: LeadVolumeTrend[];
    leadSourceData: LeadSourceData[];
  } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
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

      const response = await fetch(`/api/analytics/leads-insights?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchData();
    }
  }, [dateRange, companyId, accessToken]);

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

  const { insights, officerPerformance, leadVolumeTrends, leadSourceData } = data;

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads Insights</h1>
          <p className="text-gray-600">Track and analyze lead performance across your team</p>
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
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{insights.totalLeads.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-green-600">{insights.conversionRate.toFixed(3)}%</p>
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
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-orange-600">{insights.avgResponseTime}h</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">${insights.totalCommission.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Volume Trends */}
        <div className="lg:col-span-2">
          <LeadVolumeChart
            data={leadVolumeTrends}
            title="Lead Volume Trends"
            height={400}
          />
        </div>

        {/* Lead Sources */}
        <LeadSourceChart
          data={leadSourceData}
          title="Lead Sources Distribution"
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
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsInsightsDashboard;
