'use client';

import React, { memo } from 'react';
import { useRouter } from 'next/navigation';
import { dashboard } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';
import StaticHeader from './StaticHeader';
import { useAuth } from '@/hooks/use-auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

const DashboardLayout = memo(function DashboardLayout({ 
  children, 
  title, 
  subtitle, 
  showBackButton = false 
}: DashboardLayoutProps) {
  const router = useRouter();
  const { userRole } = useAuth();

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

  return (
    <div style={dashboard.container}>
      {/* Static Navigation Header - Memoized to prevent re-rendering */}
      <StaticHeader />

      {/* Main Content */}
      <main style={dashboard.mainContent}>
        <div style={{ padding: '24px 0' }}>
          {showBackButton && (
            <button
              onClick={handleBackClick}
              style={{
                marginBottom: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '14px',
                color: '#ffffff',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s ease-in-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
              }}
            >
              {React.createElement(icons.chevronLeft, { 
                size: 16, 
                style: { marginRight: '8px' } 
              })}
              Back
            </button>
          )}
          
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ 
              fontSize: '30px', 
              fontWeight: 'bold', 
              color: '#111827' 
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ 
                marginTop: '8px', 
                color: '#4b5563' 
              }}>
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </main>
    </div>
  );
});

export { DashboardLayout };
