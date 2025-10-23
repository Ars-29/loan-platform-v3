'use client';

import React from 'react';
import { colors } from '@/theme/theme';

export interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'sent' | 'accepted' | 'expired' | 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
  children?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'gray' | 'red';
}

export function StatusBadge({ status, children, color }: StatusBadgeProps) {
  const getStatusStyles = () => {
    // If color is provided, use theme colors
    if (color) {
      const colorMap = {
        blue: colors.darkBlue,
        green: colors.green,
        yellow: colors.yellow,
        purple: colors.darkPurple,
        gray: colors.gray,
        red: colors.red,
      };
      
      const selectedColor = colorMap[color];
      return {
        backgroundColor: selectedColor[50],
        color: selectedColor[600],
        borderColor: selectedColor[200],
      };
    }
    
    // Fallback to original Tailwind classes
    switch (status) {
      case 'active':
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sent':
        return 'bg-[#01bcc6]/10 text-[#01bcc6] border-[#01bcc6]/20';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'active':
      case 'accepted':
        return (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'inactive':
        return (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'sent':
        return (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        );
      case 'expired':
        return (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const styles = getStatusStyles();
  const isObjectStyle = typeof styles === 'object';
  
  return (
    <span 
      className={isObjectStyle ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border' : `
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
        ${styles}
      `}
      style={isObjectStyle ? styles : undefined}
    >
      {getIcon()}
      {children}
    </span>
  );
}
