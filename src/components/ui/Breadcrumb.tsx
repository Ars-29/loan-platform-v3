'use client';

import React from 'react';
import Link from 'next/link';
import { icons } from '@/components/ui/Icon';
import { colors, typography, spacing } from '@/theme/theme';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: keyof typeof icons;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb Navigation Component
 * 
 * Features:
 * - Hierarchical navigation
 * - Optional icons for each item
 * - Clickable links for non-current items
 * - Consistent styling
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className = ''
}) => {
  return (
    <nav 
      className={`flex ${className}`} 
      aria-label="Breadcrumb"
      style={{ marginBottom: spacing[4] }}
    >
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const IconComponent = item.icon ? icons[item.icon] : null;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <div 
                  className="mr-2 text-gray-400"
                  style={{ color: colors.gray[400] }}
                >
                  {React.createElement(icons.chevronRight, { size: 16 })}
                </div>
              )}
              
              <div className="flex items-center">
                {IconComponent && (
                  <div className="mr-1.5">
                    {React.createElement(IconComponent, { 
                      size: 16,
                      style: { color: isLast ? colors.gray[900] : colors.blue[600] }
                    })}
                  </div>
                )}
                
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    style={{
                      color: colors.blue[600],
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium
                    }}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="text-gray-900"
                    style={{
                      color: colors.gray[900],
                      fontSize: typography.fontSize.sm,
                      fontWeight: isLast ? typography.fontWeight.semibold : typography.fontWeight.medium
                    }}
                  >
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
