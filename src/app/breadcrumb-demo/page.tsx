'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { BreadcrumbItem } from '@/components/ui/Breadcrumb';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function BreadcrumbDemoPage() {
  const demoBreadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: 'home' },
    { label: 'Loan Officers', href: '/admin/loanofficers', icon: 'profile' },
    { label: 'John Doe', href: '/admin/loanofficers/john-doe', icon: 'user' },
    { label: 'Leads', href: '/admin/loanofficers/john-doe/leads', icon: 'document' },
    { label: 'Jane Smith', icon: 'profile' }
  ];

  const loadingBreadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: 'home' },
    { label: 'Loading Officer...', isLoading: true, icon: 'user' },
    { label: 'Leads', icon: 'document' }
  ];

  return (
    <RouteGuard allowedRoles={['company_admin', 'super_admin', 'employee']}>
      <DashboardLayout 
        showBreadcrumb={false}
        title="Breadcrumb Navigation Demo"
        subtitle="Showcasing the new modern breadcrumb system with different variants and features"
      >
        <div className="space-y-8">
          
          {/* Default Variant */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Default Variant</h3>
            <p className="text-sm text-gray-600">Clean, modern design with subtle gradient background</p>
            <Breadcrumb 
              items={demoBreadcrumbItems}
              variant="default"
              size="md"
            />
          </div>

          {/* Minimal Variant */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Minimal Variant</h3>
            <p className="text-sm text-gray-600">Clean, transparent design for subtle navigation</p>
            <Breadcrumb 
              items={demoBreadcrumbItems}
              variant="minimal"
              size="md"
            />
          </div>

          {/* Elevated Variant */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Elevated Variant</h3>
            <p className="text-sm text-gray-600">Prominent design with shadow and border for important navigation</p>
            <Breadcrumb 
              items={demoBreadcrumbItems}
              variant="elevated"
              size="md"
            />
          </div>

          {/* Different Sizes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Different Sizes</h3>
            <p className="text-sm text-gray-600">Small, medium, and large sizes for different contexts</p>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Small (sm)</p>
                <Breadcrumb 
                  items={demoBreadcrumbItems}
                  variant="default"
                  size="sm"
                />
              </div>
              
              <div>
                <p className="text-xs text-gray-500 mb-1">Medium (md) - Default</p>
                <Breadcrumb 
                  items={demoBreadcrumbItems}
                  variant="default"
                  size="md"
                />
              </div>
              
              <div>
                <p className="text-xs text-gray-500 mb-1">Large (lg)</p>
                <Breadcrumb 
                  items={demoBreadcrumbItems}
                  variant="default"
                  size="lg"
                />
              </div>
            </div>
          </div>

          {/* Loading States */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Loading States</h3>
            <p className="text-sm text-gray-600">Shows loading animation while fetching dynamic data</p>
            <Breadcrumb 
              items={loadingBreadcrumbItems}
              variant="default"
              size="md"
            />
          </div>

          {/* Features Overview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">✨ Modern Design</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Gradient backgrounds and subtle shadows</li>
                  <li>• Smooth hover animations</li>
                  <li>• Focus states for accessibility</li>
                  <li>• Consistent with app theme</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">🎯 Smart Navigation</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Auto-generates from URL patterns</li>
                  <li>• Fetches dynamic data (names, etc.)</li>
                  <li>• Loading states for async data</li>
                  <li>• Contextual breadcrumbs per portal</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">📱 Responsive</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Three size variants (sm, md, lg)</li>
                  <li>• Mobile-friendly design</li>
                  <li>• Flexible container sizing</li>
                  <li>• Touch-friendly interactions</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">🔧 Customizable</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Three visual variants</li>
                  <li>• Custom breadcrumb items</li>
                  <li>• Easy to override styles</li>
                  <li>• Backward compatible</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Implementation Examples */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Implementation Examples</h3>
            <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm text-gray-300">
{`// Automatic breadcrumbs (recommended)
<DashboardLayout showBreadcrumb={true} />

// Custom breadcrumb items
<DashboardLayout 
  showBreadcrumb={true}
  customBreadcrumbItems={[
    { label: 'Dashboard', href: '/admin/dashboard', icon: 'home' },
    { label: 'Current Page', icon: 'document' }
  ]}
/>

// Different variants
<DashboardLayout 
  showBreadcrumb={true}
  breadcrumbVariant="elevated"
  breadcrumbSize="lg"
/>

// Disable breadcrumbs
<DashboardLayout showBreadcrumb={false} />`}
              </pre>
            </div>
          </div>

        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
