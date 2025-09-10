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
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

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
    
    // For free Supabase plan, we rely only on onAuthStateChange
    // No initial session check to avoid getSession() calls

    // macOS-specific: Add small delay to ensure auth state is ready
    const initTimeout = setTimeout(() => {
      if (loading) {
        console.log('🔐 useAuth: macOS timeout - forcing loading to false');
        setLoading(false);
      }
    }, 10000);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('🔐 useAuth: Auth state changed:', event, session?.user?.email);
        
        const previousUser = user;
        
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          console.log('🔐 useAuth: User authenticated:', session.user.email, 'Event:', event);
          setUser(session.user);
          await fetchUserRole(session.user.id);
          // Only invalidate cache on actual sign in, not initial session
          if (event === 'SIGNED_IN') {
            invalidateCacheOnUserChange(session.user, previousUser);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🔐 useAuth: User signed out');
          setUser(null);
          setUserRole(null);
          setCompanyId(null);
          // Clear cache on sign out
          clearProfileCache();
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Handle token refresh - user is still signed in
          console.log('🔐 useAuth: Token refreshed, user still signed in:', session.user.email);
          setUser(session.user);
          await fetchUserRole(session.user.id);
          // Don't clear cache on token refresh - same user
        }
        setLoading(false);
        clearTimeout(initTimeout);
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(initTimeout);
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('🔍 useAuth: Fetching user role for:', userId);
      
      // First check if user exists and is not deactivated
      const { data: userData } = await supabase
        .from('users')
        .select('role, deactivated')
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

      // Check if user is super admin
      if (userData.role === 'super_admin') {
        console.log('🔍 useAuth: User is super admin');
        setUserRole({ role: 'super_admin' });
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

          setUserRole({ role: 'company_admin', companyId: userCompany.company_id });
          setCompanyId(userCompany.company_id);
        } else {
          console.log('🔍 useAuth: No company found for company admin');
          setUserRole({ role: 'company_admin' });
        }
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

        setUserRole({ role: 'employee', companyId: userCompany.company_id });
        setCompanyId(userCompany.company_id);
      } else {
        console.log('🔍 useAuth: User has no company relationship');
        setUserRole({ role: 'employee' });
      }
    } catch (error) {
      console.error('🔍 useAuth: Error fetching user role:', error);
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
    loading: loading || !mounted,
    signOut,
    isSuperAdmin,
    isCompanyAdmin,
    isEmployee,
    isAuthenticated: !!user,
    clearProfileCache, // Export cache clearing function
  };
}
