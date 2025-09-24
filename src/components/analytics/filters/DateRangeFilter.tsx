'use client';

import React, { useState } from 'react';
import { format, subDays, subMonths, subYears } from 'date-fns';

interface DateRange {
  start: Date;
  end: Date;
}

interface DateRangeFilterProps {
  value?: DateRange;
  onChange: (range: DateRange | null) => void;
  className?: string;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const presetRanges = [
    {
      label: 'Last 7 days',
      getValue: () => ({
        start: subDays(new Date(), 7),
        end: new Date()
      })
    },
    {
      label: 'Last 30 days',
      getValue: () => ({
        start: subDays(new Date(), 30),
        end: new Date()
      })
    },
    {
      label: 'Last 90 days',
      getValue: () => ({
        start: subDays(new Date(), 90),
        end: new Date()
      })
    },
    {
      label: 'Last 6 months',
      getValue: () => ({
        start: subMonths(new Date(), 6),
        end: new Date()
      })
    },
    {
      label: 'Last year',
      getValue: () => ({
        start: subYears(new Date(), 1),
        end: new Date()
      })
    },
    {
      label: 'All time',
      getValue: () => null
    }
  ];

  const handlePresetClick = (preset: typeof presetRanges[0]) => {
    const range = preset.getValue();
    onChange(range);
    setIsOpen(false);
  };

  const handleCustomRangeChange = (field: 'start' | 'end', date: string) => {
    if (!value) {
      const newRange = field === 'start' 
        ? { start: new Date(date), end: new Date() }
        : { start: new Date(), end: new Date(date) };
      onChange(newRange);
    } else {
      const newRange = { ...value, [field]: new Date(date) };
      onChange(newRange);
    }
  };

  const formatDateRange = (range: DateRange | null) => {
    if (!range) return 'All time';
    return `${format(range.start, 'MMM dd')} - ${format(range.end, 'MMM dd, yyyy')}`;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-medium text-gray-700">
          {formatDateRange(value || null)}
        </span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Select</h4>
            <div className="space-y-2 mb-4">
              {presetRanges.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetClick(preset)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Custom Range</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={value?.start ? format(value.start, 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleCustomRangeChange('start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={value?.end ? format(value.end, 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleCustomRangeChange('end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default DateRangeFilter;
