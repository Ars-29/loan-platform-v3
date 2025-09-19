'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { dashboard } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';
import StaticHeader from './StaticHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

export function DashboardLayout({ 
  children, 
  title, 
  subtitle, 
  showBackButton = false 
}: DashboardLayoutProps) {
  const router = useRouter();

  return (
    <div style={dashboard.container}>
      {/* Static Navigation Header */}
      <StaticHeader />

      {/* Main Content */}
      <main style={dashboard.mainContent}>
        <div style={{ padding: '24px 0' }}>
          {showBackButton && (
            <button
              onClick={() => router.back()}
              style={{
                marginBottom: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '14px',
                color: '#6b7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6b7280';
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
}
