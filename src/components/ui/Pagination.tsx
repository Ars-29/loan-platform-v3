'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { icons } from '@/components/ui/Icon';
import { colors, typography, spacing, borderRadius } from '@/theme/theme';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalItems: number;
  className?: string;
}

/**
 * Pagination Component
 * 
 * Features:
 * - Page navigation controls
 * - Previous/Next buttons
 * - Page numbers with ellipsis for large ranges
 * - Items per page information
 * - Responsive design
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
  className = ''
}) => {
  // Don't render if there's only one page or no items
  if (totalPages <= 1 || totalItems === 0) {
    return null;
  }

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Always include first page
    range.push(1);

    // Add pages around current page
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    // Always include last page if it's not page 1
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Add dots where needed
    let prev = 0;
    for (const page of range) {
      if (page - prev === 2) {
        rangeWithDots.push(prev + 1);
      } else if (page - prev !== 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(page);
      prev = page;
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div 
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
      style={{ padding: `${spacing[4]} 0` }}
    >
      {/* Items information */}
      <div 
        className="text-sm text-gray-700"
        style={{ 
          color: colors.gray[700],
          fontSize: typography.fontSize.sm 
        }}
      >
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* Previous button */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center bg-[#01bcc6] hover:bg-[#008eab] text-white disabled:bg-gray-300 disabled:text-gray-500"
        >
          {React.createElement(icons.chevronLeft, { size: 16 })}
          <span className="ml-1 hidden sm:inline">Previous</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-gray-500"
                  style={{ 
                    color: colors.gray[500],
                    fontSize: typography.fontSize.sm 
                  }}
                >
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;

            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-[#01bcc6] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={{
                  borderRadius: borderRadius.md,
                  backgroundColor: isActive ? '#01bcc6' : 'transparent',
                  color: isActive ? '#ffffff' : colors.gray[700],
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium
                }}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center bg-[#01bcc6] hover:bg-[#008eab] text-white disabled:bg-gray-300 disabled:text-gray-500"
        >
          <span className="mr-1 hidden sm:inline">Next</span>
          {React.createElement(icons.chevronRight, { size: 16 })}
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
