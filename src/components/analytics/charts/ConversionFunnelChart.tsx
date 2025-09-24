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

interface ConversionFunnelData {
  stage: string;
  count: number;
  percentage: number;
}

interface ConversionFunnelChartProps {
  data: ConversionFunnelData[];
  title?: string;
  height?: number;
}

const ConversionFunnelChart: React.FC<ConversionFunnelChartProps> = ({
  data,
  title = "Conversion Funnel",
  height = 400
}) => {
  // Sort data by conversion stage order
  const stageOrder = ['lead', 'application', 'approval', 'closing'];
  const sortedData = [...data].sort((a, b) => {
    const aIndex = stageOrder.indexOf(a.stage);
    const bIndex = stageOrder.indexOf(b.stage);
    return aIndex - bIndex;
  });

  // Format stage names for display
  const formatStageName = (stage: string) => {
    switch (stage) {
      case 'lead': return 'Leads';
      case 'application': return 'Applications';
      case 'approval': return 'Approvals';
      case 'closing': return 'Closings';
      default: return stage.charAt(0).toUpperCase() + stage.slice(1);
    }
  };

  const formattedData = sortedData.map(item => ({
    ...item,
    displayStage: formatStageName(item.stage),
    stage: item.stage
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{data.displayStage}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-medium">{data.count}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium">{data.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Color gradient for funnel stages
  const getBarColor = (stage: string) => {
    switch (stage) {
      case 'lead': return '#3b82f6'; // Blue
      case 'application': return '#10b981'; // Green
      case 'approval': return '#f59e0b'; // Amber
      case 'closing': return '#ef4444'; // Red
      default: return '#6b7280'; // Gray
    }
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
              dataKey="displayStage" 
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
            <Bar 
              dataKey="count"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ConversionFunnelChart;
