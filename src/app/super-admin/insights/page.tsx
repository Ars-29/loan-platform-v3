import React from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import AdminLeadsView from '@/components/analytics/AdminLeadsView';

export default function SuperAdminInsightsPage() {
  return (
    <RouteGuard allowedRoles={['super_admin']}>
      <DashboardLayout 
        title="Leads" 
        subtitle="Manage your leads"
        showBackButton={true}
      >
        <AdminLeadsView 
          isSuperAdmin={true}
          showCompanyFilter={true}
          showOfficerFilter={true}
        />
      </DashboardLayout>
    </RouteGuard>
  );
}
