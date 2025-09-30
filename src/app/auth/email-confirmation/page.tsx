'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { useNotification } from '@/components/ui/Notification';
import { LiquidChromeBackground } from '@/components/ui/LiquidChromeBackground';

function EmailConfirmationContent() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'success' | 'error' | 'loading'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showNotification } = useNotification();

  // Function to sync company email if user is a company admin
  const syncCompanyEmail = async (userId: string, newEmail: string) => {
    try {
      console.log('🏢 Checking if user is a company admin...');
      
      const response = await fetch('/api/company/sync-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          newEmail: newEmail
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('✅ Company email synced successfully:', result.data);
      } else {
        console.log('ℹ️ User is not a company admin or company sync not needed:', result.error);
      }
    } catch (error: any) {
      console.warn('⚠️ Company email sync failed (non-critical):', error.message);
    }
  };

  // Function to sync email from Supabase Auth to users table
  const syncEmailToUsersTable = async () => {
    try {
      console.log('🔄 Syncing email to users table...');
      
      // Get current user session to get the new email
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('❌ Error getting user:', userError);
        throw new Error('Could not get user information');
      }

      console.log('👤 Current user:', { id: user.id, email: user.email });

      // Call API to update email in users table
      const response = await fetch('/api/user/update-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          newEmail: user.email
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('❌ Error updating users table:', result.error);
        throw new Error(result.error || 'Failed to update email in database');
      }

      console.log('✅ Email synced successfully:', result.data);

      // Also sync company email if user is a company admin
      if (user.email) {
        await syncCompanyEmail(user.id, user.email);
      }

      setStatus('success');
      setMessage('Email successfully updated! You can now use your new email address.');
      showNotification({
        type: 'success',
        title: 'Email Updated Successfully',
        message: 'Your email address has been successfully updated.'
      });
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/officers/dashboard');
      }, 3000);

    } catch (error: any) {
      console.error('❌ Error syncing email:', error);
      setStatus('error');
      setMessage(`Email confirmation successful, but failed to update database: ${error.message}`);
      showNotification({
        type: 'error',
        title: 'Partial Success',
        message: 'Email confirmed but database update failed. Please contact support.'
      });
    }
  };

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get URL parameters
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const next = searchParams.get('next') ?? '/';

        // Check for URL hash parameters (alternative way Supabase might send data)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashToken = hashParams.get('access_token');
        const hashType = hashParams.get('type');
        const hashMessage = hashParams.get('message');
        const hashRefreshToken = hashParams.get('refresh_token');

        console.log('URL params:', { 
          token_hash, 
          type, 
          hashToken, 
          hashType, 
          hashMessage, 
          hashRefreshToken,
          fullHash: window.location.hash 
        });

        // Method 1: Handle OTP verification (token_hash + type)
        if (token_hash && type) {
          console.log('Attempting OTP verification...');
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          });

          if (error) {
            console.error('OTP verification error:', error);
            setStatus('error');
            setMessage(`Failed to confirm email change: ${error.message}`);
            showNotification({
              type: 'error',
              title: 'Email Confirmation Failed',
              message: error.message || 'The confirmation link is invalid or expired.'
            });
          } else {
            console.log('OTP verification successful');
            await syncEmailToUsersTable();
          }
        }
        // Method 2: Handle session-based confirmation (access_token + refresh_token)
        else if (hashToken && hashRefreshToken) {
          console.log('Attempting session-based confirmation...');
          const { error } = await supabase.auth.setSession({
            access_token: hashToken,
            refresh_token: hashRefreshToken
          });

          if (error) {
            console.error('Session confirmation error:', error);
            setStatus('error');
            setMessage(`Failed to confirm email change: ${error.message}`);
            showNotification({
              type: 'error',
              title: 'Email Confirmation Failed',
              message: error.message || 'The confirmation link is invalid or expired.'
            });
          } else {
            console.log('Session confirmation successful');
            await syncEmailToUsersTable();
          }
        }
        // Method 3: Handle hash message (informational)
        else if (hashMessage) {
          console.log('Handling hash message:', hashMessage);
          if (hashMessage.includes('Confirmation link accepted')) {
            setStatus('success');
            setMessage('Email change confirmed! Please check your other email for the final confirmation.');
            showNotification({
              type: 'success',
              title: 'First Confirmation Complete',
              message: 'Please check your other email for the final confirmation link.'
            });
          } else {
            setStatus('error');
            setMessage('Confirmation process incomplete. Please try again.');
          }
        }
        // Method 4: Check if user is already authenticated (might be a redirect after successful confirmation)
        else {
          console.log('Checking current session...');
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (session && !sessionError) {
            console.log('User is already authenticated, email change likely successful');
            await syncEmailToUsersTable();
          } else {
            console.log('No valid confirmation method found');
            setStatus('error');
            setMessage('Invalid confirmation link. Please try again or request a new confirmation email.');
          }
        }
      } catch (error) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setMessage('An error occurred while confirming your email change.');
        showNotification({
          type: 'error',
          title: 'Confirmation Error',
          message: 'An unexpected error occurred. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [searchParams, router, showNotification]);

  if (loading) {
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
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="bg-[#F7F1E9]/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#F7F1E9]/40">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#01bcc6] to-[#008eab] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
                <h2 className="text-3xl font-bold text-[#005b7c] mb-4 drop-shadow-lg">Confirming Email</h2>
                <p className="text-[#005b7c]/80 text-lg">Please wait while we confirm your email change...</p>
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
        <div className="max-w-md w-full">
          <div className="bg-[#F7F1E9]/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#F7F1E9]/40">
            {status === 'success' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-[#005b7c] mb-4 drop-shadow-lg">Email Updated!</h2>
                <p className="text-[#005b7c]/80 text-lg mb-6">{message}</p>
                <p className="text-sm text-[#005b7c]/60 mb-6">
                  Redirecting to dashboard in 3 seconds...
                </p>
                <button
                  onClick={() => router.push('/officers/dashboard')}
                  className="w-full bg-gradient-to-r from-[#01bcc6] to-[#008eab] hover:from-[#008eab] hover:to-[#005b7c] text-white py-3 px-6 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Go to Dashboard
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-[#005b7c] mb-4 drop-shadow-lg">Confirmation Failed</h2>
                <p className="text-[#005b7c]/80 text-lg mb-6">{message}</p>
                <div className="space-y-4">
                  <button
                    onClick={() => router.push('/officers/settings')}
                    className="w-full bg-gradient-to-r from-[#01bcc6] to-[#008eab] hover:from-[#008eab] hover:to-[#005b7c] text-white py-3 px-6 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    Back to Settings
                  </button>
                  <button
                    onClick={() => router.push('/officers/dashboard')}
                    className="w-full bg-[#F7F1E9] text-[#005b7c] border-2 border-[#01bcc6]/30 hover:bg-[#01bcc6]/10 hover:border-[#01bcc6]/50 py-3 px-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function EmailConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#005b7c] via-[#008eab] to-[#01bcc6]">
        <LiquidChromeBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#01bcc6]"></div>
        </div>
      </div>
    }>
      <EmailConfirmationContent />
    </Suspense>
  );
}
