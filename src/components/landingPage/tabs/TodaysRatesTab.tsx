'use client';

import React, { useState, useEffect } from 'react';
import { typography } from '@/theme/theme';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { useAuth } from '@/hooks/use-auth';
import { icons } from '@/components/ui/Icon';

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
  loanTerm: 'ThirtyYear'
};

export default function TodaysRatesTab({
  selectedTemplate,
  className = '',
  // NEW: Public mode props
  isPublic = false,
  publicTemplateData
}: TodaysRatesTabProps) {
  const { user } = useAuth();
  const { getTemplateSync } = useEfficientTemplates();
  
  // Template data fetching - support both public and auth modes
  const templateData = isPublic && publicTemplateData 
    ? publicTemplateData 
    : getTemplateSync(selectedTemplate);

  
  // Comprehensive template data usage
  const colors = templateData?.template?.colors || {
    primary: '#ec4899',
    secondary: '#3b82f6',
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
        ? 'px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white'
        : 'px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white',
      secondary: `px-6 py-3 rounded-lg font-medium transition-all duration-200 border`,
      outline: selectedTemplate === 'template2'
        ? 'border-2 px-6 py-3 rounded-lg font-medium transition-all duration-200'
        : 'border-2 px-6 py-3 rounded-lg font-medium transition-all duration-200',
      ghost: selectedTemplate === 'template2'
        ? 'px-4 py-2 rounded-lg font-medium transition-all duration-200'
        : 'px-4 py-2 rounded-lg font-medium transition-all duration-200'
    },
    card: {
      container: `rounded-lg border shadow-sm hover:shadow-md transition-all duration-200`,
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
      primary: 'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
      secondary: 'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
      small: 'w-8 h-8 rounded-lg flex items-center justify-center'
    },
    select: {
      base: 'px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      error: 'px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500'
    },
    status: {
      success: 'text-green-600 bg-green-50 px-2 py-1 rounded text-sm',
      warning: 'text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-sm',
      error: 'text-red-600 bg-red-50 px-2 py-1 rounded text-sm',
      info: 'text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm'
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
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rate' | 'payment'>('rate');
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

  const loanTypes = ['all', '30-Year Fixed', '15-Year Fixed', '5/1 ARM', '7/1 ARM', '10/1 ARM', 'FHA Loan', 'VA Loan'];

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
    if (name.includes('15') || name.includes('fifteen')) return '15-Year Fixed';
    if (name.includes('5/1') || name.includes('5-1')) return '5/1 ARM';
    if (name.includes('7/1') || name.includes('7-1')) return '7/1 ARM';
    if (name.includes('10/1') || name.includes('10-1')) return '10/1 ARM';
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
  const fetchTodaysRates = async (forceRefresh = false) => {
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
      console.log('Search params:', defaultSearchParams);
      
      const response = await fetch('/api/ob/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(defaultSearchParams),
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

  // Fetch rates on component mount
  useEffect(() => {
    fetchTodaysRates();
  }, []);

  const filteredRates = rates.filter(rate => 
    filter === 'all' || rate.loanType === filter
  ).sort((a, b) => {
    if (sortBy === 'rate') {
      return a.rate - b.rate;
    } else {
      return a.monthlyPayment - b.monthlyPayment;
    }
  });

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

  return (
    <div 
      className={`w-full space-y-6 ${className}`}
      style={{ 
        fontFamily: typography.fontFamily,
        padding: `${layout.padding.medium}px 0`
      }}
    >
      {/* Header */}
      <div 
        className="bg-white rounded-xl border shadow-sm p-6"
        style={{ 
          borderColor: colors.border,
          backgroundColor: colors.background,
          borderRadius: `${layout.borderRadius}px`
        }}
      >
        <div 
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6"
          style={{ gap: `${layout.spacing}px` }}
        >
          <div>
            <h2 
              className={`${classes.heading.h2}`}
              style={{ color: colors.text }}
            >
              {content.headline}
            </h2>
            <p 
              className={`${classes.body.base}`}
              style={{ color: colors.textSecondary }}
            >
              {content.subheadline} - {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
              {React.createElement(icons.calendar, { size: 16, className: "text-blue-600" })}
              <span className="text-sm font-medium text-blue-700">
                Showing only today's rates
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              {React.createElement(icons.refresh, { 
                size: 20, 
                color: colors.textSecondary 
              })}
              <span className="text-sm"
                    style={{ color: colors.textSecondary }}>
                {lastUpdated ? `Updated ${lastUpdated}` : 'Loading...'}
              </span>
            </div>
            
            {lastUpdated && lastUpdated !== 'Cached' && (
              <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-md">
                Live Data
              </span>
            )}
            {lastUpdated === 'Cached' && (
              <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md">
                Cached Data
              </span>
            )}
          </div>
        </div>

        {/* Filters and Controls */}
        <div 
          className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6"
          style={{ gap: `${layout.spacing}px` }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <label 
                className={`${classes.body.small} font-medium`}
                style={{ color: colors.text }}
              >
                Loan Type:
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={classes.select.base}
                style={{ 
                  borderColor: colors.border,
                  borderRadius: `${layout.borderRadius}px`
                }}
              >
                {loanTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label 
                className={`${classes.body.small} font-medium`}
                style={{ color: colors.text }}
              >
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rate' | 'payment')}
                className={classes.select.base}
                style={{ 
                  borderColor: colors.border,
                  borderRadius: `${layout.borderRadius}px`
                }}
              >
                <option value="rate">Interest Rate</option>
                <option value="payment">Monthly Payment</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => fetchTodaysRates(true)}
              disabled={isLoading}
              className={`${classes.button.primary} flex items-center gap-2 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{
                backgroundColor: isLoading ? `${colors.primary}50` : colors.primary,
                color: colors.background,
                borderColor: colors.primary
              }}
            >
              {React.createElement(icons.refresh, { size: 16, color: colors.background })}
              <span>{isLoading ? 'Updating...' : 'Force Refresh'}</span>
            </button>
          </div>
        </div>
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

      {/* Rates Table */}
      <div 
        className="bg-white rounded-xl border shadow-sm overflow-hidden"
        style={{ 
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderRadius: `${layout.borderRadius}px`
        }}
      >
        {isLoading ? (
          <div 
            className="p-8 text-center"
            style={{ padding: `${layout.padding.xlarge}px` }}
          >
            <div className="flex items-center justify-center space-x-2">
              {React.createElement(icons.refresh, { size: 20, className: "animate-spin" })}
              <span 
                className={`${classes.body.base}`}
                style={{ color: colors.textSecondary }}
              >
                Loading today's rates...
              </span>
            </div>
          </div>
        ) : filteredRates.length === 0 ? (
          <div 
            className="p-8 text-center"
            style={{ padding: `${layout.padding.xlarge}px` }}
          >
            <div className="flex items-center justify-center space-x-2">
              {React.createElement(icons.error, { size: 20 })}
              <span 
                className={`${classes.body.base}`}
                style={{ color: colors.textSecondary }}
              >
                No rates available for today
              </span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead 
                className="border-b"
                style={{ 
                  backgroundColor: `${colors.primary}10`,
                  borderBottomColor: colors.border
                }}
              >
                <tr>
                  <th 
                    className="px-4 py-4 text-left text-sm font-semibold"
                    style={{ color: colors.primary }}
                  >
                    Loan Type
                  </th>
                  <th 
                    className="px-4 py-4 text-left text-sm font-semibold"
                    style={{ color: colors.primary }}
                  >
                    Interest Rate
                  </th>
                  <th 
                    className="px-4 py-4 text-left text-sm font-semibold"
                    style={{ color: colors.primary }}
                  >
                    APR
                  </th>
                  <th 
                    className="px-4 py-4 text-left text-sm font-semibold"
                    style={{ color: colors.primary }}
                  >
                    Points
                  </th>
                  <th 
                    className="px-4 py-4 text-left text-sm font-semibold"
                    style={{ color: colors.primary }}
                  >
                    Monthly Payment*
                  </th>
                  <th 
                    className="px-4 py-4 text-left text-sm font-semibold"
                    style={{ color: colors.primary }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y"
                     style={{ borderColor: colors.border }}>
                {filteredRates.map((rate, index) => (
                  <tr key={`${rate.id}-${index}-${rate.loanType}-${rate.rate}`} 
                      className="transition-colors hover:opacity-90">
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        {React.createElement(icons.document, { 
                          size: 16, 
                          color: colors.textSecondary 
                        })}
                        <span className="text-sm font-medium"
                              style={{ color: colors.text }}>
                          {rate.loanType}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold"
                            style={{ color: colors.text }}>
                        {formatRate(rate.rate)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm"
                            style={{ color: colors.textSecondary }}>
                        {formatRate(rate.apr)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm"
                            style={{ color: colors.textSecondary }}>
                        {rate.points}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold"
                            style={{ color: colors.text }}>
                        {formatCurrency(rate.monthlyPayment)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        className={`${classes.button.outline} flex items-center space-x-2`}
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.primary,
                          color: colors.primary
                        }}
                      >
                        {React.createElement(icons.arrowRight, { size: 16, color: colors.primary })}
                        <span>{content.ctaText}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Note */}
        <div className="px-6 py-4 border-t"
             style={{ 
               backgroundColor: `${colors.primary}05`,
               borderTopColor: colors.border 
             }}>
          <p className="text-xs"
             style={{ color: colors.textSecondary }}>
            * Monthly payment based on $400,000 loan amount. Rates are subject to change without notice. 
            Actual rates may vary based on credit score, loan amount, and other factors.
          </p>
        </div>
      </div>
    </div>
  );
}