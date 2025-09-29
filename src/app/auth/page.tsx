'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { EmailInput, PasswordInput } from '@/components/ui/Input';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useNotification } from '@/components/ui/Notification';
import Modal from '@/components/ui/Modal';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Loan Officer Platform
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your dashboard
          </p>
        </div>
        
        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-3 text-center animate-in fade-in-0 slide-in-from-top-1 duration-300">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
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
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3 text-center animate-in fade-in-0 slide-in-from-top-1 duration-300">
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

          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={isLoading}
              loading={isLoading}
              className="w-full"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>

        <div className="text-center space-y-4">
          <button
            onClick={handleForgotPassword}
            disabled={isLoading}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50"
          >
            Forgot your password?
          </button>
          <p className="text-sm text-gray-600">
            Contact your administrator for account access
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        title="Reset Password"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          <div>
            <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              id="forgot-email"
              type="email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={forgotPasswordLoading}
            />
          </div>

          {forgotPasswordError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {forgotPasswordError}
            </div>
          )}

          {forgotPasswordSuccess && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              {forgotPasswordSuccess}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleForgotPasswordSubmit}
              disabled={forgotPasswordLoading || !forgotPasswordEmail}
              loading={forgotPasswordLoading}
              className="flex-1"
            >
              {forgotPasswordLoading ? 'Sending...' : 'Get Reset Password Link'}
            </Button>
            
            <Button
              onClick={() => setShowForgotPasswordModal(false)}
              variant="secondary"
              disabled={forgotPasswordLoading}
              className="flex-1"
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
