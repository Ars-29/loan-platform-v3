'use client';

import React from 'react';
import Link from 'next/link';
import { icons } from '@/components/ui/Icon';
import { colors, typography, spacing } from '@/theme/theme';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: keyof typeof icons;
  isLoading?: boolean;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  variant?: 'default' | 'minimal' | 'elevated';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Modern Breadcrumb Navigation Component
 * 
 * Features:
 * - Modern, polished design with depth and visual hierarchy
 * - Multiple variants (default, minimal, elevated)
 * - Responsive sizing
 * - Smooth animations and hover effects
 * - Loading states support
 * - Accessible navigation
 * - Consistent with app theme
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className = '',
  variant = 'default',
  size = 'md'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'py-2 px-3',
          item: 'text-xs',
          icon: 14,
          separator: 'mx-2',
          padding: 'px-2 py-1'
        };
      case 'lg':
        return {
          container: 'py-4 px-5',
          item: 'text-base',
          icon: 18,
          separator: 'mx-3',
          padding: 'px-3 py-2'
        };
      default: // md
        return {
          container: 'py-3 px-4',
          item: 'text-sm',
          icon: 16,
          separator: 'mx-2.5',
          padding: 'px-2.5 py-1.5'
        };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return {
          container: 'bg-transparent border-0 shadow-none',
          item: 'text-gray-600 hover:text-gray-900',
          current: 'text-gray-900 font-semibold',
          separator: 'text-gray-300'
        };
      case 'elevated':
        return {
          container: 'bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-gray-200/20 rounded-2xl',
          item: 'text-[#01bcc6] hover:text-[#008eab]',
          current: 'text-gray-900 font-semibold',
          separator: 'text-gray-400'
        };
      default: // default
        return {
          container: 'bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-sm border border-gray-200/50 shadow-lg shadow-gray-200/10 rounded-xl',
          item: 'text-[#01bcc6] hover:text-[#008eab]',
          current: 'text-gray-900 font-semibold',
          separator: 'text-gray-400'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  if (items.length === 0) return null;

  return (
    <nav 
      className={`breadcrumb-container ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const IconComponent = item.icon ? icons[item.icon] : null;
          const isLoading = item.isLoading;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <div className="breadcrumb-separator">
                  {React.createElement(icons.chevronRight, { 
                    size: sizeClasses.icon - 2,
                    className: 'opacity-60'
                  })}
                </div>
              )}
              
              <div className="flex items-center group">
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse bg-gray-200 rounded h-4 w-16"></div>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#01bcc6]"></div>
                  </div>
                ) : (item.href || item.onClick) && !isLast ? (
                  item.onClick ? (
                    <button
                      onClick={item.onClick}
                      className="breadcrumb-item"
                    >
                      {IconComponent && (
                        <div className="mr-2 flex-shrink-0">
                          {React.createElement(IconComponent, { 
                            size: sizeClasses.icon,
                            className: `breadcrumb-icon transition-colors duration-200`
                          })}
                        </div>
                      )}
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      href={item.href!}
                      className="breadcrumb-item"
                    >
                      {IconComponent && (
                        <div className="mr-2 flex-shrink-0">
                          {React.createElement(IconComponent, { 
                            size: sizeClasses.icon,
                            className: `breadcrumb-icon transition-colors duration-200`
                          })}
                        </div>
                      )}
                      {item.label}
                    </Link>
                  )
                ) : (
                  <span
                    className={`breadcrumb-current`}
                  >
                    {IconComponent && (
                      <div className="mr-2 flex-shrink-0">
                        {React.createElement(IconComponent, { 
                          size: sizeClasses.icon,
                          className: `breadcrumb-icon transition-colors duration-200`
                        })}
                      </div>
                    )}
                    {item.label}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
