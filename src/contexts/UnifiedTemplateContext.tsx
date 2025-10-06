'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { redisCache } from '@/lib/redis';

// Unified template data interface
interface TemplateData {
  template: {
    id: string;
    slug: string;
    name: string;
    colors: any;
    typography: any;
    content: any;
    layout: any;
    advanced: any;
    classes: any;
    headerModifications?: any;
    bodyModifications?: any;
    rightSidebarModifications?: any;
    layoutConfig?: any; // Layout configuration for different template layouts
  };
  userInfo: {
    userId: string;
    companyId: string;
    companyName: string;
    userRole: string;
    hasCustomSettings: boolean;
  };
  metadata: {
    templateSlug: string;
    isCustomized: boolean;
    isPublished: boolean;
  };
}

// Customizer mode interface
interface CustomizerMode {
  isCustomizerMode: boolean;
  customTemplate?: any;
  officerInfo?: {
    officerName: string;
    phone?: string;
    email: string;
  };
}

// Unified template state interface
interface UnifiedTemplateState {
  // Template data cache
  templates: Record<string, TemplateData>;
  
  // Template selection state
  selectedTemplate: string;
  
  // Customizer mode state
  customizerMode: CustomizerMode;
  
  // Loading states
  isLoading: boolean;
  isInitialized: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  getTemplate: (slug: string) => TemplateData | null;
  getTemplateSync: (slug: string) => TemplateData | null;
  setSelectedTemplate: (slug: string) => void;
  refreshTemplate: (slug: string) => Promise<void>;
  saveTemplate: (slug: string, customSettings: any, isPublished?: boolean) => Promise<void>;
  clearCache: () => void;
  
  // Customizer actions
  setCustomizerMode: (mode: CustomizerMode) => void;
  clearCustomizerMode: () => void;
  
  // Status
  hasTemplate: (slug: string) => boolean;
  getTemplateCount: () => number;
}

// Create the context
const UnifiedTemplateContext = createContext<UnifiedTemplateState | undefined>(undefined);

// Provider component
export function UnifiedTemplateProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, userRole } = useAuth();
  const [templates, setTemplates] = useState<Record<string, TemplateData>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const initialTemplates: Record<string, TemplateData> = {};
      const loadFromLocalStorage = (slug: string): TemplateData | null => {
        const raw = localStorage.getItem(`unified_template_latest_${slug}`);
        if (!raw) return null;
        try {
          const parsed = JSON.parse(raw);
          // We store either the data directly or { data, timestamp }
          return (parsed?.data ?? parsed) as TemplateData;
        } catch {
          return null;
        }
      };
      const t1 = loadFromLocalStorage('template1');
      const t2 = loadFromLocalStorage('template2');
      if (t1) initialTemplates['template1'] = t1;
      if (t2) initialTemplates['template2'] = t2;
      return initialTemplates;
    } catch {
      return {};
    }
  });
  const [selectedTemplate, setSelectedTemplateState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const ls = localStorage.getItem('selectedTemplate');
      if (ls && (ls === 'template1' || ls === 'template2')) return ls;
    }
    return 'template1';
  });
  const [customizerMode, setCustomizerModeState] = useState<CustomizerMode>({
    isCustomizerMode: false,
    customTemplate: undefined,
    officerInfo: undefined
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Request deduplication
  const [fetchingTemplates, setFetchingTemplates] = useState<Set<string>>(new Set());
  
  // Request cache to prevent duplicate API calls
  const requestCache = useRef<Map<string, Promise<TemplateData | null>>>(new Map());
  const authTokenRef = useRef<string | null>(null);
  // Get and cache auth token for this provider lifecycle
  const getAuthToken = useCallback(async (): Promise<string> => {
    if (authTokenRef.current) return authTokenRef.current;
    const deadline = Date.now() + 1000; // wait up to 1s for token (reduced from 2.5s)
    while (Date.now() < deadline) {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (token) {
        authTokenRef.current = token;
        return token;
      }
      // Small backoff before next attempt
      await new Promise(resolve => setTimeout(resolve, 100)); // reduced from 200ms
    }
    console.warn('⚠️ UnifiedTemplate: No session token after wait, proceeding with cache-only');
    return '';
  }, []);

  // Clear cached token when user changes or signs out
  useEffect(() => {
    authTokenRef.current = null;
  }, [user?.id]);
  
  // Global initialization lock to prevent multiple initializations
  const initializationLock = useRef<boolean>(false);
  
  // Request counter for debugging
  const requestCounter = useRef<number>(0);

  // Load selected template from Redis (server-only) via API route to avoid client env issues
  useEffect(() => {
    const loadSelectedTemplate = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/templates/selection?userId=${encodeURIComponent(user.id)}`);
        const json = await res.json();
        const savedTemplate = json?.success ? json?.data : null;
        if (savedTemplate && ['template1', 'template2'].includes(savedTemplate)) {
          setSelectedTemplateState(savedTemplate);
          console.log('✅ UnifiedTemplate: Loaded selected template from API/Redis:', savedTemplate);
          return;
        }
      } catch {}
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const fallbackTemplate = localStorage.getItem('selectedTemplate');
        if (fallbackTemplate && ['template1', 'template2'].includes(fallbackTemplate)) {
          setSelectedTemplateState(fallbackTemplate);
        }
      }
    };
    loadSelectedTemplate();
  }, [user]);

  // Save selected template to Redis
  const setSelectedTemplate = useCallback(async (slug: string) => {
    if (['template1', 'template2'].includes(slug)) {
      setSelectedTemplateState(slug);
      
      if (user) {
        try {
          await fetch('/api/templates/selection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, template: slug })
          });
          console.log('✅ UnifiedTemplate: Saved selected template to API/Redis:', slug);
        } catch {}
      } 
      if (typeof window !== 'undefined') {
        // Fallback to localStorage if no user
        localStorage.setItem('selectedTemplate', slug);
      }
    }
  }, [user]);

  // Fetch a single template
  const fetchTemplate = useCallback(async (slug: string): Promise<TemplateData | null> => {
    if (!user) {
      console.log('⚠️ UnifiedTemplate: No user, skipping fetch');
      return null;
    }

    // Only fetch templates for active loan officers (employees)
    // Skip if userRole is not loaded yet, or if it's not an employee, or if user is not active
    if (!userRole || userRole.role !== 'employee' || userRole.isActive === false) {
      console.log('UnifiedTemplate:fetchSkip - Not an active loan officer or role not loaded, skipping template fetch');
      return null;
    }

    // Check request cache first to prevent duplicate API calls
    const cacheKey = `${user.id}:${slug}`;
    if (requestCache.current.has(cacheKey)) {
      console.log('⏳ UnifiedTemplate: Using cached request for:', slug);
      return requestCache.current.get(cacheKey)!;
    }

    // Check if already fetching - use a more robust approach
    if (fetchingTemplates.has(slug)) {
      console.log('⏳ UnifiedTemplate: Already fetching:', slug);
      // Wait for the existing request to complete
      return new Promise((resolve) => {
        const maxWaitTime = 15000; // 15 seconds max wait
        const checkInterval = setInterval(() => {
          if (!fetchingTemplates.has(slug)) {
            clearInterval(checkInterval);
            // Return the cached result if available
            const cachedResult = requestCache.current.get(cacheKey);
            resolve(cachedResult || templates[slug] || null);
          }
        }, 1000); // Check every second instead of 500ms
        
        // Timeout after max wait time
        setTimeout(() => {
          clearInterval(checkInterval);
          console.warn('UnifiedTemplate:waitTimeout', slug);
          resolve(null);
        }, maxWaitTime);
      });
    }

    // Check Redis cache first
    try {
      // Use server API to read Redis to avoid client env
      const res = await fetch(`/api/cache/template?userId=${encodeURIComponent(user.id)}&slug=${encodeURIComponent(slug)}`);
      const json = await res.json();
      const cachedData = json?.success ? json?.data : null;
      if (cachedData) {
        console.log('✅ UnifiedTemplate: Using Redis cache (API) for:', slug);
        return cachedData;
      }
    } catch (error) {
      console.error('❌ UnifiedTemplate: Error checking Redis cache via API:', error);
        // No localStorage fallback: rely on 304/ETag + broadcast to simplify edge cases
    }

    // Create and cache the request promise
    const requestPromise = (async () => {
      try {
        requestCounter.current += 1;
        console.log('UnifiedTemplate:fetch', slug, requestCounter.current);
        
        setFetchingTemplates(prev => new Set(prev).add(slug));
        setIsLoading(true);
        setError(null);

        const token = await getAuthToken();
        if (!token) {
          // No token: do not call protected API; just return null to allow fallback
          return null;
        }

        const response = await fetch(`/api/templates/user/${slug}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Gracefully handle unauthorized (e.g., instant sign-out): treat as cache miss
        if (response.status === 401) {
          console.warn('⚠️ UnifiedTemplate: Unauthorized when fetching template (likely signed out); skipping fetch for', slug);
          return null;
        }
        if (response.status === 304) {
          console.log('✅ UnifiedTemplate: 304 Not Modified for', slug, '- keeping cached template');
          return templates[slug] || null;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch template (${response.status})`);
        }

        const result = await response.json();
        
        if (result.success) {
          console.log('UnifiedTemplate:fetched', slug);
          
          // Cache the result in Redis
          try {
            await fetch('/api/cache/template', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, slug, data: result.data })
            });
            console.log('UnifiedTemplate:redisSet', slug);
          } catch (error) {
            console.error('❌ UnifiedTemplate: Error caching in Redis via API:', error);
            // Fallback to localStorage if Redis fails
            if (typeof window !== 'undefined') {
              const userScopedKey = `unified_template_${user.id}_${slug}`;
              const genericKey = `unified_template_latest_${slug}`;
              const payload = JSON.stringify({ data: result.data, timestamp: Date.now() });
              localStorage.setItem(userScopedKey, payload);
              localStorage.setItem(genericKey, payload);
            }
          }
          
          return result.data;
        } else {
          throw new Error(result.error || 'API returned unsuccessful response');
        }

      } catch (err) {
        console.error('❌ UnifiedTemplate: Error fetching:', err);
        // Do not propagate errors that would keep loading flags stuck
        return null;
      } finally {
        setIsLoading(false);
        setFetchingTemplates(prev => {
          const newSet = new Set(prev);
          newSet.delete(slug);
          return newSet;
        });
        // Clear the request cache after completion
        requestCache.current.delete(cacheKey);
      }
    })();

    // Cache the request promise
    requestCache.current.set(cacheKey, requestPromise);
    
    return requestPromise;
  }, [user, fetchingTemplates, templates, userRole]);

  // Initialize templates
  const initializeTemplates = useCallback(async () => {
    if (!user || authLoading || isInitialized || initializationLock.current) {
      console.log('UnifiedTemplate:initSkip');
      return;
    }

    // Only initialize templates for active loan officers (employees)
    // Skip if userRole is not loaded yet, or if it's not an employee, or if user is not active
    if (!userRole || userRole.role !== 'employee' || userRole.isActive === false) {
      console.log('UnifiedTemplate:initSkip - Not an active loan officer or role not loaded, skipping template initialization', { 
        hasUserRole: !!userRole, 
        role: userRole?.role,
        isActive: userRole?.isActive,
        userEmail: user?.email 
      });
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }
    
    // Set initialization lock
    initializationLock.current = true;
    
    console.log('UnifiedTemplate:init');
    setIsLoading(true);
    setError(null);

    try {
      const templatesToLoad = ['template1', 'template2'];
      
      // Check cached templates first from Redis
      const cachedTemplates: Record<string, TemplateData> = {};
      const uncachedSlugs: string[] = [];
      
      for (const slug of templatesToLoad) {
        try {
          // Read Redis via server API (works in client runtime)
          const res = await fetch(`/api/cache/template?userId=${encodeURIComponent(user.id)}&slug=${encodeURIComponent(slug)}`);
          const json = await res.json();
          const cachedData = json?.success ? json?.data : null;
          if (cachedData) {
            cachedTemplates[slug] = cachedData;
            console.log('UnifiedTemplate:cacheHit', slug);
            continue;
          }
        } catch (error) {
          console.error('❌ UnifiedTemplate: Error checking Redis cache via API for:', slug, error);
        }
        
        // Fallback to localStorage if Redis fails
        if (typeof window !== 'undefined') {
          const cacheKey = `unified_template_${user.id}_${slug}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            try {
              const parsedCache = JSON.parse(cached);
              if (Date.now() - parsedCache.timestamp < 5 * 60 * 1000) {
                cachedTemplates[slug] = parsedCache.data;
                console.log('✅ UnifiedTemplate: Using localStorage fallback:', slug);
                continue;
              }
            } catch (e) {
              localStorage.removeItem(cacheKey);
            }
          }
        }
        
        uncachedSlugs.push(slug);
      }
      
      // Fetch uncached templates
      const fetchPromises = uncachedSlugs.map(async (slug) => {
        try {
          const templateData = await fetchTemplate(slug);
          return { slug, templateData };
        } catch (error) {
          console.error(`❌ UnifiedTemplate: Failed to load ${slug}:`, error);
          return { slug, templateData: null };
        }
      });
      
      const fetchResults = await Promise.all(fetchPromises);
      
      // Combine cached and fetched templates
      const allTemplates: Record<string, TemplateData> = { ...cachedTemplates };
      fetchResults.forEach(({ slug, templateData }) => {
        if (templateData) {
          allTemplates[slug] = templateData;
        }
      });

      setTemplates(allTemplates);
      // Consider initialized if we loaded anything (cached or fetched).
      // If nothing loaded yet (no token or cache miss), defer init so we can retry soon.
      const loadedCount = Object.keys(allTemplates).length;
      setIsInitialized(loadedCount > 0);
      
      console.log('UnifiedTemplate:ready', { total: Object.keys(allTemplates).length });
      
    } catch (error) {
      console.error('❌ UnifiedTemplate: Error initializing:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize templates');
    } finally {
      setIsLoading(false);
      // Release initialization lock
      initializationLock.current = false;
    }
  }, [user, authLoading, isInitialized, fetchTemplate]);

  // One-time prewarm after auth (loads both templates quickly to avoid fallbacks)
  const prewarmDoneRef = useRef<string | null>(null);

  // Get template from cache
  const getTemplate = useCallback((slug: string): TemplateData | null => {
    return templates[slug] || null;
  }, [templates]);

  // Get template synchronously (from cache only, with customizer mode support)
  const getTemplateSync = useCallback((slug: string): TemplateData | null => {
    // If we're in customizer mode with custom template, use it
    if (customizerMode.isCustomizerMode && customizerMode.customTemplate) {
      console.log('🎨 UnifiedTemplate: Using customizer template from context:', slug);
      return {
        template: customizerMode.customTemplate,
        userInfo: {
          userId: user?.id || '',
          companyId: '',
          companyName: '',
          userRole: '',
          hasCustomSettings: true
        },
        metadata: {
          templateSlug: slug,
          isCustomized: true,
          isPublished: false
        }
      };
    }
    
    // Otherwise, use cached template data
    return templates[slug] || null;
  }, [templates, customizerMode, user]);

  // Refresh a specific template
  const refreshTemplate = useCallback(async (slug: string) => {
    if (!user) return;
    
    // Only refresh templates for active loan officers (employees)
    // Skip if userRole is not loaded yet, or if it's not an employee, or if user is not active
    if (!userRole || userRole.role !== 'employee' || userRole.isActive === false) {
      console.log('UnifiedTemplate:refreshSkip - Not an active loan officer or role not loaded, skipping template refresh');
      return;
    }
    
    try {
      console.log('🔄 UnifiedTemplate: Refreshing:', slug);
      
      // Clear Redis cache via server API (client cannot access Redis directly)
      try {
        const res = await fetch(`/api/cache/template?userId=${encodeURIComponent(user.id)}&slug=${encodeURIComponent(slug)}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
          console.warn('⚠️ UnifiedTemplate: Failed to delete server cache via API for:', slug);
        } else {
          console.log('🗑️ UnifiedTemplate: Cleared Redis cache via API for:', slug);
        }
      } catch (error) {
        console.error('❌ UnifiedTemplate: Error clearing Redis cache via API:', error);
      }
      
      // Clear localStorage fallback
      if (typeof window !== 'undefined') {
        const userScopedKey = `unified_template_${user.id}_${slug}`;
        const genericKey = `unified_template_latest_${slug}`;
        localStorage.removeItem(userScopedKey);
        localStorage.removeItem(genericKey);
        console.log('🗑️ UnifiedTemplate: Cleared localStorage cache for:', slug, 'keys:', userScopedKey, genericKey);
      }
      
      const templateData = await fetchTemplate(slug);
      
      if (templateData) {
        setTemplates(prev => ({
          ...prev,
          [slug]: templateData
        }));
        console.log('✅ UnifiedTemplate: Refreshed and updated:', slug);
      }
    } catch (error) {
      console.error('❌ UnifiedTemplate: Error refreshing:', error);
    }
  }, [user, fetchTemplate, userRole]);

  // One-time prewarm after auth (loads both templates quickly to avoid fallbacks)
  useEffect(() => {
    if (!user?.id) return;
    if (prewarmDoneRef.current === user.id) return;
    
    // Only prewarm for active loan officers (employees)
    // Skip if userRole is not loaded yet, or if it's not an employee, or if user is not active
    if (!userRole || userRole.role !== 'employee' || userRole.isActive === false) {
      console.log('UnifiedTemplate:prewarmSkip - Not an active loan officer or role not loaded, skipping template prewarm');
      return;
    }
    
    prewarmDoneRef.current = user.id;
    const t1 = setTimeout(() => {
      refreshTemplate('template1').catch(() => {});
      refreshTemplate('template2').catch(() => {});
    }, 250);
    const t2 = setTimeout(() => {
      refreshTemplate('template1').catch(() => {});
      refreshTemplate('template2').catch(() => {});
    }, 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [user?.id, refreshTemplate, userRole]);

  // Save template settings
  const saveTemplate = useCallback(async (slug: string, customSettings: any, isPublished = false) => {
    if (!user) return;
    
    try {
      console.log('💾 UnifiedTemplate: Saving:', slug);
      
        const token = await getAuthToken();

      const response = await fetch('/api/templates/user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateSlug: slug,
          customSettings,
          isPublished
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save template');
      }

      if (result.success) {
        console.log('✅ UnifiedTemplate: Saved successfully:', slug);
        
        // Refresh the template to get updated data
        await refreshTemplate(slug);
      } else {
        throw new Error(result.error || 'API returned unsuccessful response');
      }
      
    } catch (err) {
      console.error('❌ UnifiedTemplate: Error saving:', err);
      throw err;
    }
  }, [user, refreshTemplate]);

  // Clear cache
  const clearCache = useCallback(async () => {
    console.log('🗑️ UnifiedTemplate: Clearing cache');
    setTemplates({});
    setIsInitialized(false);
    setError(null);
    setFetchingTemplates(new Set());
    
    if (user) {
      try {
        // Best-effort: clear both templates via API (client cannot clear directly)
        const slugs = ['template1', 'template2'];
        await Promise.all(slugs.map(slug => fetch(`/api/cache/template?userId=${encodeURIComponent(user.id)}&slug=${encodeURIComponent(slug)}`, { method: 'DELETE' }).catch(() => {})));
        console.log('🗑️ UnifiedTemplate: Requested Redis cache clear via API for user:', user.id);
      } catch (error) {
        console.error('❌ UnifiedTemplate: Error clearing Redis cache via API:', error);
      }
      
      // Clear localStorage fallback
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`unified_template_${user.id}_`)) {
            keysToRemove.push(key);
          }
        }
        // Also clear generic latest keys
        keysToRemove.push('unified_template_latest_template1', 'unified_template_latest_template2');
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log('🗑️ UnifiedTemplate: Cleared localStorage cache for user:', user.id, 'keys:', keysToRemove);
      }
    }
  }, [user]);

  // Check if template exists
  const hasTemplate = useCallback((slug: string): boolean => {
    return !!templates[slug];
  }, [templates]);

  // Get template count
  const getTemplateCount = useCallback((): number => {
    return Object.keys(templates).length;
  }, [templates]);

  // Set customizer mode
  const setCustomizerMode = useCallback((mode: CustomizerMode) => {
    console.log('🎨 UnifiedTemplate: Setting customizer mode:', mode);
    setCustomizerModeState(mode);
  }, []);

  // Clear customizer mode
  const clearCustomizerMode = useCallback(() => {
    console.log('🎨 UnifiedTemplate: Clearing customizer mode');
    setCustomizerModeState({
      isCustomizerMode: false,
      customTemplate: undefined,
      officerInfo: undefined
    });
  }, []);

  // BroadcastChannel: listen for template invalidations (cross-tab sync)
  useEffect(() => {
    if (typeof window === 'undefined' || !user?.id) return;
    const bc = new BroadcastChannel('templates');
    const handler = (e: MessageEvent) => {
      const m = e.data as any;
      if (m?.type === 'template:updated' && m.userId === user.id && m.slug) {
        console.log('UnifiedTemplate:broadcast', m.slug);
        refreshTemplate(m.slug).catch(() => {});
      }
    };
    bc.addEventListener('message', handler);
    return () => bc.removeEventListener('message', handler);
  }, [user?.id, refreshTemplate]);

  // Initialize templates when user is available
  useEffect(() => {
    console.log('🔄 UnifiedTemplate: Auth state changed:', { 
      authLoading, 
      hasUser: !!user, 
      isInitialized,
      userEmail: user?.email 
    });
    
    // Kick off initialization as soon as we have a user and userRole
    if (user && userRole && !isInitialized) {
      console.log('🚀 UnifiedTemplate: User present, initializing templates...');
      initializeTemplates();
      return;
    }
    
    // If user is present but no userRole yet, wait for it to load
    if (user && !userRole && !authLoading) {
      console.log('🔄 UnifiedTemplate: User present but role not loaded yet, waiting...');
      return;
    }
    // If auth has settled and there is no user, clear caches
    if (!authLoading && !user) {
      console.log('UnifiedTemplate:clearNoUser');
      clearCache();
      return;
    }
    console.log('UnifiedTemplate:authWait', { authLoading, hasUser: !!user, isInitialized });
  }, [user, authLoading, isInitialized, userRole]);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading && !isInitialized) {
        console.log('⚠️ UnifiedTemplate: Template loading timeout, forcing initialization');
        setIsLoading(false);
        setIsInitialized(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading, isInitialized]);

  // Create the context value
  const contextValue: UnifiedTemplateState = {
    templates,
    selectedTemplate,
    customizerMode,
    // isLoading: isLoading || authLoading,   // this is the original code
    isLoading: isLoading,
    isInitialized,
    error,
    getTemplate,
    getTemplateSync,
    setSelectedTemplate,
    refreshTemplate,
    saveTemplate,
    clearCache,
    setCustomizerMode,
    clearCustomizerMode,
    hasTemplate,
    getTemplateCount,
  };

  return (
    <UnifiedTemplateContext.Provider value={contextValue}>
      {children}
    </UnifiedTemplateContext.Provider>
  );
}

// Hook to use the unified template state
export function useUnifiedTemplates() {
  const context = useContext(UnifiedTemplateContext);
  
  if (context === undefined) {
    throw new Error('useUnifiedTemplates must be used within a UnifiedTemplateProvider');
  }
  
  return context;
}

// Hook for getting a specific template (with fallback)
export function useTemplate(slug: string) {
  const { getTemplate, isLoading, isInitialized } = useUnifiedTemplates();
  
  const templateData = getTemplate(slug);
  
  // Provide fallback template data
  const fallbackTemplate: TemplateData = {
    template: {
      id: 'fallback',
      slug,
      name: 'Loading...',
      colors: {
        primary: '#ec4899',
        secondary: '#01bcc6',
        background: '#ffffff',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb'
      },
      typography: {
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        }
      },
      content: {
        headline: 'Loading...',
        subheadline: 'Please wait while we load your template.',
        ctaText: 'Get Started',
        companyName: 'Your Company'
      },
      layout: {
        alignment: 'center',
        spacing: 16,
        borderRadius: 8,
        padding: 24
      },
      advanced: {
        customCSS: '',
        accessibility: true
      },
      classes: {},
      headerModifications: {},
      bodyModifications: {},
      rightSidebarModifications: {}
    },
    userInfo: {
      userId: '',
      companyId: '',
      companyName: '',
      userRole: '',
      hasCustomSettings: false
    },
    metadata: {
      templateSlug: slug,
      isCustomized: false,
      isPublished: false
    }
  };

  return {
    templateData: templateData || fallbackTemplate,
    isLoading: isLoading || (!isInitialized && !templateData),
    isFallback: !templateData,
    hasTemplate: !!templateData
  };
}

// Hook for template selection (replaces TemplateSelectionContext)
export function useTemplateSelection() {
  const { selectedTemplate, setSelectedTemplate, isLoading } = useUnifiedTemplates();
  
  return {
    selectedTemplate,
    setSelectedTemplate,
    isLoading
  };
}

// Hook for global templates (replaces GlobalTemplateContext)
export function useGlobalTemplates() {
  const { refreshTemplate, clearCache, hasTemplate, getTemplateCount } = useUnifiedTemplates();
  
  return {
    refreshTemplate,
    clearCache,
    hasTemplate,
    getTemplateCount
  };
}

// Hook for efficient templates (replaces useEfficientTemplates)
export function useEfficientTemplates() {
  const { getTemplateSync, refreshTemplate, saveTemplate, templates, isLoading, error } = useUnifiedTemplates();
  
  return {
    getTemplateSync,
    fetchTemplate: refreshTemplate, // Map refreshTemplate to fetchTemplate for compatibility
    saveTemplateSettings: saveTemplate,
    templateData: templates,
    isLoading,
    error,
    hasTemplate: (slug: string) => !!templates[slug],
    getTemplateCount: () => Object.keys(templates).length
  };
}

// Hook for template context (replaces TemplateContext)
export function useTemplateContext() {
  const { customizerMode } = useUnifiedTemplates();
  
  return {
    templateData: customizerMode.customTemplate,
    isCustomizerMode: customizerMode.isCustomizerMode,
    customTemplate: customizerMode.customTemplate,
    officerInfo: customizerMode.officerInfo
  };
}

// Hook to check if we're in customizer mode
export function useIsCustomizerMode(): boolean {
  const { customizerMode } = useUnifiedTemplates();
  return customizerMode.isCustomizerMode;
}

// Hook to get custom template if available
export function useCustomTemplate(templateSlug: string): any {
  const { customizerMode } = useUnifiedTemplates();
  
  if (customizerMode.isCustomizerMode && customizerMode.customTemplate) {
    return customizerMode.customTemplate;
  }
  
  return null;
}

// Hook to get officer info if available
export function useCustomizerOfficerInfo(): {
  officerName: string;
  phone?: string;
  email: string;
} | null {
  const { customizerMode } = useUnifiedTemplates();
  
  if (customizerMode.isCustomizerMode && customizerMode.officerInfo) {
    return customizerMode.officerInfo;
  }
  
  return null;
}

// Template Provider Component (for backward compatibility)
interface TemplateProviderProps {
  children: ReactNode;
  templateData?: any;
  isCustomizerMode?: boolean;
  customTemplate?: any;
  officerInfo?: {
    officerName: string;
    phone?: string;
    email: string;
  };
}

export const TemplateProvider: React.FC<TemplateProviderProps> = ({
  children,
  templateData,
  isCustomizerMode = false,
  customTemplate,
  officerInfo
}) => {
  const { setCustomizerMode, clearCustomizerMode } = useUnifiedTemplates();
  const lastPayloadRef = React.useRef<{ isCustomizerMode: boolean; customTemplate?: any; officerInfo?: any } | null>(null);

  const deepEqual = (a: any, b: any) => {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return a === b;
    }
  };
  
  // Set customizer mode when provider mounts
  useEffect(() => {
    const nextPayload = {
      isCustomizerMode: !!isCustomizerMode,
      customTemplate: isCustomizerMode ? (customTemplate || templateData) : undefined,
      officerInfo: isCustomizerMode ? officerInfo : undefined,
    };

    const prev = lastPayloadRef.current;

    // Determine if we actually need to update context state
    const changed = !prev
      || prev.isCustomizerMode !== nextPayload.isCustomizerMode
      || (nextPayload.isCustomizerMode && (!deepEqual(prev.customTemplate, nextPayload.customTemplate) || !deepEqual(prev.officerInfo, nextPayload.officerInfo)));

    if (!changed) return;

    if (nextPayload.isCustomizerMode) {
      setCustomizerMode({
        isCustomizerMode: true,
        customTemplate: nextPayload.customTemplate,
        officerInfo: nextPayload.officerInfo
      });
    } else {
      clearCustomizerMode();
    }
    lastPayloadRef.current = nextPayload;
  }, [isCustomizerMode, customTemplate, templateData, officerInfo, setCustomizerMode, clearCustomizerMode]);
  
  return <>{children}</>;
};
