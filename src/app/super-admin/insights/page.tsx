import React from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import HierarchicalLeadsInsights from '@/components/analytics/HierarchicalLeadsInsights';

export default function SuperAdminInsightsPage() {
  return (
    <RouteGuard allowedRoles={['super_admin']}>
      <DashboardLayout 
        title="Leads Insights" 
        subtitle="View all companies and their loan officers' leads data"
      >
        <HierarchicalLeadsInsights />
      </DashboardLayout>
    </RouteGuard>
  );
}
