'use client';

import React, { memo } from 'react';
import { useRouter } from 'next/navigation';
import { dashboard } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';
import StaticHeader from './StaticHeader';
import { useAuth } from '@/hooks/use-auth';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean; // Deprecated - use showBreadcrumb instead
  showBreadcrumb?: boolean;
  breadcrumbVariant?: 'default' | 'minimal' | 'elevated';
  breadcrumbSize?: 'sm' | 'md' | 'lg';
  customBreadcrumbItems?: Array<{
    label: string;
    href?: string;
    icon?: keyof typeof icons;
    isLoading?: boolean;
  }>;
}

const DashboardLayout = memo(function DashboardLayout({ 
  children, 
  title, 
  subtitle, 
  showBackButton = false, // Keep for backward compatibility
  showBreadcrumb = true, // New default behavior
  breadcrumbVariant = 'default',
  breadcrumbSize = 'md',
  customBreadcrumbItems
}: DashboardLayoutProps) {
  const router = useRouter();
  const { userRole } = useAuth();
  const { items: autoBreadcrumbItems, isLoading: breadcrumbLoading } = useBreadcrumb();

  const handleBackClick = () => {
    // Always navigate to the appropriate dashboard based on user role
    if (userRole?.role === 'super_admin') {
      router.push('/super-admin/dashboard');
    } else if (userRole?.role === 'company_admin') {
      router.push('/admin/dashboard');
    } else if (userRole?.role === 'employee') {
      router.push('/officers/dashboard');
    } else {
      // Fallback to officers dashboard
      router.push('/officers/dashboard');
    }
  };

  // Determine which breadcrumb items to use
  const breadcrumbItems = customBreadcrumbItems || autoBreadcrumbItems;
  const shouldShowBreadcrumb = showBreadcrumb && breadcrumbItems.length > 0;

  return (
    <div style={dashboard.container}>
      {/* Static Navigation Header - Memoized to prevent re-rendering */}
      <StaticHeader />

      {/* Main Content */}
      <main style={dashboard.mainContent}>
        <div style={{ padding: '24px 0' }}>
          {/* Breadcrumb Navigation - New modern approach */}
          {shouldShowBreadcrumb && (
            <div style={{ marginBottom: '16px' }}>
              <Breadcrumb 
                items={breadcrumbItems}
                variant={breadcrumbVariant}
                size={breadcrumbSize}
              />
            </div>
          )}

          {/* Legacy Back Button - Only show if explicitly requested and no breadcrumb */}
          {showBackButton && !shouldShowBreadcrumb && (
            <button
              onClick={handleBackClick}
              style={{
                marginBottom: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '14px',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 91, 124, 0.3)',
                transition: 'all 0.2s ease-in-out',
              }}
              className="btn-primary-solid"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 91, 124, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 91, 124, 0.3)';
              }}
            >
              {React.createElement(icons.chevronLeft, { 
                size: 16, 
                style: { marginRight: '8px' } 
              })}
              Back
            </button>
          )}
          
          {(title || subtitle) && (
            <div style={{ marginBottom: '32px' }}>
              {title && (
                <h1 style={{ 
                  fontSize: '30px', 
                  fontWeight: 'bold', 
                  color: '#005b7c' 
                }}>
                  {title}
                </h1>
              )}
              {subtitle && (
                <p style={{ 
                  marginTop: '8px', 
                  color: '#4b5563' 
                }}>
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  );
});

export { DashboardLayout };
