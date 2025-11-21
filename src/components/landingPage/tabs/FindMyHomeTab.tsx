'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { useAuth } from '@/hooks/use-auth';
import Icon from '@/components/ui/Icon';

interface FindMyHomeTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
  // NEW: Public mode props
  isPublic?: boolean;
  publicTemplateData?: any;
}

export default function FindMyHomeTab({
  selectedTemplate,
  className = '',
  // NEW: Public mode props
  isPublic = false,
  publicTemplateData
}: FindMyHomeTabProps) {
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
    headline: 'Find My Home',
    subheadline: 'Search for your perfect home with our advanced property finder',
    ctaText: 'Search Homes',
    ctaSecondary: 'Map View'
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
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 font-medium transition-all duration-200 border border-gray-300',
      outline: selectedTemplate === 'template2'
        ? 'border-2 px-6 py-3 font-medium transition-all duration-200'
        : 'border-2 px-6 py-3 font-medium transition-all duration-200',
      ghost: selectedTemplate === 'template2'
        ? 'px-4 py-2 font-medium transition-all duration-200'
        : 'px-4 py-2 font-medium transition-all duration-200'
    },
    card: {
      container: 'bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200',
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
        ? 'w-12 h-12 flex items-center justify-center mb-4'
        : 'w-12 h-12 flex items-center justify-center mb-4',
      secondary: 'w-10 h-10 bg-gray-100 flex items-center justify-center mb-3',
      small: selectedTemplate === 'template2'
        ? 'w-8 h-8 flex items-center justify-center'
        : 'w-8 h-8 flex items-center justify-center'
    },
    input: {
      base: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01bcc6] focus:border-transparent',
      error: 'w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent'
    },
    select: {
      base: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#01bcc6] focus:border-transparent bg-white',
      error: 'w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white'
    },
    status: {
      success: 'text-green-600 bg-green-50 px-2 py-1 rounded text-sm',
      warning: 'text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-sm',
      error: 'text-red-600 bg-red-50 px-2 py-1 rounded text-sm',
      info: 'text-[#01bcc6] bg-[#01bcc6]/10 px-2 py-1 rounded text-sm'
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
  const [idxWidgetLoaded, setIdxWidgetLoaded] = useState(false);

  useEffect(() => {
    // Check if IDX widget script is already loaded
    if (typeof window !== 'undefined' && document.getElementById('idxwidgetsrc-122191')) {
      setIdxWidgetLoaded(true);
    }
  }, []);

  const handleScriptLoad = () => {
    setIdxWidgetLoaded(true);
  };

  // Stub variables for legacy code (never executed, kept for reference)
  const searchCriteria: any = {};
  const handleInputChange = (_field: string, _value: string) => {};
  const handleSearch = () => {};
  const setShowIframe = (_show: boolean) => {};

  return (
    <div 
      className={`w-full ${className}`}
      style={{ fontFamily: typography.fontFamily }}
    >
      {/* IDX Widget Script */}
      <Script
        id="idxwidgetsrc-122191"
        charSet="UTF-8"
        type="text/javascript"
        src="//syncly360.idxbroker.com/idx/widgets/122191"
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
      />

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

      {/* IDX Widget Container */}
      <div 
        className="w-full mt-6"
        style={{ 
          minHeight: '600px',
          borderRadius: `${layout.borderRadius}px`,
          overflow: 'hidden',
          backgroundColor: colors.background
        }}
      >
        <div 
          id="idxwidget-122191" 
          className="w-full"
          style={{
            minHeight: '600px',
            width: '100%'
          }}
        >
          {!idxWidgetLoaded && (
            <div className="flex items-center justify-center py-12" style={{ minHeight: '600px' }}>
              <div className="text-center">
                <div 
                  className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
                  style={{ borderColor: colors.primary }}
                ></div>
                <p style={{ color: colors.textSecondary }}>Loading property search...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global styles for IDX widget to ensure proper rendering */}
      <style jsx global>{`
        #idxwidget-122191 {
          width: 100% !important;
          max-width: 100% !important;
        }
        #idxwidget-122191 iframe,
        #idxwidget-122191 > div {
          width: 100% !important;
          max-width: 100% !important;
        }
        /* Ensure IDX widget is responsive */
        @media (max-width: 768px) {
          #idxwidget-122191 {
            overflow-x: auto;
          }
        }
      `}</style>

      {/* Legacy Search Form - Hidden but kept for reference */}
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore - Legacy code kept for reference, never executed */}
      {false && (
        <>
          {/* Search Form */}
          <div className={`${classes.card.container} mb-8 mt-8`} style={{ borderRadius: `${layout.borderRadius}px` }}>
            <div className={`${classes.card.body}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className={`${classes.body.small} font-medium text-gray-700 mb-2 block`}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={searchCriteria.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, State or ZIP"
                    className={`${classes.input.base}`}
                    style={{
                      borderRadius: `${layout.borderRadius}px`,
                      borderColor: colors.border
                    }}
                  />
                </div>

                <div>
                  <label className={`${classes.body.small} font-medium text-gray-700 mb-2 block`}>
                    Min Price
                  </label>
                  <select
                    value={searchCriteria.priceMin}
                    onChange={(e) => handleInputChange('priceMin', e.target.value)}
                    className={`${classes.select.base}`}
                    style={{
                      borderRadius: `${layout.borderRadius}px`,
                      borderColor: colors.border
                    }}
                  >
                    <option value="">No Min</option>
                    <option value="100000">$100,000</option>
                    <option value="200000">$200,000</option>
                    <option value="300000">$300,000</option>
                    <option value="400000">$400,000</option>
                    <option value="500000">$500,000</option>
                    <option value="750000">$750,000</option>
                    <option value="1000000">$1,000,000</option>
                  </select>
                </div>

                <div>
                  <label className={`${classes.body.small} font-medium text-gray-700 mb-2 block`}>
                    Max Price
                  </label>
                  <select
                    value={searchCriteria.priceMax}
                    onChange={(e) => handleInputChange('priceMax', e.target.value)}
                    className={`${classes.select.base}`}
                    style={{
                      borderRadius: `${layout.borderRadius}px`,
                      borderColor: colors.border
                    }}
                  >
                    <option value="">No Max</option>
                    <option value="200000">$200,000</option>
                    <option value="300000">$300,000</option>
                    <option value="400000">$400,000</option>
                    <option value="500000">$500,000</option>
                    <option value="750000">$750,000</option>
                    <option value="1000000">$1,000,000</option>
                    <option value="1500000">$1,500,000</option>
                    <option value="2000000">$2,000,000+</option>
                  </select>
                </div>

                <div>
                  <label className={`${classes.body.small} font-medium text-gray-700 mb-2 block`}>
                    Bedrooms
                  </label>
                  <select
                    value={searchCriteria.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                    className={`${classes.select.base}`}
                    style={{
                      borderRadius: `${layout.borderRadius}px`,
                      borderColor: colors.border
                    }}
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>

                <div>
                  <label className={`${classes.body.small} font-medium text-gray-700 mb-2 block`}>
                    Bathrooms
                  </label>
                  <select
                    value={searchCriteria.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                    className={`${classes.select.base}`}
                    style={{
                      borderRadius: `${layout.borderRadius}px`,
                      borderColor: colors.border
                    }}
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="1.5">1.5+</option>
                    <option value="2">2+</option>
                    <option value="2.5">2.5+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                <div>
                  <label className={`${classes.body.small} font-medium text-gray-700 mb-2 block`}>
                    Property Type
                  </label>
                  <select
                    value={searchCriteria.propertyType}
                    onChange={(e) => handleInputChange('propertyType', e.target.value)}
                    className={`${classes.select.base}`}
                    style={{
                      borderRadius: `${layout.borderRadius}px`,
                      borderColor: colors.border
                    }}
                  >
                    <option value="all">All Types</option>
                    <option value="single-family">Single Family</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="multi-family">Multi-Family</option>
                    <option value="land">Land</option>
                  </select>
                </div>
              </div>

              <div 
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                style={{ gap: `${layout.padding.medium}px` }}
              >
                <button
                  onClick={handleSearch}
                  className="flex items-center justify-center gap-3 px-8 py-4 font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.background,
                    borderColor: colors.primary,
                    borderRadius: `${layout.borderRadius}px`,
                    border: 'none',
                    fontFamily: typography.fontFamily,
                    fontSize: getFontSize('base'),
                    fontWeight: typography.fontWeight.semibold,
                    minWidth: '160px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.secondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary;
                  }}
                >
                  <Icon name="search" size={20} color={colors.background} />
                  <span>Search Home</span>
                </button>
                
                <button
                  onClick={() => setShowIframe(true)}
                  className="flex items-center justify-center gap-3 px-8 py-4 font-semibold transition-all duration-300 transform hover:scale-105 border-2 hover:shadow-lg"
                  style={{
                    backgroundColor: colors.background,
                    color: colors.primary,
                    borderColor: colors.primary,
                    borderRadius: `${layout.borderRadius}px`,
                    fontFamily: typography.fontFamily,
                    fontSize: getFontSize('base'),
                    fontWeight: typography.fontWeight.semibold,
                    minWidth: '160px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '10';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.background;
                  }}
                >
                  <Icon name="map" size={20} color={colors.primary} />
                  <span>{content.ctaSecondary}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className={`${classes.card.container}`} style={{ borderRadius: `${layout.borderRadius}px` }}>
              <div className={`${classes.card.body}`}>
                <div className={`${classes.icon.primary}`}>
                  <Icon name="search" size={24} color={colors.primary} />
                </div>
                <h3 className={`${classes.heading.h5}`}>
                  Advanced Search
                </h3>
                <p className={`${classes.body.small}`}>
                  Filter by price, location, size, and property type
                </p>
              </div>
            </div>

            <div className={`${classes.card.container}`} style={{ borderRadius: `${layout.borderRadius}px` }}>
              <div className={`${classes.card.body}`}>
                <div className={`${classes.icon.primary}`}>
                  <Icon name="map" size={24} color={colors.primary} />
                </div>
                <h3 className={`${classes.heading.h5}`}>
                  Interactive Maps
                </h3>
                <p className={`${classes.body.small}`}>
                  Explore neighborhoods with detailed map views
                </p>
              </div>
            </div>

            <div className={`${classes.card.container}`} style={{ borderRadius: `${layout.borderRadius}px` }}>
              <div className={`${classes.card.body}`}>
                <div className={`${classes.icon.primary}`}>
                  <Icon name="heart" size={24} color={colors.primary} />
                </div>
                <h3 className={`${classes.heading.h5}`}>
                  Save Favorites
                </h3>
                <p className={`${classes.body.small}`}>
                  Save properties you love and compare them easily
                </p>
              </div>
            </div>
          </div>

          {/* Information Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${classes.card.container}`} style={{ borderRadius: `${layout.borderRadius}px` }}>
              <div className={`${classes.card.header}`}>
                <h3 className={`${classes.heading.h4}`}>
                  Search Tips
                </h3>
              </div>
              <div className={`${classes.card.body}`}>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className={`${classes.icon.small}`}>
                      <span className="text-sm font-bold text-gray-600">1</span>
                    </div>
                    <div>
                      <h4 className={`${classes.heading.h6}`}>Set Your Budget</h4>
                      <p className={`${classes.body.small}`}>Determine your price range before searching</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className={`${classes.icon.small}`}>
                      <span className="text-sm font-bold text-gray-600">2</span>
                    </div>
                    <div>
                      <h4 className={`${classes.heading.h6}`}>Choose Location</h4>
                      <p className={`${classes.body.small}`}>Consider commute time and neighborhood amenities</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className={`${classes.icon.small}`}>
                      <span className="text-sm font-bold text-gray-600">3</span>
                    </div>
                    <div>
                      <h4 className={`${classes.heading.h6}`}>Define Needs</h4>
                      <p className={`${classes.body.small}`}>List must-have features vs. nice-to-have features</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${classes.card.container}`} style={{ borderRadius: `${layout.borderRadius}px` }}>
              <div className={`${classes.card.header}`}>
                <h3 className={`${classes.heading.h4}`}>
                  Market Insights
                </h3>
              </div>
              <div className={`${classes.card.body}`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`${classes.body.small}`}>Average Home Price</span>
                    <span className={`${classes.body.base} font-semibold`}>$425,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`${classes.body.small}`}>Days on Market</span>
                    <span className={`${classes.body.base} font-semibold`}>28 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`${classes.body.small}`}>Price per Sq Ft</span>
                    <span className={`${classes.body.base} font-semibold`}>$185</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`${classes.body.small}`}>Market Trend</span>
                    <span className={`${classes.status.success}`}>Rising</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}