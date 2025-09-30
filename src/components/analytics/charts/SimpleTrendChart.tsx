'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface TrendData {
  date: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
}

interface SimpleTrendChartProps {
  data: TrendData[];
  title?: string;
  height?: number;
  chartType?: 'line' | 'area';
}

const SimpleTrendChart: React.FC<SimpleTrendChartProps> = ({
  data,
  title = "Performance Trends",
  height = 400,
  chartType = 'area'
}) => {
  // Format data for display
  const formattedData = data.map(item => ({
    ...item,
    date: format(parseISO(item.date), 'MMM dd'),
    displayDate: format(parseISO(item.date), 'MMM dd, yyyy')
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#005b7c] rounded-full mr-2"></div>
            <span className="text-gray-600">Total Leads</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#01bcc6] rounded-full mr-2"></div>
            <span className="text-gray-600">Converted Leads</span>
          </div>
        </div>
      </div>
      
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <ChartComponent
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
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {chartType === 'area' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="totalLeads"
                  stackId="1"
                  stroke="#005b7c"
                  fill="#005b7c"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="convertedLeads"
                  stackId="2"
                  stroke="#01bcc6"
                  fill="#01bcc6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </>
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey="totalLeads"
                  stroke="#005b7c"
                  strokeWidth={3}
                  name="Total Leads"
                  dot={{ fill: '#005b7c', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#005b7c', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="convertedLeads"
                  stroke="#01bcc6"
                  strokeWidth={3}
                  name="Converted Leads"
                  dot={{ fill: '#01bcc6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#01bcc6', strokeWidth: 2 }}
                />
              </>
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
      
      {/* Key Metrics Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-[#005b7c]/10 rounded-lg">
          <div className="text-2xl font-bold text-[#005b7c]">
            {data.reduce((sum, item) => sum + item.totalLeads, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Leads</div>
        </div>
        <div className="text-center p-4 bg-[#01bcc6]/10 rounded-lg">
          <div className="text-2xl font-bold text-[#01bcc6]">
            {data.reduce((sum, item) => sum + item.convertedLeads, 0)}
          </div>
          <div className="text-sm text-gray-600">Converted Leads</div>
        </div>
        <div className="text-center p-4 bg-[#008eab]/10 rounded-lg">
          <div className="text-2xl font-bold text-[#008eab]">
            {data.length > 0 ? (data.reduce((sum, item) => sum + item.conversionRate, 0) / data.length).toFixed(1) : 0}%
          </div>
          <div className="text-sm text-gray-600">Avg Conversion Rate</div>
        </div>
      </div>
    </div>
  );
};

export default SimpleTrendChart;
