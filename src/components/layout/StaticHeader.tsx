'use client';

import React, { memo, useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { dashboard } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';
import { supabase } from '@/lib/supabase/client';

// No props interface needed - component gets data from useAuth

const StaticHeader = memo(function StaticHeader() {
  const { user, signOut, userRole, loading: authLoading, roleLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Stable state that only updates when user actually changes
  const [stableUserData, setStableUserData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    fullName: '',
    initial: 'U',
    role: 'employee',
    avatar: null as string | null
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch user profile data from users table
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('first_name, last_name, avatar')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to email-based data
          setStableUserData(prev => ({
            ...prev,
            email: user.email || '',
            initial: user.email?.charAt(0).toUpperCase() || 'U',
            role: userRole?.role || 'employee'
          }));
          return;
        }

        const firstName = data.first_name || '';
        const lastName = data.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || user.email || '';
        const initial = firstName ? firstName.charAt(0).toUpperCase() : 
                       lastName ? lastName.charAt(0).toUpperCase() : 
                       user.email?.charAt(0).toUpperCase() || 'U';

        setStableUserData({
          email: user.email || '',
          firstName,
          lastName,
          fullName,
          initial,
          role: userRole?.role || 'employee',
          avatar: data.avatar
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to email-based data
        setStableUserData(prev => ({
          ...prev,
          email: user.email || '',
          initial: user.email?.charAt(0).toUpperCase() || 'U',
          role: userRole?.role || 'employee'
        }));
      } finally {
        setProfileLoading(false);
      }
    };

    if (user?.id && userRole?.role) {
      fetchUserProfile();
    }
  }, [user?.id, user?.email, userRole?.role]);

  // Memoize role display name based on stable data
  const roleDisplayName = useMemo(() => {
    switch (stableUserData.role) {
      case 'super_admin':
        return 'Super Admin';
      case 'company_admin':
        return 'Company Admin';
      case 'employee':
        return 'Loan Officer';
      default:
        return 'User';
    }
  }, [stableUserData.role]);

  // Get dashboard URL based on user role
  const getDashboardUrl = useMemo(() => {
    switch (stableUserData.role) {
      case 'super_admin':
        return '/super-admin/dashboard';
      case 'company_admin':
        return '/admin/dashboard';
      case 'employee':
        return '/officers/dashboard';
      default:
        return '/officers/dashboard';
    }
  }, [stableUserData.role]);

  // Don't render if auth is still loading OR if user role is not yet determined
  if (authLoading || roleLoading || profileLoading || !user || !userRole) {
    return (
      <nav style={dashboard.nav}>
        <div style={dashboard.navContent}>
          <div style={dashboard.navInner}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flexShrink: 0 }}>
                <Image
                  src="/images/logos/LoanOffW.png"
                  alt="Loan Officer Platform"
                  width={100}
                  height={20}
                  style={{
                    height: 'auto',
                    maxHeight: '20px',
                    width: 'auto'
                  }}
                />
              </div>
            </div>
            <div style={dashboard.userInfo}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                opacity: 0.5 
              }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  backgroundColor: '#e5e7eb',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    borderRadius: '50%', 
                    backgroundColor: '#01bcc6' 
                  }}></div>
                </div>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>
                  <span style={{ 
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    border: '2px solid #e5e7eb',
                    borderTop: '2px solid #01bcc6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px'
                  }}></span>
                  Loading...
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  const handleProfileClick = () => {
    // Navigate to settings page based on user role
    if (userRole?.role === 'super_admin') {
      router.push('/super-admin/settings');
    } else if (userRole?.role === 'company_admin') {
      router.push('/admin/settings');
    } else {
      router.push('/officers/settings');
    }
  };

  return (
    <nav style={dashboard.nav}>
      <div style={dashboard.navContent}>
        <div style={dashboard.navInner}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flexShrink: 0 }}>
              <button
                onClick={() => router.push(getDashboardUrl)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  transition: 'opacity 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8'; /* Semi-transparent on hover */
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'; /* Back to full opacity */
                }}
              >
                <Image
                  src="/images/logos/LoanOffW.png"
                  alt="Loan Officer Platform"
                  width={100}
                  height={20}
                  style={{
                    height: 'auto',
                    maxHeight: '20px',
                    width: 'auto'
                  }}
                />
              </button>
            </div>
          </div>
          
          <div style={dashboard.userInfo}>
            <button
              onClick={handleProfileClick}
              style={{
                ...dashboard.userInfo,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem 1rem', /* Match breadcrumb button padding */
                borderRadius: '0.75rem', /* 12px - match breadcrumb buttons */
                transition: 'all 0.2s ease', /* Smooth transitions for all properties */
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0177a385'; /* Same hover color as breadcrumb */
                e.currentTarget.style.transform = 'translateY(-1px)'; /* Lift effect */
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'; /* Subtle shadow */
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)'; /* Reset position */
                e.currentTarget.style.boxShadow = 'none'; /* Remove shadow */
              }}
            >
              <div style={dashboard.userDetails}>
                <p style={dashboard.userEmail}>
                  {stableUserData.fullName || stableUserData.email}
                </p>
                <p style={dashboard.userRole}>{roleDisplayName}</p>
              </div>
              <div style={dashboard.userAvatar}>
                {stableUserData.avatar ? (
                  <Image
                    src={stableUserData.avatar}
                    alt={stableUserData.fullName || stableUserData.email}
                    width={32}
                    height={32}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <span style={dashboard.userAvatarText}>
                    {stableUserData.initial}
                  </span>
                )}
              </div>
            </button>
            
            <button
              onClick={handleSignOut}
              style={{
                background: 'linear-gradient(135deg, #01bcc6 0%, #008eab 100%)', /* Same as Settings button */
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem', /* 12px - matches breadcrumb buttons */
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(1, 188, 198, 0.3)', /* Same shadow as Settings button */
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(1, 188, 198, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(1, 188, 198, 0.3)';
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
});

export default StaticHeader;
