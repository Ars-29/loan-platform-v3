'use client';

import React from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AdminCompaniesPage() {
  return (
    <RouteGuard allowedRoles={['company_admin']}>
      <DashboardLayout 
        title="Company Information" 
        subtitle="View your company details"
        showBackButton={true}
      >
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Access</h2>
            <p className="text-gray-600">
              As a company administrator, you can manage your company's loan officers and leads. 
              Company creation and management is handled by the super administrator.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> To create new companies or manage other companies, 
                you need super administrator privileges.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
