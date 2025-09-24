import React from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import SimpleLeadsInsights from '@/components/analytics/SimpleLeadsInsights';

export default function AdminInsightsPage() {
  return (
    <RouteGuard allowedRoles={['company_admin']}>
      <DashboardLayout 
        title="Leads Insights" 
        subtitle="View all loan officers and their leads data"
      >
        <SimpleLeadsInsights isSuperAdmin={false} />
      </DashboardLayout>
    </RouteGuard>
  );
}
