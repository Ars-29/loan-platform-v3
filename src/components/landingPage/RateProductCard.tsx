'use client';

import React from 'react';
import { icons } from '@/components/ui/Icon';

interface RateProduct {
  id: string;
  lenderName: string;
  loanProgram: string;
  loanType: string;
  loanTerm: number;
  interestRate: number;
  apr: number;
  monthlyPayment: number;
  fees: number;
  points: number;
  credits: number;
  lockPeriod: number;
}

interface RateProductCardProps {
  product: RateProduct;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  layout: {
    borderRadius: number;
  };
  onGetStarted: (product: RateProduct) => void;
  onViewDetails: (product: RateProduct) => void;
  formatRate: (rate: number) => string;
  formatCurrency: (amount: number) => string;
  formatPoints: (points: number) => string;
}

export default function RateProductCard({
  product,
  colors,
  layout,
  onGetStarted,
  onViewDetails,
  formatRate,
  formatCurrency,
  formatPoints
}: RateProductCardProps) {
  return (
    <div 
      className="border rounded-lg p-4 transition-colors hover:opacity-90"
      style={{ 
        borderColor: colors.border,
        borderRadius: `${layout.borderRadius}px`
      }}
    >
      {/* Two-column grid layout */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Column 1 */}
        <div className="space-y-3">
          {/* Loan Type */}
          <div>
            <div className="flex items-center space-x-2 mb-1">
              {React.createElement(icons.document, { 
                size: 16, 
                color: colors.primary 
              })}
              <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                Loan Type
              </span>
            </div>
            <span className="text-sm font-medium" style={{ color: colors.text }}>
              {product.loanTerm}-Year Fixed
            </span>
          </div>

          {/* Interest Rate */}
          <div>
            <span className="text-xs font-medium block mb-1" style={{ color: colors.textSecondary }}>
              Interest Rate
            </span>
            <span className="text-base font-semibold" style={{ color: colors.text }}>
              {formatRate(product.interestRate)}
            </span>
          </div>

          {/* APR */}
          <div>
            <span className="text-xs font-medium block mb-1" style={{ color: colors.textSecondary }}>
              APR
            </span>
            <span className="text-sm" style={{ color: colors.textSecondary }}>
              {formatRate(product.apr)}
            </span>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-3">
          {/* Points */}
          <div>
            <span className="text-xs font-medium block mb-1" style={{ color: colors.textSecondary }}>
              Points
            </span>
            <span className="text-sm" style={{ color: colors.textSecondary }}>
              {formatPoints(product.points)}
            </span>
          </div>

          {/* Monthly Payment */}
          <div>
            <span className="text-xs font-medium block mb-1" style={{ color: colors.textSecondary }}>
              Monthly Payment*
            </span>
            <span className="text-base font-semibold" style={{ color: colors.text }}>
              {formatCurrency(product.monthlyPayment)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons - Stack vertically on mobile, horizontal on larger screens */}
      <div className="flex flex-col @sm:flex-row gap-2 mt-4">
        <button
          onClick={() => onGetStarted(product)}
          className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium transition-colors w-full sm:w-auto"
          style={{
            backgroundColor: colors.primary,
            color: colors.background,
            borderRadius: `${layout.borderRadius}px`,
            border: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.primary;
          }}
        >
          {React.createElement(icons.arrowRight, { size: 16, color: colors.background })}
          <span>Get Started</span>
        </button>
        <button 
          onClick={() => onViewDetails(product)}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors w-full sm:w-auto"
          style={{
            backgroundColor: colors.background,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: `${layout.borderRadius}px`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.background;
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

