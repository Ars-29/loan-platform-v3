'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { useNotification } from '@/components/ui/Notification';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming email change...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <SpotlightCard variant="primary" className="p-8 text-center">
          {status === 'success' && (
            <div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Updated!</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500 mb-4">
                Redirecting to dashboard in 3 seconds...
              </p>
              <button
                onClick={() => router.push('/officers/dashboard')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirmation Failed</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/officers/settings')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Settings
                </button>
                <button
                  onClick={() => router.push('/officers/dashboard')}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </SpotlightCard>
      </div>
    </div>
  );
}

export default function EmailConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    }>
      <EmailConfirmationContent />
    </Suspense>
  );
}
