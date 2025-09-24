'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { EmailInput, PasswordInput } from '@/components/ui/Input';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useNotification } from '@/components/ui/Notification';
// Removed Session import - not needed for free plan

function AuthPageContent() {
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
          router.push('/admin/companies');
          return;
        }
        // Default fast fallback to officers dashboard
        router.push('/officers/dashboard');
        return;
      }

      console.log('User role:', userData.role);

      // Redirect based on role
      if (userData.role === 'super_admin') {
        console.log('Redirecting to /admin/companies');
        router.push('/admin/companies');
      } else if (userData.role === 'company_admin') {
        console.log('Redirecting to /companyadmin/loanofficers');
        router.push('/companyadmin/loanofficers');
      } else if (userData.role === 'employee') {
        console.log('Redirecting to /officers/dashboard');
        router.push('/officers/dashboard');
      } else {
        console.log('Redirecting to /dashboard (default)');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      // Fallback redirect
      router.push('/dashboard');
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
        console.error('Sign in error:', error);
        // Show user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          setError('❌ Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          setError('📧 Please check your email and confirm your account before signing in. Look for the verification email and click the confirmation link.');
        } else if (error.message.includes('signup_disabled')) {
          setError('🚫 Account registration is disabled. Please contact your administrator.');
        } else if (error.message.includes('user_not_found')) {
          setError('👤 No account found with this email. Please check your email or contact your administrator.');
        } else if (error.message.includes('too_many_requests')) {
          setError('⏰ Too many login attempts. Please wait a few minutes before trying again.');
        } else {
          setError(`⚠️ ${error.message}`);
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
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm text-center">{success}</p>
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
            <div className="text-red-600 text-sm text-center">
              {error}
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

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Contact your administrator for account access
          </p>
        </div>
      </div>
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
