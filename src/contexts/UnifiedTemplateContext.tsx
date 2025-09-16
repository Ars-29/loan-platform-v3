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
  const { user, loading: authLoading } = useAuth();
  const [templates, setTemplates] = useState<Record<string, TemplateData>>({});
  const [selectedTemplate, setSelectedTemplateState] = useState<string>('template1');
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
  
  // Global initialization lock to prevent multiple initializations
  const initializationLock = useRef<boolean>(false);
  
  // Request counter for debugging
  const requestCounter = useRef<number>(0);

  // Load selected template from Redis on mount
  useEffect(() => {
    const loadSelectedTemplate = async () => {
      if (user) {
        try {
          const savedTemplate = await redisCache.getSelection(user.id);
          if (savedTemplate && ['template1', 'template2'].includes(savedTemplate)) {
            setSelectedTemplateState(savedTemplate);
            console.log('✅ UnifiedTemplate: Loaded selected template from Redis:', savedTemplate);
          }
        } catch (error) {
          console.error('❌ UnifiedTemplate: Error loading selected template from Redis:', error);
          // Fallback to localStorage if Redis fails
          if (typeof window !== 'undefined') {
            const fallbackTemplate = localStorage.getItem('selectedTemplate');
            if (fallbackTemplate && ['template1', 'template2'].includes(fallbackTemplate)) {
              setSelectedTemplateState(fallbackTemplate);
            }
          }
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
          await redisCache.setSelection(user.id, slug);
          console.log('✅ UnifiedTemplate: Saved selected template to Redis:', slug);
        } catch (error) {
          console.error('❌ UnifiedTemplate: Error saving selected template to Redis:', error);
          // Fallback to localStorage if Redis fails
          if (typeof window !== 'undefined') {
            localStorage.setItem('selectedTemplate', slug);
          }
        }
      } else if (typeof window !== 'undefined') {
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
          console.log('⚠️ UnifiedTemplate: Timeout waiting for:', slug);
          resolve(null);
        }, maxWaitTime);
      });
    }

    // Check Redis cache first
    try {
      const cachedData = await redisCache.getTemplate(user.id, slug);
      if (cachedData) {
        console.log('✅ UnifiedTemplate: Using Redis cache for:', slug);
        return cachedData;
      }
    } catch (error) {
      console.error('❌ UnifiedTemplate: Error checking Redis cache:', error);
      // Fallback to localStorage if Redis fails
      if (typeof window !== 'undefined') {
        const cacheKey = `unified_template_${user.id}_${slug}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsedCache = JSON.parse(cached);
            if (Date.now() - parsedCache.timestamp < 5 * 60 * 1000) {
              console.log('✅ UnifiedTemplate: Using localStorage fallback for:', slug);
              return parsedCache.data;
            }
          } catch (e) {
            localStorage.removeItem(cacheKey);
          }
        }
      }
    }

    // Create and cache the request promise
    const requestPromise = (async () => {
      try {
        requestCounter.current += 1;
        console.log(`🔍 UnifiedTemplate: Fetching #${requestCounter.current}:`, slug);
        
        setFetchingTemplates(prev => new Set(prev).add(slug));
        setIsLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('No valid session found');
        }

        const response = await fetch(`/api/templates/user/${slug}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch template');
        }

        const result = await response.json();
        
        if (result.success) {
          console.log('✅ UnifiedTemplate: Fetched successfully:', slug);
          
          // Cache the result in Redis
          try {
            await redisCache.setTemplate(user.id, slug, result.data);
            console.log('✅ UnifiedTemplate: Cached template in Redis:', slug);
          } catch (error) {
            console.error('❌ UnifiedTemplate: Error caching in Redis:', error);
            // Fallback to localStorage if Redis fails
            if (typeof window !== 'undefined') {
              const cacheKey = `unified_template_${user.id}_${slug}`;
              localStorage.setItem(cacheKey, JSON.stringify({
                data: result.data,
                timestamp: Date.now()
              }));
            }
          }
          
          return result.data;
        } else {
          throw new Error(result.error || 'API returned unsuccessful response');
        }

      } catch (err) {
        console.error('❌ UnifiedTemplate: Error fetching:', err);
        throw err;
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
  }, [user, fetchingTemplates, templates]);

  // Initialize templates
  const initializeTemplates = useCallback(async () => {
    if (!user || authLoading || isInitialized || initializationLock.current) {
      console.log('⚠️ UnifiedTemplate: Skipping initialization - no user, already initialized, or locked');
      return;
    }
    
    // Set initialization lock
    initializationLock.current = true;
    
    console.log('🚀 UnifiedTemplate: Initializing...');
    setIsLoading(true);
    setError(null);

    try {
      const templatesToLoad = ['template1', 'template2'];
      
      // Check cached templates first from Redis
      const cachedTemplates: Record<string, TemplateData> = {};
      const uncachedSlugs: string[] = [];
      
      for (const slug of templatesToLoad) {
        try {
          const cachedData = await redisCache.getTemplate(user.id, slug);
          if (cachedData) {
            cachedTemplates[slug] = cachedData;
            console.log('✅ UnifiedTemplate: Using Redis cached:', slug);
            continue;
          }
        } catch (error) {
          console.error('❌ UnifiedTemplate: Error checking Redis cache for:', slug, error);
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
      setIsInitialized(true);
      
      console.log('✅ UnifiedTemplate: Initialized:', {
        total: Object.keys(allTemplates).length,
        cached: Object.keys(cachedTemplates).length,
        fetched: fetchResults.filter(r => r.templateData).length
      });
      
    } catch (error) {
      console.error('❌ UnifiedTemplate: Error initializing:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize templates');
    } finally {
      setIsLoading(false);
      // Release initialization lock
      initializationLock.current = false;
    }
  }, [user, authLoading, isInitialized, fetchTemplate]);

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
    
    try {
      console.log('🔄 UnifiedTemplate: Refreshing:', slug);
      
      // Clear Redis cache
      try {
        await redisCache.delete(redisCache.getTemplateKey(user.id, slug));
        console.log('🗑️ UnifiedTemplate: Cleared Redis cache for:', slug);
      } catch (error) {
        console.error('❌ UnifiedTemplate: Error clearing Redis cache:', error);
      }
      
      // Clear localStorage fallback
      if (typeof window !== 'undefined') {
        const cacheKey = `unified_template_${user.id}_${slug}`;
        localStorage.removeItem(cacheKey);
        console.log('🗑️ UnifiedTemplate: Cleared localStorage cache for:', slug);
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
  }, [user, fetchTemplate]);

  // Save template settings
  const saveTemplate = useCallback(async (slug: string, customSettings: any, isPublished = false) => {
    if (!user) return;
    
    try {
      console.log('💾 UnifiedTemplate: Saving:', slug);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch('/api/templates/user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
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
        await redisCache.clearUserCache(user.id);
        console.log('🗑️ UnifiedTemplate: Cleared Redis cache for user:', user.id);
      } catch (error) {
        console.error('❌ UnifiedTemplate: Error clearing Redis cache:', error);
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
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log('🗑️ UnifiedTemplate: Cleared localStorage cache for user:', user.id);
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

  // Initialize templates when user is available
  useEffect(() => {
    if (!authLoading && user && !isInitialized) {
      console.log('🚀 UnifiedTemplate: User authenticated, initializing templates...');
      initializeTemplates();
    } else if (!authLoading && !user) {
      console.log('⚠️ UnifiedTemplate: No user, clearing cache...');
      clearCache();
    } else {
      console.log('⚠️ UnifiedTemplate: Waiting for auth state...', { authLoading, hasUser: !!user, isInitialized });
    }
  }, [user, authLoading, isInitialized]); // Removed function dependencies to prevent infinite loops

  // Create the context value
  const contextValue: UnifiedTemplateState = {
    templates,
    selectedTemplate,
    customizerMode,
    isLoading: isLoading || authLoading,
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
        secondary: '#3b82f6',
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
  
  // Set customizer mode when provider mounts
  useEffect(() => {
    if (isCustomizerMode) {
      setCustomizerMode({
        isCustomizerMode: true,
        customTemplate: customTemplate || templateData,
        officerInfo
      });
    } else {
      clearCustomizerMode();
    }
    
    // Cleanup when provider unmounts
    return () => {
      clearCustomizerMode();
    };
  }, [isCustomizerMode, customTemplate, templateData, officerInfo, setCustomizerMode, clearCustomizerMode]);
  
  return <>{children}</>;
};
