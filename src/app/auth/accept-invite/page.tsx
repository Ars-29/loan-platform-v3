'use client'

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

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
        router.push('/admin/employees');
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invite Link</h1>
            <p className="text-gray-600">This invite link is invalid or missing required information.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accept Company Invite</h1>
          <p className="text-gray-600">Complete your company admin setup by creating a password.</p>
          {companyInfo && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Company:</strong> {companyInfo.name}<br />
                <strong>Email:</strong> {companyInfo.email}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Create Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Enter your password"
              required
              minLength={8}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Confirm your password"
              required
              minLength={8}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 text-white py-3 px-6 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Setting up account...' : 'Accept Invite & Setup Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a href="mailto:support@loanplatform.com" className="text-pink-600 hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    }>
      <AcceptInvitePageContent />
    </Suspense>
  );
}
