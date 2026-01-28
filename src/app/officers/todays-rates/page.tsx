'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { useTemplateSelection, useEfficientTemplates, useUnifiedTemplates } from '@/contexts/UnifiedTemplateContext';
import { supabase } from '@/lib/supabase/client';
import { icons } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import SpotlightCard from '@/components/ui/SpotlightCard';
import MortgageSearchForm from '@/components/landingPage/MortgageSearchForm';
import RateResults from '@/components/landingPage/RateResults';
import { useNotification } from '@/components/ui/Notification';
import Modal from '@/components/ui/Modal';
import TodaysRatesSkeleton from './TodaysRatesSkeleton';

interface Rate {
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
  searchParams?: {
    purchasePrice?: number;
    downPayment?: number;
    loanAmount: number;
    creditScore: string;
    loanPurpose: 'Purchase' | 'Refinance';
  };
  [key: string]: any;
}

interface SelectedRate {
  id: string;
  rateData: Rate;
  createdAt: string;
  updatedAt: string;
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

type TabType = 'search' | 'selected';

export default function TodaysRatesPage() {
  const { user, companyId, loading: authLoading } = useAuth();
  const { isInitialized: templatesInitialized } = useUnifiedTemplates();
  const { selectedTemplate } = useTemplateSelection();
  const { getTemplateSync } = useEfficientTemplates();
  const router = useRouter();
  const { showNotification } = useNotification();
  
  // Get template data for colors and layout
  const templateData = getTemplateSync(selectedTemplate || 'template1');
  const templateColors = templateData?.template?.colors || {
    primary: '#01bcc6',
    secondary: '#01bcc6',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };
  const templateLayout = templateData?.template?.layout || {
    borderRadius: 8,
    padding: { small: 8, medium: 16, large: 24 },
    spacing: 16
  };

  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [loading, setLoading] = useState(false);
  const [loadingSelectedRates, setLoadingSelectedRates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rates, setRates] = useState<Rate[]>([]);
  const [selectedRates, setSelectedRates] = useState<SelectedRate[]>([]);
  const [rateLimit, setRateLimit] = useState<{ remaining: number; resetAt: Date; used: number } | null>(null);
  
  // Current search parameters state
  const [currentSearchParams, setCurrentSearchParams] = useState<{
    purchasePrice?: number;
    downPayment?: number;
    loanAmount: number;
    creditScore: string;
    loanPurpose: 'Purchase' | 'Refinance';
  } | null>(null);
  
  // Confirmation modal states
  const [showSelectConfirm, setShowSelectConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [rateToSelect, setRateToSelect] = useState<Rate | null>(null);
  const [rateToRemove, setRateToRemove] = useState<SelectedRate | null>(null);
  const [rateToView, setRateToView] = useState<Rate | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

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

  // Fetch selected rates
  const fetchSelectedRates = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoadingSelectedRates(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setLoadingSelectedRates(false);
        return;
      }

      const response = await fetch('/api/officers/selected-rates', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSelectedRates(result.rates || []);
        }
      }
    } catch (err) {
      console.error('Error fetching selected rates:', err);
    } finally {
      setLoadingSelectedRates(false);
    }
  }, [user?.id]);

  // Fetch selected rates on mount and when tab changes
  // Also fetch when on search tab to check for duplicates
  useEffect(() => {
    fetchSelectedRates();
  }, [activeTab, fetchSelectedRates]);

  // Handle search form updates
  const handleSearchFormUpdate = useCallback(async (formData: SearchFormData, email?: string) => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      let propertyValue: number;
      let calculatedLoanAmount: number;
      let purchasePrice: number | undefined;
      let downPayment: number | undefined;

      if (formData.loanPurpose === 'Refinance') {
        const mortgageBalance = parseFloat(formData.mortgageBalance || '0');
        calculatedLoanAmount = mortgageBalance;
        propertyValue = calculatedLoanAmount;
        // For refinance, don't set purchasePrice or downPayment
      } else {
        const salesPrice = parseFloat(formData.salesPrice || '0');
        const calculatedDownPayment = parseFloat(formData.downPayment || '0');
        calculatedLoanAmount = salesPrice - calculatedDownPayment;
        propertyValue = salesPrice;
        purchasePrice = salesPrice;
        downPayment = calculatedDownPayment;
      }

      // Store current search parameters for rate selection
      setCurrentSearchParams({
        purchasePrice,
        downPayment,
        loanAmount: calculatedLoanAmount,
        creditScore: formData.creditScore, // Keep original string format (range)
        loanPurpose: formData.loanPurpose as 'Purchase' | 'Refinance',
      });

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

      const response = await fetch('/api/mortech/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError(`Rate limit exceeded. You have ${result.rateLimit?.remaining || 0} searches remaining. Limit resets at ${new Date(result.rateLimit?.resetAt).toLocaleString()}`);
          setRateLimit(result.rateLimit);
        } else {
          setError(result.error || 'Failed to fetch rates');
        }
        setRates([]);
        setLoading(false);
        return;
      }

      if (result.success && result.rates) {
        const transformedRates: Rate[] = result.rates.map((rate: any) => ({
          id: rate.id || rate.productId,
          lenderName: rate.lenderName || rate.vendorName,
          loanProgram: rate.loanProgram || rate.productDesc,
          loanType: rate.loanType || rate.termType,
          loanTerm: rate.loanTerm || rate.productTerm,
          interestRate: rate.interestRate || rate.rate,
          apr: rate.apr,
          monthlyPayment: rate.monthlyPayment,
          fees: rate.fees || 0,
          points: rate.points || 0,
          credits: rate.credits || 0,
          lockPeriod: rate.lockPeriod || rate.lockTerm || 30,
          ...rate, // Include all original fields
        }));

        setRates(transformedRates);
        setRateLimit(result.rateLimit || null);
      } else {
        setError('No rates returned from API');
        setRates([]);
      }
    } catch (err) {
      console.error('Error fetching rates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rates');
      setRates([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Handle opening select confirmation
  const handleSelectRateClick = useCallback((rate: Rate) => {
    // Attach current search parameters to the rate
    const rateWithSearchParams: Rate = {
      ...rate,
      searchParams: currentSearchParams || undefined,
    };
    setRateToSelect(rateWithSearchParams);
    setShowSelectConfirm(true);
  }, [currentSearchParams]);

  // Handle confirming rate selection
  const handleSelectRate = useCallback(async () => {
    if (!user?.id || !rateToSelect) return;

    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Not authenticated',
        });
        setShowSelectConfirm(false);
        setIsProcessing(false);
        return;
      }

      const response = await fetch('/api/officers/selected-rates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          rateData: rateToSelect,
          searchParams: rateToSelect.searchParams 
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Rate selected successfully',
        });
        // Refresh selected rates to update UI
        fetchSelectedRates();
        setShowSelectConfirm(false);
        setRateToSelect(null);
      } else {
        showNotification({
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to select rate',
        });
      }
    } catch (err) {
      console.error('Error selecting rate:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to select rate',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id, rateToSelect, fetchSelectedRates, showNotification]);

  // Handle opening remove confirmation
  const handleRemoveRateClick = useCallback((selectedRate: SelectedRate) => {
    setRateToRemove(selectedRate);
    setShowRemoveConfirm(true);
  }, []);

  const handleViewDetailsClick = useCallback((rate: Rate) => {
    // Attach current search parameters (if any) so Details can display them
    const rateWithSearchParams: Rate = {
      ...rate,
      searchParams: rate.searchParams ?? currentSearchParams ?? undefined,
    };
    setRateToView(rateWithSearchParams);
    setShowDetailsModal(true);
  }, [currentSearchParams]);

  // Handle confirming rate removal
  const handleRemoveRate = useCallback(async () => {
    if (!user?.id || !rateToRemove) return;

    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Not authenticated',
        });
        setShowRemoveConfirm(false);
        setIsProcessing(false);
        return;
      }

      const response = await fetch(`/api/officers/selected-rates/${rateToRemove.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Rate removed successfully',
        });
        fetchSelectedRates();
        setShowRemoveConfirm(false);
        setRateToRemove(null);
      } else {
        showNotification({
          type: 'error',
          title: 'Error',
          message: result.error || 'Failed to remove rate',
        });
      }
    } catch (err) {
      console.error('Error removing rate:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to remove rate',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id, rateToRemove, fetchSelectedRates, showNotification]);

  // Check if a rate is already selected
  const isRateSelected = useCallback((rate: Rate): boolean => {
    if (!selectedRates.length) return false;
    
    // Compare multiple fields to uniquely identify a rate
    // since multiple rates can have the same productId
    return selectedRates.some((selectedRate) => {
      const selected = selectedRate.rateData;
      if (!selected) return false;
      
      // Match by ID first, then verify with other unique fields
      const idMatch = selected.id === rate.id || selected.productId === rate.id;
      if (!idMatch) return false;
      
      // Verify it's the same rate by comparing unique characteristics
      return (
        Math.abs((selected.interestRate || 0) - (rate.interestRate || 0)) < 0.001 &&
        Math.abs((selected.apr || 0) - (rate.apr || 0)) < 0.001 &&
        Math.abs((selected.monthlyPayment || 0) - (rate.monthlyPayment || 0)) < 0.01
      );
    });
  }, [selectedRates]);

  // Transform rates to RateResults format
  const transformRatesToRateResults = (rates: Rate[]) => {
    return rates.map(rate => ({
      id: rate.id,
      lenderName: rate.lenderName,
      loanProgram: rate.loanProgram,
      loanType: rate.loanType,
      loanTerm: rate.loanTerm,
      interestRate: rate.interestRate,
      apr: rate.apr,
      monthlyPayment: rate.monthlyPayment,
      fees: rate.fees,
      points: rate.points,
      credits: rate.credits,
      lockPeriod: rate.lockPeriod
    }));
  };

  // Show a page-shaped skeleton on reload until auth + templates are ready.
  if (authLoading || !templatesInitialized) {
    return (
      <RouteGuard allowedRoles={['employee']}>
        <TodaysRatesSkeleton />
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['employee']}>
      <DashboardLayout
        showBreadcrumb={true}
        breadcrumbVariant="default"
        breadcrumbSize="md"
        customBreadcrumbItems={[
          {
            label: 'Dashboard',
            href: '/officers/dashboard',
            icon: 'home' as keyof typeof icons
          },
          {
            label: "Today's Rates",
            href: '/officers/todays-rates',
            icon: 'trendingUp' as keyof typeof icons
          }
        ]}
      >
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-[#005b7c] mb-2">
              Today's Rates Management
            </h1>
            <p className="text-gray-600">
              Search for rates and select which ones to display on your public profile
            </p>
          </div>

          {/* Tabs */}
          <div 
            className="toggle-switch relative inline-flex p-1 mb-4"
            style={{
              backgroundColor: templateColors.border,
              borderRadius: `${templateLayout.borderRadius}px`,
              width: 'fit-content'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`relative z-10 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === 'search' ? 'text-white' : 'text-gray-600'
              }`}
              style={{
                borderRadius: `${templateLayout.borderRadius}px`,
                backgroundColor: activeTab === 'search' ? templateColors.primary : 'transparent'
              }}
            >
              Search Rates
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('selected')}
              className={`relative z-10 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === 'selected' ? 'text-white' : 'text-gray-600'
              }`}
              style={{
                borderRadius: `${templateLayout.borderRadius}px`,
                backgroundColor: activeTab === 'selected' ? templateColors.primary : 'transparent'
              }}
            >
              Selected Rates
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'search' && (
            <div className="space-y-6">

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    {React.createElement(icons.error, { size: 20, className: "text-red-500 mr-2" })}
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}

              {/* Search Form */}
              <SpotlightCard variant="default" className="p-6">
                <MortgageSearchForm
                  onSearch={handleSearchFormUpdate}
                  loading={loading}
                  template={selectedTemplate as 'template1' | 'template2'}
                  isPublic={false}
                />
              </SpotlightCard>

              {/* Loading Skeleton */}
              {loading && rates.length === 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map((index) => (
                      <SpotlightCard key={index} variant="default" className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <div className="h-3 w-20 mb-2 bg-gray-200/70 rounded animate-[pulse_4s_ease-in-out_infinite]" />
                              <div className="h-5 w-32 bg-gray-200/70 rounded animate-[pulse_4s_ease-in-out_infinite]" />
                            </div>
                            <div>
                              <div className="h-3 w-20 mb-2 bg-gray-200/70 rounded animate-[pulse_4s_ease-in-out_infinite]" />
                              <div className="h-5 w-24 bg-gray-200/70 rounded animate-[pulse_4s_ease-in-out_infinite]" />
                            </div>
                            <div>
                              <div className="h-3 w-16 mb-2 bg-gray-200/70 rounded animate-[pulse_4s_ease-in-out_infinite]" />
                              <div className="h-5 w-24 bg-gray-200/70 rounded animate-[pulse_4s_ease-in-out_infinite]" />
                            </div>
                            <div>
                              <div className="h-3 w-24 mb-2 bg-gray-200/70 rounded animate-[pulse_4s_ease-in-out_infinite]" />
                              <div className="h-5 w-28 bg-gray-200/70 rounded animate-[pulse_4s_ease-in-out_infinite]" />
                            </div>
                          </div>
                          <div className="w-full md:w-auto">
                            <div className="h-10 w-32 bg-gray-200/70 rounded animate-[pulse_4s_ease-in-out_infinite]" />
                          </div>
                        </div>
                      </SpotlightCard>
                    ))}
                  </div>
                </div>
              )}

              {/* Rate Results with Select Buttons */}
              {!loading && rates.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
                  <div className="space-y-4">
                    {rates.map((rate, index) => (
                      <SpotlightCard key={`${rate.id}-${index}-${rate.interestRate}-${rate.apr}`} variant="default" className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Loan Program</p>
                              <p className="text-sm font-medium dark:text-gray-900">{rate.loanProgram}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Interest Rate</p>
                              <p className="text-sm font-medium dark:text-gray-900">{rate.interestRate.toFixed(3)}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">APR</p>
                              <p className="text-sm font-medium dark:text-gray-900">{rate.apr.toFixed(3)}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Monthly Payment</p>
                              <p className="text-sm font-medium dark:text-gray-900">${rate.monthlyPayment.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                            <Button
                              variant={"primary"}
                              onClick={() => handleSelectRateClick(rate)}
                              disabled={isRateSelected(rate)}
                              className="w-full sm:w-auto sm:min-w-[160px]"
                            >
                              {isRateSelected(rate) ? 'Already Selected' : 'Select Rate'}
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => handleViewDetailsClick(rate)}
                              className="w-full sm:w-auto sm:min-w-[110px]"
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      </SpotlightCard>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'selected' && (
            <div className="space-y-4">
              {/* Loading Skeleton for Selected Rates */}
              {loadingSelectedRates && (
                <div className="space-y-4">
                  {[1, 2, 3].map((index) => (
                    <SpotlightCard key={`skeleton-${index}`} variant="default" className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="h-3 w-20 mb-2 bg-gray-200/70 rounded animate-[pulse_4s_ease-in-out_infinite]" />
                            <div className="h-5 w-32 bg-gray-200/70 rounded animate-[pulse_4s_ease-in-out_infinite]" />
                          </div>
                          <div>
                            <div className="h-3 w-20 mb-2 bg-gray-200/70 rounded animate-[pulse_4s_ease-in-out_infinite]" />
                            <div className="h-5 w-24 bg-gray-200/70 rounded animate-[pulse_4s_ease-in-out_infinite]" />
                          </div>
                          <div>
                            <div className="h-3 w-16 mb-2 bg-gray-200/70 rounded animate-[pulse_4s_ease-in-out_infinite]" />
                            <div className="h-5 w-24 bg-gray-200/70 rounded animate-[pulse_4s_ease-in-out_infinite]" />
                          </div>
                          <div>
                            <div className="h-3 w-24 mb-2 bg-gray-200/70 rounded animate-[pulse_4s_ease-in-out_infinite]" />
                            <div className="h-5 w-28 bg-gray-200/70 rounded animate-[pulse_4s_ease-in-out_infinite]" />
                          </div>
                        </div>
                        <div className="w-full md:w-auto">
                          <div className="h-10 w-24 bg-gray-200/70 rounded animate-[pulse_4s_ease-in-out_infinite]" />
                        </div>
                      </div>
                    </SpotlightCard>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loadingSelectedRates && selectedRates.length === 0 && (
                <SpotlightCard variant="default" className="p-8 text-center">
                  <p className="text-gray-500">No rates selected yet. Search for rates and select them to display on your public profile.</p>
                </SpotlightCard>
              )}

              {/* Selected Rates List */}
              {!loadingSelectedRates && selectedRates.length > 0 && (
                <div className="space-y-4">
                  {selectedRates.map((selectedRate) => {
                    const rate = selectedRate.rateData;
                    const searchParams = rate.searchParams;
                    const formatCurrency = (amount: number) => {
                      return new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(amount);
                    };
                    return (
                      <SpotlightCard key={selectedRate.id} variant="default" className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                              <div>
                                <p className="text-xs text-gray-500">Loan Program</p>
                                <p className="text-sm font-medium dark:text-gray-900">{rate.loanProgram}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Interest Rate</p>
                                <p className="text-sm font-medium dark:text-gray-900">{rate.interestRate.toFixed(3)}%</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">APR</p>
                                <p className="text-sm font-medium dark:text-gray-900">{rate.apr.toFixed(3)}%</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Monthly Payment</p>
                                <p className="text-sm font-medium dark:text-gray-900">${rate.monthlyPayment.toLocaleString()}</p>
                              </div>
                            </div>
                            {/* Search Parameters */}
                            {searchParams && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                  {searchParams.loanPurpose === 'Purchase' && searchParams.purchasePrice !== undefined && (
                                    <div>
                                      <span className="text-gray-500">Purchase Price: </span>
                                      <span className="font-medium text-gray-700">
                                        {formatCurrency(searchParams.purchasePrice)}
                                      </span>
                                    </div>
                                  )}
                                  {searchParams.loanPurpose === 'Purchase' && searchParams.downPayment !== undefined && (
                                    <div>
                                      <span className="text-gray-500">Down Payment: </span>
                                      <span className="font-medium text-gray-700">
                                        {formatCurrency(searchParams.downPayment)}
                                      </span>
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-gray-500">Loan Amount: </span>
                                    <span className="font-medium text-gray-700">
                                      {formatCurrency(searchParams.loanAmount)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Credit Score: </span>
                                    <span className="font-medium text-gray-700">
                                      {searchParams.creditScore}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="danger"
                            onClick={() => handleRemoveRateClick(selectedRate)}
                            className="w-full md:w-auto"
                          >
                            Remove
                          </Button>
                        </div>
                      </SpotlightCard>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Select Rate Confirmation Modal */}
      <Modal
        isOpen={showSelectConfirm}
        onClose={() => {
          if (!isProcessing) {
            setShowSelectConfirm(false);
            setRateToSelect(null);
          }
        }}
        title="Confirm Rate Selection"
      >
        {rateToSelect && (
          <div className="space-y-4">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01bcc6] mb-4"></div>
                <p className="text-gray-600">Selecting rate...</p>
              </div>
            ) : (
              <>
                <p className="text-gray-700">
                  Are you sure you want to select this rate for display on your public profile?
                </p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Loan Program:</span>
                    <span className="text-sm font-medium">{rateToSelect.loanProgram}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Interest Rate:</span>
                    <span className="text-sm font-medium">{rateToSelect.interestRate.toFixed(3)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">APR:</span>
                    <span className="text-sm font-medium">{rateToSelect.apr.toFixed(3)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monthly Payment:</span>
                    <span className="text-sm font-medium">${rateToSelect.monthlyPayment.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="primary"
                    onClick={handleSelectRate}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowSelectConfirm(false);
                      setRateToSelect(null);
                    }}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Remove Rate Confirmation Modal */}
      <Modal
        isOpen={showRemoveConfirm}
        onClose={() => {
          if (!isProcessing) {
            setShowRemoveConfirm(false);
            setRateToRemove(null);
          }
        }}
        title="Confirm Rate Removal"
      >
        {rateToRemove && (
          <div className="space-y-4">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01bcc6] mb-4"></div>
                <p className="text-gray-600">Removing rate...</p>
              </div>
            ) : (
              <>
                <p className="text-gray-700">
                  Are you sure you want to remove this rate from your selected rates? This will remove it from your public profile.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Loan Program:</span>
                    <span className="text-sm font-medium">{rateToRemove.rateData.loanProgram}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Interest Rate:</span>
                    <span className="text-sm font-medium">{rateToRemove.rateData.interestRate.toFixed(3)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">APR:</span>
                    <span className="text-sm font-medium">{rateToRemove.rateData.apr.toFixed(3)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monthly Payment:</span>
                    <span className="text-sm font-medium">${rateToRemove.rateData.monthlyPayment.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="danger"
                    onClick={handleRemoveRate}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    Remove
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowRemoveConfirm(false);
                      setRateToRemove(null);
                    }}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Rate Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setRateToView(null);
        }}
        title="Rate Details"
        className="max-w-3xl"
      >
        {rateToView && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-3">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Lender</span>
                    <span className="font-medium text-gray-900 text-right">{rateToView.lenderName}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Loan Program</span>
                    <span className="font-medium text-gray-900 text-right">{rateToView.loanProgram}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Loan Type</span>
                    <span className="font-medium text-gray-900 text-right">{rateToView.loanType}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Loan Term</span>
                    <span className="font-medium text-gray-900 text-right">{rateToView.loanTerm} years</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Lock Period</span>
                    <span className="font-medium text-gray-900 text-right">{rateToView.lockPeriod} days</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-3">Financial Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Interest Rate</span>
                    <span className="font-semibold text-right" style={{ color: templateColors.primary }}>
                      {rateToView.interestRate.toFixed(3)}%
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">APR</span>
                    <span className="font-medium text-gray-900 text-right">{rateToView.apr.toFixed(3)}%</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Monthly Payment</span>
                    <span className="font-semibold text-right">{formatCurrency(rateToView.monthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Fees</span>
                    <span className="font-medium text-gray-900 text-right">{formatCurrency(rateToView.fees)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Points</span>
                    <span className="font-medium text-gray-900 text-right">{rateToView.points.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Credits</span>
                    <span className="font-medium text-gray-900 text-right">{formatCurrency(rateToView.credits)}</span>
                  </div>
                </div>
              </div>
            </div>

            {rateToView.searchParams && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-base font-semibold text-gray-900 mb-3">Search Parameters</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Purpose</span>
                    <span className="font-medium text-gray-900 text-right">{rateToView.searchParams.loanPurpose}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Credit Score</span>
                    <span className="font-medium text-gray-900 text-right">{rateToView.searchParams.creditScore}</span>
                  </div>

                  {rateToView.searchParams.purchasePrice !== undefined && (
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Purchase Price</span>
                      <span className="font-medium text-gray-900 text-right">
                        {formatCurrency(rateToView.searchParams.purchasePrice)}
                      </span>
                    </div>
                  )}

                  {rateToView.searchParams.downPayment !== undefined && (
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Down Payment</span>
                      <span className="font-medium text-gray-900 text-right">
                        {formatCurrency(rateToView.searchParams.downPayment)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Loan Amount</span>
                    <span className="font-medium text-gray-900 text-right">
                      {formatCurrency(rateToView.searchParams.loanAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDetailsModal(false);
                  setRateToView(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </RouteGuard>
  );
}

