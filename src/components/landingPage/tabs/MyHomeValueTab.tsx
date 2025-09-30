'use client';

import React, { useState, useEffect } from 'react';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { useAuth } from '@/hooks/use-auth';
import Icon from '@/components/ui/Icon';

interface MyHomeValueTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
  // NEW: Public mode props
  isPublic?: boolean;
  publicTemplateData?: any;
}

export default function MyHomeValueTab({
  selectedTemplate,
  className = '',
  // NEW: Public mode props
  isPublic = false,
  publicTemplateData
}: MyHomeValueTabProps) {
  const { user } = useAuth();
  const { getTemplateSync } = useEfficientTemplates();
  
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
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  };
  
  // Helper function to get font size
  const getFontSize = (size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl') => {
    if (typeof typography.fontSize === 'object') {
      return typography.fontSize[size];
    }
    // Fallback sizes if fontSize is a number
    const fallbackSizes = {
      xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24
    };
    return fallbackSizes[size];
  };
  
  const content = templateData?.template?.content || {
    headline: 'My Home Value',
    subheadline: 'Get an instant estimate of your home\'s current market value',
    ctaText: 'Get Home Value',
    ctaSecondary: 'Advanced Search'
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
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-gray-300',
      outline: selectedTemplate === 'template2'
        ? 'border-2 px-6 py-3 rounded-lg font-medium transition-all duration-200'
        : 'border-2 px-6 py-3 rounded-lg font-medium transition-all duration-200',
      ghost: selectedTemplate === 'template2'
        ? 'px-4 py-2 rounded-lg font-medium transition-all duration-200'
        : 'px-4 py-2 rounded-lg font-medium transition-all duration-200'
    },
    card: {
      container: 'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200',
      header: 'px-6 py-4 border-b border-gray-200',
      body: 'px-6 py-4',
      footer: 'px-6 py-4 border-t border-gray-200 bg-gray-50'
    },
    heading: {
      h1: 'text-3xl font-bold text-gray-900 mb-4',
      h2: 'text-2xl font-bold text-gray-900 mb-3',
      h3: 'text-xl font-semibold text-gray-900 mb-2',
      h4: 'text-lg font-semibold text-gray-900 mb-2',
      h5: 'text-base font-semibold text-gray-900 mb-2',
      h6: 'text-sm font-semibold text-gray-900 mb-1'
    },
    body: {
      large: 'text-lg text-gray-700 leading-relaxed',
      base: 'text-base text-gray-700 leading-relaxed',
      small: 'text-sm text-gray-600 leading-relaxed',
      xs: 'text-xs text-gray-500 leading-normal'
    },
    icon: {
      primary: selectedTemplate === 'template2' 
        ? 'w-12 h-12 rounded-lg flex items-center justify-center mb-4'
        : 'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
      secondary: 'w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3',
      small: selectedTemplate === 'template2'
        ? 'w-8 h-8 rounded-lg flex items-center justify-center'
        : 'w-8 h-8 rounded-lg flex items-center justify-center'
    },
    input: {
      base: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01bcc6] focus:border-transparent',
      error: 'w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
    }
  };
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
    input: { 
      ...defaultClasses.input, 
      ...(safeTemplateClasses?.input || {}) 
    }
  };
  const [address, setAddress] = useState('');
  const [showIframe, setShowIframe] = useState(false);
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);

  const handleGetEstimate = () => {
    // Simulate getting an estimate
    setEstimatedValue(450000);
    setShowIframe(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div 
      className={`w-full ${className}`}
      style={{ fontFamily: typography.fontFamily }}
    >
      {/* Header */}
      <div 
        className={`${classes.card.header}`}
        style={{ borderBottomColor: colors.border }}
      >
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
          {content.subheadline}
        </p>
      </div>

      {!showIframe ? (
        <>
          {/* Search Form */}
          <div 
            className={`${classes.card.container} mb-8`}
            style={{ 
              backgroundColor: colors.background,
              borderColor: colors.border,
              borderRadius: `${layout.borderRadius}px`
            }}
          >
            <div className={`${classes.card.body}`}>
              <div className="mb-6">
                <label 
                  className={`${classes.body.small} font-medium block mb-2`}
                  style={{ color: colors.text }}
                >
                  Property Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your property address"
                  className={`${classes.input.base}`}
                  style={{ 
                    borderColor: colors.border,
                    borderRadius: `${layout.borderRadius}px`
                  }}
                />
              </div>

              <div 
                className="flex flex-col sm:flex-row"
                style={{ gap: `${layout.padding.medium}px` }}
              >
                <button
                  onClick={handleGetEstimate}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: `${layout.spacing}px`,
                    padding: `${layout.padding.medium}px ${layout.padding.large}px`,
                    backgroundColor: `${colors.primary} !important`,
                    color: `${colors.background} !important`,
                    border: `none !important`,
                    borderRadius: `${layout.borderRadius}px`,
                    fontSize: getFontSize('base'),
                    fontWeight: typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${colors.primary}dd`;
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary;
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <Icon name="search" size={20} color={colors.background} />
                  <span>{content.ctaText}</span>
                </button>
                
                <button
                  onClick={() => setShowIframe(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: `${layout.spacing}px`,
                    padding: `${layout.padding.medium}px ${layout.padding.large}px`,
                    backgroundColor: `${colors.background} !important`,
                    color: `${colors.text} !important`,
                    border: `1px solid ${colors.border} !important`,
                    borderRadius: `${layout.borderRadius}px`,
                    fontSize: getFontSize('base'),
                    fontWeight: typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${colors.border}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.background;
                  }}
                >
                  <Icon name="externalLink" size={20} color={colors.text} />
                  <span>{content.ctaSecondary}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className={`${classes.card.container}`}>
              <div className={`${classes.card.body}`}>
                <div className={`${classes.icon.primary}`}>
                  <Icon name="home" size={24} color={colors.primary} />
                </div>
                <h3 className={`${classes.heading.h5}`}>
                  Instant Estimates
                </h3>
                <p className={`${classes.body.small}`}>
                  Get immediate property value estimates using advanced algorithms
                </p>
              </div>
            </div>

            <div className={`${classes.card.container}`}>
              <div className={`${classes.card.body}`}>
                <div className={`${classes.icon.primary}`}>
                  <Icon name="trendingUp" size={24} color={colors.primary} />
                </div>
                <h3 className={`${classes.heading.h5}`}>
                  Market Trends
                </h3>
                <p className={`${classes.body.small}`}>
                  View historical data and market trends for your area
                </p>
              </div>
            </div>

            <div className={`${classes.card.container}`}>
              <div className={`${classes.card.body}`}>
                <div className={`${classes.icon.primary}`}>
                  <Icon name="mapPin" size={24} color={colors.primary} />
                </div>
                <h3 className={`${classes.heading.h5}`}>
                  Local Insights
                </h3>
                <p className={`${classes.body.small}`}>
                  Compare with similar properties in your neighborhood
                </p>
              </div>
            </div>
          </div>

          {/* Information Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${classes.card.container}`}>
              <div className={`${classes.card.header}`}>
                <h3 className={`${classes.heading.h4}`}>
                  How It Works
                </h3>
              </div>
              <div className={`${classes.card.body}`}>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className={`${classes.icon.small}`}>
                      <span className="text-sm font-bold text-gray-600">1</span>
                    </div>
                    <div>
                      <h4 className={`${classes.heading.h6}`}>Enter Address</h4>
                      <p className={`${classes.body.small}`}>Provide your property address</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className={`${classes.icon.small}`}>
                      <span className="text-sm font-bold text-gray-600">2</span>
                    </div>
                    <div>
                      <h4 className={`${classes.heading.h6}`}>Analysis</h4>
                      <p className={`${classes.body.small}`}>Our system analyzes market data</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className={`${classes.icon.small}`}>
                      <span className="text-sm font-bold text-gray-600">3</span>
                    </div>
                    <div>
                      <h4 className={`${classes.heading.h6}`}>Get Results</h4>
                      <p className={`${classes.body.small}`}>Receive your home value estimate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${classes.card.container}`}>
              <div className={`${classes.card.header}`}>
                <h3 className={`${classes.heading.h4}`}>
                  Important Notes
                </h3>
              </div>
              <div className={`${classes.card.body}`}>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Icon name="info" size={20} className="text-[#01bcc6] mt-0.5" />
                    <p className={`${classes.body.small}`}>
                      Estimates are based on public records and comparable sales
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Icon name="info" size={20} className="text-[#01bcc6] mt-0.5" />
                    <p className={`${classes.body.small}`}>
                      For accurate pricing, consult with a real estate professional
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Icon name="info" size={20} className="text-[#01bcc6] mt-0.5" />
                    <p className={`${classes.body.small}`}>
                      Values can vary based on property condition and market changes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Results View */
        <div className={`${classes.card.container}`}>
          <div className={`${classes.card.header}`}>
            <div className="flex items-center justify-between">
              <h3 className={`${classes.heading.h3}`}>
                Home Value Estimate
              </h3>
              <button
                onClick={() => setShowIframe(false)}
                style={{
                  padding: `${layout.padding.small}px`,
                  backgroundColor: 'transparent',
                  color: colors.textSecondary,
                  border: 'none',
                  borderRadius: `${layout.borderRadius}px`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${colors.border}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon name="close" size={20} color={colors.textSecondary} />
              </button>
            </div>
          </div>
          
          <div className={`${classes.card.body}`}>
            {estimatedValue ? (
              <div className="text-center">
                <div className="mb-6">
                  <h4 className={`${classes.heading.h2} text-green-600`}>
                    {formatCurrency(estimatedValue)}
                  </h4>
                  <p className={`${classes.body.base}`}>
                    Estimated Market Value
                  </p>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-6 mb-6">
                  <h5 className={`${classes.heading.h5} mb-4`}>
                    Property Details
                  </h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Address:</span>
                      <p className="font-medium">{address || '123 Main St, City, State'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Property Type:</span>
                      <p className="font-medium">Single Family</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Bedrooms:</span>
                      <p className="font-medium">3</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Bathrooms:</span>
                      <p className="font-medium">2</p>
                    </div>
                  </div>
                </div>

                <div 
                  className="flex flex-col sm:flex-row"
                  style={{ gap: `${layout.padding.medium}px` }}
                >
                  <button 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: `${layout.spacing}px`,
                      padding: `${layout.padding.medium}px ${layout.padding.large}px`,
                      backgroundColor: `${colors.primary} !important`,
                      color: `${colors.background} !important`,
                      border: `none !important`,
                      borderRadius: `${layout.borderRadius}px`,
                      fontSize: getFontSize('base'),
                      fontWeight: typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon name="download" size={20} color={colors.background} />
                    <span>Download Report</span>
                  </button>
                  <button 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: `${layout.spacing}px`,
                      padding: `${layout.padding.medium}px ${layout.padding.large}px`,
                      backgroundColor: `${colors.background} !important`,
                      color: `${colors.primary} !important`,
                      border: `1px solid ${colors.primary} !important`,
                      borderRadius: `${layout.borderRadius}px`,
                      fontSize: getFontSize('base'),
                      fontWeight: typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon name="share" size={20} color={colors.primary} />
                    <span>Share Results</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon name="home" size={48} className="text-gray-400 mx-auto mb-4" />
                <h4 className={`${classes.heading.h4} text-gray-600 mb-2`}>
                  Property Search
                </h4>
                <p className={`${classes.body.base} text-gray-500 mb-4`}>
                  Enter your property address to get an instant home value estimate
                </p>
                <button
                  onClick={() => setShowIframe(false)}
                  style={{
                    padding: `${layout.padding.medium}px ${layout.padding.large}px`,
                    backgroundColor: `${colors.primary} !important`,
                    color: `${colors.background} !important`,
                    border: `none !important`,
                    borderRadius: `${layout.borderRadius}px`,
                    fontSize: getFontSize('base'),
                    fontWeight: typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Back to Search
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}