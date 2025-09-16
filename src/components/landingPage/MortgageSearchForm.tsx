'use client';

import { useState, useCallback, memo } from 'react';
import { spacing, borderRadius, shadows, typography, colors } from '@/theme/theme';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import Icon from '@/components/ui/Icon';

interface SearchFormData {
  zipCode: string;
  salesPrice: string;
  downPayment: string;
  downPaymentPercent: string;
  creditScore: string;
  propertyType: string;
  occupancy: string;
  loanType: string;
  loanTerm?: string;
  eligibleForLowerRate: boolean;
  loanPurpose: string;
  // Refinance-specific fields
  homeValue: string;
  mortgageBalance: string;
  cashOut: string;
  ltv: string;
  // Additional fields for exact API match
  firstName: string;
  lastName: string;
  vaFirstTimeUse: boolean;
  firstTimeHomeBuyer: boolean;
  monthsReserves: number;
  selfEmployed: boolean;
  waiveEscrows: boolean;
  county: string;
  state: string;
  numberOfStories: number;
  numberOfUnits: string;
  lienType: string;
  borrowerPaidMI: string;
  baseLoanAmount: number;
  loanLevelDebtToIncomeRatio: number;
  totalMonthlyQualifyingIncome: number;
}

interface MortgageSearchFormProps {
  onSearch: (data: SearchFormData) => void;
  loading: boolean;
  template?: 'template1' | 'template2';
}

function MortgageSearchForm({ onSearch, loading, template = 'template1' }: MortgageSearchFormProps) {
  const { getTemplateSync } = useEfficientTemplates();
  const templateData = getTemplateSync(template);
  const templateColors = templateData?.template?.colors || {
    primary: '#ec4899',
    secondary: '#3b82f6',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };
  
  const [formData, setFormData] = useState<SearchFormData>({
    zipCode: '75024',
    salesPrice: '225000',
    downPayment: '75000',
    downPaymentPercent: '33.33',
    creditScore: '800+',
    propertyType: 'SingleFamily',
    occupancy: 'PrimaryResidence',
    loanType: 'Conventional',
    eligibleForLowerRate: false,
    loanPurpose: 'Purchase',
    // Refinance-specific fields
    homeValue: '450000',
    mortgageBalance: '360000',
    cashOut: '0',
    ltv: '80.00',
    // Additional fields matching your exact request
    firstName: 'test',
    lastName: 'test1',
    vaFirstTimeUse: true,
    firstTimeHomeBuyer: false,
    monthsReserves: 24,
    selfEmployed: true,
    waiveEscrows: false,
    county: 'Collin',
    state: 'TX',
    numberOfStories: 1,
    numberOfUnits: 'OneUnit',
    lienType: 'First',
    borrowerPaidMI: 'Yes',
    baseLoanAmount: 150000,
    loanLevelDebtToIncomeRatio: 18,
    totalMonthlyQualifyingIncome: 9000
  });

  const [activeTab, setActiveTab] = useState<'purchase' | 'refinance'>('purchase');

  const handleInputChange = (field: keyof SearchFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate down payment percentage for purchase
    if (field === 'salesPrice' || field === 'downPayment') {
      const price = field === 'salesPrice' ? parseFloat(value as string) : parseFloat(formData.salesPrice);
      const down = field === 'downPayment' ? parseFloat(value as string) : parseFloat(formData.downPayment);
      if (price > 0) {
        const percent = ((down / price) * 100).toFixed(1);
        setFormData(prev => ({
          ...prev,
          downPaymentPercent: percent
        }));
      }
    }

    // Auto-calculate LTV for refinance
    if (field === 'homeValue' || field === 'mortgageBalance') {
      const homeVal = field === 'homeValue' ? parseFloat(value as string) : parseFloat(formData.homeValue);
      const mortgageBal = field === 'mortgageBalance' ? parseFloat(value as string) : parseFloat(formData.mortgageBalance);
      if (homeVal > 0) {
        const ltv = ((mortgageBal / homeVal) * 100).toFixed(2);
        setFormData(prev => ({
          ...prev,
          ltv: ltv
        }));
      }
    }
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch(formData);
  }, [onSearch, formData]);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: borderRadius.lg,
      boxShadow: shadows.lg,
      padding: spacing[6],
      marginBottom: spacing[8]
    }}>
      {/* Tab Navigation */}
      <div style={{ display: 'flex', marginBottom: spacing[6] }}>
        <button
          type="button"
          onClick={() => setActiveTab('purchase')}
          style={{
            padding: `${spacing[3]} ${spacing[6]}`,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            borderRadius: borderRadius.lg,
            border: `1px solid ${activeTab === 'purchase' ? templateColors.primary : colors.gray[300]}`,
            backgroundColor: activeTab === 'purchase' ? templateColors.primary : colors.gray[100],
            color: activeTab === 'purchase' ? templateColors.background : colors.gray[700],
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          Purchase
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('refinance')}
          style={{
            padding: `${spacing[3]} ${spacing[6]}`,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            borderRadius: borderRadius.lg,
            border: `1px solid ${activeTab === 'refinance' ? templateColors.primary : colors.gray[300]}`,
            backgroundColor: activeTab === 'refinance' ? templateColors.primary : colors.gray[100],
            color: activeTab === 'refinance' ? templateColors.background : colors.gray[700],
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          Refinance
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
        {/* Row 1: ZIP Code and Price/Value */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: spacing[4] 
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.gray[700],
              marginBottom: spacing[2]
            }}>
              ZIP Code
            </label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              style={{
                width: '100%',
                padding: `${spacing[2]} ${spacing[3]}`,
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                outline: 'none',
                transition: 'border-color 0.2s ease-in-out'
              }}
              placeholder="Enter ZIP code"
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.gray[700],
              marginBottom: spacing[2]
            }}>
              {activeTab === 'purchase' ? 'Purchase Price' : 'Home Value'}
            </label>
            <input
              type="number"
              value={activeTab === 'purchase' ? formData.salesPrice : formData.homeValue}
              onChange={(e) => handleInputChange(activeTab === 'purchase' ? 'salesPrice' : 'homeValue', e.target.value)}
              style={{
                width: '100%',
                padding: `${spacing[2]} ${spacing[3]}`,
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                outline: 'none',
                transition: 'border-color 0.2s ease-in-out'
              }}
              placeholder={activeTab === 'purchase' ? 'Enter purchase price' : 'Enter home value'}
            />
            {activeTab === 'refinance' && (
              <div style={{ 
                marginTop: spacing.xs, 
                fontSize: typography.fontSize.sm, 
                color: colors.gray[600] 
              }}>
                {formData.ltv}% LTV
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Purchase-specific or Refinance-specific fields */}
        {activeTab === 'purchase' ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: spacing.md 
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: typography.fontSize.sm, 
                fontWeight: typography.fontWeight.medium, 
                color: colors.gray[600], 
                marginBottom: spacing.sm 
              }}>
                Down Payment
              </label>
              <div style={{ display: 'flex' }}>
                <input
                  type="number"
                  value={formData.downPayment}
                  onChange={(e) => handleInputChange('downPayment', e.target.value)}
                  style={{ 
                    flex: 1,
                    padding: `${spacing.sm} ${spacing.md}`,
                    border: `1px solid ${colors.gray[300]}`,
                    borderTopLeftRadius: borderRadius.md,
                    borderBottomLeftRadius: borderRadius.md,
                    borderRight: 'none',
                    outline: 'none',
                    fontSize: typography.fontSize.base,
                    color: templateColors.text,
                    backgroundColor: templateColors.background
                  }}
                  placeholder="Enter down payment"
                />
                <span style={{ 
                  padding: `${spacing.sm} ${spacing.md}`, 
                  backgroundColor: colors.gray[100], 
                  border: `1px solid ${colors.gray[300]}`, 
                  borderTopRightRadius: borderRadius.md,
                  borderBottomRightRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm, 
                  color: colors.text.secondary 
                }}>
                  {formData.downPaymentPercent}%
                </span>
              </div>
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: typography.fontSize.sm, 
                fontWeight: typography.fontWeight.medium, 
                color: colors.gray[600], 
                marginBottom: spacing.sm 
              }}>
                Credit Score
              </label>
              <select
                value={formData.creditScore}
                onChange={(e) => handleInputChange('creditScore', e.target.value)}
                style={{ 
                  width: '100%',
                  padding: `${spacing.sm} ${spacing.md}`,
                  border: `1px solid ${colors.gray[300]}`,
                  borderRadius: borderRadius.md,
                  outline: 'none',
                  fontSize: typography.fontSize.base,
                  color: templateColors.text,
                  backgroundColor: templateColors.background
                }}
              >
                <option value="500-850">Outstanding 800+</option>
                <option value="780-799">Excellent 780 - 799</option>
                <option value="740-779">Very good 740 - 779</option>
                <option value="720-739">Fairly good 720 - 739</option>
                <option value="700-719">Good 700 - 719</option>
                <option value="680-699">Decent 680 - 699</option>
                <option value="660-679">Average 660 - 679</option>
              </select>
            </div>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: spacing.md 
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: typography.fontSize.sm, 
                fontWeight: typography.fontWeight.medium, 
                color: colors.gray[600], 
                marginBottom: spacing.sm 
              }}>
                Mortgage Balance
              </label>
              <input
                type="number"
                value={formData.mortgageBalance}
                onChange={(e) => handleInputChange('mortgageBalance', e.target.value)}
                style={{ 
                  width: '100%',
                  padding: `${spacing.sm} ${spacing.md}`,
                  border: `1px solid ${colors.gray[300]}`,
                  borderRadius: borderRadius.md,
                  outline: 'none',
                  fontSize: typography.fontSize.base,
                  color: templateColors.text,
                  backgroundColor: templateColors.background
                }}
                placeholder="Enter mortgage balance"
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: typography.fontSize.sm, 
                fontWeight: typography.fontWeight.medium, 
                color: colors.gray[600], 
                marginBottom: spacing.sm 
              }}>
                Cash Out
              </label>
              <input
                type="number"
                value={formData.cashOut}
                onChange={(e) => handleInputChange('cashOut', e.target.value)}
                style={{ 
                  width: '100%',
                  padding: `${spacing.sm} ${spacing.md}`,
                  border: `1px solid ${colors.gray[300]}`,
                  borderRadius: borderRadius.md,
                  outline: 'none',
                  fontSize: typography.fontSize.base,
                  color: templateColors.text,
                  backgroundColor: templateColors.background
                }}
                placeholder="Enter cash out amount"
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: typography.fontSize.sm, 
                fontWeight: typography.fontWeight.medium, 
                color: colors.gray[600], 
                marginBottom: spacing.sm 
              }}>
                Credit Score
              </label>
              <select
                value={formData.creditScore}
                onChange={(e) => handleInputChange('creditScore', e.target.value)}
                style={{ 
                  width: '100%',
                  padding: `${spacing.sm} ${spacing.md}`,
                  border: `1px solid ${colors.gray[300]}`,
                  borderRadius: borderRadius.md,
                  outline: 'none',
                  fontSize: typography.fontSize.base,
                  color: templateColors.text,
                  backgroundColor: templateColors.background
                }}
              >
                <option value="500-850">Outstanding 800+</option>
                <option value="780-799">Excellent 780 - 799</option>
                <option value="740-779">Very good 740 - 779</option>
                <option value="720-739">Fairly good 720 - 739</option>
                <option value="700-719">Good 700 - 719</option>
                <option value="680-699">Decent 680 - 699</option>
                <option value="660-679">Average 660 - 679</option>
              </select>
            </div>
          </div>
        )}

        {/* Row 3: Property Type and Residency Usage */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: spacing.md 
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: typography.fontSize.sm, 
              fontWeight: typography.fontWeight.medium, 
              color: colors.gray[600], 
              marginBottom: spacing.sm 
            }}>
              Property Type
            </label>
            <select
              value={formData.propertyType}
              onChange={(e) => handleInputChange('propertyType', e.target.value)}
              style={{ 
                width: '100%',
                padding: `${spacing.sm} ${spacing.md}`,
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: borderRadius.md,
                outline: 'none',
                fontSize: typography.fontSize.base,
                color: templateColors.text,
                backgroundColor: templateColors.background
              }}
            >
              <option value="SingleFamily">Single Family Home</option>
              <option value="Townhouse">Townhome</option>
              <option value="Condo">Condominium</option>
              <option value="MultiFamily">Multi Unit Home</option>
              <option value="Manufactured">Manufactured Home</option>
            </select>
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: typography.fontSize.sm, 
              fontWeight: typography.fontWeight.medium, 
              color: colors.gray[600], 
              marginBottom: spacing.sm 
            }}>
              Residency Usage
            </label>
            <select
              value={formData.occupancy}
              onChange={(e) => handleInputChange('occupancy', e.target.value)}
              style={{ 
                width: '100%',
                padding: `${spacing.sm} ${spacing.md}`,
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: borderRadius.md,
                outline: 'none',
                fontSize: typography.fontSize.base,
                color: templateColors.text,
                backgroundColor: templateColors.background
              }}
            >
              <option value="PrimaryResidence">Primary Home</option>
              <option value="SecondHome">Second Home</option>
              <option value="Investment">Rental Home</option>
            </select>
          </div>
        </div>

        {/* Row 4: Loan Type and Loan Term */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: spacing.md 
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: typography.fontSize.sm, 
              fontWeight: typography.fontWeight.medium, 
              color: colors.gray[600], 
              marginBottom: spacing.sm 
            }}>
              Loan Type
            </label>
            <select
              value={formData.loanType}
              onChange={(e) => handleInputChange('loanType', e.target.value)}
              style={{ 
                width: '100%',
                padding: `${spacing.sm} ${spacing.md}`,
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: borderRadius.md,
                outline: 'none',
                fontSize: typography.fontSize.base,
                color: templateColors.text,
                backgroundColor: templateColors.background
              }}
            >
              <option value="Conforming">Conforming</option>
              <option value="NonConforming">Non-Conforming</option>
              <option value="FHA">FHA</option>
              <option value="VA">VA</option>
              <option value="USDA">USDA</option>
            </select>
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: typography.fontSize.sm, 
              fontWeight: typography.fontWeight.medium, 
              color: colors.gray[600], 
              marginBottom: spacing.sm 
            }}>
              Loan Term
            </label>
            <select
              value={formData.loanTerm || 'ThirtyYear'}
              onChange={(e) => handleInputChange('loanTerm', e.target.value)}
              style={{ 
                width: '100%',
                padding: `${spacing.sm} ${spacing.md}`,
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: borderRadius.md,
                outline: 'none',
                fontSize: typography.fontSize.base,
                color: templateColors.text,
                backgroundColor: templateColors.background
              }}
            >
              <option value="ThirtyYear">30 Year Fixed</option>
              <option value="TwentyFiveYear">25 Year Fixed</option>
              <option value="FifteenYear">15 Year Fixed</option>
              <option value="TwentyYear">20 Year Fixed</option>
            </select>
          </div>
        </div>

        {/* Row 5: Eligible for Lower Rate (Purchase only) */}
        {activeTab === 'purchase' && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="eligibleForLowerRate"
              checked={formData.eligibleForLowerRate}
              onChange={(e) => handleInputChange('eligibleForLowerRate', e.target.checked)}
              style={{ 
                height: '1rem',
                width: '1rem',
                border: `1px solid ${colors.gray[300]}`,
                borderRadius: borderRadius.sm,
                color: templateColors.primary,
                accentColor: templateColors.primary
              }}
            />
            <label htmlFor="eligibleForLowerRate" style={{ 
              marginLeft: spacing.sm, 
              display: 'block', 
              fontSize: typography.fontSize.sm, 
              color: colors.text.secondary 
            }}>
              Eligible for lower rate
            </label>
          </div>
        )}

        {/* Debug Info */}
        <div style={{ 
          paddingTop: spacing.md, 
          padding: spacing.md, 
          backgroundColor: colors.gray[50], 
          borderRadius: borderRadius.md 
        }}>
          <h4 style={{ 
            fontSize: typography.fontSize.sm, 
            fontWeight: typography.fontWeight.medium, 
              color: colors.gray[600],
            marginBottom: spacing.sm 
          }}>
            Current Form Values (Debug):
          </h4>
          <div style={{ 
            fontSize: typography.fontSize.xs, 
              color: colors.gray[600],
            display: 'flex', 
            flexDirection: 'column', 
            gap: spacing.xs 
          }}>
            <p><strong>Property:</strong> {formData.salesPrice} | {formData.zipCode} | {formData.county}, {formData.state}</p>
            <p><strong>Loan:</strong> {formData.baseLoanAmount} | {formData.loanType} | FICO: {formData.creditScore}</p>
            <p><strong>Borrower:</strong> {formData.firstName} {formData.lastName} | Self-employed: {formData.selfEmployed ? 'Yes' : 'No'}</p>
            <p><strong>Income:</strong> ${formData.totalMonthlyQualifyingIncome}/month | DTI: {formData.loanLevelDebtToIncomeRatio}%</p>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ paddingTop: spacing[4] }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: templateColors.primary,
              color: '#ffffff',
              padding: `${spacing[3]} ${spacing[6]}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {loading ? 'Searching...' : 'Update Rates'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
export default memo(MortgageSearchForm);
