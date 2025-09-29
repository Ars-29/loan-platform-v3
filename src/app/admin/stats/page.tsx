import React from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ConversionStatsDashboard from '@/components/analytics/ConversionStatsDashboard';

export default function AdminStatsPage() {
  return (
    <RouteGuard allowedRoles={['company_admin']}>
      <DashboardLayout 
        title="Conversion Statistics" 
        subtitle="Detailed analytics and conversion metrics for your loan officers"
        showBackButton={true}
      >
        <ConversionStatsDashboard />
      </DashboardLayout>
    </RouteGuard>
  );
}
