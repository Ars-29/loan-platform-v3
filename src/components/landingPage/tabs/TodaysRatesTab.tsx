'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { typography } from '@/theme/theme';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { useAuth } from '@/hooks/use-auth';
import { icons } from '@/components/ui/Icon';
import LeadCaptureModal, { LeadData } from '@/components/landingPage/LeadCaptureModal';
import { useNotification } from '@/components/ui/Notification';
import MortgageSearchForm from '@/components/landingPage/MortgageSearchForm';
import RateResults from '@/components/landingPage/RateResults';

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


interface ApiProduct {
  productId?: string;
  productName?: string;
  rate?: number;
  apr?: number;
  principalAndInterest?: number;
  totalPayment?: number;
  closingCost?: number;
  discount?: number;
  points?: number;
  lockPeriod?: number;
  priceStatus?: string;
  lastUpdate?: string;
}

interface TodaysRatesTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
  // NEW: Public mode props
  isPublic?: boolean;
  publicTemplateData?: any;
  // User context props
  userId?: string;
  companyId?: string;
}

// Default search parameters for today's rates
const defaultSearchParams = {
  // Borrower Information
  firstName: 'Market',
  lastName: 'Rates',
  vaFirstTimeUse: true,
  firstTimeHomeBuyer: false,
  monthsReserves: 6,
  selfEmployed: false,
  waiveEscrows: false,
  
  // Property Information
  county: 'Collin',
  state: 'TX',
  zipCode: '75024',
  numberOfStories: 1,
  numberOfUnits: '1',
  
  // Loan Information
  salesPrice: 400000,
  downPayment: 80000,
  downPaymentPercent: 20,
  baseLoanAmount: 320000,
  loanLevelDebtToIncomeRatio: 28,
  totalMonthlyQualifyingIncome: 11428,
  
  // Loan Details
  loanPurpose: 'Purchase',
  occupancy: 'PrimaryResidence',
  propertyType: 'SingleFamily',
  loanType: 'Conforming',
  creditScore: '740-759',
  loanTerm: 'ThirtyYear',
  
  // ARM Loan Configuration - Explicitly enforce ARM loans
  amortizationTypes: ["Fixed", "ARM"],
  armFixedTerms: ["ThreeYear", "FiveYear", "SevenYear", "TenYear"],
  loanTerms: ["ThirtyYear", "TwentyYear", "TwentyFiveYear", "FifteenYear", "TenYear"]
};

export default function TodaysRatesTab({
  selectedTemplate,
  className = '',
  // NEW: Public mode props
  isPublic = false,
  publicTemplateData,
  // User context props
  userId,
  companyId
}: TodaysRatesTabProps) {
  const { user } = useAuth();
  const { getTemplateSync } = useEfficientTemplates();
  const { showNotification } = useNotification();
  
  // Template data fetching - support both public and auth modes
  const templateData = isPublic && publicTemplateData 
    ? publicTemplateData 
    : getTemplateSync(selectedTemplate);

  
  // Comprehensive template data usage
  const colors = templateData?.template?.colors || {
    primary: '#ec4899',
    secondary: '#01bcc6',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };
  
  const typography = templateData?.template?.typography || {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  };
  
  const content = templateData?.template?.content || {
    headline: "Today's Mortgage Rates",
    subheadline: 'Current rates as of today',
    ctaText: 'Get Quote',
    ctaSecondary: 'Learn More'
  };
  
  const layout = templateData?.template?.layout || {
    alignment: 'center',
    spacing: 18,
    borderRadius: 8,
    padding: { small: 8, medium: 16, large: 24, xlarge: 32 }
  };
  
  const defaultClasses = {
    button: {
      primary: selectedTemplate === 'template2' 
        ? 'px-6 py-3 font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white'
        : 'px-6 py-3 font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white',
      secondary: `px-6 py-3 font-medium transition-all duration-200 border`,
      outline: selectedTemplate === 'template2'
        ? 'border-2 px-6 py-3 font-medium transition-all duration-200'
        : 'border-2 px-6 py-3 font-medium transition-all duration-200',
      ghost: selectedTemplate === 'template2'
        ? 'px-4 py-2 font-medium transition-all duration-200'
        : 'px-4 py-2 font-medium transition-all duration-200'
    },
    card: {
      container: `border shadow-sm hover:shadow-md transition-all duration-200`,
      header: 'px-6 py-4 border-b',
      body: 'px-6 py-4',
      footer: 'px-6 py-4 border-t'
    },
    heading: {
      h1: 'text-3xl font-bold mb-4',
      h2: 'text-2xl font-bold mb-3',
      h3: 'text-xl font-semibold mb-2',
      h4: 'text-lg font-semibold mb-2',
      h5: 'text-base font-semibold mb-2',
      h6: 'text-sm font-semibold mb-1'
    },
    body: {
      large: 'text-lg leading-relaxed',
      base: 'text-base leading-relaxed',
      small: 'text-sm leading-relaxed',
      xs: 'text-xs leading-normal'
    },
    icon: {
      primary: 'w-12 h-12 flex items-center justify-center mb-4',
      secondary: 'w-10 h-10 flex items-center justify-center mb-3',
      small: 'w-8 h-8 flex items-center justify-center'
    },
    select: {
      base: 'px-3 py-2 border text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6]',
      error: 'px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500'
    },
    status: {
      success: 'text-green-600 bg-green-50 px-2 py-1 rounded text-sm',
      warning: 'text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-sm',
      error: 'text-red-600 bg-red-50 px-2 py-1 rounded text-sm',
      info: 'text-[#01bcc6] bg-[#01bcc6]/10 px-2 py-1 rounded text-sm'
    }
  };
  
  // More defensive approach for template classes
  const templateClasses = templateData?.template?.classes;
  const safeTemplateClasses = templateClasses && typeof templateClasses === 'object' ? templateClasses : {};
  
  const classes = {
    ...defaultClasses,
    ...safeTemplateClasses,
    button: { 
      ...defaultClasses.button, 
      ...(safeTemplateClasses?.button || {}) 
    },
    card: { 
      ...defaultClasses.card, 
      ...(safeTemplateClasses?.card || {}) 
    },
    heading: { 
      ...defaultClasses.heading, 
      ...(safeTemplateClasses?.heading || {}) 
    },
    body: { 
      ...defaultClasses.body, 
      ...(safeTemplateClasses?.body || {}) 
    },
    icon: { 
      ...defaultClasses.icon, 
      ...(safeTemplateClasses?.icon || {}) 
    },
    select: { 
      ...defaultClasses.select, 
      ...(safeTemplateClasses?.select || {}) 
    },
    status: { 
      ...defaultClasses.status, 
      ...(safeTemplateClasses?.status || {}) 
    }
  };
  
  const [rates, setRates] = useState<Rate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  // New state for enhanced features
  const [loanType, setLoanType] = useState<'purchase' | 'refinance'>('purchase');
  const [zipCode, setZipCode] = useState('75024');
  const [creditScore, setCreditScore] = useState('740-759');
  const [homeValue, setHomeValue] = useState('400000');
  const [subscribeToRates, setSubscribeToRates] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'featured' | '30yr-fixed' | '20yr-fixed' | '15yr-fixed' | 'arm'>('featured');
  
  // Lead capture modal state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);
  
  // Search form state
  const [searchParams, setSearchParams] = useState(defaultSearchParams);

  const loanTypes = ['all', '30-Year Fixed', '15-Year Fixed', '5/1 ARM', '7/1 ARM', '10/1 ARM', 'FHA Loan', 'VA Loan'];

  // Handle search form updates
  const handleSearchFormUpdate = useCallback(async (formData: any) => {
    console.log('🔄 TodaysRatesTab: handleSearchFormUpdate called with formData:', formData);
    
    const newSearchParams = {
      ...defaultSearchParams,
      zipCode: formData.zipCode,
      salesPrice: parseInt(formData.salesPrice) || 400000,
      downPayment: parseInt(formData.downPayment) || 80000,
      downPaymentPercent: parseFloat(formData.downPaymentPercent) || 20,
      creditScore: formData.creditScore,
      propertyType: formData.propertyType,
      occupancy: formData.occupancy,
      loanType: formData.loanType,
      loanTerm: 'ThirtyYear', // Default to 30 year fixed
      loanPurpose: formData.loanPurpose,
      baseLoanAmount: parseInt(formData.salesPrice) - parseInt(formData.downPayment) || 320000,
      firstName: formData.firstName || 'Market',
      lastName: formData.lastName || 'Rates',
      selfEmployed: formData.selfEmployed || false,
      vaFirstTimeUse: formData.vaFirstTimeUse || true,
      firstTimeHomeBuyer: formData.firstTimeHomeBuyer || false,
      monthsReserves: formData.monthsReserves || 6,
      waiveEscrows: formData.waiveEscrows || false,
      county: formData.county || 'Collin',
      state: formData.state || 'TX',
      numberOfStories: formData.numberOfStories || 1,
      numberOfUnits: formData.numberOfUnits || '1',
      loanLevelDebtToIncomeRatio: formData.loanLevelDebtToIncomeRatio || 28,
      totalMonthlyQualifyingIncome: formData.totalMonthlyQualifyingIncome || 11428,
      // Use form data for loan configuration (form already has ARM loans enforced)
      amortizationTypes: formData.amortizationTypes || ["Fixed", "ARM"],
      armFixedTerms: formData.armFixedTerms || ["ThreeYear", "FiveYear", "SevenYear", "TenYear"],
      loanTerms: formData.loanTerms || ["ThirtyYear", "TwentyYear", "TwentyFiveYear", "FifteenYear", "TenYear"]
    };
    
    console.log('🔄 TodaysRatesTab: Setting new search params:', newSearchParams);
    setSearchParams(newSearchParams);
    
    // Force a fresh API call immediately when form is submitted with new parameters
    console.log('🔄 TodaysRatesTab: Making fresh API call with new parameters');
    await fetchTodaysRates(true, newSearchParams);
  }, []);

  // Transform rates to RateResults format
  const transformRatesToRateResults = (rates: Rate[]) => {
    return rates.map(rate => ({
      id: rate.id,
      lenderName: 'Today\'s Rates',
      loanProgram: rate.loanType,
      loanType: rate.loanType,
      loanTerm: getLoanTermFromLoanType(rate.loanType), // Extract term from loan type
      interestRate: rate.rate,
      apr: rate.apr,
      monthlyPayment: rate.monthlyPayment,
      fees: 0, // Default fees
      points: rate.points,
      credits: 0, // Default credits
      lockPeriod: 30 // Default lock period
    }));
  };

  // Extract loan term number from loan type string
  const getLoanTermFromLoanType = (loanType: string): number => {
    if (loanType.includes('30')) return 30;
    if (loanType.includes('25')) return 25;
    if (loanType.includes('20')) return 20;
    if (loanType.includes('15')) return 15;
    if (loanType.includes('10')) return 10;
    if (loanType.includes('7')) return 7;
    if (loanType.includes('5')) return 5;
    return 30; // Default to 30 years
  };

  // Transform API data to our Rate format
  const transformApiData = (apiProducts: any[]): Rate[] => {
    console.log('=== TRANSFORMING API DATA ===');
    console.log('Raw API products:', apiProducts);
    
    const transformedRates = apiProducts
      .filter(product => product.rate && product.apr && product.principalAndInterest)
      .map((product, index) => ({
        id: `${product.productId || product.productCode || 'rate'}-${index}-${product.rate}-${product.apr}`,
        loanType: getLoanTypeFromProduct(product.productName || ''),
        rate: product.rate,
        apr: product.apr,
        points: product.discount || 0, // Using discount as points
        monthlyPayment: Math.round(product.principalAndInterest),
        lastUpdated: product.lastUpdate || new Date().toISOString()
      }));
    
    console.log('Transformed rates:', transformedRates);
    
    // Filter to only show today's rates
    const todaysRates = transformedRates.filter(rate => {
      const isTodayRate = isToday(rate.lastUpdated);
      if (!isTodayRate) {
        console.log(`Filtering out rate from ${rate.lastUpdated} (not today)`);
      }
      return isTodayRate;
    });
    
    console.log(`Filtered to ${todaysRates.length} rates from today out of ${transformedRates.length} total rates`);
    return todaysRates;
  };

  // Check if a date is today
  const isToday = (dateString: string): boolean => {
    if (!dateString) return false;
    
    try {
      const date = new Date(dateString);
      const today = new Date();
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.log(`Invalid date format: ${dateString}`);
        return false;
      }
      
      // Compare dates (ignore time)
      const isTodayDate = date.toDateString() === today.toDateString();
      
      if (!isTodayDate) {
        console.log(`Date ${dateString} (${date.toDateString()}) is not today (${today.toDateString()})`);
      }
      
      return isTodayDate;
    } catch (error) {
      console.log(`Error parsing date ${dateString}:`, error);
      return false;
    }
  };

  // Get loan type from product name
  const getLoanTypeFromProduct = (productName: string): string => {
    const name = productName.toLowerCase();
    if (name.includes('30') || name.includes('thirty')) return '30-Year Fixed';
    if (name.includes('25') || name.includes('twentyfive')) return '25-Year Fixed';
    if (name.includes('20') || name.includes('twenty')) return '20-Year Fixed';
    if (name.includes('15') || name.includes('fifteen')) return '15-Year Fixed';
    if (name.includes('10') || name.includes('ten')) return '10-Year Fixed';
    if (name.includes('5/1') || name.includes('5-1') || name.includes('fiveyearonearm')) return '5/1 ARM';
    if (name.includes('7/1') || name.includes('7-1') || name.includes('sevenyearonearm')) return '7/1 ARM';
    if (name.includes('10/1') || name.includes('10-1') || name.includes('tenyearonearm')) return '10/1 ARM';
    if (name.includes('fha')) return 'FHA Loan';
    if (name.includes('va')) return 'VA Loan';
    if (name.includes('conventional')) return '30-Year Fixed'; // Default for conventional
    return '30-Year Fixed'; // Default
  };

  // Cache management functions
  const CACHE_KEY = 'todays_rates_cache';
  const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
  
  const getCachedData = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      const isExpired = (now - timestamp) > CACHE_DURATION;
      
      console.log('Cache check:', {
        cached: !!cached,
        timestamp: new Date(timestamp).toLocaleString(),
        age: Math.round((now - timestamp) / (1000 * 60 * 60)), // hours
        expired: isExpired
      });
      
      return isExpired ? null : data;
    } catch (error) {
      console.log('Error reading cache:', error);
      return null;
    }
  };
  
  const setCachedData = (data: any) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('Data cached successfully');
    } catch (error) {
      console.log('Error caching data:', error);
    }
  };

  // Fetch rates from API
  const fetchTodaysRates = async (forceRefresh = false, customSearchParams: any = null) => {
    const paramsToUse = customSearchParams || searchParams;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = getCachedData();
      if (cachedData) {
        console.log('✅ Using cached data for today\'s rates');
        setRates(cachedData.rates || []);
        setLastUpdated(cachedData.lastUpdated || 'Cached');
        setIsLoading(false);
        return;
      }
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('=== FETCHING TODAY\'S RATES FROM API ===');
      console.log('Force refresh:', forceRefresh);
      console.log('Search params:', paramsToUse);
      
      const response = await fetch('/api/ob/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paramsToUse),
      });

      const result = await response.json();
      console.log('TodaysRatesTab API Response:', result);
      console.log('Is mock data:', result.isMockData);
      console.log('Data source:', result.source);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch rates');
      }

      // Access the products from the correct path in the response
      const products = result.data?.products || result.products || [];
      console.log('Products from API:', products);
      
      const transformedRates = transformApiData(products);
      console.log('Final rates to display:', transformedRates);
      
      // Show warning if using mock data
      if (result.isMockData) {
        console.warn('⚠️ TodaysRatesTab: Using mock data due to API authentication failure');
        console.warn('⚠️ Data source:', result.source);
      } else {
        console.log('✅ TodaysRatesTab: Using real API data from:', result.source);
      }
      
      // Check if we have any rates for today
      if (transformedRates.length === 0) {
        console.log('⚠️ No rates available for today. This could mean:');
        console.log('  1. API returned no data for today');
        console.log('  2. All rates have dates that are not today');
        console.log('  3. Date format from API is not recognized');
        console.log('  4. API is returning mock data with old timestamps');
      } else {
        console.log(`✅ Found ${transformedRates.length} rates for today`);
      }
      
      // Cache the data for future use
      const cacheData = {
        rates: transformedRates,
        lastUpdated: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        dataSource: result.source,
        isMockData: result.isMockData,
        timestamp: new Date().toISOString()
      };
      setCachedData(cacheData);
      
      setRates(transformedRates);
      setLastUpdated(cacheData.lastUpdated);
    } catch (err) {
      console.error('Error fetching rates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rates');
      
      // Fallback to sample data if API fails
      console.log('Using fallback sample data...');
      const fallbackRates: Rate[] = [
        {
          id: 'fallback-1',
          loanType: '30-Year Fixed',
          rate: 6.875,
          apr: 6.925,
          points: 0,
          monthlyPayment: 2627,
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'fallback-2',
          loanType: '15-Year Fixed',
          rate: 6.375,
          apr: 6.425,
          points: 0,
          monthlyPayment: 3456,
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'fallback-3',
          loanType: '5/1 ARM',
          rate: 6.125,
          apr: 6.175,
          points: 0,
          monthlyPayment: 2434,
          lastUpdated: new Date().toISOString()
        }
      ];
      setRates(fallbackRates);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch rates on component mount and when search params change
  useEffect(() => {
    console.log('🔄 TodaysRatesTab: useEffect triggered, searchParams changed:', searchParams);
    fetchTodaysRates();
  }, [searchParams]);

  // No need for filteredRates since RateResults handles its own filtering

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRate = (rate: number) => {
    return `${rate.toFixed(3)}%`;
  };

  // Lead capture handlers
  const handleGetStarted = useCallback((rate: Rate) => {
    console.log('🚀 TodaysRatesTab - handleGetStarted called with rate:', rate);
    setSelectedRate(rate);
    setIsLeadModalOpen(true);
  }, []);

  const handleCloseLeadModal = useCallback(() => {
    setIsLeadModalOpen(false);
    setSelectedRate(null);
  }, []);

  const handleLeadSubmit = useCallback(async (leadData: LeadData) => {
    try {
      console.log('🚀 Submitting lead data from Today\'s Rates:', leadData);
      
      // Get userId and companyId from props (passed from parent components)
      let leadUserId: string | undefined;
      let leadCompanyId: string | undefined;
      
      if (isPublic && publicTemplateData?.profileData) {
        // For public profiles, get from profile data
        leadUserId = publicTemplateData.profileData.user.id;
        leadCompanyId = publicTemplateData.profileData.company.id;
        console.log('🔗 Public profile - using userId:', leadUserId, 'companyId:', leadCompanyId);
      } else if (userId && companyId) {
        // For internal profiles, use props passed from parent
        leadUserId = userId;
        leadCompanyId = companyId;
        console.log('🔗 Internal profile - using userId:', leadUserId, 'companyId:', leadCompanyId);
      } else {
        console.log('⚠️ Missing user context for lead submission');
        throw new Error('Missing user or company information');
      }
      
      if (!leadUserId || !leadCompanyId) {
        throw new Error('Missing user or company information');
      }
      
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...leadData,
          source: "Today's Rate Table", // Set source as "Today's Rate Table"
          userId: leadUserId,
          companyId: leadCompanyId
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit lead');
      }

      console.log('✅ Lead submitted successfully:', result);
      
      // Show success notification
      showNotification({
        type: 'success',
        title: 'Lead Submitted Successfully!',
        message: 'Thank you for your interest. We\'ll contact you soon about your loan application.',
        duration: 5000
      });
      
      // Close modal on success
      handleCloseLeadModal();
      
    } catch (error) {
      console.error('❌ Error submitting lead:', error);
      throw error; // Re-throw to let LeadCaptureModal handle the error display
    }
  }, [isPublic, publicTemplateData, userId, companyId, handleCloseLeadModal]);

  return (
    <div 
      className={`w-full space-y-6 ${className}`}
      style={{ 
        fontFamily: typography.fontFamily,
        padding: `${layout.padding.medium}px 0`
      }}
    >
      {/* Mortgage Search Form */}
      <div 
        className="bg-white border shadow-sm p-6"
        style={{ 
          borderColor: colors.border,
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


      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
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
      />

      {/* Lead Capture Modal */}
      {selectedRate && (
        <LeadCaptureModal
          isOpen={isLeadModalOpen}
          onClose={handleCloseLeadModal}
          loanProduct={{
            id: selectedRate.id,
            lenderName: 'Today\'s Rates',
            loanProgram: selectedRate.loanType,
            loanType: selectedRate.loanType,
            loanTerm: 30, // Default term
            interestRate: selectedRate.rate,
            apr: selectedRate.apr,
            monthlyPayment: selectedRate.monthlyPayment,
            fees: 0, // Default fees
            points: selectedRate.points,
            credits: 0, // Default credits
            lockPeriod: 30 // Default lock period
          }}
          onSubmit={handleLeadSubmit}
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
        />
      )}
    </div>
  );
}