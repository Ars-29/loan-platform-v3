'use client';

import React from 'react';
import { icons } from '@/components/ui/Icon';

interface MetricsCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: keyof typeof icons;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
  subtitle?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon = 'trendingUp',
  color = 'blue',
  subtitle
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      text: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      text: 'text-green-600'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      text: 'text-orange-600'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      text: 'text-red-600'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      text: 'text-purple-600'
    },
    gray: {
      bg: 'bg-gray-50',
      icon: 'text-gray-600',
      text: 'text-gray-600'
    }
  };

  const changeColors = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
    neutral: 'text-gray-600'
  };

  const changeIcons = {
    increase: '↗',
    decrease: '↘',
    neutral: '→'
  };

  const selectedColor = colorClasses[color];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${changeColors[changeType]}`}>
                {changeIcons[changeType]} {Math.abs(change)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${selectedColor.bg}`}>
          {React.createElement(icons[icon], {
            size: 24,
            className: selectedColor.icon
          })}
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;
