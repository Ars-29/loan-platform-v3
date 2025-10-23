import React, { Suspense } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import AdminLeadsView from '@/components/analytics/AdminLeadsView';

export default function SuperAdminInsightsPage() {
  return (
    <RouteGuard allowedRoles={['super_admin']}>
      <DashboardLayout 
        showBreadcrumb={true}
        breadcrumbVariant="default"
        breadcrumbSize="md"
      >
        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading leads...</span>
          </div>
        }>
          <AdminLeadsView 
            isSuperAdmin={true}
            showCompanyFilter={true}
            showOfficerFilter={true}
          />
        </Suspense>
      </DashboardLayout>
    </RouteGuard>
  );
}
