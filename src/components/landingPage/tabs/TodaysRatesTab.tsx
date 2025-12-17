'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { icons } from '@/components/ui/Icon';
import MortgageSearchForm from '@/components/landingPage/MortgageSearchForm';
import RateResults from '@/components/landingPage/RateResults';

interface TodaysRatesTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
  isPublic?: boolean;
  publicTemplateData?: any;
  userId?: string;
  companyId?: string;
}

interface Rate {
  id: string;
  loanType: string;
  rate: number;
  apr: number;
  points: number;
  monthlyPayment: number;
  lastUpdated: string;
  category?: 'featured' | '30yr-fixed' | '20yr-fixed' | '15yr-fixed' | 'arm';
}

interface SearchFormData {
  zipCode: string;
  salesPrice: string;
  downPayment: string;
  downPaymentPercent: string;
  creditScore: string;
  propertyType: string;
  occupancy: string;
  loanType: string;
  loanTerm: string;
  eligibleForLowerRate: boolean;
  loanPurpose: string;
  homeValue: string;
  mortgageBalance: string;
  cashOut: string;
  ltv: string;
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
  waiveEscrow: boolean;
  militaryVeteran: boolean;
  lockDays: string;
  secondMortgageAmount: string;
  amortizationTypes: string[];
  armFixedTerms: string[];
  loanTerms: string[];
}

/**
 * TodaysRatesTab - Uses MortgageSearchForm UI (like old version) but with Mortech API logic
 */
export default function TodaysRatesTab({
  selectedTemplate,
  className = '',
  isPublic = false,
  publicTemplateData,
  userId,
  companyId
}: TodaysRatesTabProps) {
  const { getTemplateSync } = useEfficientTemplates();
  
  const templateData = isPublic && publicTemplateData 
    ? publicTemplateData 
    : getTemplateSync(selectedTemplate);

  const colors = templateData?.template?.colors || {
    primary: '#ec4899',
    secondary: '#01bcc6',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };
  
  const layout = templateData?.template?.layout || {
    alignment: 'center',
    spacing: 18,
    borderRadius: 8,
    padding: { small: 8, medium: 16, large: 24, xlarge: 32 }
  };
  
  const [rates, setRates] = useState<Rate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [loanAmount, setLoanAmount] = useState<number | undefined>(undefined);
  const [downPayment, setDownPayment] = useState<number | undefined>(undefined);
  
  // Map property type from form to Mortech format
  const mapPropertyType = (type: string): string => {
    const mapping: Record<string, string> = {
      'SingleFamily': 'Single Family',
      'Condo': 'Condo',
      'Townhouse': 'Townhouse',
      'MultiFamily': 'Multi-Family'
    };
    return mapping[type] || 'Single Family';
  };

  // Map occupancy from form to Mortech format
  const mapOccupancy = (occ: string): string => {
    const mapping: Record<string, string> = {
      'PrimaryResidence': 'Primary',
      'Secondary': 'Secondary',
      'Investment': 'Investment'
    };
    return mapping[occ] || 'Primary';
  };

  // Normalize loan term to Mortech format
  const normalizeLoanTerm = (term: string): string => {
    if (!term) return '30 year fixed';
    if (term.includes('year fixed')) return term;
    return `${term} year fixed`;
  };

  // Map credit score from form to numeric value
  const mapCreditScore = (creditScore: string): number => {
    if (creditScore.includes('+')) {
      return parseInt(creditScore.replace('+', '')) || 800;
    }
    if (creditScore.includes('-')) {
      const parts = creditScore.split('-');
      return parseInt(parts[0]) || 740;
    }
    return parseInt(creditScore) || 740;
  };

  // Handle search form updates - transform to Mortech format
  const handleSearchFormUpdate = useCallback(async (formData: SearchFormData) => {
    setIsLoading(true);
    setError(null);
    setValidationMessage(null);
    
    try {
      let propertyValue: number;
      
      let calculatedLoanAmount: number;
      let calculatedDownPayment: number | undefined;
      
      if (formData.loanPurpose === 'Refinance') {
        // For refinance: loan amount = mortgage balance (no cash out field)
        const mortgageBalance = parseFloat(formData.mortgageBalance || '0');
        calculatedLoanAmount = mortgageBalance;
        calculatedDownPayment = undefined; // No down payment for refinance
        // Property value = loan amount (used for API, but not shown in form)
        propertyValue = calculatedLoanAmount;
        
        // Validation for refinance
        if (mortgageBalance <= 0) {
          setValidationMessage('⚠️ Please enter a valid loan amount.');
          setIsLoading(false);
          return;
        }
      } else {
        // For purchase: loan amount = sales price - down payment
        const salesPrice = parseFloat(formData.salesPrice || '0');
        calculatedDownPayment = parseFloat(formData.downPayment || '0');
        calculatedLoanAmount = salesPrice - calculatedDownPayment;
        propertyValue = salesPrice;
        
        // Validation for purchase
        if (salesPrice > 0 && calculatedLoanAmount > salesPrice) {
          setValidationMessage('⚠️ Loan amount cannot be more than the property value. Please adjust your down payment or purchase price.');
          setIsLoading(false);
          return;
        }
        if (salesPrice <= 0) {
          setValidationMessage('⚠️ Please enter a valid property value.');
          setIsLoading(false);
          return;
        }
        if (calculatedDownPayment < 0) {
          setValidationMessage('⚠️ Down payment cannot be negative.');
          setIsLoading(false);
          return;
        }
      }
      
      // Store loan amount and down payment for lead capture
      setLoanAmount(calculatedLoanAmount);
      setDownPayment(calculatedDownPayment);

      // Build Mortech API request from form data
      const request: any = {
        propertyZip: formData.zipCode || '75024',
        appraisedvalue: propertyValue,
        loan_amount: calculatedLoanAmount,
        fico: mapCreditScore(formData.creditScore),
        loanpurpose: formData.loanPurpose as 'Purchase' | 'Refinance',
        proptype: mapPropertyType(formData.propertyType),
        occupancy: mapOccupancy(formData.occupancy),
        loanProduct1: normalizeLoanTerm(formData.loanTerm || '30')
      };
      
      // Validate required fields
      if (!request.propertyZip || request.propertyZip.trim() === '') {
        setValidationMessage('⚠️ Please enter a valid ZIP code.');
        setIsLoading(false);
        return;
      }
      if (request.appraisedvalue <= 0) {
        setValidationMessage('⚠️ Please enter a valid property value.');
        setIsLoading(false);
        return;
      }
      if (request.loan_amount <= 0) {
        setValidationMessage('⚠️ Please enter a valid loan amount.');
        setIsLoading(false);
        return;
      }

      // Optional fields - only include if explicitly set
      if (formData.waiveEscrow === true) {
        request.waiveEscrow = true;
      }
      if (formData.militaryVeteran === true) {
        request.militaryVeteran = true;
      }
      if (formData.lockDays && formData.lockDays !== '30' && formData.lockDays !== '') {
        request.lockDays = formData.lockDays;
      }
      if (formData.secondMortgageAmount && formData.secondMortgageAmount !== '0' && formData.secondMortgageAmount !== '') {
        const amount = parseInt(formData.secondMortgageAmount);
        if (!isNaN(amount) && amount > 0) {
          request.secondMortgageAmount = amount;
        }
      }

      console.log('🔍 Fetching today\'s rates with Mortech API:', request);

      const response = await fetch('/api/mortech/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const result = await response.json();
      console.log('📊 Mortech API Response:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch rates');
      }

      // Transform Mortech rates to our display format
      if (result.rates && Array.isArray(result.rates)) {
        const transformedRates: Rate[] = result.rates.slice(0, 6).map((rate: any, index: number) => ({
          id: rate.id || `rate-${index}`,
          loanType: rate.productName || rate.loanProgram || '30 Year Fixed',
          rate: rate.interestRate || 6.0,
          apr: rate.apr || 6.1,
          points: rate.points || 0,
          monthlyPayment: rate.monthlyPayment || 2000,
          lastUpdated: rate.lastUpdate || new Date().toLocaleString(),
          category: index === 0 ? 'featured' : '30yr-fixed'
        }));

        setRates(transformedRates);
        // Prefer latest quote's lastUpdate if available
        const mostRecent = transformedRates
          .map(r => new Date(r.lastUpdated))
          .filter(d => !isNaN(d.getTime()))
          .sort((a, b) => b.getTime() - a.getTime())[0];
        setLastUpdated(mostRecent ? mostRecent.toLocaleString() : new Date().toLocaleString());
        console.log('✅ Rates loaded successfully:', transformedRates.length);
      } else {
        throw new Error('No rates returned from API');
      }
    } catch (err) {
      console.error('❌ Error fetching rates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rates');
      setRates([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Transform rates to RateResults format
  const transformRatesToRateResults = (rates: Rate[]) => {
    return rates.map(rate => ({
      id: rate.id,
      lenderName: 'Today\'s Rates',
      loanProgram: rate.loanType,
      loanType: rate.loanType,
      loanTerm: 30, // Default term
      interestRate: rate.rate,
      apr: rate.apr,
      monthlyPayment: rate.monthlyPayment,
      fees: 0,
      points: rate.points,
      credits: 0,
      lockPeriod: 30
    }));
  };

  return (
    <div 
      className={`w-full space-y-6 ${className}`}
      style={{ 
        fontFamily: templateData?.template?.typography?.fontFamily || 'Inter',
        padding: `${layout.padding.medium}px 0`
      }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 
          className="text-xl @md:text-2xl font-bold mb-2"
          style={{ color: colors.text }}
        >
          Today's Mortgage Rates
        </h2>
        <p 
          className="text-base @md:text-lg"
          style={{ color: colors.textSecondary }}
        >
          Current rates based on market conditions
        </p>
        {lastUpdated && (
          <p className="text-sm mt-2" style={{ color: colors.textSecondary }}>
            Last updated: {lastUpdated}
          </p>
        )}
      </div>

      {/* Mortgage Search Form */}
      <div 
        className="bg-white"
        style={{ 
          backgroundColor: colors.background,
          borderRadius: `${layout.borderRadius}px`
        }}
      >
        <MortgageSearchForm
          onSearch={handleSearchFormUpdate}
          loading={isLoading}
          template={selectedTemplate}
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
        />
      </div>

      {/* Validation Message (Alert/Warning) */}
      {validationMessage && (
        <div
          style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: `${layout.borderRadius}px`,
            padding: '16px',
            color: '#92400e'
          }}
        >
          <p className="font-semibold">⚠️ Notice</p>
          <p className="text-sm">{validationMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4" style={{ borderRadius: `${layout.borderRadius}px` }}>
          <div className="flex items-center">
            {React.createElement(icons.error, { size: 20, className: "text-red-500 mr-2" })}
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Rate Results Component */}
      <RateResults
        products={transformRatesToRateResults(rates)}
        loading={isLoading}
        rawData={[]}
        template={selectedTemplate}
        isMockData={false}
        dataSource="todays-rates"
        isPublic={isPublic}
        publicTemplateData={publicTemplateData}
        userId={userId}
        companyId={companyId}
        showTodaysRatesOnly={true}
        loanAmount={loanAmount}
        downPayment={downPayment}
      />

      {/* Disclaimer */}
      <div 
        className="text-xs text-center p-4 rounded-lg mt-6"
        style={{ 
          backgroundColor: colors.background,
          border: `1px solid ${colors.border}`,
          borderRadius: `${layout.borderRadius}px`,
          color: colors.textSecondary 
        }}
      >
        <p>
          * Rates shown are for illustrative purposes and may not reflect your actual rate. 
          Your rate will depend on your specific circumstances including credit score, loan amount, 
          property type, and other factors. Contact us for a personalized rate quote.
        </p>
      </div>
    </div>
  );
}
