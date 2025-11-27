'use client';

import React, { useState, lazy, Suspense, useEffect } from 'react';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { useAuth } from '@/hooks/use-auth';
import { icons } from '@/components/ui/Icon';

// Lazy load heavy components
const MortgageRateComparison = lazy(() => import('./mortgage/MortgageRateComparison'));

// Import lightweight tab components
import {
  TodaysRatesTab,
  DocumentChecklistTab,
  ApplyNowTab,
  MyHomeValueTab,
  FindMyHomeTab,
  LearningCenterTab,
  NeighborhoodReportsTab
} from './tabs';

export type TabId = 
  | 'todays-rates'
  | 'get-custom-rate'
  | 'document-checklist'
  | 'apply-now'
  | 'my-home-value'
  | 'find-my-home'
  | 'learning-center'
  | 'neighborhood-reports';

// Loading component for heavy tabs
const TabLoadingSkeleton = React.memo(({ selectedTemplate }: { selectedTemplate: 'template1' | 'template2' }) => {
  return (
    <div className={`bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 min-h-[600px] flex flex-col gap-4`}>
      <div className={`h-8 bg-gray-200 rounded-lg animate-pulse`} />
      <div className={`h-24 bg-gray-200 rounded-lg animate-pulse`} />
      <div className={`h-16 bg-gray-200 rounded-lg animate-pulse`} />
      <div className={`h-12 bg-gray-200 rounded-lg animate-pulse`} />
    </div>
  );
});

TabLoadingSkeleton.displayName = 'TabLoadingSkeleton';

interface Tab {
  id: TabId;
  label: string;
  icon: keyof typeof import('@/components/ui/Icon').icons;
  description: string;
}

interface LandingPageTabsProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
  selectedTemplate: 'template1' | 'template2';
  className?: string;
  // Template customization data for instant updates
  templateCustomization?: {
    bodyModifications?: {
      enabledTabs?: string[];
      activeTab?: string;
    };
  };
  // Public mode props
  isPublic?: boolean;
  publicTemplateData?: any;
  // User context props for lead submission
  userId?: string;
  companyId?: string;
  // Layout props
  hideTabNavigation?: boolean; // Hide the tab navigation (for sidebar layout)
  // Force mobile view (for customizer mobile preview)
  forceMobileView?: boolean;
}

const tabs: Tab[] = [
  {
    id: 'todays-rates',
    label: "Today's Rates",
    icon: 'rates',
    description: 'Current mortgage rates and market trends'
  },
  {
    id: 'get-custom-rate',
    label: 'Get My Custom Rate',
    icon: 'custom',
    description: 'Get personalized rate quotes'
  },
  {
    id: 'document-checklist',
    label: 'Document Checklist',
    icon: 'apply',
    description: 'Required documents for your loan'
  },
  {
    id: 'apply-now',
    label: 'Apply Now',
    icon: 'applyNow',
    description: 'Start your loan application'
  },
  {
    id: 'my-home-value',
    label: 'My Home Value',
    icon: 'home',
    description: 'Estimate your property value'
  },
  {
    id: 'find-my-home',
    label: 'Find My Home',
    icon: 'home',
    description: 'Search for properties'
  },
  {
    id: 'learning-center',
    label: 'Learning Center',
    icon: 'about',
    description: 'Educational resources and guides'
  },
  {
    id: 'neighborhood-reports',
    label: 'Neighborhood Reports',
    icon: 'location',
    description: 'Neighborhood insights and market trends'
  }
];

export default function LandingPageTabs({
  activeTab,
  onTabChange,
  selectedTemplate,
  className = '',
  templateCustomization,
  // Public mode props
  isPublic = false,
  publicTemplateData,
  // User context props
  userId,
  companyId,
  // Layout props
  hideTabNavigation = false,
  // Force mobile view
  forceMobileView = false
}: LandingPageTabsProps) {
  const { user } = useAuth();
  const { getTemplateSync } = useEfficientTemplates();
  
  // Template data fetching - support both public and auth modes
  const templateData = isPublic && publicTemplateData 
    ? publicTemplateData 
    : getTemplateSync(selectedTemplate);

  // Get enabled tabs from customization or use all tabs
  const enabledTabs = templateCustomization?.bodyModifications?.enabledTabs || tabs.map(tab => tab.id);
  const filteredTabs = tabs.filter(tab => enabledTabs.includes(tab.id));
  
  // Get active tab from customization or use prop
  const effectiveActiveTab = templateCustomization?.bodyModifications?.activeTab || activeTab;

  // Debug template customization
  React.useEffect(() => {
    console.log('🔄 LandingPageTabs: Template customization updated:', {
      templateCustomization,
      enabledTabs,
      effectiveActiveTab,
      timestamp: new Date().toISOString()
    });
  }, [templateCustomization, enabledTabs, effectiveActiveTab]);

  
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
    headline: 'Mortgage Solutions',
    subheadline: 'Find the perfect loan for your needs',
    ctaText: 'Get Started',
    ctaSecondary: 'Learn More'
  };
  
  const layout = templateData?.template?.layout || {
    alignment: 'center',
    spacing: 18,
    borderRadius: 8,
    padding: { small: 8, medium: 16, large: 24, xlarge: 32 }
  };
  
  const classes = templateData?.template?.classes || {
    button: {
      primary: 'px-6 py-3 font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 font-medium transition-all duration-200 border border-gray-300'
    },
    card: {
      container: 'bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200'
    },
    navigation: {
      container: 'flex flex-wrap gap-2 p-4',
      tab: {
        base: 'px-4 py-2 font-medium transition-all duration-200 cursor-pointer',
        inactive: 'text-gray-600 hover:text-gray-800 hover:bg-gray-100',
        active: 'text-white shadow-md',
        hover: 'hover:bg-opacity-10'
      }
    }
  };
  
  const renderTabContent = () => {
    switch (effectiveActiveTab) {
      case 'todays-rates':
        return <TodaysRatesTab 
          selectedTemplate={selectedTemplate} 
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
          userId={userId}
          companyId={companyId}
        />;
      
      case 'get-custom-rate':
        return (
          <Suspense fallback={<TabLoadingSkeleton selectedTemplate={selectedTemplate} />}>
            <MortgageRateComparison 
              showHeader={false} 
              showFooter={false}
              className="bg-transparent"
              template={selectedTemplate}
              isPublic={isPublic}
              publicTemplateData={publicTemplateData}
              userId={userId}
              companyId={companyId}
            />
          </Suspense>
        );
      
      case 'document-checklist':
        return <DocumentChecklistTab 
          selectedTemplate={selectedTemplate} 
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
        />;
      
      case 'apply-now':
        return <ApplyNowTab 
          selectedTemplate={selectedTemplate} 
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
        />;
      
      case 'my-home-value':
        return <MyHomeValueTab 
          selectedTemplate={selectedTemplate} 
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
        />;
      
      case 'find-my-home':
        return <FindMyHomeTab 
          selectedTemplate={selectedTemplate} 
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
        />;
      
      case 'learning-center':
        return <LearningCenterTab 
          selectedTemplate={selectedTemplate} 
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
        />;
      
      case 'neighborhood-reports':
        return <NeighborhoodReportsTab 
          selectedTemplate={selectedTemplate} 
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
        />;
      
      default:
        return <TodaysRatesTab 
          selectedTemplate={selectedTemplate} 
          isPublic={isPublic}
          publicTemplateData={publicTemplateData}
          userId={userId}
          companyId={companyId}
        />;
    }
  };

  return (
    <div 
      className={`${className}`}
      style={{ 
        fontFamily: typography.fontFamily
      }}
    >
      {/* Modern Tab Navigation - Only show if not hidden */}
      {!hideTabNavigation && (
        <div className="relative">
        {/* Enhanced background using template colors */}
        <div 
          className={`absolute inset-0 shadow-inner w-full mx-auto`}
          style={{
            background: `linear-gradient(to right, ${colors.primary}10, ${colors.primary}05, ${colors.primary}10)`,
            paddingLeft: '1rem',
            paddingRight: '1rem',
            borderTopLeftRadius: `${layout.borderRadius}px`,
            borderTopRightRadius: `${layout.borderRadius}px`
          }}
        />
        
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5 max-w-7xl mx-auto" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '20px 20px',
            color: colors.border,
            paddingLeft: '1rem',
            paddingRight: '1rem',
            borderTopLeftRadius: `${layout.borderRadius}px`,
            borderTopRightRadius: `${layout.borderRadius}px`
          }}
        />
        
        {/* Scrollable Tab Container */}
        <div className="relative">
          {/* Scrollable Tab Navigation */}
          <div className="relative max-w-7xl mx-auto px-4">
            <nav 
              className="overflow-x-auto overflow-y-hidden scrollbar-rounded gap-2 @sm:gap-3"
              style={{ 
                display: 'flex',
                flexWrap: 'nowrap',
                alignItems: 'center',
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                minHeight: '70px'
              }}
            >
            {filteredTabs.map((tab, index) => {
              const isActive = effectiveActiveTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    relative flex-shrink-0 flex items-center justify-center space-x-1.5 @sm:space-x-3 px-2 @sm:px-4 py-3 rounded-xl
                    transition-all duration-300 ease-out transform
                    backdrop-blur-sm border shadow-sm
                    hover:shadow-lg active:scale-95
                    group font-medium whitespace-nowrap
                  `}
                  title={tab.description}
                  style={{
                    backdropFilter: 'blur(10px)',
                    borderRadius: `${layout.borderRadius}px`,
                    backgroundColor: isActive ? colors.primary : colors.background,
                    color: isActive ? colors.background : colors.text,
                    borderColor: isActive ? colors.primary : colors.border,
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                    fontWeight: typography.fontWeight.medium,
                    boxShadow: isActive ? `0 4px 12px ${colors.primary}30` : '0 2px 4px rgba(0,0,0,0.1)',
                    margin: `${layout.padding.small}px 0`
                  }}
                >
                  {/* Enhanced active indicator */}
                  {isActive && (
                    <>
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full shadow-lg transition-all duration-300 ease-out" style={{ backgroundColor: colors.primary, boxShadow: `0 0 20px ${colors.primary}50` }} />
                    </>
                  )}
                  
                  {/* Icon with glow effect */}
                  <div className={`relative ${
                    isActive ? 'drop-shadow-lg' : ''
                  }`}>
                    {React.createElement(icons[tab.icon], { 
                      size: undefined,
                      color: isActive ? colors.background : colors.primary,
                      className: `${isActive ? 'drop-shadow-sm' : 'transition-colors duration-200'} w-3 h-3 @[20rem]:w-4 @[20rem]:h-4 @[48rem]:w-5 @[48rem]:h-5`
                    })}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full opacity-20 blur-sm" style={{ backgroundColor: colors.primary }} />
                    )}
                  </div>
                  
                  {/* Label */}
                  <span 
                    className="text-xs @sm:text-sm font-medium whitespace-nowrap transition-all duration-200 drop-shadow-sm"
                    style={{
                      color: isActive ? colors.background : colors.textSecondary,
                      fontWeight: typography.fontWeight.medium
                    }}
                  >
                    {tab.label}
                  </span>
                  
                  {/* Hover effect overlay */}
                  <div 
                    className="absolute inset-0 rounded-xl transition-opacity duration-200 opacity-0 hover:opacity-100"
                    style={{
                      background: `linear-gradient(to right, ${colors.primary}20, ${colors.secondary}20)`
                    }}
                  />
                  
                  {/* Ripple effect on click */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 rounded-full opacity-0 scale-0 transition-all duration-500 ease-out" 
                    style={{
                      backgroundColor: colors.primary,
                      transform: 'scale(0)',
                      opacity: 0,
                    }}
                    onAnimationEnd={(e) => {
                      e.currentTarget.style.transform = 'scale(0)';
                      e.currentTarget.style.opacity = '0';
                    }}
                    />
                  </div>
                  
                </button>
              );
            })}
          </nav>
          </div>
        </div>
        
        
        </div>
      )}

      {/* Tab Content */}
      <div
        className={`w-full mx-auto ${
          forceMobileView
            ? ''
              : 'md:min-w-[800px] md:max-w-7xl overflow-x-auto'
        }`}
      >
        <div 
          className={`bg-white shadow-xl ${
            forceMobileView || selectedTemplate === 'template2' ? '' : 'overflow-x-auto'
          } ${hideTabNavigation ? 'rounded-2xl' : 'rounded-b-2xl'}`}
          style={{ 
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderRadius: hideTabNavigation 
              ? `${layout.borderRadius}px` 
              : `0 0 ${layout.borderRadius}px ${layout.borderRadius}px`,
            
            minHeight: '800px',
            boxShadow: `0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
          }}
        >
          <div 
            className="p-4"
            style={{ 
              padding: `${layout.padding.medium}px`
            }}
          >
            <div className="space-y-8">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
