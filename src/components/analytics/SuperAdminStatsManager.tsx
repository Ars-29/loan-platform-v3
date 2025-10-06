'use client';

import React, { useState, useEffect, useMemo } from 'react';
import CompanyStatsSelector from './CompanyStatsSelector';
import ConversionStatsDashboard from './ConversionStatsDashboard';
import { icons } from '@/components/ui/Icon';

interface SuperAdminStatsManagerProps {
  onBreadcrumbUpdate?: (items: Array<{
    label: string;
    href?: string;
    icon?: keyof typeof icons;
    isLoading?: boolean;
    onClick?: () => void;
  }> | undefined) => void;
}

const SuperAdminStatsManager: React.FC<SuperAdminStatsManagerProps> = ({ onBreadcrumbUpdate }) => {
  const [selectedCompany, setSelectedCompany] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleCompanySelect = (companyId: string, companyName: string) => {
    setSelectedCompany({ id: companyId, name: companyName });
  };

  // Back to companies functionality removed - users can click "Conversion Stats" in breadcrumb

  // Reset selected company when component mounts to ensure clean state
  useEffect(() => {
    setSelectedCompany(null);
  }, []);

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (href: string) => {
    if (href === '/super-admin/stats') {
      // Local navigation - go back to company selection
      setSelectedCompany(null);
    }
    // For other hrefs, let the default navigation handle it
  };

  // Memoize breadcrumb items to prevent infinite re-renders
  const customBreadcrumbItems = useMemo(() => {
    if (!selectedCompany) return undefined;
    
    return [
      {
        label: 'Dashboard',
        href: '/super-admin/dashboard',
        icon: 'home' as keyof typeof icons
      },
      {
        label: 'Conversion Stats',
        href: '/super-admin/stats',
        icon: 'calculator' as keyof typeof icons,
        onClick: () => handleBreadcrumbClick('/super-admin/stats')
      },
      {
        label: selectedCompany.name,
        icon: 'building' as keyof typeof icons
      }
    ];
  }, [selectedCompany]);

  // Update breadcrumb when company selection changes
  useEffect(() => {
    if (onBreadcrumbUpdate) {
      onBreadcrumbUpdate(customBreadcrumbItems);
    }
  }, [selectedCompany, onBreadcrumbUpdate]);

  if (selectedCompany) {
    return (
      <ConversionStatsDashboard
        companyId={selectedCompany.id}
        isSuperAdmin={true}
        selectedCompanyName={selectedCompany.name}
      />
    );
  }

  return (
    <CompanyStatsSelector onCompanySelect={handleCompanySelect} />
  );
};

export default SuperAdminStatsManager;
