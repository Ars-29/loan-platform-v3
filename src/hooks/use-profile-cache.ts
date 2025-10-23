// 'use client';

// import React, { useState, useEffect, useCallback } from 'react';
// import { supabase } from '@/lib/supabase/client';
// import { User } from '@supabase/supabase-js';

// export interface LoanOfficerProfile {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string | null;
//   avatar: string | null;
//   nmlsNumber: string | null;
//   title: string | null;
//   company?: {
//     id: string;
//     name: string;
//     logo: string | null;
//     website: string | null;
//     phone: string | null;
//     email: string | null;
//   };
//   isOnline: boolean;
//   lastLoginAt: string | null;
// }

// interface CachedProfile {
//   profile: LoanOfficerProfile;
//   userId: string;
//   userEmail: string;
//   cachedAt: string;
//   lastLoginAt: string | null;
// }

// const MEMORY_TTL = 60 * 1000; // 60s in-memory hot cache to eliminate spinners on navigation

// // Simple in-memory hot cache (per-tab)
// const memoryCache: Map<string, { data: CachedProfile; expiresAt: number }> = new Map();

// export function useProfileCache() {
//   const [profile, setProfile] = useState<LoanOfficerProfile | null>(null);
//   const [loading, setLoading] = useState(false); // set true only during actual network work
//   const [error, setError] = useState<string | null>(null);

//   console.log('Profile:init', { loading, hasProfile: !!profile });

//   // Debug loading state changes
//   React.useEffect(() => {
//     console.log('Profile:state', { loading, hasProfile: !!profile });
//   }, [loading, profile]);

//   const getCachedProfile = useCallback(async (userId: string, etag?: string): Promise<{ data: CachedProfile | null; etag?: string; notModified?: boolean }> => {
//     const headers: HeadersInit = {};
//     if (etag) headers['If-None-Match'] = etag;
//     const res = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`, { headers });
//     if (res.status === 304) {
//       return { data: null, etag, notModified: true };
//     }
//     if (!res.ok) return { data: null };
//     const json = await res.json();
//     const nextEtag = res.headers.get('etag') || undefined;
//     return { data: json?.data ?? null, etag: nextEtag };
//   }, []);

//   const saveToCache = useCallback(async (profile: LoanOfficerProfile, userId: string, userEmail: string) => {
//     try {
//       const payload: CachedProfile = {
//         profile,
//         userId,
//         userEmail,
//         cachedAt: new Date().toISOString(),
//         lastLoginAt: profile.lastLoginAt,
//       };
//       // best-effort write to Redis via API for future reads
//       await fetch('/api/cache/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, data: payload }) });
//       console.log('Profile:redisSet');
//     } catch {}
//   }, []);

//   // Clear cache
//   const clearCache = useCallback(() => {
//     console.log('Profile:clear');
//   }, []);

//   // Check if cached profile matches current user
//   const isCacheValid = useCallback((cachedProfile: CachedProfile, currentUser: User): boolean => {
//     // Only check userId and email - don't compare lastLoginAt as it causes cache invalidation
//     const isValid = (
//       cachedProfile.userId === currentUser.id &&
//       cachedProfile.userEmail === currentUser.email
//     );
    
//     if (!isValid) {
//       console.log('❌ Cache invalid - user mismatch:', {
//         cachedUserId: cachedProfile.userId,
//         currentUserId: currentUser.id,
//         cachedEmail: cachedProfile.userEmail,
//         currentEmail: currentUser.email
//       });
//     } else {
//       console.log('✅ Cache valid for user:', currentUser.email);
//     }
    
//     return isValid;
//   }, []);

//   // Fetch fresh profile data
//   const fetchProfile = useCallback(async (user: User): Promise<LoanOfficerProfile> => {
//     console.log('Profile:fetch', user.id);

//     // Fetch user data from users table
//     console.log('🔍 Starting Supabase user query...');
//     const { data: userData, error: userError } = await supabase
//       .from('users')
//       .select(`
//         id,
//         first_name,
//         last_name,
//         email,
//         phone,
//         avatar,
//         last_login_at,
//         created_at
//       `)
//       .eq('id', user.id)
//       .single();
    
//     console.log('Profile:userQueryDone');

//     if (userError) {
//       console.error('❌ Error fetching user data:', userError);
//       console.error('❌ User ID being queried:', user.id);
//       throw new Error(`Failed to fetch user data: ${userError.message || 'Unknown error'}`);
//     }

//     if (!userData) {
//       console.error('❌ No user data returned for ID:', user.id);
//       throw new Error('No user data found');
//     }


//     // Fetch company data
//     console.log('Profile:companyQuery');
//     const { data: companyData, error: companyError } = await supabase
//       .from('user_companies')
//       .select(`
//         role,
//         companies!inner(
//           id,
//           name,
//           logo,
//           website,
//           phone,
//           email,
//           license_number,
//           address
//         )
//       `)
//       .eq('user_id', user.id)
//       .eq('is_active', true)
//       .limit(1)
//       .single();
    
//     console.log('Profile:companyQueryDone');

//     if (companyError) {
//       console.error('❌ Error fetching company data:', companyError);
//       console.error('❌ This is not critical, continuing without company data');
//     } else {
//       console.log('✅ Company data fetched:', companyData);
//     }

//     // Determine if user is online
//     const isOnline = userData.last_login_at 
//       ? new Date(userData.last_login_at).getTime() > (Date.now() - 5 * 60 * 1000)
//       : false;

//     // Build profile object
//     const profileData: LoanOfficerProfile = {
//       id: userData.id,
//       firstName: userData.first_name || userData.email?.split('@')[0] || 'User',
//       lastName: userData.last_name || 'Smith',
//       email: userData.email,
//       phone: userData.phone || null,
//       avatar: userData.avatar,
//       nmlsNumber: null, // Not in database schema
//       title: null, // Not in database schema
//       company: companyData?.companies ? {
//         id: (companyData.companies as any).id,
//         name: (companyData.companies as any).name,
//         logo: (companyData.companies as any).logo,
//         website: (companyData.companies as any).website,
//         phone: (companyData.companies as any).phone,
//         email: (companyData.companies as any).email,
//       } : undefined,
//       isOnline,
//       lastLoginAt: userData.last_login_at,
//     };

//     console.log('Profile:freshBuilt');

//     // Update last login time
//     await supabase
//       .from('users')
//       .update({ last_login_at: new Date().toISOString() })
//       .eq('id', user.id);

//     return profileData;
//   }, []);

//   // Main function to get profile (with caching logic)
//   const getProfile = useCallback(async (user: User | null, authLoading: boolean) => {
//     console.log('Profile:get', { user: user?.id, authLoading });
    
//     // Do not block on authLoading; render from caches or fallback immediately
    
//     try {
//       console.log('Profile:start');
//       // only set loading if we expect to hit the network
//       setLoading(true);
//       setError(null);

//       if (!user) {
//         console.log('Profile:fallbackNoUser');
//         const fallbackProfile: LoanOfficerProfile = {
//           id: 'fallback',
//           firstName: 'User',
//           lastName: 'Smith',
//           email: 'user@example.com',
//           phone: null,
//           avatar: null,
//           nmlsNumber: null,
//           title: null,
//           isOnline: true,
//           lastLoginAt: null,
//         };
//         setProfile(fallbackProfile);
//         setLoading(false);
//         return;
//       }

//       // Check if we already have a valid profile for this user
//       if (profile && profile.id === user.id && profile.email === user.email) {
//         console.log('Profile:alreadyLoaded');
//         setLoading(false);
//         console.log('✅ Profile loading state cleared (already loaded)');
//         return;
//       }

//       // 0) Check in-memory hot cache first
//       const memKey = user.id;
//       const mem = memoryCache.get(memKey);
//       if (mem && mem.expiresAt > Date.now()) {
//         console.log('Profile:memHit');
//         setProfile(mem.data.profile);
//         setLoading(false);
//         return;
//       }

//       // 1) Check server cache with ETag
//       const prev = memoryCache.get(memKey);
//       const prevEtag = (prev as any)?.etag as string | undefined;
//       const server = await getCachedProfile(user.id, prevEtag);
//       if (server.notModified && prev) {
//         console.log('Profile:304');
//         setProfile(prev.data.profile);
//         prev.expiresAt = Date.now() + MEMORY_TTL;
//         setLoading(false);
//         return;
//       }
//       if (server.data) {
//         console.log('Profile:redisHit');
//         setProfile(server.data.profile);
//         memoryCache.set(memKey, { data: server.data, expiresAt: Date.now() + MEMORY_TTL } as any);
//         (memoryCache.get(memKey) as any).etag = server.etag;
//         setLoading(false);
//         return;
//       }

//       console.log('Profile:miss');
      
//       // Fetch fresh data with timeout and retry once on timeout
//       const withTimeout = <T,>(promise: Promise<T>, ms: number) => {
//         return Promise.race([
//           promise,
//           new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
//         ]);
//       };

//       let freshProfile: LoanOfficerProfile;
//       try {
//         freshProfile = await withTimeout(fetchProfile(user), 7000) as LoanOfficerProfile;
//       } catch (e) {
//         console.warn('⚠️ Profile fetch timed out, retrying once...');
//         freshProfile = await withTimeout(fetchProfile(user), 7000) as LoanOfficerProfile;
//       }
      
//       // Save to caches (Redis + local)
//       await saveToCache(freshProfile, user.id, user.email || 'unknown@example.com');
//       try {
//         await fetch('/api/cache/profile', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             userId: user.id,
//             data: {
//               profile: freshProfile,
//               userId: user.id,
//               userEmail: user.email || 'unknown@example.com',
//               cachedAt: new Date().toISOString(),
//               lastLoginAt: freshProfile.lastLoginAt,
//             }
//           })
//         });
//         console.log('Profile:redisSet');
//       } catch (e) {
//         console.log('Profile:redisSetFail');
//       }
      
//       // Set profile
//       console.log('Profile:fresh');
//       setProfile(freshProfile);
//       // Hot cache in memory
//       memoryCache.set(memKey, { data: {
//         profile: freshProfile,
//         userId: user.id,
//         userEmail: user.email || 'unknown@example.com',
//         cachedAt: new Date().toISOString(),
//         lastLoginAt: freshProfile.lastLoginAt,
//       }, expiresAt: Date.now() + MEMORY_TTL });
//       setLoading(false);
//       console.log('Profile:done');

//     } catch (err) {
//       console.error('Profile:error', err);
//       setError(err instanceof Error ? (err.message || 'Unknown error') : 'Failed to fetch profile');
      
//       // Try to use server cache even if error locally
//       let cachedProfile: CachedProfile | null = null;
//       try {
//         const server = await getCachedProfile(user?.id || '', undefined);
//         if (server?.data) {
//           cachedProfile = server.data;
//         }
//       } catch {}
//       if (cachedProfile) {
//         console.log('Profile:fallbackExpired');
//         setProfile(cachedProfile.profile);
//       } else if (user) {
//         // Use user data as fallback
//         console.log('Profile:fallbackUser');
//         const fallbackProfile: LoanOfficerProfile = {
//           id: user.id,
//           firstName: user.user_metadata?.first_name || user.email?.split('@')[0] || 'User',
//           lastName: user.user_metadata?.last_name || 'Smith',
//           email: user.email || 'user@example.com',
//           phone: user.user_metadata?.phone || null,
//           avatar: user.user_metadata?.avatar_url || null,
//           nmlsNumber: null,
//           title: null,
//           isOnline: true,
//           lastLoginAt: null,
//         };
//         setProfile(fallbackProfile);
//       } else {
//         // Use generic fallback data
//         const fallbackProfile: LoanOfficerProfile = {
//           id: 'fallback',
//           firstName: 'User',
//           lastName: 'Smith',
//           email: 'user@example.com',
//           phone: null,
//           avatar: null,
//           nmlsNumber: null,
//           title: null,
//           isOnline: true,
//           lastLoginAt: null,
//         };
//         setProfile(fallbackProfile);
//       }
//       setLoading(false);
//     }
//   }, [getCachedProfile, isCacheValid, fetchProfile, saveToCache]);

//   // Force refresh profile (bypass cache)
//   const refreshProfile = useCallback(async (user: User | null) => {
//     if (!user) return;
    
//     console.log('🔄 Force refreshing profile data');
//     clearCache();
//     await getProfile(user, false);
//   }, [clearCache, getProfile]);

//   return {
//     profile,
//     loading,
//     error,
//     getProfile,
//     refreshProfile,
//     clearCache,
//   };
// }

// // // Minimal no-op implementation to satisfy callers while profile cache is disabled
// // export interface LoanOfficerProfile {
// //   id: string;
// //   firstName: string;
// //   lastName: string;
// //   email: string;
// //   phone: string | null;
// //   avatar: string | null;
// //   nmlsNumber: string | null;
// //   title: string | null;
// //   company?: {
// //     id: string;
// //     name: string;
// //     logo: string | null;
// //     website: string | null;
// //     phone: string | null;
// //     email: string | null;
// //   };
// //   isOnline: boolean;
// //   lastLoginAt: string | null;
// // }

// // // Stable no-op references to avoid re-running effects that depend on these
// // const __noopAsync = async (..._args: any[]) => {};
// // const __noop = () => {};

// // export function useProfileCache() {
// //   return {
// //     profile: null as LoanOfficerProfile | null,
// //     loading: false,
// //     error: null as string | null,
// //     getProfile: __noopAsync,
// //     refreshProfile: __noopAsync,
// //     clearCache: __noop,
// //   };
// // }