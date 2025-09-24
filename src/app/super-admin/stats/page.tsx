import React from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import SuperAdminStatsManager from '@/components/analytics/SuperAdminStatsManager';

export default function SuperAdminStatsPage() {
  return (
    <RouteGuard allowedRoles={['super_admin']}>
      <DashboardLayout 
        title="Conversion Statistics" 
        subtitle="Detailed analytics and conversion metrics across all companies"
      >
        <SuperAdminStatsManager />
      </DashboardLayout>
    </RouteGuard>
  );
}
