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
  LineChart,
  Line,
  Legend
} from 'recharts';

interface DashboardOverviewChartProps {
  data: any[];
  title?: string;
  height?: number;
}

const DashboardOverviewChart: React.FC<DashboardOverviewChartProps> = ({
  data,
  title = "Performance Overview",
  height = 350
}) => {
  // Clean, professional color scheme
  const COLORS = {
    leads: '#3b82f6',        // Blue - Primary
    converted: '#10b981',    // Green - Success
    applications: '#f59e0b', // Amber - Warning
    approvals: '#8b5cf6',    // Purple - Info
    closings: '#ef4444'      // Red - Danger
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">
                  {entry.name}: <span className="font-medium text-gray-900">{entry.value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">Key metrics over time</p>
      </div>
      
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            
            <Line
              type="monotone"
              dataKey="leads"
              stroke={COLORS.leads}
              strokeWidth={3}
              name="Total Leads"
              dot={{ fill: COLORS.leads, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: COLORS.leads, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="converted"
              stroke={COLORS.converted}
              strokeWidth={3}
              name="Converted"
              dot={{ fill: COLORS.converted, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: COLORS.converted, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="applications"
              stroke={COLORS.applications}
              strokeWidth={3}
              name="Applications"
              dot={{ fill: COLORS.applications, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: COLORS.applications, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardOverviewChart;
