'use client';

import React, { useState, useCallback } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import SuperAdminStatsManager from '@/components/analytics/SuperAdminStatsManager';
import { icons } from '@/components/ui/Icon';

export default function SuperAdminStatsPage() {
  const [customBreadcrumbItems, setCustomBreadcrumbItems] = useState<Array<{
    label: string;
    href?: string;
    icon?: keyof typeof icons;
    isLoading?: boolean;
    onClick?: () => void;
  }> | undefined>(undefined);

  const handleBreadcrumbUpdate = useCallback((items: Array<{
    label: string;
    href?: string;
    icon?: keyof typeof icons;
    isLoading?: boolean;
    onClick?: () => void;
  }> | undefined) => {
    setCustomBreadcrumbItems(items);
  }, []);

  return (
    <RouteGuard allowedRoles={['super_admin']}>
      <DashboardLayout 
        showBreadcrumb={true}
        breadcrumbVariant="default"
        breadcrumbSize="md"
        customBreadcrumbItems={customBreadcrumbItems}
      >
        <SuperAdminStatsManager onBreadcrumbUpdate={handleBreadcrumbUpdate} />
      </DashboardLayout>
    </RouteGuard>
  );
}
