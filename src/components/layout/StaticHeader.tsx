'use client';

import React, { memo, useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { dashboard } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';

// No props interface needed - component gets data from useAuth

const StaticHeader = memo(function StaticHeader() {
  const { user, signOut, userRole, loading: authLoading, roleLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Stable state that only updates when user actually changes
  const [stableUserData, setStableUserData] = useState({
    email: '',
    initial: 'U',
    role: 'employee'
  });

  // Only update stable data when user actually changes (not on every auth update)
  useEffect(() => {
    if (user?.email && userRole?.role) {
      setStableUserData({
        email: user.email,
        initial: user.email.charAt(0).toUpperCase(),
        role: userRole.role
      });
    }
  }, [user?.email, userRole?.role]);

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

  // Memoize navigation items based on stable data
  const navigationItems = useMemo(() => {
    switch (stableUserData.role) {
      case 'super_admin':
        return [
          { name: 'Companies', href: '/admin/companies', current: pathname === '/admin/companies' },
          { name: 'Leads Insights', href: '/super-admin/insights', current: pathname === '/super-admin/insights' },
          { name: 'Conversion Stats', href: '/super-admin/stats', current: pathname === '/super-admin/stats' },
        ];
      case 'company_admin':
        return [
          { name: 'Loan Officers', href: '/companyadmin/loanofficers', current: pathname === '/companyadmin/loanofficers' },
          { name: 'Leads Insights', href: '/admin/insights', current: pathname === '/admin/insights' },
          { name: 'Conversion Stats', href: '/admin/stats', current: pathname === '/admin/stats' },
        ];
      case 'employee':
        return [
          { name: 'Dashboard', href: '/officers/dashboard', current: pathname === '/officers/dashboard' },
          { name: 'Profile', href: '/officers/profile', current: pathname === '/officers/profile' },
          { name: 'Customizer', href: '/officers/customizer', current: pathname === '/officers/customizer' },
          { name: 'Leads', href: '/officers/leads', current: pathname === '/officers/leads' },
        ];
      default:
        return [];
    }
  }, [stableUserData.role, pathname]);

  // Don't render if auth is still loading OR if user role is not yet determined
  if (authLoading || roleLoading || !user || !userRole) {
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
            <div style={{ 
              marginLeft: '24px', 
              ...dashboard.navLinks 
            }}>
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  style={{
                    ...dashboard.navLink,
                    ...(item.current ? dashboard.navLinkActive : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (!item.current) {
                      Object.assign(e.currentTarget.style, dashboard.navLinkHover);
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!item.current) {
                      Object.assign(e.currentTarget.style, dashboard.navLink);
                    }
                  }}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
          
          <div style={dashboard.userInfo}>
            <div style={dashboard.userInfo}>
              <div style={dashboard.userDetails}>
                <p style={dashboard.userEmail}>{stableUserData.email}</p>
                <p style={dashboard.userRole}>{roleDisplayName}</p>
              </div>
              <div style={dashboard.userAvatar}>
                <span style={dashboard.userAvatarText}>
                  {stableUserData.initial}
                </span>
              </div>
            </div>
            
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
