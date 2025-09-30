'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { colors, spacing, typography } from '@/theme/theme';
import Icon from '@/components/ui/Icon';
import { PageLoadingState } from '@/components/ui/LoadingState';
import { LiquidChromeBackground } from '@/components/ui/LiquidChromeBackground';

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
      <PageLoadingState text="Loading..." />
    );
  }

  if (!user) {
    return fallback || (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#005b7c] via-[#008eab] to-[#01bcc6]">
        <LiquidChromeBackground />
        
        {/* Header */}
        <header className="bg-[#F7F1E9]/95 backdrop-blur-xl shadow-lg border-b border-[#F7F1E9]/30 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#005b7c] to-[#01bcc6] bg-clip-text text-transparent">
                  Loan Officer Platform
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.location.href = '/auth'}
                  className="text-[#005b7c] hover:text-[#01bcc6] font-medium transition-colors duration-200"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="bg-[#F7F1E9]/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#F7F1E9]/40">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#01bcc6] to-[#008eab] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-[#005b7c] mb-4 drop-shadow-lg">Authentication Required</h2>
                <p className="text-[#005b7c]/80 text-lg mb-6">Please sign in to access this page.</p>
                <button
                  onClick={() => window.location.href = '/auth'}
                  className="bg-gradient-to-r from-[#01bcc6] to-[#008eab] hover:from-[#008eab] hover:to-[#005b7c] text-white py-3 px-8 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Sign In Now
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (userRole && !allowedRoles.includes(userRole.role)) {
    return fallback || (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#005b7c] via-[#008eab] to-[#01bcc6]">
        <LiquidChromeBackground />
        
        {/* Header */}
        <header className="bg-[#F7F1E9]/95 backdrop-blur-xl shadow-lg border-b border-[#F7F1E9]/30 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#005b7c] to-[#01bcc6] bg-clip-text text-transparent">
                  Loan Officer Platform
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    // Redirect based on user role
                    switch (userRole.role) {
                      case 'super_admin':
                        window.location.href = '/super-admin/dashboard';
                        break;
                      case 'company_admin':
                        window.location.href = '/admin/dashboard';
                        break;
                      case 'employee':
                        window.location.href = '/officers/dashboard';
                        break;
                      default:
                        window.location.href = '/auth';
                    }
                  }}
                  className="text-[#005b7c] hover:text-[#01bcc6] font-medium transition-colors duration-200"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="bg-[#F7F1E9]/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#F7F1E9]/40">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-[#005b7c] mb-4 drop-shadow-lg">Access Denied</h2>
                <p className="text-[#005b7c]/80 text-lg mb-6">You don't have permission to access this page.</p>
                <button
                  onClick={() => {
                    // Redirect based on user role
                    switch (userRole.role) {
                      case 'super_admin':
                        window.location.href = '/super-admin/dashboard';
                        break;
                      case 'company_admin':
                        window.location.href = '/admin/dashboard';
                        break;
                      case 'employee':
                        window.location.href = '/officers/dashboard';
                        break;
                      default:
                        window.location.href = '/auth';
                    }
                  }}
                  className="bg-gradient-to-r from-[#01bcc6] to-[#008eab] hover:from-[#008eab] hover:to-[#005b7c] text-white py-3 px-8 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return <>{children}</>;
}