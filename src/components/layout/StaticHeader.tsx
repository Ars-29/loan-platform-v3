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
                <h1 style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  color: '#111827' 
                }}>
                  Loan Officer Platform
                </h1>
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
                    backgroundColor: '#9ca3af' 
                  }}></div>
                </div>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>
                  <span style={{ 
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    border: '2px solid #e5e7eb',
                    borderTop: '2px solid #3b82f6',
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
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#111827',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#111827';
                }}
              >
                Loan Officer Platform
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
                padding: '8px',
                borderRadius: '8px',
                transition: 'background-color 0.2s ease-in-out',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
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
                ...dashboard.button.primary,
              }}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, dashboard.button.primaryHover);
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, dashboard.button.primary);
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
