'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import MortgageSearchForm from '@/components/landingPage/MortgageSearchForm';
import RateResults from '@/components/landingPage/RateResults';
import { Button } from '@/components/ui/Button';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { icons } from '@/components/ui/Icon';

/**
 * Mortgage Rate Comparison Component
 * Restored questionnaire/landing page UI (from old version) with Mortech API logic
 */

interface MortgageRateComparisonProps {
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
  template?: 'template1' | 'template2';
  isPublic?: boolean;
  publicTemplateData?: any;
  userId?: string;
  companyId?: string;
}

interface RateProduct {
  id: string;
  lenderName: string;
  productName?: string;
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
    'Primary': 'Primary',
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

const MortgageRateComparison = React.memo(function MortgageRateComparison({ 
  showHeader = true, 
  showFooter = true, 
  className = "",
  template = 'template1',
  isPublic = false,
  publicTemplateData,
  userId,
  companyId
}: MortgageRateComparisonProps) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<RateProduct[]>([]);
  const [rawData, setRawData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState('landing');
  const [stepHistory, setStepHistory] = useState<string[]>(['landing']);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [questionnaireFormData, setQuestionnaireFormData] = useState<Partial<SearchFormData> | undefined>(undefined);

  // Get template-specific styles and content
  const { getTemplateSync } = useEfficientTemplates();
  const templateData = isPublic && publicTemplateData ? publicTemplateData : getTemplateSync(template);
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

  // Questionnaire navigation functions
  const handleQuestionnaireStepChange = (step: string, answer?: any) => {
    if (answer) {
      const newAnswers = { ...questionnaireAnswers, [currentStep]: answer };
      setQuestionnaireAnswers(newAnswers);
    }
    setStepHistory(prev => [...prev, step]);
    setCurrentStep(step);
  };

  const handleQuestionnaireBack = () => {
    if (stepHistory.length > 1) {
      const newHistory = stepHistory.slice(0, -1);
      setStepHistory(newHistory);
      setCurrentStep(newHistory[newHistory.length - 1]);
    }
  };

  const handleQuestionnaireComplete = async (finalAnswer: any) => {
    const allAnswers = { ...questionnaireAnswers, [currentStep]: finalAnswer };
    setQuestionnaireAnswers(allAnswers);
    
    // Generate form data from questionnaire answers
    await autoSearchFromQuestionnaire(allAnswers);
    
    // Hide questionnaire and show search form with pre-filled values
    setShowQuestionnaire(false);
    setShowLanding(false);
  };

  // Map credit score from form to numeric value for Mortech
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

  // Map property type from form to Mortech format
  const mapPropertyTypeToMortech = (type: string): string => {
    const mapping: Record<string, string> = {
      'SingleFamily': 'Single Family',
      'Condo': 'Condo',
      'Townhouse': 'Townhouse',
      'MultiFamily': 'Multi-Family'
    };
    return mapping[type] || 'Single Family';
  };

  // Map occupancy from form to Mortech format
  const mapOccupancyToMortech = (occ: string): string => {
    const mapping: Record<string, string> = {
      'PrimaryResidence': 'Primary',
      'Secondary': 'Secondary',
      'Investment': 'Investment'
    };
    return mapping[occ] || 'Primary';
  };

  // Map questionnaire credit score to form dropdown value
  const mapCreditScoreToDropdown = (creditScore: string): string => {
    // Map questionnaire values to exact dropdown values
    if (creditScore === 'Below 580') return 'Below 580';
    if (creditScore === '580-619') return '580-619';
    if (creditScore === '620-639') return '620-639';
    if (creditScore === '640+') return '640-659'; // Map 640+ to closest range
    if (creditScore === '640-659') return '640-659';
    if (creditScore === '660-679') return '660-679';
    if (creditScore === '680-699') return '680-699';
    if (creditScore === '700-719') return '700-719';
    if (creditScore === '720-739') return '720-739';
    if (creditScore === '740-759') return '740-759';
    if (creditScore === '760-779') return '760-779';
    if (creditScore === '780-799') return '780-799';
    if (creditScore === '800+') return '800+';
    // Default fallback
    return creditScore || '740-759';
  };

  // Auto-search based on questionnaire answers
  const autoSearchFromQuestionnaire = async (answers: Record<string, any>) => {
    // Extract values from questionnaire answers
    let loanType = 'Conventional';
    let creditScore = '740-759';
    let loanPurpose = 'Purchase';
    let vaFirstTimeUse = false;
    let downPaymentPercent: string | undefined = undefined;
    
    Object.values(answers).forEach((answer: any) => {
      if (answer && typeof answer === 'object') {
        if (answer.loanType) loanType = answer.loanType;
        if (answer.creditScore) creditScore = answer.creditScore;
        if (answer.loanPurpose) loanPurpose = answer.loanPurpose;
        if (answer.vaFirstTimeUse !== undefined) vaFirstTimeUse = answer.vaFirstTimeUse;
        if (answer.downPaymentPercent) downPaymentPercent = answer.downPaymentPercent;
      }
    });
    
    // Map credit score to exact dropdown value
    const mappedCreditScore = mapCreditScoreToDropdown(creditScore);
    
    // Default sales price
    const defaultSalesPrice = 225000;
    
    // Calculate down payment amount from percentage if provided
    let downPayment: string | undefined = undefined;
    if (downPaymentPercent && loanPurpose === 'Purchase') {
      const percent = parseFloat(downPaymentPercent);
      const amount = (defaultSalesPrice * percent) / 100;
      downPayment = amount.toFixed(0);
    }
    
    console.log('📝 Questionnaire mapping:', {
      original: creditScore,
      mapped: mappedCreditScore,
      loanPurpose,
      loanType,
      downPaymentPercent,
      downPayment
    });
    
    // Create form data from questionnaire - map to form fields
    const formDataPartial: Partial<SearchFormData> = {
      zipCode: '75024',
      salesPrice: loanPurpose === 'Purchase' ? defaultSalesPrice.toString() : undefined,
      downPayment: downPayment || (loanPurpose === 'Purchase' ? '75000' : undefined),
      downPaymentPercent: downPaymentPercent || (loanPurpose === 'Purchase' ? '33.33' : undefined),
      creditScore: mappedCreditScore, // Use mapped value
      propertyType: 'SingleFamily',
      occupancy: 'PrimaryResidence',
      loanType: loanType,
      loanTerm: '30',
      loanPurpose: loanPurpose,
      // For refinance: only loan amount, no home value or cash out
      mortgageBalance: loanPurpose === 'Refinance' ? '360000' : undefined,
      vaFirstTimeUse: vaFirstTimeUse,
      militaryVeteran: loanType === 'VA',
      // Keep other defaults
      eligibleForLowerRate: false,
      firstName: 'test',
      lastName: 'test1',
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
      totalMonthlyQualifyingIncome: 9000,
      waiveEscrow: false,
      lockDays: '',
      secondMortgageAmount: '',
      amortizationTypes: ["Fixed", "ARM"],
      armFixedTerms: ["ThreeYear", "FiveYear", "SevenYear", "TenYear"],
      loanTerms: ["ThirtyYear", "TwentyYear", "TwentyFiveYear", "FifteenYear", "TenYear"]
    };

    // Store questionnaire form data to pass to MortgageSearchForm
    setQuestionnaireFormData(formDataPartial);

    // Create full form data for search
    const formData: SearchFormData = {
      zipCode: formDataPartial.zipCode || '75024',
      salesPrice: formDataPartial.salesPrice || '225000',
      downPayment: formDataPartial.downPayment || '75000',
      downPaymentPercent: formDataPartial.downPaymentPercent || '33.33',
      creditScore: formDataPartial.creditScore || '740-759',
      propertyType: formDataPartial.propertyType || 'SingleFamily',
      occupancy: formDataPartial.occupancy || 'PrimaryResidence',
      loanType: formDataPartial.loanType || 'Conventional',
      loanTerm: formDataPartial.loanTerm || '30',
      eligibleForLowerRate: formDataPartial.eligibleForLowerRate || false,
      loanPurpose: formDataPartial.loanPurpose || 'Purchase',
      homeValue: formDataPartial.homeValue || '450000',
      mortgageBalance: formDataPartial.mortgageBalance || '360000',
      cashOut: formDataPartial.cashOut || '0',
      ltv: formDataPartial.ltv || '80.00',
      firstName: formDataPartial.firstName || 'test',
      lastName: formDataPartial.lastName || 'test1',
      vaFirstTimeUse: formDataPartial.vaFirstTimeUse || false,
      firstTimeHomeBuyer: formDataPartial.firstTimeHomeBuyer || false,
      monthsReserves: formDataPartial.monthsReserves || 24,
      selfEmployed: formDataPartial.selfEmployed || true,
      waiveEscrows: formDataPartial.waiveEscrows || false,
      county: formDataPartial.county || 'Collin',
      state: formDataPartial.state || 'TX',
      numberOfStories: formDataPartial.numberOfStories || 1,
      numberOfUnits: formDataPartial.numberOfUnits || 'OneUnit',
      lienType: formDataPartial.lienType || 'First',
      borrowerPaidMI: formDataPartial.borrowerPaidMI || 'Yes',
      baseLoanAmount: formDataPartial.baseLoanAmount || 150000,
      loanLevelDebtToIncomeRatio: formDataPartial.loanLevelDebtToIncomeRatio || 18,
      totalMonthlyQualifyingIncome: formDataPartial.totalMonthlyQualifyingIncome || 9000,
      waiveEscrow: formDataPartial.waiveEscrow || false,
      militaryVeteran: formDataPartial.militaryVeteran || false,
      lockDays: formDataPartial.lockDays || '',
      secondMortgageAmount: formDataPartial.secondMortgageAmount || '',
      amortizationTypes: formDataPartial.amortizationTypes || ["Fixed", "ARM"],
      armFixedTerms: formDataPartial.armFixedTerms || ["ThreeYear", "FiveYear", "SevenYear", "TenYear"],
      loanTerms: formDataPartial.loanTerms || ["ThirtyYear", "TwentyYear", "TwentyFiveYear", "FifteenYear", "TenYear"]
    };

    // Don't auto-trigger search - let user see the form with pre-filled values
    // await handleSearch(formData);
  };

  // Handle search - transform form data to Mortech API format
  const handleSearch = async (formData: SearchFormData) => {
    setLoading(true);
    setError(null);
    setValidationMessage(null);
    
    try {
      let loanAmount: number;
      let propertyValue: number;
      
      if (formData.loanPurpose === 'Refinance') {
        // For refinance: loan amount = mortgage balance (no cash out field)
        const mortgageBalance = parseFloat(formData.mortgageBalance || '0');
        loanAmount = mortgageBalance;
        // Property value = loan amount (used for API, but not shown in form)
        propertyValue = loanAmount;
        
        // Validation for refinance
        if (mortgageBalance <= 0) {
          setValidationMessage('⚠️ Please enter a valid loan amount.');
          setLoading(false);
          return;
        }
      } else {
        // For purchase: loan amount = sales price - down payment
        const salesPrice = parseFloat(formData.salesPrice || '0');
        const downPayment = parseFloat(formData.downPayment || '0');
        loanAmount = salesPrice - downPayment;
        propertyValue = salesPrice;
        
        // Validation for purchase
        if (salesPrice > 0 && loanAmount > salesPrice) {
          setValidationMessage('⚠️ Loan amount cannot be more than the property value. Please adjust your down payment or purchase price.');
          setLoading(false);
          return;
        }
        if (salesPrice <= 0) {
          setValidationMessage('⚠️ Please enter a valid property value.');
          setLoading(false);
          return;
        }
        if (downPayment < 0) {
          setValidationMessage('⚠️ Down payment cannot be negative.');
          setLoading(false);
          return;
        }
      }

      // Build Mortech API request
      const request: any = {
        propertyZip: formData.zipCode || '75024',
        appraisedvalue: propertyValue,
        loan_amount: loanAmount,
        fico: mapCreditScore(formData.creditScore),
        loanpurpose: formData.loanPurpose as 'Purchase' | 'Refinance',
        proptype: mapPropertyTypeToMortech(formData.propertyType),
        occupancy: mapOccupancyToMortech(formData.occupancy),
        loanProduct1: normalizeLoanTerm(formData.loanTerm || '30')
      };
      
      // Validate required fields
      if (!request.propertyZip || request.propertyZip.trim() === '') {
        setValidationMessage('⚠️ Please enter a valid ZIP code.');
        setLoading(false);
        return;
      }
      if (request.appraisedvalue <= 0) {
        setValidationMessage('⚠️ Please enter a valid property value.');
        setLoading(false);
        return;
      }
      if (request.loan_amount <= 0) {
        setValidationMessage('⚠️ Please enter a valid loan amount.');
        setLoading(false);
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

      console.log('📤 Sending request to Mortech API:', request);

      const response = await fetch('/api/mortech/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const result = await response.json();
      console.log('📥 Received response from Mortech API:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch rates');
      }

      // Transform results
      if (result.rates && Array.isArray(result.rates)) {
        const transformed: RateProduct[] = result.rates.map((rate: any, index: number) => ({
          id: rate.id || `rate-${index}`,
          lenderName: rate.lenderName || 'Lender',
          productName: rate.productName || 'Mortgage Product',
          loanProgram: rate.loanProgram || 'Conventional',
          loanType: rate.loanType || 'Fixed',
          loanTerm: parseInt(rate.loanTerm) || 30,
          interestRate: rate.interestRate || 0,
          apr: rate.apr || 0,
          monthlyPayment: rate.monthlyPayment || 0,
          fees: (rate.originationFee || 0) + (rate.upfrontFee || 0),
          points: rate.points || 0,
          credits: 0,
          lockPeriod: rate.lockTerm || 30
        }));

        setProducts(transformed);
        setRawData(result.rates);
        console.log('✅ Rates loaded:', transformed.length);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rates');
    } finally {
      setLoading(false);
    }
  };

  // Get template content
  const getTemplateContent = () => {
    if (template === 'template1') {
      return {
        title: "Get Your Custom Rate",
        subtitle: "Personalized Mortgage Solutions",
        description: "Answer a few quick questions to get personalized loan recommendations and compare real-time rates from multiple lenders. Our intelligent questionnaire helps you find the ideal loan for your unique situation.",
        primaryButton: "Get My Custom Rate",
        secondaryButton: "Compare All Rates"
      };
    } else {
      return {
        title: "Get Your Custom Rate",
        subtitle: "Tailored Mortgage Solutions", 
        description: "Complete our smart questionnaire to receive personalized loan recommendations and compare real-time rates from multiple lenders. Find the perfect mortgage solution for your specific needs.",
        primaryButton: "Get My Custom Rate",
        secondaryButton: "View All Rates"
      };
    }
  };

  const getTemplateButtonStyles = (buttonType: 'primary' | 'secondary') => {
    if (buttonType === 'primary') {
      return {
        variant: 'primary' as const,
        className: 'flex items-center space-x-2 px-6 py-4 text-base font-medium transition-colors',
        style: { 
          backgroundColor: colors.primary,
          color: colors.background,
          borderRadius: `${layout.borderRadius}px`,
          border: 'none'
        }
      };
    } else {
      return {
        variant: 'secondary' as const,
        className: 'flex items-center space-x-2 px-6 py-4 text-base font-medium transition-colors',
        style: { 
          backgroundColor: colors.primary,
          color: colors.background,
          borderRadius: `${layout.borderRadius}px`,
          border: 'none'
        }
      };
    }
  };

  // Render questionnaire step
  const renderQuestionnaireStep = () => {
    switch (currentStep) {
      case 'landing':
        return (
          <div className="p-0 @sm:p-6 bg-white mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold text-black mb-2 text-center">Select Your Loan Purpose</h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.text }}>Choose the option that best describes your situation</p>
            <div className="grid grid-cols-1 @sm:grid-cols-2 gap-1.5 @sm:gap-4">
              <Button 
                onClick={() => handleQuestionnaireStepChange('purchase-credit-score', { loanPurpose: 'Purchase' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.homePurchase, { size: 20, color: colors.background })}
                  <span>Home Purchase</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('refinance-veteran', { loanPurpose: 'Refinance' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.homeRefinance, { size: 20, color: colors.background })}
                  <span>Home Refinance</span>
                </div>
              </Button>
            </div>
          </div>
        );

      case 'purchase-credit-score':
        return (
          <div className="p-0 @sm:p-6 bg-white mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold text-black mb-2 text-center">What's Your Credit Score?</h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.text }}>Your credit score helps determine which loan options are available to you</p>
            <div className="grid grid-cols-2 gap-1.5 @sm:gap-4">
              <Button 
                onClick={() => handleQuestionnaireStepChange('fha-loan', { creditScore: 'Below 580', loanType: 'FHA' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.rates, { size: 20, color: colors.background })}
                  <span>Below 580</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('purchase-down-payment-low', { creditScore: '580-619' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.calculators, { size: 20, color: colors.background })}
                  <span>580-619</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('purchase-down-payment-mid', { creditScore: '620-639' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.trendingUp, { size: 20, color: colors.background })}
                  <span>620-639</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('purchase-military', { creditScore: '640+' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.star, { size: 20, color: colors.background })}
                  <span>640 or higher</span>
                </div>
              </Button>
            </div>
          </div>
        );

      case 'purchase-military':
        return (
          <div className="p-0 @sm:p-6 bg-white mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold text-black mb-2 text-center">Are You a Veteran or Active Military?</h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.text }}>VA loans offer excellent benefits including no down payment requirements</p>
            <div className="grid grid-cols-1 @sm:grid-cols-2 gap-1.5 @sm:gap-4">
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'VA', vaFirstTimeUse: true })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.star, { size: 20, color: colors.background })}
                  <span>Yes</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('purchase-rural', { loanType: 'Conventional' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.cancel, { size: 20, color: colors.background })}
                  <span>No</span>
                </div>
              </Button>
            </div>
          </div>
        );

      case 'purchase-rural':
        return (
          <div className="p-0 @sm:p-6 bg-white mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold text-black mb-2 text-center">Is the Property in a Rural Area?</h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.text }}>USDA loans are available for properties in eligible rural areas</p>
            <div className="grid grid-cols-1 @sm:grid-cols-2 gap-1.5 @sm:gap-4">
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'USDA' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                {React.createElement(icons.check, { size: 20 })}
                <span>Yes</span>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'Conventional' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                {React.createElement(icons.cancel, { size: 20 })}
                No
              </Button>
            </div>
          </div>
        );

      case 'purchase-down-payment-low':
        return (
          <div className="p-0 @sm:p-6 bg-white mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold text-black mb-2 text-center">How Much Can You Put Down?</h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.text }}>Your down payment amount affects your loan options and monthly payments</p>
            <div className="grid grid-cols-2 gap-2 @sm:gap-4">
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'FHA', downPaymentPercent: '3.5' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-1 @sm:space-x-3">
                  {React.createElement(icons.calculators, { size: 20, color: colors.background })}
                  <span>Less than 3.5%</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'Conventional', dpa: true, downPaymentPercent: '3.5' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-1 @sm:space-x-3">
                  {React.createElement(icons.calculators, { size: 20, color: colors.background })}
                  <span>3.5% or more</span>
                </div>
              </Button>
            </div>
          </div>
        );

      case 'purchase-down-payment-mid':
        return (
          <div className="p-0 @sm:p-6 bg-white mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold text-black mb-2 text-center">How Much Can You Put Down?</h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.text }}>Your down payment amount affects your loan options and monthly payments</p>
            <div className="grid grid-cols-2 @md:grid-cols-3 gap-1.5 @sm:gap-4">
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'Conventional', dpa: true, downPaymentPercent: '3' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.calculators, { size: 20, color: colors.background })}
                  <span>Less than 3%</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'FHA', downPaymentPercent: '4' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.calculators, { size: 20, color: colors.background })}
                  <span>3-5%</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'Conventional', downPaymentPercent: '5' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base col-span-2 @md:col-span-1"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.calculators, { size: 20, color: colors.background })}
                  <span>5% or more</span>
                </div>
              </Button>
            </div>
          </div>
        );

      case 'refinance-veteran':
        return (
          <div className="p-0 @sm:p-6 bg-white mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold text-black mb-2 text-center">Are You a Veteran?</h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.text }}>Veterans have access to special refinance programs with great benefits</p>
            <div className="grid grid-cols-1 @sm:grid-cols-2 gap-1.5 @sm:gap-4">
              <Button 
                onClick={() => handleQuestionnaireStepChange('refinance-veteran-purpose', { loanType: 'VA' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                {React.createElement(icons.star, { size: 20 })}
                Yes
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('refinance-non-veteran-purpose', { loanType: 'Conventional' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                {React.createElement(icons.cancel, { size: 20 })}
                No
              </Button>
            </div>
          </div>
        );

      case 'refinance-veteran-purpose':
        return (
          <div className="p-0 @sm:p-6 bg-white mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold text-black mb-2 text-center">What's Your Refinance Goal?</h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.text }}>Choose your primary refinance objective</p>
            <div className="grid grid-cols-1 @sm:grid-cols-2 gap-1.5 @sm:gap-4">
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'VA', cashOut: true })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.calculators, { size: 20, color: colors.background })}
                  <span>Access Equity</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'VA', irrrl: true })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.rates, { size: 20, color: colors.background })}
                  <span>Lower Rate</span>
                </div>
              </Button>
            </div>
          </div>
        );

      case 'refinance-non-veteran-purpose':
        return (
          <div className="p-0 @sm:p-6 bg-white mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold text-black mb-2 text-center">What's Your Refinance Goal?</h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.text }}>Choose your primary refinance objective</p>
            <div className="grid grid-cols-1 @sm:grid-cols-2 gap-1.5 @sm:gap-4">
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'Conventional', cashOut: true })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.calculators, { size: 20, color: colors.background })}
                  <span>Access Equity</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'Conventional', refinance: true })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.rates, { size: 20, color: colors.background })}
                  <span>Lower Rate</span>
                </div>
              </Button>
            </div>
          </div>
        );

      case 'fha-loan':
        return (
          <div className="p-0 @sm:p-6 bg-white mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold mb-2 text-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: colors.text }}>
              {React.createElement(icons.target, { size: 24 })}
              Recommended: FHA Loan
            </h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.primary }}>An FHA loan might be ideal for you, offering lower down payment requirements and more flexible credit guidelines.</p>
            <div className="flex justify-center">
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'FHA' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base px-8"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.custom, { size: 20, color: colors.background })}
                  <span>Get My Custom Rate</span>
                </div>
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-0 @sm:p-6 bg-white shadow-sm border border-gray-200 mb-6" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <h3 className="text-md @sm:text-xl font-semibold text-black mb-2 text-center">Select Your Loan Purpose</h3>
            <p className="mb-6 text-center text-sm @sm:text-base" style={{ color: colors.text }}>Choose the option that best describes your situation</p>
            <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
              <Button 
                onClick={() => handleQuestionnaireStepChange('purchase-credit-score', { loanPurpose: 'Purchase' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.homePurchase, { size: 20, color: colors.background })}
                  <span> Home Purchase</span>
                </div>
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('refinance-veteran', { loanPurpose: 'Refinance' })}
                {...getTemplateButtonStyles('secondary')}
                className="h-10 @sm:h-14 text-sm @sm:text-base"
              >
                <div className="flex items-center space-x-3">
                  {React.createElement(icons.homeRefinance, { size: 20, color: colors.background })}
                  <span> Home Refinance</span>
                </div>
              </Button>
            </div>
          </div>
        );
    }
  };

  // Handle URL parameters from loan finder
  useEffect(() => {
    const loanType = searchParams.get('loanType');
    if (loanType) {
      setShowLanding(false); // Show search form when coming from loan finder
    }
  }, [searchParams]);

  // Show landing page by default
  if (showLanding) {
    return (
      <div className="min-h-screen">
        {/* Header */}
        {showHeader && (
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl sm:max-w-full mx-auto px-3 sm:px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">Mortgage Rate Comparison</h1>
                </div>
                <div className="text-xs sm:text-sm" style={{ color: colors.text }}>Powered by Mortech</div>
              </div>
            </div>
          </header>
        )}

        {/* Hero Section */}
        <main className="max-w-7xl sm:max-w-full mx-auto px-3 sm:px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black mb-6">
              {getTemplateContent().title}
              <span style={{ color: colors.primary }}> Mortgage</span>
            </h1>
            <p className="text-base mb-8 w-[700px]  mx-auto" style={{ color: colors.text }}>
              {getTemplateContent().description}
            </p>
            
            <div className="flex flex-col @sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => {
                  setShowLanding(false);
                  setShowQuestionnaire(true);
                }}
                className="flex items-center justify-center space-x-2 px-4 py-3 @sm:px-8 @sm:py-4 text-sm @sm:text-lg font-semibold transition-colors shadow-lg w-full @sm:w-auto"
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
                {React.createElement(icons.target, { size: 20, color: colors.background })}
                <span className='text-sm @sm:text-base'>{getTemplateContent().primaryButton}</span>
              </button>
              <button 
                onClick={() => setShowLanding(false)}
                className="flex items-center justify-center space-x-2 px-4 py-3 @sm:px-8 @sm:py-4 text-sm @sm:text-lg font-semibold transition-colors border-2 w-full @sm:w-auto"
                style={{ 
                  backgroundColor: colors.background,
                  color: colors.primary,
                  borderColor: colors.primary,
                  borderRadius: `${layout.borderRadius}px`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary + '10';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.background;
                }}
              >
                {React.createElement(icons.rates, { size: 20, color: colors.primary })}
                <span className='text-sm @sm:text-base'>{getTemplateContent().secondaryButton}</span>
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        {showFooter && (
          <footer className="bg-white border-t mt-16">
            <div className="max-w-7xl sm:max-w-full mx-auto px-3 sm:px-4 py-8">
              <div className="text-center text-sm" style={{ color: colors.text }}>
                <p>&copy; 2024 Mortgage Rate Comparison. All rights reserved.</p>
                <p className="mt-2">Rates are subject to change and may vary based on individual circumstances.</p>
              </div>
            </div>
          </footer>
        )}
      </div>
    );
  }

  // Show questionnaire section
  if (showQuestionnaire) {
    return (
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        {/* Header */}
        {showHeader && (
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl sm:max-w-full mx-auto px-3 sm:px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center space-x-3 sm:space-x-6 flex-1 sm:flex-initial">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">Get My Custom Rate</h1>
                  <button 
                    onClick={() => {
                      setShowQuestionnaire(false);
                      setShowLanding(true);
                    }}
                    className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: colors.background,
                      color: colors.primary,
                      border: `1px solid ${colors.primary}`,
                      borderRadius: `${layout.borderRadius}px`
                    }}
                  >
                    <span>← Back to Home</span>
                  </button>
                </div>
                <div className="text-xs sm:text-sm" style={{ color: colors.text }}>Powered by Mortech</div>
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className="max-w-4xl sm:max-w-full mx-auto px-3 sm:px-4 py-8">
          <div className="max-w-3xl sm:max-w-full mx-auto">
            {/* Back Button */}
            {currentStep !== 'landing' && (
              <div className="mb-6">
                <Button 
                  onClick={handleQuestionnaireBack}
                  variant="ghost"
                  size="sm"
                  className="font-medium transition-colors duration-200 p-2 pr-4 border"
                  style={{ 
                    color: colors.primary,
                  }}
                >
                  <div className="flex items-center justify-center space-x-1">
                    {React.createElement(icons.chevronLeft, { size: 20, color: colors.primary })}
                    <span className='pb-0.5'>Back</span>
                  </div>
                </Button>
              </div>
            )}
            
            {/* Questionnaire Content - Container Query Wrapper */}
            <div style={{ containerType: 'inline-size' }}>
              {renderQuestionnaireStep()}
            </div>
          </div>
        </main>

        {/* Footer */}
        {showFooter && (
          <footer className="bg-white border-t mt-16">
            <div className="max-w-7xl sm:max-w-full mx-auto px-3 sm:px-4 py-8">
              <div className="text-center text-sm" style={{ color: colors.text }}>
                <p>&copy; 2024 Mortgage Rate Comparison. All rights reserved.</p>
                <p className="mt-2">Rates are subject to change and may vary based on individual circumstances.</p>
              </div>
            </div>
          </footer>
        )}
      </div>
    );
  }

  // Show search form and results
  return (
      <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      {showHeader && (
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl sm:max-w-full mx-auto px-3 sm:px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">Mortgage Rate Comparison</h1>
                <button 
                  onClick={() => {
                    setShowQuestionnaire(true);
                    setShowLanding(false);
                  }}
                  className="text-[#01bcc6] hover:text-[#008eab] font-medium"
                >
                  Find Your Ideal Loan
                </button>
              </div>
              <div className="text-xs sm:text-sm" style={{ color: colors.text }}>
                Powered by Mortech
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="max-w-7xl sm:max-w-full mx-auto px-3 sm:px-4 py-8">
        {/* Search Form */}
        <MortgageSearchForm 
          onSearch={handleSearch} 
          loading={loading} 
          template={template}
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
          initialValues={questionnaireFormData}
        />

        {/* Validation Message */}
        {validationMessage && (
          <div
            style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: `${layout.borderRadius}px`,
              padding: '16px',
              color: '#92400e',
              marginTop: '16px'
            }}
          >
            <p className="font-semibold">⚠️ Notice</p>
            <p className="text-sm">{validationMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 mb-8" style={{ borderRadius: `${layout.borderRadius}px` }}>
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-900">Error</h3>
                <div className="mt-2 text-sm text-red-800">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <RateResults 
          products={products} 
          loading={loading} 
          rawData={rawData} 
          template={template}
          isMockData={false}
          dataSource="mortech"
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
          userId={userId}
          companyId={companyId}
        />
      </main>

      {/* Footer */}
      {showFooter && (
        <footer className="bg-white border-t mt-16">
          <div className="max-w-7xl sm:max-w-full mx-auto px-3 sm:px-4 py-8">
            <div className="text-center text-sm" style={{ color: colors.text }}>
              <p>&copy; 2024 Mortgage Rate Comparison. All rights reserved.</p>
              <p className="mt-2">Rates are subject to change and may vary based on individual circumstances.</p>
            </div>
          </div>
          </footer>
        )}
      </div>
  );
});

export default MortgageRateComparison;
