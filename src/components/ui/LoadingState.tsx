'use client';

import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { colors } from '@/theme/theme';

interface LoadingStateProps {
  loading?: boolean;
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  minHeight?: string;
  children?: React.ReactNode;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  loading = true,
  text = '',
  size = 'md',
  fullScreen = false,
  minHeight = '400px',
  children,
  className = ''
}) => {
  if (!loading) {
    return <>{children}</>;
  }

  const containerStyle = fullScreen 
    ? 'min-h-screen flex items-center justify-center bg-gray-50'
    : `flex items-center justify-center ${className}`;

  const heightStyle = fullScreen ? {} : { minHeight };

  return (
    <div className={containerStyle} style={heightStyle}>
      <LoadingSpinner 
        size={size} 
        text={text} 
        showText={true}
        fullScreen={false}
      />
    </div>
  );
};

// Specific loading components for common use cases
export const DashboardLoadingState: React.FC<{ text?: string }> = ({ 
  text = '' 
}) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '400px',
    flexDirection: 'column',
    gap: '16px'
  }}>
    <LoadingSpinner size="lg" text={text} showText={!!text} />
  </div>
);

export const PageLoadingState: React.FC<{ text?: string }> = ({ 
  text = '' 
}) => (
  <LoadingSpinner 
    size="xl" 
    text={text} 
    showText={!!text}
    fullScreen={true}
  />
);

export const InlineLoadingState: React.FC<{ text?: string }> = ({ 
  text = '' 
}) => (
  <div className="flex items-center justify-center py-4">
    <LoadingSpinner size="md" text={text} showText={!!text} />
  </div>
);

export const TableLoadingState: React.FC<{ text?: string }> = ({ 
  text = '' 
}) => (
  <div className="flex justify-center items-center h-64">
    <LoadingSpinner size="md" text={text} showText={!!text} />
  </div>
);

export default LoadingState;
