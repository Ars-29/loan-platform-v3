'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { EmailInput, PasswordInput } from '@/components/ui/Input';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useNotification } from '@/components/ui/Notification';
import Modal from '@/components/ui/Modal';
import { PageLoadingState } from '@/components/ui/LoadingState';
import { LiquidChromeBackground } from '@/components/ui/LiquidChromeBackground';
// Removed Session import - not needed for free plan

function AuthPageContent() {
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Forgot password modal state
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  // Remove signup functionality - only admin-created accounts
  const router = useRouter();
  const searchParams = useSearchParams();

  const checkUserRoleAndRedirect = useCallback(async (user: { id: string; email?: string }) => {
    try {
      console.log('Checking user role for:', user.id);
      
      // Get user role from database
      const roleFetch = supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      // Add a hard timeout so UI never hangs here
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('role_timeout')), 5000));
      const { data: userData, error } = await Promise.race([roleFetch, timeout]) as any;

      if (error || !userData) {
        console.error('Error fetching user role:', error);
        // If RLS is blocking, try to redirect based on email
        if (user.email === 'admin@loanplatform.com') {
          console.log('Redirecting super admin based on email');
          router.push('/super-admin/dashboard');
          return;
        }
        // Default fast fallback to officers dashboard
        router.push('/officers/dashboard');
        return;
      }

      console.log('User role:', userData.role);

      // Redirect based on role
      if (userData.role === 'super_admin') {
        console.log('Redirecting to /super-admin/dashboard');
        router.push('/super-admin/dashboard');
      } else if (userData.role === 'company_admin') {
        console.log('Redirecting to /admin/dashboard');
        router.push('/admin/dashboard');
      } else if (userData.role === 'employee') {
        console.log('Redirecting to /officers/dashboard');
        router.push('/officers/dashboard');
      } else {
        console.log('Redirecting to /officers/dashboard (default)');
        router.push('/officers/dashboard');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      // Fallback redirect
      router.push('/officers/dashboard');
    }
  }, [router]);

  // Simple redirect after successful login
  useEffect(() => {
    // Check for success messages from URL params
    const message = searchParams.get('message');
    if (message === 'verification_complete') {
      setSuccess('✅ Email verified successfully! You can now login with your credentials.');
    }

    // REMOVED: onAuthStateChange listener - let useAuth hook handle this
    // Multiple listeners were causing conflicts
  }, [checkUserRoleAndRedirect, searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting sign in with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('Authentication attempt failed:', error.message);
        // Show user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          setError('Oops! Wrong credentials. Please double-check your email and password.');
        } else if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          setError('Please check your email and click the verification link before signing in.');
        } else if (error.message.includes('signup_disabled')) {
          setError('Account registration is currently disabled. Please contact your administrator.');
        } else if (error.message.includes('user_not_found')) {
          setError('No account found with this email. Please check your email or contact your administrator.');
        } else if (error.message.includes('too_many_requests')) {
          setError('Too many login attempts. Please wait a few minutes before trying again.');
        } else {
          setError('Something went wrong. Please try again or contact support.');
        }
      } else if (data.user) {
        console.log('Sign in successful for:', data.user.email);
        setError('');
        // Immediately go to dashboard to avoid waiting here; RouteGuard will settle
        router.push('/officers/dashboard');
        // Fire-and-forget role check to refine destination if needed
        checkUserRoleAndRedirect(data.user).catch(() => {});
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPasswordModal(true);
    // Clear any previous errors/success messages
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    setForgotPasswordEmail('');
  };

  const handleForgotPasswordSubmit = async () => {
    if (!forgotPasswordEmail) {
      setForgotPasswordError('Please enter your email address.');
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError('');
    setForgotPasswordSuccess('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        throw error;
      }

      setForgotPasswordSuccess('📧 Password reset link sent! Check your email for instructions.');
      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Password reset email sent! Check your inbox.'
      });
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowForgotPasswordModal(false);
        setForgotPasswordEmail('');
        setForgotPasswordSuccess('');
      }, 2000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setForgotPasswordError('❌ Failed to send password reset email. Please try again.');
      showNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to send reset email'
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Signup functionality removed - only admin-created accounts

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#005b7c] via-[#008eab] to-[#01bcc6]">
      <LiquidChromeBackground />
      
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl shadow-lg border-b border-[#F7F1E9]/30 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Image
                src="/images/logos/LoanOffD.png"
                alt="Loan Officer Platform"
                width={140}
                height={28}
                className="h-auto max-h-[28px] w-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="text-[#005b7c] hover:text-[#01bcc6] font-medium transition-colors duration-200"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Login Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#F7F1E9]/40">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-[#005b7c] mb-4 drop-shadow-lg">
                Welcome Back
              </h2>
              <p className="text-[#005b7c]/80 text-lg">
                Sign in to access your dashboard
              </p>
            </div>
            
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-center animate-in fade-in-0 slide-in-from-top-1 duration-300">
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSignIn}>
              <div className="space-y-4">
                <EmailInput
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
                <PasswordInput
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center animate-in fade-in-0 slide-in-from-top-1 duration-300">
                  <p className="text-orange-800 text-sm">
                    {error}
                  </p>
                  {error.includes('Wrong credentials') && (
                    <p className="text-orange-700 text-xs mt-1">
                      💡 Try checking your caps lock or contact your administrator if you're unsure
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  loading={isLoading}
                  className="w-full bg-gradient-to-r from-[#01bcc6] to-[#008eab] hover:from-[#008eab] hover:to-[#005b7c] text-[#F7F1E9] py-3 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </form>

            <div className="text-center space-y-4 mt-6">
              <button
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="text-sm text-[#01bcc6] hover:text-[#008eab] font-medium disabled:opacity-50 transition-colors duration-200"
              >
                Forgot your password?
              </button>
              <p className="text-sm text-[#005b7c]/70">
                Contact your administrator for account access
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        title="Reset Password"
        className="bg-white/95 backdrop-blur-xl border border-[#F7F1E9]/40"
      >
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#01bcc6] to-[#008eab] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <p className="text-[#005b7c] text-lg font-medium leading-relaxed">
              Enter your email address and we'll send you a secure link to reset your password.
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="forgot-email" className="block text-sm font-semibold text-[#005b7c] mb-3">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-[#01bcc6]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="forgot-email"
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full pl-12 pr-4 py-4 border-2 border-[#01bcc6]/20 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-[#01bcc6]/20 focus:border-[#01bcc6] transition-all duration-300 bg-white/50 backdrop-blur-sm text-[#005b7c] font-medium placeholder-[#005b7c]/50"
                disabled={forgotPasswordLoading}
              />
            </div>
          </div>

          {forgotPasswordError && (
            <div className="bg-red-50 border-2 border-red-200 p-4 rounded-xl shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-300">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 font-medium">{forgotPasswordError}</p>
              </div>
            </div>
          )}

          {forgotPasswordSuccess && (
            <div className="bg-green-50 border-2 border-green-200 p-4 rounded-xl shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-300">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-700 font-medium">{forgotPasswordSuccess}</p>
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <Button
              onClick={handleForgotPasswordSubmit}
              disabled={forgotPasswordLoading || !forgotPasswordEmail}
              loading={forgotPasswordLoading}
              className="flex-1 bg-gradient-to-r from-[#01bcc6] to-[#008eab] hover:from-[#008eab] hover:to-[#005b7c] text-white py-4 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              {forgotPasswordLoading ? 'Sending...' : 'Reset Password'}
            </Button>
            
            <Button
              onClick={() => setShowForgotPasswordModal(false)}
              variant="secondary"
              disabled={forgotPasswordLoading}
              className="flex-1 bg-white text-[#005b7c] border-2 border-[#01bcc6]/30 hover:bg-[#01bcc6]/10 hover:border-[#01bcc6]/50 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <PageLoadingState />
    }>
      <AuthPageContent />
    </Suspense>
  );
}
