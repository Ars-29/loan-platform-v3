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
  LearningCenterTab
} from './tabs';

export type TabId = 
  | 'todays-rates'
  | 'get-custom-rate'
  | 'document-checklist'
  | 'apply-now'
  | 'my-home-value'
  | 'find-my-home'
  | 'learning-center';

// Loading component for heavy tabs
const TabLoadingSkeleton = React.memo(({ selectedTemplate }: { selectedTemplate: 'template1' | 'template2' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 min-h-[600px] flex flex-col gap-4`}>
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
  }
];

export default function LandingPageTabs({
  activeTab,
  onTabChange,
  selectedTemplate,
  className = '',
  templateCustomization
}: LandingPageTabsProps) {
  const { user } = useAuth();
  const { getTemplateSync } = useEfficientTemplates();
  const templateData = getTemplateSync(selectedTemplate);

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
      primary: 'px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-gray-300'
    },
    card: {
      container: 'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200'
    },
    navigation: {
      container: 'flex flex-wrap gap-2 p-4',
      tab: {
        base: 'px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer',
        inactive: 'text-gray-600 hover:text-gray-800 hover:bg-gray-100',
        active: 'text-white shadow-md',
        hover: 'hover:bg-opacity-10'
      }
    }
  };
  
  const renderTabContent = () => {
    switch (effectiveActiveTab) {
      case 'todays-rates':
        return <TodaysRatesTab selectedTemplate={selectedTemplate} />;
      
      case 'get-custom-rate':
        return (
          <Suspense fallback={<TabLoadingSkeleton selectedTemplate={selectedTemplate} />}>
            <MortgageRateComparison 
              showHeader={false} 
              showFooter={false}
              className="bg-transparent"
              template={selectedTemplate}
            />
          </Suspense>
        );
      
      case 'document-checklist':
        return <DocumentChecklistTab selectedTemplate={selectedTemplate} />;
      
      case 'apply-now':
        return <ApplyNowTab selectedTemplate={selectedTemplate} />;
      
      case 'my-home-value':
        return <MyHomeValueTab selectedTemplate={selectedTemplate} />;
      
      case 'find-my-home':
        return <FindMyHomeTab selectedTemplate={selectedTemplate} />;
      
      case 'learning-center':
        return <LearningCenterTab selectedTemplate={selectedTemplate} />;
      
      default:
        return <TodaysRatesTab selectedTemplate={selectedTemplate} />;
    }
  };

  return (
    <div 
      className={`${className}`}
      style={{ fontFamily: typography.fontFamily }}
    >
      {/* Modern Tab Navigation */}
      <div className="relative">
        {/* Enhanced background with subtle pattern */}
        <div 
          className="absolute inset-0 rounded-t-2xl shadow-inner"
          style={{
            background: selectedTemplate === 'template1' 
              ? 'linear-gradient(to right, #fdf2f8, #fce7f3, #fdf2f8)' 
              : 'linear-gradient(to right, #faf5ff, #f3e8ff, #faf5ff)'
          }}
        />
        
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5 rounded-t-2xl" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '20px 20px',
            color: colors.border
          }}
        />
        
        {/* Scrollable Tab Container */}
        <div className="relative">
          {/* Tab Navigation */}
          <nav 
            className={`${classes.navigation.container} overflow-x-auto scrollbar-hide`}
            style={{ 
              padding: `${layout.padding.medium}px`,
              gap: `${layout.spacing}px`
            }}
          >
            {filteredTabs.map((tab, index) => {
              const isActive = effectiveActiveTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    relative flex-shrink-0 flex items-center space-x-3 px-6 py-3 rounded-xl
                    transition-all duration-300 ease-out transform
                    backdrop-blur-sm border border-white/30
                    hover:shadow-md active:scale-95
                    group font-medium
                  `}
                  title={tab.description}
                  style={{
                    minWidth: '140px',
                    backdropFilter: 'blur(10px)',
                    borderRadius: `${layout.borderRadius}px`,
                    backgroundColor: isActive ? colors.primary : colors.background,
                    color: isActive ? colors.background : colors.text,
                    borderColor: isActive ? colors.primary : colors.border,
                    transform: isActive ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  {/* Enhanced active indicator */}
                  {isActive && (
                    <>
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full animate-pulse shadow-lg" style={{ backgroundColor: colors.primary, boxShadow: `0 0 20px ${colors.primary}50` }} />
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: `${colors.primary}80` }} />
                      <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: `${colors.primary}40`, animationDelay: '0.5s' }} />
                    </>
                  )}
                  
                  {/* Icon with glow effect */}
                  <div className={`relative ${
                    isActive ? 'drop-shadow-lg' : ''
                  }`}>
                    {React.createElement(icons[tab.icon], { 
                      size: 20, 
                      color: isActive ? colors.background : colors.primary,
                      className: isActive ? 'drop-shadow-sm' : 'transition-colors duration-200'
                    })}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full opacity-20 blur-sm" style={{ backgroundColor: colors.primary }} />
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className={`text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive ? 'text-white drop-shadow-sm' : 'text-gray-600'
                  }`}>
                    {tab.label}
                  </span>
                  
                  {/* Hover effect overlay */}
                  <div className={`absolute inset-0 rounded-xl transition-opacity duration-200 ${
                    selectedTemplate === 'template1' 
                      ? 'bg-gradient-to-r from-pink-400/20 to-pink-500/20' 
                      : 'bg-gradient-to-r from-purple-400/20 to-purple-500/20'
                  } opacity-0 hover:opacity-100`} />
                  
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
                  
                  {/* Subtle border glow for active tab */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl border-2 animate-pulse" style={{ borderColor: `${colors.primary}50` }} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Enhanced bottom border */}
        <div 
          className="h-0.5 shadow-sm"
          style={{
            background: selectedTemplate === 'template1' 
              ? 'linear-gradient(to right, transparent, #f9a8d4, transparent)' 
              : 'linear-gradient(to right, transparent, #c084fc, transparent)'
          }}
        />
      </div>

      {/* Tab Content */}
      <div 
        className={`${classes.card.container} bg-white rounded-b-2xl shadow-lg border border-t-0`}
        style={{ 
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderRadius: `0 0 ${layout.borderRadius * 2}px ${layout.borderRadius * 2}px`
        }}
      >
        {renderTabContent()}
      </div>
    </div>
  );
}
