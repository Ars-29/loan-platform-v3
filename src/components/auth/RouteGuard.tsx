'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { colors, spacing, typography } from '@/theme/theme';
import Icon from '@/components/ui/Icon';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: ('super_admin' | 'company_admin' | 'employee')[];
  fallback?: React.ReactNode;
}

export function RouteGuard({ children, allowedRoles, fallback }: RouteGuardProps) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth');
        return;
      }

      if (userRole && !allowedRoles.includes(userRole.role)) {
        // Redirect based on user role
        switch (userRole.role) {
          case 'super_admin':
            router.push('/super-admin/dashboard');
            break;
          case 'company_admin':
            router.push('/admin/dashboard');
            break;
          case 'employee':
            router.push('/officers/dashboard');
            break;
          default:
            router.push('/auth');
        }
      }
    }
  }, [user, userRole, loading, allowedRoles, router]);

  // Only block the UI when loading and there is no user yet.
  if (loading && !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ animation: 'spin 1s linear infinite', borderRadius: '50%', height: '8rem', width: '8rem', borderBottom: `2px solid ${colors.primary[600]}`, margin: '0 auto' }}></div>
          <p style={{ marginTop: spacing.md, color: colors.text.secondary }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary, marginBottom: spacing.md }}>Authentication Required</h2>
          <p style={{ color: colors.text.secondary }}>Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  if (userRole && !allowedRoles.includes(userRole.role)) {
    return fallback || (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary, marginBottom: spacing.md }}>Access Denied</h2>
          <p style={{ color: colors.text.secondary }}>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}