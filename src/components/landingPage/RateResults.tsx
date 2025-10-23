'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { spacing, borderRadius, shadows, typography } from '@/theme/theme';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import Icon, { icons } from '@/components/ui/Icon';
import LeadCaptureModal, { type LeadData } from './LeadCaptureModal';
import { useNotification } from '@/components/ui/Notification';

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

interface ApiProduct {
  productId?: string;
  productName?: string;
  rate?: number;
  apr?: number;
  principalAndInterest?: number;
  totalPayment?: number;
  closingCost?: number;
  discount?: number;
  rebate?: number;
  price?: number;
  investor?: string;
  loanType?: string;
  loanTerm?: string;
  amortizationType?: string;
  lockPeriod?: number;
  priceStatus?: string;
  lastUpdate?: string;
}

interface RateResultsProps {
  products: RateProduct[];
  loading: boolean;
  rawData?: ApiProduct[];
  template?: 'template1' | 'template2';
  isMockData?: boolean;
  dataSource?: string;
  // Public mode props
  isPublic?: boolean;
  publicTemplateData?: any;
  // User context props for lead submission
  userId?: string;
  companyId?: string;
  // Filter for today's rates only
  showTodaysRatesOnly?: boolean;
}

function RateResults({ 
  products, 
  loading, 
  rawData, 
  template = 'template1', 
  isMockData = false, 
  dataSource = 'unknown',
  // Public mode props
  isPublic = false,
  publicTemplateData,
  // User context props
  userId,
  companyId,
  // Filter for today's rates only
  showTodaysRatesOnly = false
}: RateResultsProps) {
  const { getTemplateSync } = useEfficientTemplates();
  const { showNotification } = useNotification();
  
  // Template data fetching - support both public and auth modes
  const templateData = isPublic && publicTemplateData 
    ? publicTemplateData 
    : getTemplateSync(template);
  
  // Comprehensive debugging for template data
  console.log('🔍 RateResults Debug:', {
    template,
    templateData,
    hasTemplateData: !!templateData,
    colors: templateData?.template?.colors,
    classes: templateData?.template?.classes,
    primaryColor: templateData?.template?.colors?.primary,
    buttonPrimary: templateData?.template?.classes?.button?.primary,
    timestamp: new Date().toISOString()
  });
  
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
  const [sortBy, setSortBy] = useState<'rate' | 'payment' | 'fees'>('rate');
  const [selectedTerm, setSelectedTerm] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<RateProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedLoanProduct, setSelectedLoanProduct] = useState<RateProduct | null>(null);

  // Memoized handlers to prevent unnecessary re-renders
  const handleSortChange = useCallback((newSortBy: 'rate' | 'payment' | 'fees') => {
    setSortBy(newSortBy);
  }, []);

  const handleTermChange = useCallback((term: string) => {
    setSelectedTerm(term);
  }, []);

  const handleGetStarted = useCallback((product: RateProduct) => {
    console.log('🚀 RateResults - handleGetStarted called with product:', product);
    setSelectedLoanProduct(product);
    setIsLeadModalOpen(true);
  }, []);

  const handleViewDetails = useCallback((product: RateProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }, []);

  const handleCloseLeadModal = useCallback(() => {
    setIsLeadModalOpen(false);
    setSelectedLoanProduct(null);
  }, []);

  const handleLeadSubmit = useCallback(async (leadData: LeadData) => {
    try {
      console.log('🚀 Submitting lead data:', leadData);
      
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
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          ...leadData,
          source: "Rate Results Table", // Set source for Rate Results
          userId: leadUserId,
          companyId: leadCompanyId
        }),
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Failed to submit lead: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Lead submitted successfully:', result);
      
      // Show success notification
      showNotification({
        type: 'success',
        title: 'Lead Submitted Successfully!',
        message: 'Thank you for your interest. We\'ll contact you soon about your loan application.',
        duration: 5000
      });
      
    } catch (error) {
      console.error('Error submitting lead:', error);
      throw error; // Re-throw to let the modal handle the error
    }
  }, []);

  // Memoized filtering and sorting logic
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;
    
    // Filter for today's rates only when showTodaysRatesOnly is true
    if (showTodaysRatesOnly) {
      filtered = products.filter(product => {
        // Only show products from "Today's Rates" lender
        return product.lenderName === 'Today\'s Rates';
      });
    }
    
    // Filter by term if not 'all'
    if (selectedTerm !== 'all') {
      filtered = products.filter(product => {
        const termStr = product.loanTerm.toString();
        
        // Handle different loan term filter options
        if (selectedTerm === '30') {
          return termStr === '30' || termStr.includes('Thirty');
        } else if (selectedTerm === '20') {
          return termStr === '20' || termStr.includes('Twenty');
        } else if (selectedTerm === '15') {
          return termStr === '15' || termStr.includes('Fifteen');
        } else if (selectedTerm === '10') {
          return termStr === '10' || termStr.includes('10/1');
        } else if (selectedTerm === '7') {
          return termStr === '7' || termStr.includes('7/1');
        } else if (selectedTerm === '5') {
          return termStr === '5' || termStr.includes('5/1');
        }
        
        return termStr === selectedTerm;
      });
    }
    
    // Sort products
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rate':
          return a.interestRate - b.interestRate;
        case 'payment':
          return a.monthlyPayment - b.monthlyPayment;
        case 'fees':
          return a.fees - b.fees;
        default:
          return 0;
      }
    });
  }, [products, selectedTerm, sortBy, showTodaysRatesOnly]);

  // Memoized unique terms
  // No longer needed since we have fixed filter buttons
  // const uniqueTerms = useMemo(() => {
  //   const terms = products.map(p => p.loanTerm.toString());
  //   return ['all', ...Array.from(new Set(terms))];
  // }, [products]);

  // Use memoized filtered and sorted products

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

  const formatPoints = (points: number) => {
    if (points > 0) {
      return `${points.toFixed(3)} Points`;
    } else if (points < 0) {
      return `${Math.abs(points).toFixed(3)} Credit`;
    }
    return '0 Points';
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: borderRadius.lg,
        boxShadow: shadows.lg,
        padding: spacing[8]
      }}>
        <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
          <div style={{
            height: spacing[8],
            backgroundColor: colors.border,
            borderRadius: borderRadius.md,
            marginBottom: spacing[4]
          }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{
                height: spacing[24],
                backgroundColor: colors.border,
                borderRadius: borderRadius.md
              }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: borderRadius.lg,
        boxShadow: shadows.lg,
        padding: spacing[8],
        textAlign: 'center'
      }}>
        <div style={{
          color: colors.textSecondary,
          fontSize: typography.fontSize.lg,
          lineHeight: typography.lineHeight.relaxed
        }}>
          No rates found for your criteria. Try adjusting your search parameters.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: `${layout.borderRadius}px`,
      boxShadow: shadows.lg
    }}>
      {/* Mock Data Warning Banner */}
      {isMockData && (
        <div style={{
          backgroundColor: '#fef3c7', // Yellow background
          borderBottom: `1px solid #f59e0b`, // Yellow border
          padding: spacing[3],
          borderRadius: `${layout.borderRadius}px ${layout.borderRadius}px 0 0`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            justifyContent: 'center'
          }}>
            <Icon name="warning" size={20} color="#d97706" />
            <span style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: '#92400e'
            }}>
              ⚠️ Demo Data: Currently showing sample mortgage rates. Real-time rates require API authentication.
            </span>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div style={{
        padding: spacing[6],
        borderBottom: `1px solid ${colors.border}`
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[4],
          alignItems: 'flex-start',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text,
              lineHeight: typography.lineHeight.tight
            }}>Mortgage Rates</h2>
            <p style={{
              fontSize: typography.fontSize.sm,
              color: colors.textSecondary,
              marginTop: spacing[1],
              lineHeight: typography.lineHeight.relaxed
            }}>
              Rates current as of {new Date().toLocaleDateString('en-US', { 
                month: 'numeric', 
                day: 'numeric', 
                year: 'numeric' 
              })}, {new Date().toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Loan Term Filter and Sort Controls */}
      <div className="p-4 border-b" style={{ borderBottomColor: colors.border }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Loan Term Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: '30', label: '30yr Fixed' },
              { id: '20', label: '20yr Fixed' },
              { id: '15', label: '15yr Fixed' },
              { id: '10', label: '10y/6m ARM' },
              { id: '7', label: '7y/6m ARM' },
              { id: '5', label: '5y/6m ARM' }
            ].map((term) => (
              <button
                key={term.id}
                onClick={() => handleTermChange(term.id)}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                  selectedTerm === term.id
                    ? 'text-white shadow-md'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: selectedTerm === term.id ? colors.primary : undefined,
                  color: selectedTerm === term.id ? colors.background : colors.text,
                  borderRadius: `${layout.borderRadius}px`
                }}
                onMouseEnter={(e) => {
                  if (selectedTerm !== term.id) {
                    e.currentTarget.style.backgroundColor = colors.border;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTerm !== term.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {term.label}
              </button>
            ))}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-3">
            {/* Settings Button */}
            <button
              className="w-10 h-10 flex items-center justify-center border transition-colors"
              style={{
                borderColor: colors.border,
                borderRadius: `${layout.borderRadius}px`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.border;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span 
                className="text-sm font-medium"
                style={{ color: colors.primary }}
              >
                Sort By:
              </span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as 'rate' | 'payment' | 'fees')}
                className="px-3 py-2 text-sm border focus:outline-none focus:ring-2"
                style={{
                  borderColor: colors.border,
                  borderRadius: `${layout.borderRadius}px`,
                  backgroundColor: colors.background,
                  color: colors.text
                }}
              >
                <option value="rate">Low Rate</option>
                <option value="payment">Low Payment</option>
                <option value="fees">Low Fees</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead 
              className="border-b"
              style={{ 
                backgroundColor: `${colors.primary}10`,
                borderColor: colors.border 
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
              {filteredAndSortedProducts.map((product, index) => (
                <tr key={`${product.id}-${index}-${product.interestRate}-${product.apr}`} 
                    className="transition-colors hover:opacity-90">
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      {React.createElement(icons.document, { 
                        size: 16, 
                        color: colors.primary 
                      })}
                      <span className="text-sm font-medium"
                            style={{ color: colors.text }}>
                        {product.loanTerm}-Year Fixed
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold"
                          style={{ color: colors.text }}>
                      {formatRate(product.interestRate)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm"
                          style={{ color: colors.textSecondary }}>
                      {formatRate(product.apr)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm"
                          style={{ color: colors.textSecondary }}>
                      {formatPoints(product.points)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold"
                          style={{ color: colors.text }}>
                      {formatCurrency(product.monthlyPayment)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleGetStarted(product)}
                        className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium transition-colors w-full"
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
                        onClick={() => handleViewDetails(product)}
                        className="flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors w-full"
                        style={{
                          backgroundColor: colors.background,
                          color: colors.text,
                          border: `1px solid ${colors.border}`,
                          borderRadius: `${layout.borderRadius}px`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.backgroundSecondary || '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = colors.background;
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <span>4.9</span>
            <div className="flex text-yellow-400">
              {'★★★★★'.split('').map((star, i) => (
                <span key={i}>{star}</span>
              ))}
            </div>
            <span>(20,672 reviews)</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Want more personalized rates? <span 
              className="cursor-pointer hover:underline"
              style={{ color: colors.primary }}
            >Get a custom quote</span>
          </p>
        </div>
      </div>

      {/* Product Details Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ borderRadius: `${layout.borderRadius}px` }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Loan Product Details
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Basic Info */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Lender:</span>
                      <span className="font-medium text-gray-900">{selectedProduct.lenderName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Loan Program:</span>
                      <span className="font-medium text-gray-900">{selectedProduct.loanProgram}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Loan Type:</span>
                      <span className="font-medium text-gray-900">{selectedProduct.loanType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Loan Term:</span>
                      <span className="font-medium text-gray-900">{selectedProduct.loanTerm} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Lock Period:</span>
                      <span className="font-medium text-gray-900">{selectedProduct.lockPeriod} days</span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Financial Details */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Interest Rate:</span>
                      <span className="font-medium" style={{ color: colors.primary }}>{formatRate(selectedProduct.interestRate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">APR:</span>
                      <span className="font-medium text-gray-900">{formatRate(selectedProduct.apr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Monthly Payment:</span>
                      <span className="font-medium text-green-600">{formatCurrency(selectedProduct.monthlyPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total Fees:</span>
                      <span className="font-medium text-gray-900">{formatCurrency(selectedProduct.fees)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Points:</span>
                      <span className="font-medium text-gray-900">{formatPoints(selectedProduct.points)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Credits:</span>
                      <span className="font-medium text-green-600">{formatCurrency(selectedProduct.credits)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Loan Features</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Fixed interest rate</li>
                      <li>• {selectedProduct.loanTerm}-year term</li>
                      <li>• {selectedProduct.lockPeriod}-day rate lock</li>
                      <li>• Principal and interest payments</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Cost Breakdown</h5>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div className="flex justify-between">
                        <span>Monthly Payment:</span>
                        <span className="text-gray-900">{formatCurrency(selectedProduct.monthlyPayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Upfront Costs:</span>
                        <span className="text-gray-900">{formatCurrency(selectedProduct.fees)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lender Credits:</span>
                        <span className="text-green-600">{formatCurrency(selectedProduct.credits)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Information Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Request Information</h4>
                <div className="bg-gray-50 p-4" style={{ borderRadius: `${layout.borderRadius}px` }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Loan Request Details</h5>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div className="flex justify-between">
                          <span>Request ID:</span>
                          <span className="text-gray-900 font-mono">#{selectedProduct.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Request Date:</span>
                          <span className="text-gray-900">{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Request Time:</span>
                          <span className="text-gray-900">{new Date().toLocaleTimeString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className="text-green-600 font-medium">Available</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Rate Information</h5>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div className="flex justify-between">
                          <span>Rate Lock Expires:</span>
                          <span className="text-gray-900">
                            {new Date(Date.now() + selectedProduct.lockPeriod * 24 * 60 * 60 * 1000).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rate Type:</span>
                          <span className="text-gray-900">Fixed</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Updated:</span>
                          <span className="text-gray-900">{new Date().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Product ID:</span>
                          <span className="text-gray-900 font-mono">{selectedProduct.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handleGetStarted(selectedProduct)}
                  className="flex-1 flex items-center justify-center text-white py-3 px-6 font-medium transition-colors"
                  style={{ 
                    backgroundColor: colors.primary,
                    color: colors.background,
                    borderRadius: `${layout.borderRadius}px`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.secondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary;
                  }}
                >
                  Get Started with This Loan
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 flex items-center justify-center border border-gray-300 text-gray-700 py-3 px-6 font-medium hover:bg-gray-50 transition-colors"
                  style={{ borderRadius: `${layout.borderRadius}px` }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Capture Modal */}
      {selectedLoanProduct && (
        <LeadCaptureModal
          isOpen={isLeadModalOpen}
          onClose={handleCloseLeadModal}
          loanProduct={selectedLoanProduct}
          onSubmit={handleLeadSubmit}
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
        />
      )}
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
export default memo(RateResults);
