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
import { LiquidChromeBackground } from '@/components/ui/LiquidChromeBackground';

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01bcc6]"></div>
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
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Reset Password Card */}
          <div className="bg-[#F7F1E9]/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#F7F1E9]/40">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#01bcc6] to-[#008eab] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-[#005b7c] mb-4 drop-shadow-lg">
                Set New Password
              </h2>
              <p className="text-[#005b7c]/80 text-lg">
                Enter your new password below
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#005b7c] mb-3">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-[#01bcc6]/60" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-[#01bcc6]/20 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-[#01bcc6]/20 focus:border-[#01bcc6] transition-all duration-300 bg-[#F7F1E9]/50 backdrop-blur-sm text-[#005b7c] font-medium placeholder-[#005b7c]/50"
                    placeholder="Enter your new password"
                    required
                    minLength={8}
                  />
                </div>
                <p className="text-xs text-[#005b7c]/60 mt-2">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#005b7c] mb-3">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-[#01bcc6]/60" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 border-2 border-[#01bcc6]/20 rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-[#01bcc6]/20 focus:border-[#01bcc6] transition-all duration-300 bg-[#F7F1E9]/50 backdrop-blur-sm text-[#005b7c] font-medium placeholder-[#005b7c]/50"
                    placeholder="Confirm your new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-[#01bcc6]/60" />
                    ) : (
                      <Eye className="h-5 w-5 text-[#01bcc6]/60" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm text-green-700 font-medium">
                  Your password will be updated securely
                </span>
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="w-full bg-gradient-to-r from-[#01bcc6] to-[#008eab] hover:from-[#008eab] hover:to-[#005b7c] text-white py-4 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  <Lock className="h-5 w-5" />
                  <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#005b7c]/70">
                Remember your password?{' '}
                <button
                  onClick={() => router.push('/auth')}
                  className="text-[#01bcc6] hover:text-[#008eab] font-medium transition-colors duration-200"
                >
                  Sign in instead
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#01bcc6]"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
