import React from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import AdminLeadsView from '@/components/analytics/AdminLeadsView';

export default function AdminInsightsPage() {
  return (
    <RouteGuard allowedRoles={['company_admin']}>
      <DashboardLayout 
        title="Leads" 
        subtitle="Manage your leads"
        showBackButton={true}
      >
        <AdminLeadsView 
          isSuperAdmin={false}
          showCompanyFilter={false}
          showOfficerFilter={true}
        />
      </DashboardLayout>
    </RouteGuard>
  );
}
