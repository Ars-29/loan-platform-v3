'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MortgageSearchForm from '@/components/landingPage/MortgageSearchForm';
import RateResults from '@/components/landingPage/RateResults';
import { Button } from '@/components/ui/Button';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { icons } from '@/components/ui/Icon';

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

interface MortgageRateComparisonProps {
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
  template?: 'template1' | 'template2';
  // Public mode props
  isPublic?: boolean;
  publicTemplateData?: any;
  // User context props for lead submission
  userId?: string;
  companyId?: string;
}

const MortgageRateComparison = React.memo(function MortgageRateComparison({ 
  showHeader = true, 
  showFooter = true, 
  className = "",
  template = 'template1',
  isPublic = false,
  publicTemplateData,
  // User context props
  userId,
  companyId
}: MortgageRateComparisonProps) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<RateProduct[]>([]);
  const [rawData, setRawData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [dataSource, setDataSource] = useState<string>('unknown');
  const [showLanding, setShowLanding] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState('landing');
  const [stepHistory, setStepHistory] = useState<string[]>(['landing']);

  // Questionnaire navigation functions
  const handleQuestionnaireStepChange = (step: string, answer?: any) => {
    if (answer) {
      const newAnswers = { ...questionnaireAnswers, [currentStep]: answer };
      setQuestionnaireAnswers(newAnswers);
      console.log('=== QUESTIONNAIRE STEP CHANGE ===');
      console.log('Current step:', currentStep);
      console.log('Answer:', answer);
      console.log('All answers so far:', newAnswers);
      console.log('Next step:', step);
      console.log('=================================');
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
    
    console.log('=== QUESTIONNAIRE COMPLETION ===');
    console.log('Current step:', currentStep);
    console.log('Final answer:', finalAnswer);
    console.log('All answers:', allAnswers);
    console.log('================================');
    
    // Auto-trigger search with questionnaire answers
    await autoSearchFromQuestionnaire(allAnswers);
    
    // Hide questionnaire and show results
    setShowQuestionnaire(false);
    setShowLanding(false);
  };

  // Handle URL parameters from loan finder
  useEffect(() => {
    const loanType = searchParams.get('loanType');
    const dpa = searchParams.get('dpa');
    const construction = searchParams.get('construction');
    const bridge = searchParams.get('bridge');
    const cashOut = searchParams.get('cashOut');
    const refinance = searchParams.get('refinance');
    const irrrl = searchParams.get('irrrl');
    const streamline = searchParams.get('streamline');

    if (loanType) {
      console.log('Loan finder recommendation:', {
        loanType,
        dpa,
        construction,
        bridge,
        cashOut,
        refinance,
        irrrl,
        streamline
      });
      setShowLanding(false); // Show search form when coming from loan finder
    }
  }, [searchParams]);

  // Auto-search based on questionnaire answers
  const autoSearchFromQuestionnaire = async (answers: Record<string, any>) => {
    console.log('=== AUTO SEARCH FROM QUESTIONNAIRE ===');
    console.log('Questionnaire answers:', answers);
    
    // Extract loan type from answers
    let loanType = 'Conventional';
    let creditScore = '800+';
    let loanPurpose = 'Purchase';
    let vaFirstTimeUse = false;
    
    // Process questionnaire answers
    Object.values(answers).forEach((answer: any) => {
      if (answer && typeof answer === 'object') {
        if (answer.loanType) loanType = answer.loanType;
        if (answer.creditScore) creditScore = answer.creditScore;
        if (answer.loanPurpose) loanPurpose = answer.loanPurpose;
        if (answer.vaFirstTimeUse !== undefined) vaFirstTimeUse = answer.vaFirstTimeUse;
      }
    });
    
    // Map credit score to numeric value
    let representativeFICO = 850;
    if (creditScore === 'Below 580') representativeFICO = 580;
    else if (creditScore === '580-619') representativeFICO = 600;
    else if (creditScore === '620-639') representativeFICO = 630;
    else if (creditScore === '640-659') representativeFICO = 650;
    else if (creditScore === '660-679') representativeFICO = 670;
    else if (creditScore === '680-699') representativeFICO = 690;
    else if (creditScore === '700-719') representativeFICO = 710;
    else if (creditScore === '720-739') representativeFICO = 730;
    else if (creditScore === '740-759') representativeFICO = 750;
    else if (creditScore === '760-779') representativeFICO = 770;
    else if (creditScore === '780-799') representativeFICO = 790;
    else if (creditScore === '800+') representativeFICO = 800;
    else if (creditScore === '640+') representativeFICO = 750; // Legacy fallback
    
    // Map questionnaire answers to form data with defaults
    const formData: SearchFormData = {
      zipCode: '75024',
      salesPrice: '225000',
      downPayment: '75000',
      downPaymentPercent: '33.33',
      creditScore: creditScore,
      propertyType: 'SingleFamily',
      occupancy: 'PrimaryResidence',
      loanType: loanType,
      eligibleForLowerRate: false,
      loanPurpose: loanPurpose,
      // Additional fields matching your exact request
      firstName: 'test',
      lastName: 'test1',
      vaFirstTimeUse: vaFirstTimeUse,
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
    };

    console.log('Auto-generated form data:', formData);
    console.log('Extracted values:', { loanType, creditScore, loanPurpose, vaFirstTimeUse, representativeFICO });
    console.log('==========================================');

    // Trigger the search
    await handleSearch(formData);
  };

  const handleSearch = async (formData: SearchFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Transform form data to API format - matching your exact request structure
      const apiData = {
        // Borrower Information
        firstName: formData.firstName,
        lastName: formData.lastName,
        vaFirstTimeUse: formData.vaFirstTimeUse,
        firstTimeHomeBuyer: formData.firstTimeHomeBuyer,
        monthsReserves: formData.monthsReserves,
        selfEmployed: formData.selfEmployed,
        waiveEscrows: formData.waiveEscrows,
        
        // Property Information
        zipCode: formData.zipCode,
        salesPrice: parseFloat(formData.salesPrice),
        downPayment: parseFloat(formData.downPayment),
        propertyType: formData.propertyType,
        occupancy: formData.occupancy,
        county: formData.county,
        state: formData.state,
        numberOfStories: formData.numberOfStories,
        numberOfUnits: formData.numberOfUnits,
        
        // Loan Information
        loanType: formData.loanType,
        loanPurpose: formData.loanPurpose,
        lienType: formData.lienType,
        borrowerPaidMI: formData.borrowerPaidMI,
        baseLoanAmount: formData.baseLoanAmount,
        loanLevelDebtToIncomeRatio: formData.loanLevelDebtToIncomeRatio,
        totalMonthlyQualifyingIncome: formData.totalMonthlyQualifyingIncome,
        representativeFICO: (() => {
          if (formData.creditScore === 'Below 580') return 580;
          if (formData.creditScore === '580-619') return 600;
          if (formData.creditScore === '620-639') return 630;
          if (formData.creditScore === '640-659') return 650;
          if (formData.creditScore === '660-679') return 670;
          if (formData.creditScore === '680-699') return 690;
          if (formData.creditScore === '700-719') return 710;
          if (formData.creditScore === '720-739') return 730;
          if (formData.creditScore === '740-759') return 750;
          if (formData.creditScore === '760-779') return 770;
          if (formData.creditScore === '780-799') return 790;
          if (formData.creditScore === '800+') return 800;
          if (formData.creditScore === '640+') return 750; // Legacy fallback
          return 750; // default fallback
        })(),
        loanTerms: [formData.loanTerm || "ThirtyYear"],
        amortizationTypes: ["Fixed"],
        armFixedTerms: ["FiveYear"]
      };

      console.log('=== API REQUEST DEBUG ===');
      console.log('Form data received:', formData);
      console.log('API request payload:', apiData);
      console.log('========================');

      const response = await fetch('/api/ob/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      console.log('=== API RESPONSE DEBUG ===');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Raw API response:', result);
      console.log('Is mock data:', result.isMockData);
      console.log('Data source:', result.source);
      console.log('========================');

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch rates');
      }

      // Transform API response to our component format
      if (result.success && result.data) {
        // Extract products from the API response
        const products = result.data.products || result.data.data?.products || [];
        
        // Store raw data for table display
        setRawData(products);
        
        console.log('=== DATA TRANSFORMATION DEBUG ===');
        console.log('Full API response:', result.data);
        console.log('Products array:', products);
        console.log('Products array length:', products.length);
        console.log('First product:', products[0]);
        console.log('================================');
        
        if (Array.isArray(products) && products.length > 0) {
          const transformedProducts: RateProduct[] = products.map((item: Record<string, unknown>, index: number) => ({
          id: (item.productId as string) || `product-${index}`,
          lenderName: (item.investor as string) || 'Optimal Blue Lender',
          loanProgram: (item.productName as string) || 'Conventional',
          loanType: (item.loanType as string) || 'Fixed',
          loanTerm: (item.loanTerm as string) === 'ThirtyYear' ? 30 : (item.loanTerm as string) === 'TwentyFiveYear' ? 25 : 15,
          interestRate: (item.rate as number) || 6.0,
          apr: (item.apr as number) || 6.1,
          monthlyPayment: (item.principalAndInterest as number) || 2000,
          fees: (item.closingCost as number) || 5000,
          points: (item.discount as number) || 0,
          credits: (item.rebate as number) || 0,
          lockPeriod: (item.lockPeriod as number) || 30
        }));
        
        console.log('=== TRANSFORMED PRODUCTS DEBUG ===');
        console.log('Transformed products count:', transformedProducts.length);
        console.log('First transformed product:', transformedProducts[0]);
        console.log('==================================');
        
        // Show warning if using mock data
        if (result.isMockData) {
          console.warn('⚠️ WARNING: Using mock data due to API authentication failure');
          console.warn('⚠️ Data source:', result.source);
        } else {
          console.log('✅ Using real API data from:', result.source);
        }
        
        // Set mock data flags
        setIsMockData(result.isMockData || false);
        setDataSource(result.source || 'unknown');
        
        setProducts(transformedProducts);
        } else {
          console.log('No products found in API response, using mock data');
          // If no real data, create mock data for demonstration
          const mockProducts: RateProduct[] = [
          {
            id: '1',
            lenderName: 'Optimal Blue Lender',
            loanProgram: 'Conventional',
            loanType: 'Fixed',
            loanTerm: 30,
            interestRate: 6.000,
            apr: 6.147,
            monthlyPayment: 2158,
            fees: 7098,
            points: 1.555,
            credits: 0,
            lockPeriod: 30
          },
          {
            id: '2',
            lenderName: 'Optimal Blue Lender',
            loanProgram: 'Conventional',
            loanType: 'Fixed',
            loanTerm: 30,
            interestRate: 6.125,
            apr: 6.185,
            monthlyPayment: 2187,
            fees: 3793,
            points: 0,
            credits: 0.475,
            lockPeriod: 30
          },
          {
            id: '3',
            lenderName: 'Optimal Blue Lender',
            loanProgram: 'Conventional',
            loanType: 'Fixed',
            loanTerm: 30,
            interestRate: 6.250,
            apr: 6.310,
            monthlyPayment: 2216,
            fees: 1500,
            points: 0,
            credits: 1.000,
            lockPeriod: 30
          },
          {
            id: '4',
            lenderName: 'Optimal Blue Lender',
            loanProgram: 'Conventional',
            loanType: 'Fixed',
            loanTerm: 20,
            interestRate: 5.875,
            apr: 6.022,
            monthlyPayment: 2520,
            fees: 7098,
            points: 1.555,
            credits: 0,
            lockPeriod: 30
          },
          {
            id: '5',
            lenderName: 'Optimal Blue Lender',
            loanProgram: 'Conventional',
            loanType: 'Fixed',
            loanTerm: 15,
            interestRate: 5.750,
            apr: 5.897,
            monthlyPayment: 3300,
            fees: 7098,
            points: 1.555,
            credits: 0,
            lockPeriod: 30
          }
        ];
        setProducts(mockProducts);
        }
      } else {
        console.log('API response not successful, using mock data');
        // If API call failed, create mock data for demonstration
        const mockProducts: RateProduct[] = [
          {
            id: '1',
            lenderName: 'Optimal Blue Lender',
            loanProgram: 'Conventional',
            loanType: 'Fixed',
            loanTerm: 30,
            interestRate: 6.000,
            apr: 6.147,
            monthlyPayment: 2158,
            fees: 7098,
            points: 1.555,
            credits: 0,
            lockPeriod: 30
          }
        ];
        setProducts(mockProducts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get template-specific styles and content
  const { getTemplateSync } = useEfficientTemplates();
  const templateData = isPublic && publicTemplateData ? publicTemplateData : getTemplateSync(template);
  const colors = templateData?.template?.colors || {
    primary: '#ec4899',
    secondary: '#3b82f6',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };
  const unifiedStyles = {
    button: {
      primary: templateData?.template?.classes?.button?.primary || 'px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white',
      secondary: templateData?.template?.classes?.button?.secondary || 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-gray-300'
    }
  };
  
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
        className: `${unifiedStyles.button.primary} h-16 text-base px-8 py-4 text-lg font-semibold`,
        style: { backgroundColor: colors.primary }
      };
    } else {
      return {
        variant: 'secondary' as const,
        className: `${unifiedStyles.button.secondary} h-16 text-base px-8 py-4 text-lg font-semibold`,
        style: { 
          backgroundColor: colors.background,
          borderColor: colors.primary,
          color: colors.primary
        }
      };
    }
  };

  // Render questionnaire step
  const renderQuestionnaireStep = () => {
    switch (currentStep) {
      case 'landing':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-black mb-2 text-center">Select Your Loan Purpose</h3>
            <p className="mb-6 text-center" style={{ color: colors.text }}>Choose the option that best describes your situation</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => handleQuestionnaireStepChange('purchase-credit-score', { loanPurpose: 'Purchase' })}
                {...getTemplateButtonStyles('secondary')}
              >
                {React.createElement(icons.homePurchase, { size: 20 })}
                Home Purchase
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('refinance-veteran', { loanPurpose: 'Refinance' })}
                {...getTemplateButtonStyles('secondary')}
              >
                {React.createElement(icons.homeRefinance, { size: 20 })}
                Home Refinance
              </Button>
            </div>
          </div>
        );

      case 'purchase-credit-score':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-black mb-2 text-center">What's Your Credit Score?</h3>
            <p className="mb-6 text-center" style={{ color: colors.text }}>Your credit score helps determine which loan options are available to you</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => handleQuestionnaireStepChange('fha-loan', { creditScore: 'Below 580', loanType: 'FHA' })}
                {...getTemplateButtonStyles('secondary')}
              >
                {React.createElement(icons.rates, { size: 20 })}
                Below 580
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('purchase-down-payment-low', { creditScore: '580-619' })}
                {...getTemplateButtonStyles('secondary')}
              >
                {React.createElement(icons.calculators, { size: 20 })}
                580-619
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('purchase-down-payment-mid', { creditScore: '620-639' })}
                {...getTemplateButtonStyles('secondary')}
              >
                {React.createElement(icons.trendingUp, { size: 20 })}
                620-639
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('purchase-military', { creditScore: '640+' })}
                {...getTemplateButtonStyles('secondary')}
              >
                {React.createElement(icons.star, { size: 20 })}
                640 or higher
              </Button>
            </div>
          </div>
        );

      case 'purchase-military':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-black mb-2 text-center">Are You a Veteran or Active Military?</h3>
            <p className="mb-6 text-center" style={{ color: colors.text }}>VA loans offer excellent benefits including no down payment requirements</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'VA', vaFirstTimeUse: true })}
                {...getTemplateButtonStyles('secondary')}
              >
                {React.createElement(icons.star, { size: 20 })}
                Yes
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('purchase-rural', { loanType: 'Conventional' })}
                {...getTemplateButtonStyles('secondary')}
              >
                {React.createElement(icons.cancel, { size: 20 })}
                No
              </Button>
            </div>
          </div>
        );

      case 'purchase-rural':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-black mb-2 text-center">Is the Property in a Rural Area?</h3>
            <p className="mb-6 text-center" style={{ color: colors.text }}>USDA loans are available for properties in eligible rural areas</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'USDA' })}
                variant="secondary"
                size="lg"
                className="h-16 text-base"
              >
                🌾 Yes
              </Button>
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'Conventional' })}
                {...getTemplateButtonStyles('secondary')}
              >
                {React.createElement(icons.cancel, { size: 20 })}
                No
              </Button>
            </div>
          </div>
        );

      case 'purchase-down-payment-low':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-black mb-2 text-center">How Much Can You Put Down?</h3>
            <p className="mb-6 text-center" style={{ color: colors.text }}>Your down payment amount affects your loan options and monthly payments</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'FHA' })}
                {...getTemplateButtonStyles('secondary')}
              >
                {React.createElement(icons.calculators, { size: 20 })}
                Less than 3.5%
              </Button>
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'Conventional', dpa: true })}
                {...getTemplateButtonStyles('secondary')}
              >
                {React.createElement(icons.calculators, { size: 20 })}
                3.5% or more
              </Button>
            </div>
          </div>
        );

      case 'purchase-down-payment-mid':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-black mb-2 text-center">How Much Can You Put Down?</h3>
            <p className="mb-6 text-center" style={{ color: colors.text }}>Your down payment amount affects your loan options and monthly payments</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'Conventional', dpa: true })}
                {...getTemplateButtonStyles('secondary')}
              >
                {React.createElement(icons.calculators, { size: 20 })}
                Less than 3%
              </Button>
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'FHA' })}
                {...getTemplateButtonStyles('secondary')}
              >
                {React.createElement(icons.calculators, { size: 20 })}
                3-5%
              </Button>
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'Conventional' })}
                {...getTemplateButtonStyles('secondary')}
              >
                {React.createElement(icons.calculators, { size: 20 })}
                5% or more
              </Button>
            </div>
          </div>
        );

      case 'refinance-veteran':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-black mb-2 text-center">Are You a Veteran?</h3>
            <p className="mb-6 text-center" style={{ color: colors.text }}>Veterans have access to special refinance programs with great benefits</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => handleQuestionnaireStepChange('refinance-veteran-purpose', { loanType: 'VA' })}
                {...getTemplateButtonStyles('secondary')}
              >
                {React.createElement(icons.star, { size: 20 })}
                Yes
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('refinance-non-veteran-purpose', { loanType: 'Conventional' })}
                {...getTemplateButtonStyles('secondary')}
              >
                {React.createElement(icons.cancel, { size: 20 })}
                No
              </Button>
            </div>
          </div>
        );

      case 'refinance-veteran-purpose':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-black mb-2 text-center">What's Your Refinance Goal?</h3>
            <p className="mb-6 text-center" style={{ color: colors.text }}>Choose your primary refinance objective</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'VA', cashOut: true })}
                {...getTemplateButtonStyles('secondary')}
              >
                {React.createElement(icons.calculators, { size: 20 })}
                Access Equity
              </Button>
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'VA', irrrl: true })}
                variant="secondary"
                size="lg"
                className="h-16 text-base"
              >
                {React.createElement(icons.rates, { size: 20 })}
                Lower Rate
              </Button>
            </div>
          </div>
        );

      case 'refinance-non-veteran-purpose':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-black mb-2 text-center">What's Your Refinance Goal?</h3>
            <p className="mb-6 text-center" style={{ color: colors.text }}>Choose your primary refinance objective</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'Conventional', cashOut: true })}
                {...getTemplateButtonStyles('secondary')}
              >
                {React.createElement(icons.calculators, { size: 20 })}
                Access Equity
              </Button>
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'Conventional', refinance: true })}
                variant="secondary"
                size="lg"
                className="h-16 text-base"
              >
                {React.createElement(icons.rates, { size: 20 })}
                Lower Rate
              </Button>
            </div>
          </div>
        );

      case 'fha-loan':
        return (
          <div className={`${template === 'template1' ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200' : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'} rounded-lg shadow-sm border-2 p-6 mb-6`}>
            <h3 className="text-xl font-semibold mb-2 text-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: colors.text }}>
              {React.createElement(icons.target, { size: 24 })}
              Recommended: FHA Loan
            </h3>
            <p className="mb-6 text-center" style={{ color: colors.primary }}>An FHA loan might be ideal for you, offering lower down payment requirements and more flexible credit guidelines.</p>
            <div className="flex justify-center">
              <Button 
                onClick={() => handleQuestionnaireComplete({ loanType: 'FHA' })}
                {...getTemplateButtonStyles('primary')}
                className="h-16 text-base px-8"
              >
                {React.createElement(icons.custom, { size: 20 })}
                {getTemplateContent().primaryButton}
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-semibold text-black mb-2 text-center">Select Your Loan Purpose</h3>
            <p className="mb-6 text-center" style={{ color: colors.text }}>Choose the option that best describes your situation</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => handleQuestionnaireStepChange('purchase-credit-score', { loanPurpose: 'Purchase' })}
                {...getTemplateButtonStyles('secondary')}
              >
                {React.createElement(icons.homePurchase, { size: 20 })}
                Home Purchase
              </Button>
              <Button 
                onClick={() => handleQuestionnaireStepChange('refinance-veteran', { loanPurpose: 'Refinance' })}
                {...getTemplateButtonStyles('secondary')}
              >
                {React.createElement(icons.homeRefinance, { size: 20 })}
                Home Refinance
              </Button>
            </div>
          </div>
        );
    }
  };

  // Show landing page by default
  if (showLanding) {
    return (
      <div className="min-h-screen " >
        {/* Header */}
        {showHeader && (
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-black">Mortgage Rate Comparison</h1>
                </div>
                <div className="text-sm" style={{ color: colors.text }}>Powered by Optimal Blue</div>
              </div>
            </div>
          </header>
        )}

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">
              {getTemplateContent().title}
              <span style={{ color: colors.primary }}> Mortgage</span>
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: colors.text }}>
              {getTemplateContent().description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => {
                  setShowLanding(false);
                  setShowQuestionnaire(true);
                }}
                className="text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg"
                style={{ 
                  backgroundColor: colors.primary,
                  color: colors.background,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                {getTemplateContent().primaryButton}
              </button>
              <button 
                onClick={() => setShowLanding(false)}
                className="bg-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors border-2"
                style={{ 
                  backgroundColor: colors.secondary,
                  color: colors.background,
                  borderColor: colors.secondary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
              >
                {getTemplateContent().secondaryButton}
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        {showFooter && (
          <footer className="bg-white border-t mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <h1 className="text-2xl font-bold text-black">Get My Custom Rate</h1>
                  <button 
                    onClick={() => {
                      setShowQuestionnaire(false);
                      setShowLanding(true);
                    }}
                    className="font-medium transition-colors duration-200"
                    style={{ 
                      color: colors.primary,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.secondary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.primary;
                    }}
                  >
                    ← Back to Home
                  </button>
                </div>
                <div className="text-sm" style={{ color: colors.text }}>Powered by Optimal Blue</div>
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto">
            {showLanding && (
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-black mb-2">{getTemplateContent().title}</h2>
                <p className="text-lg mb-4" style={{ color: colors.textSecondary }}>{getTemplateContent().subtitle}</p>
                <p className="mb-8 max-w-2xl mx-auto" style={{ color: colors.text }}>{getTemplateContent().description}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => setShowQuestionnaire(true)}
                    {...getTemplateButtonStyles('primary')}
                  >
                    {React.createElement(icons.custom, { size: 20 })}
                    {getTemplateContent().primaryButton}
                  </Button>
                  <Button
                    onClick={() => setShowLanding(false)}
                    {...getTemplateButtonStyles('secondary')}
                  >
                    {React.createElement(icons.rates, { size: 20 })}
                    {getTemplateContent().secondaryButton}
                  </Button>
                </div>
              </div>
            )}
            
            {!showLanding && !showQuestionnaire && (
              <h2 className="text-3xl font-bold text-black mb-8 text-center">Rate Comparison Results</h2>
            )}
            
            {/* Back Button */}
            {currentStep !== 'landing' && (
              <div className="mb-6">
                <Button 
                  onClick={handleQuestionnaireBack}
                  variant="ghost"
                  size="sm"
                  className="font-medium transition-colors duration-200"
                  style={{ 
                    color: colors.primary,
                  }}
                >
                  ← Back
                </Button>
              </div>
            )}
            
            {/* Questionnaire Content */}
            {renderQuestionnaireStep()}
            
            {/* Debug Info */}
            <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
              <h4 className="font-semibold mb-2 text-black">Debug Info:</h4>
              <p style={{ color: colors.text }}><strong>Current Step:</strong> {currentStep}</p>
              <p style={{ color: colors.text }}><strong>Answers:</strong> {JSON.stringify(questionnaireAnswers, null, 2)}</p>
              <p style={{ color: colors.text }}><strong>Step History:</strong> {stepHistory.join(' → ')}</p>
            </div>
          </div>
        </main>

        {/* Footer */}
        {showFooter && (
          <footer className="bg-white border-t mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      {showHeader && (
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <h1 className="text-2xl font-bold text-black">Mortgage Rate Comparison</h1>
                <button 
                  onClick={() => {
                    setShowQuestionnaire(true);
                    setShowLanding(false);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Find Your Ideal Loan
                </button>
              </div>
              <div className="text-sm" style={{ color: colors.text }}>
                Powered by Optimal Blue
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <MortgageSearchForm 
          onSearch={handleSearch} 
          loading={loading} 
          template={template}
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
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
          isMockData={isMockData}
          dataSource={dataSource}
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
          userId={userId}
          companyId={companyId}
        />
      </main>

      {/* Footer */}
      {showFooter && (
        <footer className="bg-white border-t mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
