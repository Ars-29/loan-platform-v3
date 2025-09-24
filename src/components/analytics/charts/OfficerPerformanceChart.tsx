'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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

interface OfficerPerformanceChartProps {
  data: OfficerPerformance[];
  title?: string;
  height?: number;
  metric?: 'totalLeads' | 'closedDeals' | 'conversionRate' | 'totalLoanVolume' | 'totalCommission';
}

const OfficerPerformanceChart: React.FC<OfficerPerformanceChartProps> = ({
  data,
  title = "Officer Performance",
  height = 400,
  metric = 'totalLeads'
}) => {
  // Format data for display
  const formattedData = data.map(item => ({
    ...item,
    displayName: item.officerName.length > 15 
      ? `${item.officerName.substring(0, 15)}...` 
      : item.officerName,
    fullName: item.officerName
  }));

  const getMetricLabel = () => {
    switch (metric) {
      case 'totalLeads': return 'Total Leads';
      case 'closedDeals': return 'Closed Deals';
      case 'conversionRate': return 'Conversion Rate (%)';
      case 'totalLoanVolume': return 'Loan Volume ($)';
      case 'totalCommission': return 'Commission ($)';
      default: return 'Total Leads';
    }
  };

  const getMetricValue = (item: any) => {
    switch (metric) {
      case 'totalLeads': return item.totalLeads;
      case 'closedDeals': return item.closedDeals;
      case 'conversionRate': return item.conversionRate;
      case 'totalLoanVolume': return Math.round(item.totalLoanVolume);
      case 'totalCommission': return Math.round(item.totalCommission);
      default: return item.totalLeads;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{data.fullName}</p>
          <p className="text-sm text-gray-600">
            {getMetricLabel()}: <span className="font-medium">{getMetricValue(data)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Total Leads: <span className="font-medium">{data.totalLeads}</span>
          </p>
          <p className="text-sm text-gray-600">
            Closed Deals: <span className="font-medium">{data.closedDeals}</span>
          </p>
          <p className="text-sm text-gray-600">
            Conversion Rate: <span className="font-medium">{data.conversionRate.toFixed(3)}%</span>
          </p>
          {data.avgResponseTime > 0 && (
            <p className="text-sm text-gray-600">
              Avg Response Time: <span className="font-medium">{data.avgResponseTime}h</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <BarChart
            data={formattedData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="displayName" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={(item) => getMetricValue(item)} 
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OfficerPerformanceChart;
