'use client'

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { LiquidChromeBackground } from '@/components/ui/LiquidChromeBackground';

function AcceptInvitePageContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [companyInfo, setCompanyInfo] = useState<{name: string, email: string} | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const companyId = searchParams.get('company');

  useEffect(() => {
    if (!companyId) {
      setError('Invalid invite link. Missing company ID.');
      return;
    }

    // Fetch company info
    const fetchCompanyInfo = async () => {
      try {
        const { data: company, error } = await supabase
          .from('companies')
          .select('name, admin_email, invite_status, invite_expires_at')
          .eq('id', companyId)
          .single();

        if (error || !company) {
          setError('Company not found or invite is invalid.');
          return;
        }

        if (company.invite_status === 'accepted') {
          setSuccess('This invite has already been accepted. You can login now.');
          setTimeout(() => router.push('/auth'), 3000);
          return;
        }

        if (company.invite_status === 'expired' || 
            (company.invite_expires_at && new Date() > new Date(company.invite_expires_at))) {
          setError('This invite has expired. Please contact your administrator for a new invite.');
          return;
        }

        setCompanyInfo({
          name: company.name,
          email: company.admin_email || 'Unknown'
        });
      } catch (error) {
        setError('Failed to load company information.');
      }
    };

    fetchCompanyInfo();
  }, [companyId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Get current user (should be the invited user)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setError('You must be logged in to accept this invite. Please check your email for the login link.');
        return;
      }

      // Update user password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      // Update company status to accepted and activate
      const { error: companyError } = await supabase
        .from('companies')
        .update({
          invite_status: 'accepted',
          admin_email_verified: true,
          admin_user_id: user.id,
          is_active: true, // Activate company when invite is accepted
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId);

      if (companyError) {
        throw companyError;
      }

      // Add user to users table
      await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email!,
          first_name: '',
          last_name: '',
          role: 'company_admin',
          is_active: true
        });

      // Link user to company
      await supabase
        .from('user_companies')
        .upsert({
          user_id: user.id,
          company_id: companyId,
          role: 'admin'
        });

      setSuccess('🎉 Welcome! Your account has been set up successfully. Redirecting to your dashboard...');
      
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error accepting invite:', error);
      setError(error instanceof Error ? error.message : 'Failed to accept invite. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!companyId) {
    return (
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
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#F7F1E9]/40">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-[#005b7c] mb-4 drop-shadow-lg">Invalid Invite Link</h1>
                <p className="text-[#005b7c]/80 text-lg">This invite link is invalid or missing required information.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
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
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Setup Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#F7F1E9]/40">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#01bcc6] to-[#008eab] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold text-[#005b7c] mb-4 drop-shadow-lg">
                Complete Your Setup
              </h2>
              <p className="text-[#005b7c]/80 text-lg">
                Create a password to access your company dashboard
              </p>
              {companyInfo && (
                <div className="mt-6 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-[#01bcc6]/20">
                  <p className="text-[#005b7c] font-medium">
                    <strong>Company:</strong> {companyInfo.name}<br />
                    <strong>Email:</strong> {companyInfo.email}
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border-2 border-red-200 p-4 rounded-xl shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-300">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border-2 border-green-200 p-4 rounded-xl shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-300">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-700 font-medium">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-[#005b7c] mb-3">
                  Create Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-[#01bcc6]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-[#01bcc6]/20 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-[#01bcc6]/20 focus:border-[#01bcc6] transition-all duration-300 bg-white/50 backdrop-blur-sm text-[#005b7c] font-medium placeholder-[#005b7c]/50"
                    placeholder="Enter your password"
                    required
                    minLength={8}
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-[#005b7c]/60 mt-2">Password must be at least 8 characters long</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#005b7c] mb-3">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-[#01bcc6]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-[#01bcc6]/20 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-[#01bcc6]/20 focus:border-[#01bcc6] transition-all duration-300 bg-white/50 backdrop-blur-sm text-[#005b7c] font-medium placeholder-[#005b7c]/50"
                    placeholder="Confirm your password"
                    required
                    minLength={8}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#01bcc6] to-[#008eab] hover:from-[#008eab] hover:to-[#005b7c] text-white py-4 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Setting up account...' : 'Complete Setup & Go to Dashboard'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#005b7c]/70">
                Need help?{' '}
                <a href="mailto:support@loanplatform.com" className="text-[#01bcc6] hover:text-[#008eab] font-medium transition-colors duration-200">
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#01bcc6]"></div>
      </div>
    }>
      <AcceptInvitePageContent />
    </Suspense>
  );
}
