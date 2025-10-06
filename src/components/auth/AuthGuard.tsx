'use client';

import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LiquidChromeBackground } from '@/components/ui/LiquidChromeBackground';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'company_admin' | 'employee';
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, requiredRole, fallback }: AuthGuardProps) {
  // TEMPORARILY DISABLED - conflicts with useAuth hook
  // When re-enabled, this component will use the new styling below
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#005b7c] via-[#008eab] to-[#01bcc6]">
        <LiquidChromeBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#01bcc6]"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#005b7c] via-[#008eab] to-[#01bcc6]">
        <LiquidChromeBackground />
        
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-xl shadow-lg border-b border-[#F7F1E9]/30 relative z-20">
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
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#F7F1E9]/40">
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

  // TEMPORARILY DISABLED - conflicts with useAuth hook
  return <>{children}</>;
}
