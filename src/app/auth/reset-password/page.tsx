'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/Input';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { useNotification } from '@/components/ui/Notification';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showNotification } = useNotification();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check if we have a valid password reset session
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if we have URL hash parameters (from password reset link)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        console.log('URL hash:', window.location.hash);
        console.log('Access token:', accessToken ? 'Present' : 'Missing');
        console.log('Refresh token:', refreshToken ? 'Present' : 'Missing');
        
        if (accessToken && refreshToken) {
          // Set the session from URL parameters
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          console.log('Session set result:', { data, error });
          
          if (error) {
            console.error('Session set error:', error);
            showNotification({
              type: 'error',
              title: 'Error',
              message: 'Invalid or expired reset link. Please request a new one.'
            });
            router.push('/auth');
            return;
          }
          
          if (data.session?.user) {
            console.log('Session set successfully, user:', data.session.user.email);
            setIsValidSession(true);
            setCheckingSession(false);
            return;
          }
        }

        // Fallback: check current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session check error:', sessionError);
          showNotification({
            type: 'error',
            title: 'Error',
            message: 'Invalid or expired reset link. Please request a new one.'
          });
          router.push('/auth');
          return;
        }

        if (session?.user) {
          setIsValidSession(true);
        } else {
          showNotification({
            type: 'error',
            title: 'Error',
            message: 'Invalid or expired reset link. Please request a new one.'
          });
          router.push('/auth');
        }
      } catch (error) {
        console.error('Error checking session:', error);
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Error validating reset link. Please try again.'
        });
        router.push('/auth');
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [router, showNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Password must be at least 8 characters long.'
      });
      return;
    }

    if (password !== confirmPassword) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Passwords do not match.'
      });
      return;
    }

    setLoading(true);

    try {
      // Check current session before updating
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session before update:', { session: session?.user?.email, error: sessionError });
      
      if (sessionError || !session?.user) {
        throw new Error('No valid session found. Please refresh the page and try again.');
      }

      // Update the password
      console.log('Attempting to update password...');
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        throw error;
      }
      
      console.log('Password updated successfully');

      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Password updated successfully! Redirecting to dashboard...'
      });
      
      // Wait a moment then redirect
      setTimeout(() => {
        router.push('/officers/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Password update error:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update password. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-4">This password reset link is invalid or has expired.</p>
          <Button onClick={() => router.push('/auth')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <SpotlightCard variant="primary" className="p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <PasswordInput
                label="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                required
                minLength={8}
              />
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters long
              </p>
            </div>

            <div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">
                  Your password will be updated securely
                </span>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                loading={loading}
                disabled={loading || !password || !confirmPassword}
                className="w-full flex items-center justify-center space-x-2"
              >
                <Lock className="h-4 w-4" />
                <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
              </Button>
            </div>
          </form>
        </SpotlightCard>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <button
              onClick={() => router.push('/auth')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in instead
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
