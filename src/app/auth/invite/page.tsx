'use client'

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

function InvitePageContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [companyInfo, setCompanyInfo] = useState<{name: string, email: string} | null>(null);
  const [user, setUser] = useState<any>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const companyId = searchParams.get('company');
  const isOfficerInvite = searchParams.get('officer') === 'true';

  useEffect(() => {
    // Listen for auth state changes to handle invite flow
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        setUser(session.user);
        await fetchCompanyInfo(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setError('Please check your email and click the invite link to continue.');
      }
    });

    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await fetchCompanyInfo(user);
      } else {
        // If no user is logged in, show the password creation form
        // This handles the case where someone clicks an invite link
        setUser({ email: 'invite@example.com' } as any); // Temporary user object
        await fetchCompanyInfo(null);
      }
    };

    checkUser();

    return () => subscription.unsubscribe();
  }, []);

  const fetchCompanyInfo = async (currentUser: any) => {
    if (!companyId) {
      setError('Invalid invite link. Missing company ID.');
      return;
    }

    try {
      if (isOfficerInvite) {
        // For loan officer invites, check if the company exists and get its info
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('name, admin_email')
          .eq('id', companyId)
          .single();

        if (companyError || !company) {
          setError('Company not found or invite is invalid.');
          return;
        }

        // If user is logged in, check if they have access to this company
        if (currentUser) {
          const { data: userCompany, error: userError } = await supabase
            .from('user_companies')
            .select('is_active')
            .eq('user_id', currentUser.id)
            .eq('company_id', companyId)
            .eq('role', 'employee')
            .single();

          if (userError || !userCompany) {
            setError('You are not authorized to access this company.');
            return;
          }

          if (userCompany.is_active) {
            setError('You have already completed your setup. Please login to access your dashboard.');
            return;
          }
        }

        setCompanyInfo({
          name: company.name,
          email: company.admin_email
        });
      } else {
        // For company admin invites, check companies table
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
          email: company.admin_email || (currentUser ? currentUser.email : '')
        });
      }
    } catch (error) {
      setError('Failed to load company information.');
    }
  };

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
      // For invite links, we need to handle the authentication differently
      if (!user || user.email === 'invite@example.com') {
        // This is an invite link - we need to get the user from the invite
        const { data: { user: currentUser }, error: getUserError } = await supabase.auth.getUser();
        
        if (getUserError || !currentUser) {
          setError('Please click the invite link from your email to continue.');
          setLoading(false);
          return;
        }
        
        setUser(currentUser);
      }

      // Update user password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      if (isOfficerInvite) {
        // Update user and user-company to active for loan officer
        const { error: userError } = await supabase
          .from('users')
          .update({ is_active: true })
          .eq('id', user.id);

        if (userError) {
          throw userError;
        }

        const { error: companyError } = await supabase
          .from('user_companies')
          .update({ is_active: true })
          .eq('user_id', user.id)
          .eq('company_id', companyId);

        if (companyError) {
          throw companyError;
        }
      } else {
        // Update company status to accepted and activate for company admin
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
      }

      // Add user to users table with correct role
      await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email!,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          role: isOfficerInvite ? 'employee' : 'company_admin',
          is_active: true
        });

      // Link user to company with correct role
      await supabase
        .from('user_companies')
        .upsert({
          user_id: user.id,
          company_id: companyId,
          role: isOfficerInvite ? 'employee' : 'admin',
          is_active: true
        });

      setSuccess('🎉 Welcome! Your account has been set up successfully. Redirecting to your dashboard...');
      
      setTimeout(() => {
        if (isOfficerInvite) {
          router.push('/officers/dashboard');
        } else {
          router.push('/companyadmin/loanofficers');
        }
      }, 2000);

    } catch (error) {
      console.error('Error accepting invite:', error);
      setError(error instanceof Error ? error.message : 'Failed to accept invite. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.email === 'invite@example.com') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
            <p className="text-gray-600 mb-4">Please check your email and click the invite link to continue with the setup.</p>
            <p className="text-sm text-gray-500">If you don't see the email, check your spam folder.</p>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Make sure to click the invite link from your email. The link will automatically sign you in.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Setup</h1>
          <p className="text-gray-600">
            {isOfficerInvite 
              ? 'Create a password to access your loan officer dashboard.' 
              : 'Create a password to access your company dashboard.'
            }
          </p>
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
            {loading ? 'Setting up account...' : 'Complete Setup & Go to Dashboard'}
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

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    }>
      <InvitePageContent />
    </Suspense>
  );
}
