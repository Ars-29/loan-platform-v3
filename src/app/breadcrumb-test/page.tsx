'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function BreadcrumbTestPage() {
  const pathname = usePathname();
  const params = useParams();
  const { items: breadcrumbItems, isLoading } = useBreadcrumb();

  return (
    <RouteGuard allowedRoles={['company_admin', 'super_admin', 'employee']}>
      <DashboardLayout 
        showBreadcrumb={false}
        title="Breadcrumb Navigation Test"
        subtitle="Debug breadcrumb navigation issues"
      >
        <div className="space-y-6">
          
          {/* Current Route Info */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Current Route Information</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Pathname:</strong> {pathname}</p>
              <p><strong>Params:</strong> {JSON.stringify(params)}</p>
              <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Generated Breadcrumb Items */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Generated Breadcrumb Items</h3>
            <div className="space-y-2">
              {breadcrumbItems.length > 0 ? (
                <div className="space-y-1">
                  {breadcrumbItems.map((item, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{index + 1}.</span> 
                      <span className="ml-2">Label: "{item.label}"</span>
                      <span className="ml-2">Href: "{item.href || 'No href'}"</span>
                      <span className="ml-2">Icon: {item.icon || 'No icon'}</span>
                      <span className="ml-2">Loading: {item.isLoading ? 'Yes' : 'No'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No breadcrumb items generated</p>
              )}
            </div>
          </div>

          {/* Test Breadcrumb Component */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Breadcrumb Component Test</h3>
            <p className="text-sm text-gray-600 mb-4">This is how the breadcrumb component renders:</p>
            <Breadcrumb 
              items={breadcrumbItems}
              variant="default"
              size="md"
            />
          </div>

          {/* Manual Test Links */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Manual Test Links</h3>
            <p className="text-sm text-gray-600 mb-4">Test navigation to different pages:</p>
            <div className="space-x-4">
              <Link href="/officers/dashboard" className="text-blue-600 hover:underline">Officers Dashboard</Link>
              <Link href="/officers/leads" className="text-blue-600 hover:underline">Officers Leads</Link>
              <Link href="/admin/dashboard" className="text-blue-600 hover:underline">Admin Dashboard</Link>
              <Link href="/super-admin/dashboard" className="text-blue-600 hover:underline">Super Admin Dashboard</Link>
            </div>
          </div>

          {/* Debug Information */}
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
            <p className="text-sm text-gray-600 mb-2">Check the browser console for detailed breadcrumb generation logs.</p>
            <p className="text-sm text-gray-600">Look for messages starting with 🔍, ✅, ❌, 🍞, and 🔗</p>
          </div>

        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
