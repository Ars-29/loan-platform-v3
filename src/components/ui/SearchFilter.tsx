'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { icons } from '@/components/ui/Icon';
import { colors, typography, spacing, borderRadius } from '@/theme/theme';

export interface FilterOption {
  value: string;
  label: string;
}

export interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: {
    label: string;
    key: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
  onClearFilters?: () => void;
  placeholder?: string;
  className?: string;
}

/**
 * Search and Filter Component
 * 
 * Features:
 * - Search input with icon
 * - Multiple filter dropdowns
 * - Clear filters button
 * - Responsive design
 */
export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchValue,
  onSearchChange,
  filters = [],
  onClearFilters,
  placeholder = "Search...",
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = filters.some(filter => filter.value !== '');

  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
      style={{
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.gray[200]}`,
        padding: spacing[4]
      }}
    >
      {/* Search and toggle row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {React.createElement(icons.search, { 
              size: 20, 
              style: { color: colors.gray[400] }
            })}
          </div>
          <Input
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Filter toggle button (mobile) */}
        {filters.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="sm:hidden flex items-center"
            >
              {React.createElement(icons.filter, { size: 16 })}
              <span className="ml-1">Filters</span>
              {hasActiveFilters && (
                <span className="ml-1 bg-[#01bcc6] text-white rounded-full px-1.5 py-0.5 text-xs">
                  {filters.filter(f => f.value !== '').length}
                </span>
              )}
            </Button>

            {/* Clear filters button */}
            {hasActiveFilters && onClearFilters && (
              <Button
                variant="primary"
                size="sm"
                onClick={onClearFilters}
                className="bg-[#01bcc6] hover:bg-[#008eab] text-white"
              >
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Filter dropdowns */}
      {filters.length > 0 && (
        <div 
          className={`mt-4 ${isExpanded ? 'block' : 'hidden sm:block'}`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label 
                  className="block text-sm font-medium text-gray-700 mb-1"
                  style={{
                    color: colors.gray[700],
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium
                  }}
                >
                  {filter.label}
                </label>
                <select
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6]"
                  style={{
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.gray[300]}`,
                    fontSize: typography.fontSize.sm,
                    color: colors.gray[900]
                  }}
                >
                  <option value="">All {filter.label}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Clear filters button (desktop) */}
          {hasActiveFilters && onClearFilters && (
            <div className="mt-4 hidden sm:block">
              <Button
                variant="primary"
                size="sm"
                onClick={onClearFilters}
                className="bg-[#01bcc6] hover:bg-[#008eab] text-white flex items-center"
              >
                {React.createElement(icons.x, { size: 16 })}
                <span className="ml-1">Clear all filters</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
