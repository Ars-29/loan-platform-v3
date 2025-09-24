'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// interface Company {
//   id: string;
//   name: string;
// }

interface UserRole {
  role: 'super_admin' | 'company_admin' | 'employee';
  companyId?: string;
  isActive?: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  // Cache invalidation functions
  const clearProfileCache = useCallback(() => {
    try {
      localStorage.removeItem('loan_officer_profile_cache');
      console.log('🗑️ Profile cache cleared from useAuth');
    } catch (error) {
      console.error('Error clearing profile cache:', error);
    }
  }, []);

  const invalidateCacheOnUserChange = useCallback((newUser: User | null, oldUser: User | null) => {
    // Only clear cache if user actually changed (different ID or email) or signed out
    if (!newUser) {
      // User signed out
      clearProfileCache();
    } else if (!oldUser) {
      // First time user is set (initial load) - don't clear cache
      console.log('🔐 useAuth: Initial user load, keeping existing cache');
    } else if (newUser.id !== oldUser.id || newUser.email !== oldUser.email) {
      // User actually changed
      console.log('🔐 useAuth: User changed, clearing cache');
      clearProfileCache();
    } else {
      // Same user, same session - keep cache
      console.log('🔐 useAuth: Same user, keeping cache');
    }
  }, [clearProfileCache]);

  useEffect(() => {
    setMounted(true);
    let isMounted = true;

    // 1) Resolve auth state immediately on mount (fast, reads from memory/localStorage)
    (async () => {
      let session = null;
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        session = currentSession;
        if (!isMounted) return;
        if (session?.user) {
          console.log('🔐 useAuth: Initial session detected for:', session.user.email);
          setUser(session.user);
          setAccessToken(session.access_token);
          // Fetch user role but don't block on it
          fetchUserRole(session.user.id).catch(err => {
            console.error('🔐 useAuth: Error fetching user role:', err);
            // Set default role if fetch fails
            setUserRole({ role: 'employee', isActive: true });
            setRoleLoading(false);
          });
        } else {
          console.log('🔐 useAuth: No initial session');
        }
      } catch (err) {
        console.error('🔐 useAuth: getSession error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
          // Only set role loading to false if no user was found
          if (!session?.user) {
            setRoleLoading(false);
          }
        }
      }
    })();

    // 2) Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted) {
        console.log('🔐 useAuth: Loading timeout reached, setting loading to false');
        setLoading(false);
        setRoleLoading(false);
      }
    }, 3000); // Increased to 3 seconds to allow role loading

    // 2) Listen for subsequent auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('🔐 useAuth: Auth state changed:', event, session?.user?.email);
        
        const previousUser = user;
        
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          console.log('🔐 useAuth: User authenticated:', session.user.email, 'Event:', event);
          setUser(session.user);
          setAccessToken(session.access_token);
          // Fetch user role but don't block
          fetchUserRole(session.user.id).catch(err => {
            console.error('🔐 useAuth: Error fetching user role in auth change:', err);
            setUserRole({ role: 'employee', isActive: true });
            setRoleLoading(false);
          });
          // No need for profile prewarming - using user data directly
          // Only invalidate cache on actual sign in, not initial session
          if (event === 'SIGNED_IN') {
            invalidateCacheOnUserChange(session.user, previousUser);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🔐 useAuth: User signed out');
          setUser(null);
          setUserRole(null);
          setAccessToken(null);
          setCompanyId(null);
          setRoleLoading(false);
          // No need for profile prewarming - using user data directly
          // Clear cache on sign out
          clearProfileCache();
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Handle token refresh - user is still signed in
          console.log('🔐 useAuth: Token refreshed, user still signed in:', session.user.email);
          setUser(session.user);
          // Fetch user role but don't block
          fetchUserRole(session.user.id).catch(err => {
            console.error('🔐 useAuth: Error fetching user role on token refresh:', err);
            setUserRole({ role: 'employee', isActive: true });
            setRoleLoading(false);
          });
          // Don't clear cache on token refresh - same user
        }
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('🔍 useAuth: Fetching user role for:', userId);
      const startTime = Date.now();
      
      // First check if user exists and is not deactivated
      const { data: userData } = await supabase
        .from('users')
        .select('role, deactivated, is_active')
        .eq('id', userId)
        .single();

      if (!userData) {
        console.log('🔍 useAuth: User not found');
        setUser(null);
        setUserRole(null);
        setCompanyId(null);
        return;
      }

      // Check if user is deactivated
      if (userData.deactivated) {
        console.log('🔍 useAuth: User is deactivated, signing out');
        await supabase.auth.signOut();
        setUser(null);
        setUserRole(null);
        setCompanyId(null);
        return;
      }

      // Check if user is active (not in invite flow)
      if (userData.is_active === false) {
        console.log('🔍 useAuth: User is not active (in invite flow), skipping role fetch');
        setUserRole({ role: userData.role, isActive: false });
        return;
      }

      // Check if user is super admin
      if (userData.role === 'super_admin') {
        console.log('🔍 useAuth: User is super admin');
        setUserRole({ role: 'super_admin', isActive: true });
        setRoleLoading(false);
        return;
      }

      // Check if user is company admin
      if (userData.role === 'company_admin') {
        console.log('🔍 useAuth: User is company admin');
        // Get company ID for company admin
        const { data: userCompany } = await supabase
          .from('user_companies')
          .select('company_id')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .single();

        if (userCompany) {
          console.log('🔍 useAuth: Found company ID:', userCompany.company_id);
          
          // Check if the company is deactivated
          const { data: companyData } = await supabase
            .from('companies')
            .select('deactivated')
            .eq('id', userCompany.company_id)
            .single();

          if (companyData && companyData.deactivated) {
            console.log('🔍 useAuth: Company is deactivated, signing out company admin');
            await supabase.auth.signOut();
            setUser(null);
            setUserRole(null);
            setCompanyId(null);
            return;
          }

          setUserRole({ role: 'company_admin', companyId: userCompany.company_id, isActive: true });
          setCompanyId(userCompany.company_id);
        } else {
          console.log('🔍 useAuth: No company found for company admin');
          setUserRole({ role: 'company_admin', isActive: true });
        }
        setRoleLoading(false);
        return;
      }

      // Check user-company relationship for employees
      const { data: userCompanies } = await supabase
        .from('user_companies')
        .select('company_id, role')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (userCompanies && userCompanies.length > 0) {
        // Use the first active company relationship
        const userCompany = userCompanies[0];
        console.log('🔍 useAuth: User is employee with company:', userCompany.company_id);
        
        // Check if the company is deactivated
        const { data: companyData } = await supabase
          .from('companies')
          .select('deactivated')
          .eq('id', userCompany.company_id)
          .single();

        if (companyData && companyData.deactivated) {
          console.log('🔍 useAuth: Company is deactivated, signing out employee');
          await supabase.auth.signOut();
          setUser(null);
          setUserRole(null);
          setCompanyId(null);
          return;
        }

        setUserRole({ role: 'employee', companyId: userCompany.company_id, isActive: true });
        setCompanyId(userCompany.company_id);
      } else {
        console.log('🔍 useAuth: User has no company relationship');
        setUserRole({ role: 'employee', isActive: true });
      }
      setRoleLoading(false);
      
      const endTime = Date.now();
      console.log('🔍 useAuth: User role fetch completed in:', endTime - startTime, 'ms');
    } catch (error) {
      console.error('🔍 useAuth: Error fetching user role:', error);
      // Set a default role to prevent infinite loading
      setUserRole({ role: 'employee', isActive: true });
      setRoleLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      setCompanyId(null);
      // Clear cache on manual sign out
      clearProfileCache();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isSuperAdmin = userRole?.role === 'super_admin';
  const isCompanyAdmin = userRole?.role === 'company_admin';
  const isEmployee = userRole?.role === 'employee';

  return {
    user,
    userRole,
    companyId,
    accessToken,
    loading: loading || !mounted,
    roleLoading,
    signOut,
    isSuperAdmin,
    isCompanyAdmin,
    isEmployee,
    isAuthenticated: !!user,
    clearProfileCache, // Export cache clearing function
  };
}
