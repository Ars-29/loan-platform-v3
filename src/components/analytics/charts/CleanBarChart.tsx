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
  Cell,
} from 'recharts';

interface BarChartData {
  name: string;
  value: number;
  color: string;
  percentage?: number;
}

interface CleanBarChartProps {
  data: BarChartData[];
  title?: string;
  height?: number;
  showPercentage?: boolean;
}

const CleanBarChart: React.FC<CleanBarChartProps> = ({
  data,
  title = "Performance Overview",
  height = 400,
  showPercentage = false
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Value:</span> {data.value}
          </p>
          {showPercentage && data.percentage && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Percentage:</span> {data.percentage}%
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
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name"
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
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((item, index) => (
          <div key={item.name} className="text-center p-3 rounded-lg" style={{ backgroundColor: `${item.color}10` }}>
            <div className="text-xl font-bold" style={{ color: item.color }}>
              {item.value}
            </div>
            <div className="text-sm text-gray-600">{item.name}</div>
            {showPercentage && item.percentage && (
              <div className="text-xs text-gray-500">{item.percentage}%</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CleanBarChart;
