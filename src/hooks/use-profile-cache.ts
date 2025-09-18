'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { redisCache } from '@/lib/redis';
import { User } from '@supabase/supabase-js';

export interface LoanOfficerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  nmlsNumber: string | null;
  title: string | null;
  company?: {
    id: string;
    name: string;
    logo: string | null;
    website: string | null;
    phone: string | null;
    email: string | null;
  };
  isOnline: boolean;
  lastLoginAt: string | null;
}

interface CachedProfile {
  profile: LoanOfficerProfile;
  userId: string;
  userEmail: string;
  cachedAt: string;
  lastLoginAt: string | null;
}

const CACHE_KEY = 'loan_officer_profile_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const MEMORY_TTL = 60 * 1000; // 60s in-memory hot cache to eliminate spinners on navigation

// Simple in-memory hot cache (per-tab)
const memoryCache: Map<string, { data: CachedProfile; expiresAt: number }> = new Map();

export function useProfileCache() {
  const [profile, setProfile] = useState<LoanOfficerProfile | null>(null);
  const [loading, setLoading] = useState(false); // set true only during actual network work
  const [error, setError] = useState<string | null>(null);

  console.log('🔍 useProfileCache hook initialized:', { loading, hasProfile: !!profile });

  // Debug loading state changes
  React.useEffect(() => {
    console.log('🔍 Profile loading state changed:', { loading, hasProfile: !!profile });
  }, [loading, profile]);

  // Get cached profile from localStorage
  const getCachedProfile = useCallback((): CachedProfile | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const parsedCache: CachedProfile = JSON.parse(cached);
      
      // Check if cache is expired
      const cacheAge = Date.now() - new Date(parsedCache.cachedAt).getTime();
      if (cacheAge > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return parsedCache;
    } catch (error) {
      console.error('Error reading cached profile:', error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }, []);

  // Save profile to cache
  const saveToCache = useCallback((profile: LoanOfficerProfile, userId: string, userEmail: string) => {
    try {
      const cacheData: CachedProfile = {
        profile,
        userId,
        userEmail,
        cachedAt: new Date().toISOString(),
        lastLoginAt: profile.lastLoginAt,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('💾 Profile cached successfully');
    } catch (error) {
      console.error('Error saving profile to cache:', error);
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    console.log('🗑️ Profile cache cleared');
  }, []);

  // Check if cached profile matches current user
  const isCacheValid = useCallback((cachedProfile: CachedProfile, currentUser: User): boolean => {
    // Only check userId and email - don't compare lastLoginAt as it causes cache invalidation
    const isValid = (
      cachedProfile.userId === currentUser.id &&
      cachedProfile.userEmail === currentUser.email
    );
    
    if (!isValid) {
      console.log('❌ Cache invalid - user mismatch:', {
        cachedUserId: cachedProfile.userId,
        currentUserId: currentUser.id,
        cachedEmail: cachedProfile.userEmail,
        currentEmail: currentUser.email
      });
    } else {
      console.log('✅ Cache valid for user:', currentUser.email);
    }
    
    return isValid;
  }, []);

  // Fetch fresh profile data
  const fetchProfile = useCallback(async (user: User): Promise<LoanOfficerProfile> => {
    console.log('🔍 Fetching fresh profile data for user:', user.email, 'ID:', user.id);

    // Fetch user data from users table
    console.log('🔍 Starting Supabase user query...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        avatar,
        last_login_at,
        created_at
      `)
      .eq('id', user.id)
      .single();
    
    console.log('🔍 Supabase user query completed:', { userData, userError });

    if (userError) {
      console.error('❌ Error fetching user data:', userError);
      console.error('❌ User ID being queried:', user.id);
      throw new Error(`Failed to fetch user data: ${userError.message || 'Unknown error'}`);
    }

    if (!userData) {
      console.error('❌ No user data returned for ID:', user.id);
      throw new Error('No user data found');
    }

    console.log('✅ User data fetched:', userData);

    // Fetch company data
    console.log('🔍 Starting Supabase company query...');
    const { data: companyData, error: companyError } = await supabase
      .from('user_companies')
      .select(`
        role,
        companies!inner(
          id,
          name,
          logo,
          website,
          phone,
          email,
          license_number,
          address
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .single();
    
    console.log('🔍 Supabase company query completed:', { companyData, companyError });

    if (companyError) {
      console.error('❌ Error fetching company data:', companyError);
      console.error('❌ This is not critical, continuing without company data');
    } else {
      console.log('✅ Company data fetched:', companyData);
    }

    // Determine if user is online
    const isOnline = userData.last_login_at 
      ? new Date(userData.last_login_at).getTime() > (Date.now() - 5 * 60 * 1000)
      : false;

    // Build profile object
    const profileData: LoanOfficerProfile = {
      id: userData.id,
      firstName: userData.first_name || userData.email?.split('@')[0] || 'User',
      lastName: userData.last_name || 'Smith',
      email: userData.email,
      phone: userData.phone || null,
      avatar: userData.avatar,
      nmlsNumber: null, // Not in database schema
      title: null, // Not in database schema
      company: companyData?.companies ? {
        id: (companyData.companies as any).id,
        name: (companyData.companies as any).name,
        logo: (companyData.companies as any).logo,
        website: (companyData.companies as any).website,
        phone: (companyData.companies as any).phone,
        email: (companyData.companies as any).email,
      } : undefined,
      isOnline,
      lastLoginAt: userData.last_login_at,
    };

    console.log('🎉 Fresh profile data built:', profileData);

    // Update last login time
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    return profileData;
  }, []);

  // Main function to get profile (with caching logic)
  const getProfile = useCallback(async (user: User | null, authLoading: boolean) => {
    console.log('🔄 getProfile called:', { user: user?.email, authLoading, userId: user?.id });
    
    // Do not block on authLoading; render from caches or fallback immediately
    
    try {
      console.log('🚀 Starting profile fetch...');
      console.log('🔍 Setting loading to true');
      // only set loading if we expect to hit the network
      setLoading(true);
      setError(null);

      if (!user) {
        console.log('⚠️ No authenticated user yet, using fallback profile');
        const fallbackProfile: LoanOfficerProfile = {
          id: 'fallback',
          firstName: 'User',
          lastName: 'Smith',
          email: 'user@example.com',
          phone: null,
          avatar: null,
          nmlsNumber: null,
          title: null,
          isOnline: true,
          lastLoginAt: null,
        };
        setProfile(fallbackProfile);
        setLoading(false);
        return;
      }

      // Check if we already have a valid profile for this user
      if (profile && profile.id === user.id && profile.email === user.email) {
        console.log('✅ Profile already loaded for user:', {
          userEmail: user.email,
          profileId: profile.id,
          profileEmail: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName
        });
        setLoading(false);
        console.log('✅ Profile loading state cleared (already loaded)');
        return;
      }

      // 0) Check in-memory hot cache first
      const memKey = user.id;
      const mem = memoryCache.get(memKey);
      if (mem && mem.expiresAt > Date.now()) {
        console.log('✅ Using in-memory hot cached profile data');
        setProfile(mem.data.profile);
        setLoading(false);
        return;
      }

      // 1) Check cache (Redis → localStorage fallback)
      let cachedProfile = getCachedProfile();
      if (!cachedProfile) {
        try {
          // Use API route (runs server-side, proper env access) to read Redis
          const res = await fetch(`/api/cache/profile?userId=${encodeURIComponent(user.id)}`);
          const json = await res.json();
          if (json?.success && json?.data && json.data.userId === user.id) {
            console.log('✅ Using Redis cached profile data via API');
            cachedProfile = json.data as CachedProfile;
            localStorage.setItem(CACHE_KEY, JSON.stringify(cachedProfile));
          }
        } catch (e) {
          console.log('⚠️ Redis profile cache API unavailable, continuing with local cache');
        }
      }
      
      if (cachedProfile && isCacheValid(cachedProfile, user)) {
        console.log('✅ Using cached profile data:', {
          id: cachedProfile.profile.id,
          firstName: cachedProfile.profile.firstName,
          lastName: cachedProfile.profile.lastName,
          email: cachedProfile.profile.email
        });
        setProfile(cachedProfile.profile);
        // Warm in-memory cache too
        memoryCache.set(memKey, { data: cachedProfile, expiresAt: Date.now() + MEMORY_TTL });
        setLoading(false);
        console.log('✅ Profile loading state cleared (cached)');
        return;
      }

      console.log('🔄 Cache invalid or expired, fetching fresh data');
      
      // Fetch fresh data with timeout and retry once on timeout
      const withTimeout = <T,>(promise: Promise<T>, ms: number) => {
        return Promise.race([
          promise,
          new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
        ]);
      };

      let freshProfile: LoanOfficerProfile;
      try {
        freshProfile = await withTimeout(fetchProfile(user), 7000) as LoanOfficerProfile;
      } catch (e) {
        console.warn('⚠️ Profile fetch timed out, retrying once...');
        freshProfile = await withTimeout(fetchProfile(user), 7000) as LoanOfficerProfile;
      }
      
      // Save to caches (Redis + local)
      saveToCache(freshProfile, user.id, user.email || 'unknown@example.com');
      try {
        await fetch('/api/cache/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            data: {
              profile: freshProfile,
              userId: user.id,
              userEmail: user.email || 'unknown@example.com',
              cachedAt: new Date().toISOString(),
              lastLoginAt: freshProfile.lastLoginAt,
            }
          })
        });
        console.log('✅ Profile cached in Redis via API');
      } catch (e) {
        console.log('⚠️ Failed to cache profile in Redis via API');
      }
      
      // Set profile
      console.log('✅ Setting fresh profile data:', {
        id: freshProfile.id,
        firstName: freshProfile.firstName,
        lastName: freshProfile.lastName,
        email: freshProfile.email
      });
      setProfile(freshProfile);
      // Hot cache in memory
      memoryCache.set(memKey, { data: {
        profile: freshProfile,
        userId: user.id,
        userEmail: user.email || 'unknown@example.com',
        cachedAt: new Date().toISOString(),
        lastLoginAt: freshProfile.lastLoginAt,
      }, expiresAt: Date.now() + MEMORY_TTL });
      setLoading(false);
      console.log('✅ Profile loading state cleared');

    } catch (err) {
      console.error('❌ Error in getProfile:', err);
      setError(err instanceof Error ? (err.message || 'Unknown error') : 'Failed to fetch profile');
      
      // Try to use cached data even if expired as fallback
      const cachedProfile = getCachedProfile();
      if (cachedProfile) {
        console.log('⚠️ Using expired cached data as fallback');
        setProfile(cachedProfile.profile);
      } else if (user) {
        // Use user data as fallback
        console.log('⚠️ Using user data as fallback');
        const fallbackProfile: LoanOfficerProfile = {
          id: user.id,
          firstName: user.user_metadata?.first_name || user.email?.split('@')[0] || 'User',
          lastName: user.user_metadata?.last_name || 'Smith',
          email: user.email || 'user@example.com',
          phone: user.user_metadata?.phone || null,
          avatar: user.user_metadata?.avatar_url || null,
          nmlsNumber: null,
          title: null,
          isOnline: true,
          lastLoginAt: null,
        };
        setProfile(fallbackProfile);
      } else {
        // Use generic fallback data
        const fallbackProfile: LoanOfficerProfile = {
          id: 'fallback',
          firstName: 'User',
          lastName: 'Smith',
          email: 'user@example.com',
          phone: null,
          avatar: null,
          nmlsNumber: null,
          title: null,
          isOnline: true,
          lastLoginAt: null,
        };
        setProfile(fallbackProfile);
      }
      setLoading(false);
    }
  }, [getCachedProfile, isCacheValid, fetchProfile, saveToCache]);

  // Force refresh profile (bypass cache)
  const refreshProfile = useCallback(async (user: User | null) => {
    if (!user) return;
    
    console.log('🔄 Force refreshing profile data');
    clearCache();
    await getProfile(user, false);
  }, [clearCache, getProfile]);

  return {
    profile,
    loading,
    error,
    getProfile,
    refreshProfile,
    clearCache,
  };
}
