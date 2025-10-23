'use client';

import React from 'react';
import { colors } from '@/theme/theme';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
  text?: string;
  showText?: boolean;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = colors.primary[600],
  className = '',
  text = 'Loading...',
  showText = false,
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const spinnerElement = (
    <div className={`animate-spin rounded-full border-2 border-gray-200 ${sizeClasses[size]} ${className}`}
         style={{ borderTopColor: color }}>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          {spinnerElement}
          {showText && (
            <p className={`mt-4 text-gray-600 ${textSizeClasses[size]}`}>
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (showText) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          {spinnerElement}
          <p className={`mt-2 text-gray-600 ${textSizeClasses[size]}`}>
            {text}
          </p>
        </div>
      </div>
    );
  }

  return spinnerElement;
};

export default LoadingSpinner;
