'use client';

import React, { useState } from 'react';
import { typography } from '@/theme/theme';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { icons } from '@/components/ui/Icon';

interface Tab {
  id: string;
  label: string;
  icon: keyof typeof icons;
}

interface UnifiedNavigationTabsProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  template?: 'template1' | 'template2';
  className?: string;
  // NEW: Public mode props
  isPublic?: boolean;
  publicTemplateData?: any;
}

const defaultTabs: Tab[] = [
  { id: 'apply', label: 'Apply for Loan', icon: 'apply' },
  { id: 'custom', label: 'Get Custom Offer', icon: 'custom' },
  { id: 'rates', label: "Today's Rates", icon: 'rates' },
  { id: 'calculators', label: 'Calculators', icon: 'calculators' },
  { id: 'about', label: 'About Us', icon: 'about' }
];

export default function UnifiedNavigationTabs({
  activeTab = 'apply',
  onTabChange,
  template = 'template1',
  className = "",
  // NEW: Public mode props
  isPublic = false,
  publicTemplateData
}: UnifiedNavigationTabsProps) {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const { getTemplateSync } = useEfficientTemplates();
  
  // Template data fetching - support both public and auth modes
  const templateData = isPublic && publicTemplateData 
    ? publicTemplateData 
    : getTemplateSync(template);
  // Get layout data for border radius
  const templateLayout = templateData?.template?.layout || {
    borderRadius: 8,
    padding: { small: 8, medium: 16, large: 24 },
    spacing: 16
  };
  const colors = templateData?.template?.colors || {
    primary: '#ec4899',
    secondary: '#01bcc6',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8 overflow-x-auto">
          {defaultTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            const navStyles = templateData?.template?.classes?.navigation?.tab || {
              base: 'px-4 py-2 font-medium transition-all duration-200 cursor-pointer',
              inactive: 'text-gray-600 hover:text-gray-800 hover:bg-gray-100',
              active: 'text-white shadow-md',
              hover: 'hover:bg-opacity-10'
            };
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className="flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200"
                style={{
                  borderBottomColor: isActive ? colors.primary : 'transparent',
                  color: isActive ? colors.primary : colors.text,
                  backgroundColor: isActive ? `${colors.primary}10` : 'transparent'
                }}
              >
                {React.createElement(icons[tab.icon], { size: 18 })}
                <span className={typography.body.small}>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
