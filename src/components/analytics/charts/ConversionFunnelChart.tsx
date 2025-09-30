'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ConversionFunnelData {
  stage: string;
  count: number;
  percentage: number;
  color: string;
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
  // Debug logging
  console.log('ConversionFunnelChart data:', data);
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Count:</span> {data.count}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Conversion Rate:</span> {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      {/* Funnel Visualization */}
      <div className="space-y-2 mb-6">
        {data.map((stage, index) => {
          const widthPercentage = data[0].count > 0 ? (stage.count / data[0].count) * 100 : 0;
          const isFirst = index === 0;
          const isLast = index === data.length - 1;
          
          return (
            <div key={stage.stage} className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold" style={{ color: stage.color }}>
                    {stage.count}
                  </span>
                  <span className="text-sm text-gray-500">({stage.percentage}%)</span>
                </div>
              </div>
              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="h-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.max(widthPercentage, 5)}%`, // Minimum 5% width for visibility
                    backgroundColor: stage.color,
                    borderRadius: isFirst ? '8px 8px 0 0' : isLast ? '0 0 8px 8px' : '0',
                  }}
                />
                {/* Funnel effect - make it narrower as it goes down */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent"
                  style={{
                    background: `linear-gradient(to right, transparent 0%, transparent 70%, ${stage.color}20 100%)`,
                    borderRadius: isFirst ? '8px 8px 0 0' : isLast ? '0 0 8px 8px' : '0',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Conversion Rate Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((stage, index) => (
          <div key={stage.stage} className="text-center p-3 rounded-lg" style={{ backgroundColor: `${stage.color}10` }}>
            <div className="text-2xl font-bold" style={{ color: stage.color }}>
              {stage.count}
            </div>
            <div className="text-sm text-gray-600 font-medium">{stage.stage}</div>
            <div className="text-xs text-gray-500">{stage.percentage}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversionFunnelChart;