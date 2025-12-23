'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { useTemplateSelection, useTemplate, useGlobalTemplates, TemplateProvider } from '@/contexts/UnifiedTemplateContext';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import PublicProfileContent from '@/components/public/PublicProfileContent';
import type { TabId } from '@/components/landingPage/LandingPageTabs';
import SmartDropdown from '@/components/ui/SmartDropdown';

// Define Template type for customizer
interface Template {
  id: string;
  slug: string;
  name: string;
  colors?: any;
  typography?: any;
  content?: any;
  layout?: any;
  advanced?: any;
  classes?: any;
  layoutConfig?: any; // Layout configuration for different template layouts
  headerModifications?: {
    officerName?: string;
    phone?: string;
    email?: string;
    avatar?: string;
    applyNowText?: string;
    applyNowLink?: string;
  };
  bodyModifications?: {
    enabledTabs?: string[];
    activeTab?: string;
    homeValueWidgetUrl?: string;
  };
  rightSidebarModifications?: {
    companyName?: string;
    logo?: string;
    phone?: string;
    email?: string;
    address?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}
import { 
  Palette, 
  Type, 
  Layout, 
  Settings, 
  Save, 
  Eye, 
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Smartphone,
  Cog,
  LaptopMinimal
} from 'lucide-react';

// Lazy load preview components
const UnifiedHeroSection = React.lazy(() => import('@/components/landingPage/UnifiedHeroSection'));
const UnifiedRightSidebar = React.lazy(() => import('@/components/landingPage/UnifiedRightSidebar'));
const LandingPageTabs = React.lazy(() => import('@/components/landingPage/LandingPageTabs'));

interface CustomizerState {
  selectedTemplate: string;
  customSettings: Partial<Template>;
  isPreviewMode: boolean;
  activeSection: 'general' | 'header' | 'body' | 'rightSidebar';
  showSectionDetails: boolean;
}

type ViewMode = 'desktop' | 'mobile' | 'full';

export default function CustomizerPage() {
  const { user, userRole, companyId, loading: authLoading } = useAuth();
  const { selectedTemplate, setSelectedTemplate, isLoading: templateSelectionLoading } = useTemplateSelection();
  const { templateData, isLoading: templateLoading, isFallback } = useTemplate(selectedTemplate);
  const { refreshTemplate } = useGlobalTemplates();
  
  const [customizerState, setCustomizerState] = useState<CustomizerState>({
    selectedTemplate: selectedTemplate, // Use global selection
    customSettings: {},
    isPreviewMode: false,
    activeSection: 'general',
    showSectionDetails: false
  });

  // State for active tab in preview - will be initialized from template customization after mergedTemplate is available
  const [previewActiveTab, setPreviewActiveTab] = useState<TabId>('todays-rates');
  const previewTabInitializedRef = React.useRef(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(73);
  const [isTemplateSaved, setIsTemplateSaved] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const previousNonFullViewRef = useRef<ViewMode>('desktop');
  const isDesktopView = viewMode === 'desktop';
  const isMobileView = viewMode === 'mobile';
  const isFullWidth = viewMode === 'full';
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isSettingProfileTemplate, setIsSettingProfileTemplate] = useState(false);
  const [publicLink, setPublicLink] = useState<any>(null);
  const loadedTemplateRef = useRef<string | null>(null);

  // Company data state
  const [companyData, setCompanyData] = useState<any>(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  
  // User NMLS# state
  const [userNmlsNumber, setUserNmlsNumber] = useState<string | null>(null);

  // Fetch user NMLS#
  const fetchUserNmlsNumber = React.useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('🔍 Customizer: Fetching user NMLS# for userId:', user.id);
      
      const response = await fetch(`/api/users/${user.id}/nmls`);
      const result = await response.json();
      
      console.log('🔍 Customizer: User NMLS# API response:', result);
      
      if (result.success) {
        console.log('✅ Customizer: User NMLS# fetched:', result.data.nmlsNumber);
        setUserNmlsNumber(result.data.nmlsNumber);
      } else {
        console.log('❌ Customizer: Failed to fetch user NMLS#:', result.error || result.message);
        setUserNmlsNumber(null);
      }
    } catch (error) {
      console.error('❌ Customizer: Error fetching user NMLS#:', error);
      setUserNmlsNumber(null);
    }
  }, [user]);

  // Get officer information from user data
  const officerInfo = React.useMemo(() => {
    if (user) {
      return {
        officerName: user.user_metadata?.full_name || `${user.user_metadata?.first_name || user.email?.split('@')[0] || 'User'} ${user.user_metadata?.last_name || 'Smith'}`,
        phone: user.user_metadata?.phone || undefined,
        email: user.email || 'user@example.com',
      };
    }
    
    // Final fallback
    return {
      officerName: 'John Smith',
      phone: '(555) 123-4567',
      email: 'john@example.com',
    };
  }, [user]);

  // Update customizer state when global template selection changes
  React.useEffect(() => {
    setCustomizerState(prev => ({
      ...prev,
      selectedTemplate: selectedTemplate
    }));
  }, [selectedTemplate]);


  // Measure header height for sticky sidebar positioning
  React.useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    
    // Use MutationObserver to watch for content changes (like save message appearing)
    const observer = new MutationObserver(updateHeaderHeight);
    if (headerRef.current) {
      observer.observe(headerRef.current, {
        childList: true,
        subtree: true,
        attributes: true
      });
    }
    
    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
      observer.disconnect();
    };
  }, [saveMessage]);

  // No need for profile fetching - using user data directly

  // Get current template data from global state
  const currentTemplate = templateData?.template;
  
  // Debug template loading
  React.useEffect(() => {
    console.log('🔄 Customizer: Template loading state:', {
      templateLoading,
      isFallback,
      hasTemplateData: !!templateData,
      hasCurrentTemplate: !!currentTemplate,
      selectedTemplate,
      templateDataKeys: templateData ? Object.keys(templateData) : [],
      templateId: templateData?.template?.id,
      isCustomized: templateData?.metadata?.isCustomized
    });
  }, [templateLoading, isFallback, templateData, currentTemplate, selectedTemplate]);
  
  // Combined loading state for initial page load/reload and save operations
  const isInitialLoading = authLoading || templateSelectionLoading || templateLoading || companyLoading || isFallback || !currentTemplate || isSaving || isDeletingAvatar;
  
  // Deep merge template with custom settings for real-time preview
  const mergedTemplate = React.useMemo(() => {
    // Grace period to avoid noisy fallback during first paint
    const ready = !!currentTemplate && !isFallback && !templateLoading;
    if (!ready) {
      // Do not log repeatedly; show silent fallback that still renders immediately
      return {
        id: 'fallback',
        slug: customizerState.selectedTemplate,
        name: 'Fallback Template',
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
          headline: 'Welcome to Our Service',
          subheadline: 'Get started with our amazing platform today.',
          ctaText: 'Get Started',
          ctaSecondary: 'Learn More',
          companyName: 'Your Company',
          tagline: 'Your trusted partner'
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
        // Add empty modification objects for real-time updates
        headerModifications: {},
        bodyModifications: {},
        rightSidebarModifications: {}
      };
    }

    const merged = JSON.parse(JSON.stringify(currentTemplate)); // Deep clone
    
    // Deep merge custom settings
    const deepMerge = (target: any, source: any) => {
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key]) target[key] = {};
          deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    };
    
    deepMerge(merged, customizerState.customSettings);
    console.log('🔄 Customizer: Merged template:', merged);
    console.log('🔄 Customizer: Custom settings used:', customizerState.customSettings);
    console.log('🔄 Customizer: Merged template keys:', Object.keys(merged));
    console.log('🔄 Customizer: Current template modification fields:', {
      headerModifications: (currentTemplate as any)?.headerModifications,
      bodyModifications: (currentTemplate as any)?.bodyModifications,
      rightSidebarModifications: (currentTemplate as any)?.rightSidebarModifications,
      timestamp: new Date().toISOString()
    });
    return merged;
  }, [currentTemplate, customizerState.customSettings, customizerState.selectedTemplate, isFallback, templateLoading]);

  // Load saved settings when template data changes
  useEffect(() => {
    const templateId = templateData?.template?.id;
    const isCustomized = templateData?.metadata?.isCustomized;
    
    console.log('🔄 Customizer: Template loading effect triggered:', {
      templateId,
      isCustomized,
      isFallback,
      loadedTemplateRef: loadedTemplateRef.current,
      templateLoading,
      hasTemplateData: !!templateData
    });
    
    // Only load if we have a different template or if this is the first load
    // Check that we're not using fallback data AND that we're not still loading
    if (templateId && templateId !== loadedTemplateRef.current && !isFallback && !templateLoading) {
      loadedTemplateRef.current = templateId;
      
      if (isCustomized) {
        // Load user's custom settings if they exist
        const userSettings = templateData.template;
        console.log('🔄 Customizer: Found user customizations:', userSettings);
        console.log('🔄 Customizer: User settings modification fields:', {
          headerModifications: (userSettings as any)?.headerModifications,
          bodyModifications: (userSettings as any)?.bodyModifications,
          rightSidebarModifications: (userSettings as any)?.rightSidebarModifications
        });
        
        setCustomizerState(prev => ({
          ...prev,
          customSettings: {
            colors: userSettings.colors || {},
            typography: userSettings.typography || {},
            content: userSettings.content || {},
            layout: userSettings.layout || {},
            advanced: userSettings.advanced || {},
            classes: userSettings.classes || {},
            headerModifications: (userSettings as any).headerModifications || {},
            bodyModifications: (userSettings as any).bodyModifications || {},
            rightSidebarModifications: (userSettings as any).rightSidebarModifications || {}
          }
        }));
      } else {
        // Template exists but no customizations - reset to empty settings
        console.log('🔄 Customizer: Template exists but no customizations, resetting settings');
        setCustomizerState(prev => ({
          ...prev,
          customSettings: {}
        }));
      }
    }
  }, [templateData?.template?.id, templateData?.metadata?.isCustomized, isFallback, templateLoading]); // Use stable identifiers instead of the whole object

  // Debug company data changes
  useEffect(() => {
    console.log('🔍 Customizer: Company data changed:', companyData);
    if (companyData) {
      console.log('🔍 Customizer: Company data keys:', Object.keys(companyData));
      console.log('🔍 Customizer: Company name:', companyData.name);
      console.log('🔍 Customizer: Company logo:', companyData.logo);
      console.log('🔍 Customizer: Company phone:', companyData.phone);
      console.log('🔍 Customizer: Company email:', companyData.email);
      console.log('🔍 Customizer: Company license_number:', companyData.license_number);
      console.log('🔍 Customizer: Company company_nmls_number:', companyData.company_nmls_number);
      console.log('🔍 Customizer: Company company_social_media:', companyData.company_social_media);
    }
  }, [companyData]);

  // Debug typography changes
  useEffect(() => {
    console.log('🔍 Customizer: Typography changed:', mergedTemplate?.typography);
    if (mergedTemplate?.typography) {
      console.log('🔍 Customizer: Font Family:', mergedTemplate.typography.fontFamily);
      console.log('🔍 Customizer: Font Size:', mergedTemplate.typography.fontSize);
      console.log('🔍 Customizer: Font Weight:', mergedTemplate.typography.fontWeight);
    }
  }, [mergedTemplate?.typography]);

  // Initialize previewActiveTab from template customization on first load
  // Update previewActiveTab when template's activeTab changes
  React.useEffect(() => {
    const templateActiveTab = mergedTemplate?.bodyModifications?.activeTab;
    const enabledTabs = mergedTemplate?.bodyModifications?.enabledTabs || ['todays-rates', 'get-custom-rate', 'document-checklist', 'my-home-value', 'find-my-home', 'learning-center', 'neighborhood-reports'];
    
    if (templateActiveTab && enabledTabs.includes(templateActiveTab)) {
      // On initial load, always set it. After that, only update if it changed
      if (!previewTabInitializedRef.current || templateActiveTab !== previewActiveTab) {
        setPreviewActiveTab(templateActiveTab as TabId);
        previewTabInitializedRef.current = true;
      }
    } else if (!previewTabInitializedRef.current) {
      // If no template activeTab, use default on first load only
      setPreviewActiveTab('todays-rates');
      previewTabInitializedRef.current = true;
    }
  }, [mergedTemplate?.bodyModifications?.activeTab, mergedTemplate?.bodyModifications?.enabledTabs, previewActiveTab]);

  // Fetch user NMLS#
  useEffect(() => {
    if (user) {
      fetchUserNmlsNumber();
    }
  }, [user, fetchUserNmlsNumber]);

  // Fetch public link for profile preview
  useEffect(() => {
    const fetchPublicLink = async () => {
      if (!user) return;
      
      try {
        // Get user's company ID from API
        const companyResponse = await fetch(`/api/user-company?userId=${user.id}`);
        const companyResult = await companyResponse.json();

        if (!companyResult.success) {
          console.log('⚠️ Could not fetch company for public link');
          return;
        }

        const userCompany = companyResult.data;

        const response = await fetch(`/api/public-links?userId=${user.id}&companyId=${userCompany.companyId}`);
        const result = await response.json();

        if (result.success && result.data) {
          setPublicLink(result.data);
          console.log('✅ Public link fetched:', result.data.publicSlug);
        }
      } catch (error) {
        console.error('❌ Error fetching public link:', error);
      }
    };

    fetchPublicLink();
  }, [user]);

  // Fetch company data for the logged-in user
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user?.id) {
        console.log('⚠️ Customizer: No user ID available');
        return;
      }

      // Check if user has the right role
      if (!userRole || !['employee', 'company_admin', 'super_admin'].includes(userRole.role)) {
        console.log('⚠️ Customizer: User does not have permission to access customizer:', {
          userRole: userRole?.role,
          allowedRoles: ['employee', 'company_admin', 'super_admin']
        });
        setCompanyData(null);
        return;
      }

      console.log('🔍 Customizer: Starting company data fetch for user:', {
        userId: user.id,
        userEmail: user.email,
        userRole: userRole,
        companyId: companyId,
        hasCompanyId: !!companyId
      });

      setCompanyLoading(true);
      try {
        let companyIdToUse = null;

        // First try to get company ID from auth context
        if (companyId) {
          console.log('✅ Customizer: Using companyId from auth context:', companyId);
          companyIdToUse = companyId;
        } else {
          // Fallback: Get user's company ID from user_companies table
          console.log('🔍 Customizer: Fetching company ID from user_companies table for user:', user.id);
          
          try {
            // First, let's check if the user_companies table is accessible
            console.log('🔍 Customizer: Testing user_companies table access...');
            const { data: userCompany, error: userCompanyError } = await supabase
              .from('user_companies')
              .select('company_id')
              .eq('user_id', user.id)
              .single();

            if (userCompanyError) {
              console.error('❌ Customizer: Error fetching user company:', {
                error: userCompanyError,
                message: userCompanyError.message,
                details: userCompanyError.details,
                hint: userCompanyError.hint,
                code: userCompanyError.code,
                fullError: JSON.stringify(userCompanyError, null, 2)
              });
              
              // Don't return early, try to continue with empty company data
              console.log('⚠️ Customizer: Continuing without company data due to user_companies error');
              setCompanyData(null);
        return;
      }
      
            if (!userCompany?.company_id) {
              console.log('⚠️ Customizer: User has no associated company in user_companies table');
              console.log('🔍 Customizer: User company data:', userCompany);
              
              // For new users, we might need to create a company association
              // For now, just continue without company data
              setCompanyData(null);
              return;
            }

            companyIdToUse = userCompany.company_id;
          } catch (supabaseError) {
            console.error('❌ Customizer: Supabase query error:', {
              error: supabaseError,
              message: supabaseError instanceof Error ? supabaseError.message : 'Unknown error',
              stack: supabaseError instanceof Error ? supabaseError.stack : undefined
            });
            console.log('⚠️ Customizer: Continuing without company data due to Supabase error');
            setCompanyData(null);
            return;
          }
        }

        if (!companyIdToUse) {
          console.log('⚠️ Customizer: No company ID available');
          setCompanyData(null);
          return;
        }

        // Fetch company details
        const response = await fetch(`/api/companies/details?companyId=${companyIdToUse}`);
        if (!response.ok) {
          throw new Error('Failed to fetch company details');
        }

        const result = await response.json();
        console.log('✅ Customizer: Fetched company data:', result);
        if (result.success && result.data) {
          console.log('✅ Customizer: Setting company data:', result.data);
          console.log('✅ Customizer: Company data keys:', Object.keys(result.data));
          console.log('✅ Customizer: Company name:', result.data.name);
          console.log('✅ Customizer: Company logo:', result.data.logo);
          console.log('✅ Customizer: Company phone:', result.data.phone);
          console.log('✅ Customizer: Company email:', result.data.email);
          console.log('✅ Customizer: Company license_number:', result.data.license_number);
          console.log('✅ Customizer: Company company_nmls_number:', result.data.company_nmls_number);
          console.log('✅ Customizer: Company company_social_media:', result.data.company_social_media);
          setCompanyData(result.data);
      } else {
          console.error('❌ Customizer: Company data fetch failed:', result.error);
      }
    } catch (error) {
        console.error('❌ Customizer: Error fetching company data:', error);
      } finally {
        setCompanyLoading(false);
      }
    };

    fetchCompanyData();
  }, [user?.id, companyId]);

  // Handle template selection
  const handleTemplateSelect = useCallback(async (templateSlug: string) => {
    // Update global template selection
    setSelectedTemplate(templateSlug);
    
    // Reset loaded template ref to allow loading new template
    loadedTemplateRef.current = null;
    
    // Reset custom settings when switching templates
    setCustomizerState(prev => ({
      ...prev,
      customSettings: {}
    }));
    
    // Reset saved state when switching templates
    setIsTemplateSaved(false);
    
    // Templates should already be preloaded, no need to fetch again
    console.log('🔄 Customizer: Template selected:', templateSlug);
  }, [setSelectedTemplate]);


  // Handle section change
  const handleSectionChange = useCallback((section: CustomizerState['activeSection']) => {
    setCustomizerState(prev => ({
      ...prev,
      activeSection: section,
      showSectionDetails: true
    }));
  }, []);

  // Handle back to sections view
  const handleBackToSections = useCallback(() => {
    setCustomizerState(prev => ({
      ...prev,
      showSectionDetails: false
    }));
  }, []);

  // Handle setting changes
  const handleSettingChange = useCallback((path: string, value: any) => {
    console.log('🔄 Customizer: Setting change:', { path, value });
    
    // Mark as unsaved when settings change
    setIsTemplateSaved(false);
    
    // Validate URLs for social media fields
    if (path.includes('facebook') || path.includes('twitter') || path.includes('linkedin') || path.includes('instagram')) {
      if (value && typeof value === 'string' && value.trim()) {
        // Basic URL validation
        try {
          new URL(value);
        } catch (e) {
          console.warn('⚠️ Customizer: Invalid URL provided:', value);
          // Don't prevent the change, but log the warning
        }
      }
    }
    
    setCustomizerState(prev => {
      const newSettings = { ...prev.customSettings } as any;
      
      // Handle nested paths like 'colors.primary', 'typography.fontSize', etc.
      const pathParts = path.split('.');
      let current = newSettings;
      
      // Navigate to the parent object
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      // Set the final value
      const finalKey = pathParts[pathParts.length - 1];
      current[finalKey] = value;
      
      console.log('🔄 Customizer: Updated settings:', newSettings);
      console.log('🔄 Customizer: Previous customSettings:', prev.customSettings);
      console.log('🔄 Customizer: New customSettings:', newSettings);
      
      return {
        ...prev,
        customSettings: newSettings
      };
    });
  }, []);

  // Toggle preview mode (now called full width)
  const toggleFullWidth = useCallback(() => {
    setViewMode(prevMode => {
      const nextMode = prevMode === 'full'
        ? previousNonFullViewRef.current || 'desktop'
        : 'full';

      if (prevMode !== 'full') {
        previousNonFullViewRef.current = prevMode;
      }

      setCustomizerState(prev => ({
        ...prev,
        isPreviewMode: nextMode === 'full'
      }));

      if (nextMode !== 'full') {
        previousNonFullViewRef.current = nextMode;
      }

      return nextMode;
    });
  }, [setCustomizerState]);

  const activateDesktopView = useCallback(() => {
    previousNonFullViewRef.current = 'desktop';
    setViewMode('desktop');
    setCustomizerState(prev => ({
      ...prev,
      isPreviewMode: false
    }));
  }, [setCustomizerState]);

  const activateMobileView = useCallback(() => {
    previousNonFullViewRef.current = 'mobile';
    setViewMode('mobile');
    setCustomizerState(prev => ({
      ...prev,
      isPreviewMode: false
    }));
  }, [setCustomizerState]);

  // Handle setting current template as profile template
  const handleSetProfileTemplate = useCallback(async () => {
    if (!user || !customizerState.selectedTemplate) return;
    
    setIsSettingProfileTemplate(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch('/api/templates/update-public-profile-template', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateSlug: customizerState.selectedTemplate
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to set profile template');
      }

      if (result.success) {
        setSaveMessage('Template set as profile template successfully!');
        setTimeout(() => setSaveMessage(null), 3000);
        setShowSettingsModal(false);
      } else {
        throw new Error(result.error || 'API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ Customizer: Error setting profile template:', error);
      setSaveMessage('Error setting profile template');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSettingProfileTemplate(false);
    }
  }, [user, customizerState.selectedTemplate]);

  // Handle profile preview navigation
  const handleProfilePreview = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (publicLink?.publicSlug) {
        const baseUrl = window.location.origin;
        const publicUrl = `${baseUrl}/public/profile/${publicLink.publicSlug}`;
        window.open(publicUrl, '_blank');
      } else {
        // Fallback: show message that public link needs to be created
        setSaveMessage('Please create a public profile link first from the Profile page.');
        setTimeout(() => setSaveMessage(null), 4000);
      }
    }
  }, [publicLink]);

  // Save template
  const handleSave = useCallback(async () => {
    // If already saved, navigate to profile preview
    if (isTemplateSaved) {
      handleProfilePreview();
      return;
    }
    
    if (!user || !customizerState.selectedTemplate) return;
    
    setIsSaving(true);
    
    // Add timeout to prevent hanging
    const saveTimeout = setTimeout(() => {
      console.warn('⚠️ Customizer: Save operation timed out');
      setIsSaving(false);
      setSaveMessage('Save operation timed out - please try again');
      setTimeout(() => setSaveMessage(null), 5000);
    }, 30000); // 30 second timeout (increased from 10)
    
    try {
      console.log('🔄 Customizer: Saving template settings:', {
        templateSlug: customizerState.selectedTemplate,
        customSettings: customizerState.customSettings
      });
      
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      console.log('🔄 Customizer: Sending API request...');
      console.log('🔄 Customizer: Request payload:', {
        templateSlug: customizerState.selectedTemplate,
        customSettings: customizerState.customSettings,
        isPublished: false
      });
      
      const startTime = Date.now();
      const response = await fetch('/api/templates/user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateSlug: customizerState.selectedTemplate,
          customSettings: customizerState.customSettings,
          isPublished: false
        })
      });
      
      const endTime = Date.now();
      console.log(`🔄 Customizer: API response received in ${endTime - startTime}ms:`, response.status, response.statusText);
      
      const result = await response.json();
      console.log('🔄 Customizer: API result:', result);
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save template');
      }

      if (result.success) {
        setSaveMessage('Template saved successfully!');
        setIsTemplateSaved(true); // Mark as saved to change button text
        setTimeout(() => setSaveMessage(null), 3000);
        console.log('✅ Customizer: Template saved successfully');
        
        // Invalidate client-side cache for this template
        if (typeof window !== 'undefined' && user) {
          const cacheKey = `template_${user.id}_${customizerState.selectedTemplate}`;
          localStorage.removeItem(cacheKey);
          console.log('🗑️ Customizer: Invalidated client cache for:', cacheKey);
        }
        
        // Force immediate context update by calling refreshTemplate
        // This ensures all components get the updated data instantly
        try {
          await refreshTemplate(customizerState.selectedTemplate);
          console.log('✅ Customizer: Template refreshed successfully, context updated');
          
          // Also refresh the efficient templates cache to ensure LandingPageTabs gets updated data
          if (typeof window !== 'undefined') {
            // Clear efficient templates cache
            const efficientCacheKey = `template_${user.id}_${customizerState.selectedTemplate}`;
            localStorage.removeItem(efficientCacheKey);
            console.log('🗑️ Customizer: Cleared efficient templates cache for:', efficientCacheKey);
            // Broadcast to other tabs to refresh the template now
            try {
              const bc = new BroadcastChannel('templates');
              bc.postMessage({ type: 'template:updated', userId: user.id, slug: customizerState.selectedTemplate, ts: Date.now() });
            } catch {}
          }
        } catch (error) {
          console.error('❌ Customizer: Error refreshing template data:', error);
        }
      } else {
        throw new Error(result.error || 'API returned unsuccessful response');
      }
      
    } catch (error) {
      console.error('❌ Customizer: Error saving template:', error);
      setSaveMessage('Error saving template');
    } finally {
      clearTimeout(saveTimeout);
      setIsSaving(false);
    }
  }, [user, customizerState.selectedTemplate, customizerState.customSettings, refreshTemplate, isTemplateSaved, handleProfilePreview]);

  // Auto-save template without navigation (for automatic saves like avatar upload/clear)
  const autoSaveTemplate = useCallback(async () => {
    if (!user || !customizerState.selectedTemplate) return;
    
    setIsSaving(true);
    
    // Add timeout to prevent hanging
    const saveTimeout = setTimeout(() => {
      console.warn('⚠️ Customizer: Auto-save operation timed out');
      setIsSaving(false);
    }, 30000);
    
    try {
      console.log('🔄 Customizer: Auto-saving template settings:', {
        templateSlug: customizerState.selectedTemplate,
        customSettings: customizerState.customSettings
      });
      
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const startTime = Date.now();
      const response = await fetch('/api/templates/user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateSlug: customizerState.selectedTemplate,
          customSettings: customizerState.customSettings,
          isPublished: false
        })
      });
      
      const endTime = Date.now();
      console.log(`🔄 Customizer: Auto-save API response received in ${endTime - startTime}ms:`, response.status, response.statusText);
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to auto-save template');
      }

      if (result.success) {
        setIsTemplateSaved(true); // Mark as saved
        console.log('✅ Customizer: Template auto-saved successfully');
        
        // Invalidate client-side cache for this template
        if (typeof window !== 'undefined' && user) {
          const cacheKey = `template_${user.id}_${customizerState.selectedTemplate}`;
          localStorage.removeItem(cacheKey);
          console.log('🗑️ Customizer: Invalidated client cache for:', cacheKey);
        }
        
        // Force immediate context update by calling refreshTemplate
        try {
          await refreshTemplate(customizerState.selectedTemplate);
          console.log('✅ Customizer: Template refreshed successfully after auto-save');
          
          // Also refresh the efficient templates cache
          if (typeof window !== 'undefined') {
            const efficientCacheKey = `template_${user.id}_${customizerState.selectedTemplate}`;
            localStorage.removeItem(efficientCacheKey);
            console.log('🗑️ Customizer: Cleared efficient templates cache for:', efficientCacheKey);
            // Broadcast to other tabs to refresh the template
            try {
              const bc = new BroadcastChannel('templates');
              bc.postMessage({ type: 'template:updated', userId: user.id, slug: customizerState.selectedTemplate, ts: Date.now() });
            } catch {}
          }
        } catch (error) {
          console.error('❌ Customizer: Error refreshing template data after auto-save:', error);
        }
      } else {
        throw new Error(result.error || 'API returned unsuccessful response');
      }
      
    } catch (error) {
      console.error('❌ Customizer: Error auto-saving template:', error);
      throw error; // Re-throw so caller can handle
    } finally {
      clearTimeout(saveTimeout);
      setIsSaving(false);
    }
  }, [user, customizerState.selectedTemplate, customizerState.customSettings, refreshTemplate]);


  return (
    <RouteGuard allowedRoles={['employee']}>
      <DashboardLayout 
        showBreadcrumb={true}
        breadcrumbVariant="default"
        breadcrumbSize="md"
      >
        <style jsx global>{`
          /* Show scrollbars for customizer scroll wrapper */
          .customizer-scroll-wrapper::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          .customizer-scroll-wrapper::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          
          .customizer-scroll-wrapper::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 0px;
          }
          
          .customizer-scroll-wrapper::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
          
          /* Firefox scrollbar for customizer */
          .customizer-scroll-wrapper {
            scrollbar-width: thin;
            scrollbar-color: #888 #f1f1f1;
          }
          
          /* Ensure customizer is scrollable on mobile */
          @media (max-width: 768px) {
            .customizer-scroll-wrapper {
              -webkit-overflow-scrolling: touch;
            }
          }
          
          /* Force preview container to maintain fixed size in customizer (desktop only) */
          .customizer-container .public-profile-container {
            width: auto !important;
            max-width: none !important;
            min-width: 900px !important;
          }
          
          /* Prevent child elements from being constrained in customizer preview (desktop only) */
          .customizer-container .public-profile-container * {
            max-width: none !important;
          }
          
          /* Override fixed-width rules for mobile preview */
          .customizer-mobile-preview .public-profile-container {
            width: 100% !important;
            max-width: 100% !important;
            min-width: auto !important;
          }
          
          .customizer-mobile-preview .public-profile-container * {
            max-width: 100% !important;
          }
          
          /* Override the 768px media query for customizer preview (desktop only) */
          @media (max-width: 768px) {
            .customizer-container .public-profile-container {
              width: auto !important;
              max-width: none !important;
              min-width: 1200px !important;
            }
            
            .customizer-container .public-profile-container * {
              max-width: none !important;
            }
            
            /* Ensure mobile preview still works at 768px */
            .customizer-mobile-preview .public-profile-container {
              width: 100% !important;
              max-width: 100% !important;
              min-width: auto !important;
            }
            
            .customizer-mobile-preview .public-profile-container * {
              max-width: 100% !important;
            }
          }
        `}</style>
        <div className="w-full max-h-[calc(100vh-120px)] overflow-x-auto overflow-y-auto customizer-scroll-wrapper">
          <div className="flex flex-col bg-gray-50 customizer-container min-w-[1200px] min-h-[calc(100vh-120px)]">
          {/* Header Controls */}
          <div ref={headerRef} className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 sticky top-0 z-50">
            <div className="flex flex-row items-center justify-between gap-0">
              <div className="flex flex-row items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Template Customizer</h1>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Template:</span>
                  <select
                    value={customizerState.selectedTemplate}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6]"
                  >
                    {['template1', 'template2'].map(templateSlug => {
                      const templateName = templateSlug === 'template1' ? 'Template1' : 'Template2';
                      
                      return (
                        <option key={templateSlug} value={templateSlug}>
                          {templateName}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 overflow-x-auto">
                {/* Settings Icon - Set as Profile Template */}
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 flex-shrink-0"
                  title="Settings - Set as Profile Template"
                >
                  <Cog size={18} />
                </button>

                <button
                  onClick={activateDesktopView}
                  className={`p-2 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0 ${
                    isDesktopView 
                      ? 'bg-[#01bcc6]/10 text-[#01bcc6]' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="Desktop View"
                >
                  <LaptopMinimal size={18} />
                </button>
                
                {/* Mobile View Icon */}
                <button
                  onClick={activateMobileView}
                  className={`block p-2 rounded-md transition-colors ${
                    isMobileView 
                      ? 'bg-[#01bcc6]/10 text-[#01bcc6]' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone size={18} />
                </button>
                
                {/* Full Width Icon */}
                <button
                  onClick={toggleFullWidth}
                  className={`block p-2 rounded-md transition-colors ${
                    isFullWidth
                      ? 'bg-[#01bcc6]/10 text-[#01bcc6]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title={isFullWidth ? 'Exit Full Width' : 'Full Width'}
                >
                  <Maximize2 size={18} />
                </button>
                
                {/* Save/Profile Preview Button */}
                <Button
                  onClick={handleSave}
                  disabled={(isSaving || (Object.keys(customizerState.customSettings).length === 0 && !isTemplateSaved)) && !isTemplateSaved}
                  className="bg-[#005b7c] hover:bg-[#01bcc6] text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 text-sm px-4"
                >
                  {isTemplateSaved ? (
                    <>
                      <Eye size={14} className="mr-2" />
                      <span className="inline">Profile Preview</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} className="mr-2" />
                      <span className="inline">{isSaving ? 'Saving...' : 'Save Template'}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {saveMessage && (
              <div className={`mt-3 px-4 py-2 rounded-md text-sm ${
                saveMessage.includes('Error') 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {saveMessage}
              </div>
            )}
          </div>

          {/* Settings Modal */}
          {showSettingsModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Settings</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Set the current template as your public profile template. This will make it visible to visitors on your public profile page.
                  </p>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSetProfileTemplate}
                      disabled={isSettingProfileTemplate}
                      className="flex-1 px-4 py-2 bg-[#005b7c] hover:bg-[#01bcc6] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSettingProfileTemplate ? 'Setting...' : 'Set as Profile Template'}
                    </button>
                    <button
                      onClick={() => setShowSettingsModal(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content - Takes remaining height */}
          <div className="flex flex-1 min-h-0 overflow-visible">
            {/* Left Sidebar - Sections or Section Details */}
            <div className={`block w-80 bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 sticky self-start ${
              customizerState.isPreviewMode ? '-ml-80' : 'ml-0'
            }`}
            style={{ 
              top: `${headerHeight}px`,
              maxHeight: `calc(100vh - ${headerHeight + 64}px)`,
              overflowY: 'auto'
            }}>
              {!customizerState.showSectionDetails ? (
                // Main Sections View
                <div className="h-full flex flex-col">
                  <div className="p-6 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Customization Sections</h2>
                  </div>
                  
                  <div className="flex-1 overflow-auto px-6 pb-6">
                    <div className="space-y-2">
                      {[
                        { id: 'general', label: 'General Settings', icon: Settings, description: 'Colors, typography, layout, advanced' },
                        { id: 'header', label: 'Header Modifications', icon: Layout, description: 'Officer name, avatar, contact info, Apply Now link' },
                        { id: 'body', label: 'Body Section', icon: Type, description: 'Tab management and content preview' },
                        { id: 'rightSidebar', label: 'Company Info', icon: Palette, description: 'Social media, company info, reviews' }
                      ].map(section => (
                        <button
                          key={section.id}
                          onClick={() => handleSectionChange(section.id as CustomizerState['activeSection'])}
                          className={`w-full text-left p-4 rounded-lg border transition-colors ${
                            customizerState.activeSection === section.id
                              ? ''
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                          style={customizerState.activeSection === section.id ? {
                            backgroundColor: `${mergedTemplate?.colors?.primary || '#ec4899'}10`,
                            borderColor: mergedTemplate?.colors?.primary || '#ec4899',
                            color: mergedTemplate?.colors?.primary || '#ec4899'
                          } : {}}
                        >
                          <div className="flex items-center space-x-3">
                            <section.icon size={20} />
                            <div>
                              <div className="font-medium">{section.label}</div>
                              <div className="text-sm text-gray-500">{section.description}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Section Details View
                <div className="h-full flex flex-col">
                  {/* Back Button Header */}
                  <div className="p-4 border-b border-gray-200 flex-shrink-0">
                    <button
                      onClick={handleBackToSections}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <ChevronLeft size={20} />
                      <span className="font-medium">Back to Sections</span>
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900 mt-2">
                      {(() => {
                        const sections = [
                          { id: 'general', label: 'General Settings' },
                          { id: 'header', label: 'Header Modifications' },
                          { id: 'body', label: 'Body Section' },
                          { id: 'rightSidebar', label: 'Company Info' }
                        ];
                        const currentSection = sections.find(s => s.id === customizerState.activeSection);
                        if (currentSection) {
                          return currentSection.label.includes('Settings') 
                            ? currentSection.label 
                            : `${currentSection.label} Settings`;
                        }
                        return `${customizerState.activeSection.charAt(0).toUpperCase() + customizerState.activeSection.slice(1)} Settings`;
                      })()}
                    </h2>
                  </div>
                  
                  {/* Section Content */}
                  <div className="flex-1 overflow-auto p-4">
                    <div className="space-y-6">
                      {customizerState.activeSection === 'general' && (
                        <GeneralSettings 
                          template={mergedTemplate} 
                          onChange={(path, value) => handleSettingChange(path, value)}
                        />
                      )}
                      
                      {customizerState.activeSection === 'header' && (
                        <HeaderModifications 
                          template={mergedTemplate} 
                          officerInfo={officerInfo}
                          onChange={(path, value) => handleSettingChange(`headerModifications.${path}`, value)}
                          onSave={autoSaveTemplate}
                          setIsDeletingAvatar={setIsDeletingAvatar}
                        />
                      )}
                      
                      {customizerState.activeSection === 'body' && (
                        <BodyModifications 
                          template={mergedTemplate} 
                          onChange={(path, value) => handleSettingChange(`bodyModifications.${path}`, value)}
                        />
                      )}
                      
                      {customizerState.activeSection === 'rightSidebar' && (
                        <RightSidebarModifications 
                          template={mergedTemplate} 
                          onChange={(path, value) => handleSettingChange(`rightSidebarModifications.${path}`, value)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Center - Live Preview (Full Width) */}
            <div className="flex-1 bg-gray-100 overflow-auto">
              <div className={`h-full w-full overflow-auto overflow-x-auto`}>
                <div className={`${isMobileView ? 'flex justify-center items-start min-h-full p-0' : 'p-2 2xl:p-6'}`}>
                  <div 
                      className={`transition-all duration-300 ${
                        isMobileView 
                          ? 'customizer-mobile-preview w-[375px] h-[667px] overflow-y-auto overflow-x-auto shadow-2xl border border-gray-300 bg-white m-0'
                          : 'min-h-full min-w-[900px] w-full overflow-auto bg-white shadow-sm border border-gray-200'
                      }`}
                    style={{
                      fontFamily: mergedTemplate?.typography?.fontFamily || 'Inter',
                      ...(isMobileView && {
                        WebkitOverflowScrolling: 'touch',
                        overscrollBehavior: 'contain'
                      })
                    }}
                  >
                    <TemplateProvider
                      templateData={mergedTemplate}
                      isCustomizerMode={true}
                      customTemplate={mergedTemplate}
                      officerInfo={officerInfo}
                    >
                      <React.Suspense fallback={
                        <div className="flex items-center justify-center h-96">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01bcc6]"></div>
                        </div>
                      }>
                        {/* Show skeleton loader if template is still loading or is fallback */}
                        {isInitialLoading ? (
                          <div className="bg-white min-h-screen flex flex-col">
                            <div className="h-20 bg-gray-100 border-b border-gray-200" />
                            <div className="h-[300px] bg-gray-50 flex items-center justify-center">
                              <div className="w-[200px] h-[200px] bg-gray-200 rounded-full" />
                            </div>
                            <div className="p-8 bg-white">
                              <div className="h-5 bg-gray-200 mb-4 rounded" />
                              <div className="h-5 bg-gray-200 mb-4 rounded w-3/5" />
                            </div>
                          </div>
                        ) : (
                          /* Use PublicProfileContent component for both mobile and desktop views */
                          <PublicProfileContent
                          profileData={{
                            user: {
                              id: user?.id || '',
                              firstName: officerInfo.officerName.split(' ')[0] || '',
                              lastName: officerInfo.officerName.split(' ').slice(1).join(' ') || '',
                            email: officerInfo.email,
                              phone: officerInfo.phone || '',
                            nmlsNumber: userNmlsNumber || undefined,
                            avatar: undefined
                            },
                            company: companyData ? {
                            id: companyData.id,
                            name: companyData.name,
                            logo: companyData.logo,
                            website: companyData.website,
                              address: companyData.address,
                            phone: companyData.phone || companyData.admin_email,
                            email: companyData.email || companyData.admin_email,
                            license_number: companyData.license_number,
                            company_nmls_number: companyData.company_nmls_number,
                            company_social_media: companyData.company_social_media
                            } : {
                              id: '',
                              name: 'Your Company',
                              logo: undefined,
                              website: undefined,
                              address: undefined,
                              phone: undefined,
                              email: undefined,
                              license_number: undefined,
                              company_nmls_number: undefined,
                              company_social_media: undefined
                            },
                            template: mergedTemplate
                          }}
                          templateData={{
                            template: {
                              ...mergedTemplate,
                              slug: customizerState.selectedTemplate || 'template1'
                            },
                            pageSettings: {},
                            metadata: {
                              templateSlug: customizerState.selectedTemplate || 'template1',
                              isCustomized: true,
                              isPublished: false
                            }
                          }}
                          initialActiveTab={previewActiveTab}
                          onTabChange={(tab) => setPreviewActiveTab(tab)}
                          isPreview={true}
                          companyName={companyData?.name}
                          forceMobileViewport={isMobileView}
                        />
                        )}
                      </React.Suspense>
                    </TemplateProvider>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}

// Settings Components
interface SettingsProps {
  template: Template | null;
  onChange: (path: string, value: any) => void;
}

interface HeaderModificationsProps extends SettingsProps {
  officerInfo: {
    officerName: string;
    phone?: string;
    email: string;
  };
  onSave?: () => Promise<void>;
  setIsDeletingAvatar?: (isDeleting: boolean) => void;
}

// General Settings Component (combines all current settings)
function GeneralSettings({ template, onChange }: SettingsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['colors']));

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  if (!template) return null;

  const sections = [
    { id: 'colors', label: 'Colors', icon: Palette, component: ColorsSettings },
    { id: 'layout', label: 'Layout', icon: Layout, component: LayoutSettings }
  ];

  return (
    <div className="space-y-2">
      {sections.map(section => {
        const isExpanded = expandedSections.has(section.id);
        const SectionComponent = section.component;
        
        return (
          <div key={section.id} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <section.icon size={20} className="text-gray-600" />
                <span className="font-medium text-gray-900">{section.label}</span>
              </div>
              <ChevronRight 
                size={20} 
                className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
              />
            </button>
            
            {isExpanded && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <SectionComponent 
                  template={template} 
                  onChange={(path, value) => onChange(`${section.id}.${path}`, value)} 
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Avatar Upload Component
function AvatarUploadComponent({ currentAvatar, onChange, onSave, setIsDeletingAvatar }: { currentAvatar: string; onChange: (url: string) => void; onSave?: () => Promise<void>; setIsDeletingAvatar?: (isDeleting: boolean) => void }) {
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('File too large. Maximum size is 5MB.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token found');
      }

      // Upload file
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Upload failed:', response.status, text);
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update the avatar URL
      onChange(result.data.url);
      // Also update previewUrl to the Cloudinary URL (not the blob URL)
      setPreviewUrl(result.data.url);
      console.log('✅ Avatar uploaded successfully:', result.data.url);

      // Auto-save the template after uploading
      if (onSave) {
        try {
          console.log('💾 Auto-saving template after avatar upload...');
          await onSave();
          console.log('✅ Template auto-saved successfully');
        } catch (error) {
          console.error('❌ Error auto-saving template:', error);
          // Don't throw - the avatar is already uploaded and state is updated
        }
      }

    } catch (error) {
      console.error('❌ Avatar upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    onChange(url);
    setPreviewUrl(url || null);
  };

  const clearAvatar = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to clear the avatar? This action cannot be undone.');
    if (!confirmed) {
      console.log('🚫 Clear avatar cancelled by user');
      return;
    }

    setIsDeleting(true);
    // Notify parent that avatar deletion has started (for skeleton loader)
    if (setIsDeletingAvatar) {
      setIsDeletingAvatar(true);
    }
    console.log('🔍 Clear avatar called:', { previewUrl, currentAvatar });

    try {
      // Check if current avatar is a Cloudinary URL
      // Prefer currentAvatar as it's the source of truth, but also check previewUrl
      const avatarToCheck = currentAvatar || previewUrl;
      console.log('🔍 Avatar to check:', avatarToCheck);
      
      // Clean up blob URL if previewUrl is a blob URL
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      
      if (avatarToCheck && avatarToCheck.includes('res.cloudinary.com')) {
        console.log('✅ Detected Cloudinary URL, attempting deletion...');
        try {
        // Extract publicId from Cloudinary URL
        // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
        // The publicId can include folders, e.g., "avatars/filename"
        const urlParts = avatarToCheck.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        
        if (uploadIndex !== -1 && urlParts.length > uploadIndex + 2) {
          // Get all parts after the version number (which is at uploadIndex + 1)
          // Join them to get the full publicId path (including folder)
          const publicIdParts = urlParts.slice(uploadIndex + 2);
          const publicIdWithExt = publicIdParts.join('/');
          
          // Remove file extension to get publicId
          const publicId = publicIdWithExt.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
          
          console.log('🔍 Extracted publicId:', publicId);
          
          // Delete from Cloudinary
          const response = await fetch('/api/upload/avatar', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ publicId }),
          });
          
          const responseData = await response.json();
          
          if (!response.ok) {
            console.warn('⚠️ Failed to delete image from Cloudinary:', responseData);
          } else {
            console.log('✅ Image deleted from Cloudinary:', responseData);
          }
          } else {
            console.warn('⚠️ Could not extract publicId from URL:', avatarToCheck);
          }
        } catch (error) {
          console.error('❌ Error deleting from Cloudinary:', error);
          // Continue to clear local state even if deletion fails
        }
      } else {
        console.log('ℹ️ Not a Cloudinary URL or no avatar to clear:', avatarToCheck);
      }
      
      // Clear local state regardless
      console.log('🧹 Clearing local state...');
      onChange('');
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Auto-save the template after clearing
      if (onSave) {
        try {
          console.log('💾 Auto-saving template after avatar clear...');
          await onSave();
          console.log('✅ Template auto-saved successfully');
        } catch (error) {
          console.error('❌ Error auto-saving template:', error);
          // Don't throw - the avatar is already cleared locally
        }
      }
    } finally {
      setIsDeleting(false);
      // Notify parent that avatar deletion has completed
      if (setIsDeletingAvatar) {
        setIsDeletingAvatar(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => setUploadMode('url')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            uploadMode === 'url'
              ? 'bg-[#01bcc6]/10 text-[#01bcc6] border border-[#01bcc6]/20'
              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
          }`}
        >
          URL
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('upload')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            uploadMode === 'upload'
              ? 'bg-[#01bcc6]/10 text-[#01bcc6] border border-[#01bcc6]/20'
              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
          }`}
        >
          Upload
        </button>
      </div>

      {/* URL Input Mode */}
      {uploadMode === 'url' && (
        <div>
          <input
            type="url"
            value={currentAvatar}
            onChange={handleUrlChange}
            placeholder="https://example.com/profile.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6]"
          />
        </div>
      )}

      {/* File Upload Mode */}
      {uploadMode === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileUpload}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6]"
            disabled={isUploading}
          />
          {isUploading && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#01bcc6]"></div>
              <span>Uploading...</span>
            </div>
          )}
          {uploadError && (
            <div className="mt-2 text-sm text-red-600">
              {uploadError}
            </div>
          )}
        </div>
      )}

      {/* Image Preview */}
      {(previewUrl || currentAvatar) && (
        <div className="mt-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Image
                src={previewUrl || currentAvatar}
                alt="Profile preview"
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="flex-1" title={previewUrl || currentAvatar}>
              <p className="text-sm text-gray-600">Preview</p>
              <p className="text-xs text-gray-500 max-w-[100px] truncate" >
                {previewUrl || currentAvatar}
              </p>
            </div>
            <button
              type="button"
              onClick={clearAvatar}
              disabled={isDeleting}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Clear'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Header Modifications Component
function HeaderModifications({ template, officerInfo, onChange, onSave, setIsDeletingAvatar }: HeaderModificationsProps) {
  if (!template) return null;

  const headerMods = template.headerModifications || {};

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-md font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Officer Name</label>
            <input
              type="text"
              value={headerMods.officerName || officerInfo.officerName}
              onChange={(e) => onChange('officerName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={headerMods.phone || officerInfo.phone || ''}
              onChange={(e) => onChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={headerMods.email || officerInfo.email}
              onChange={(e) => onChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
            <AvatarUploadComponent 
              currentAvatar={headerMods.avatar || ''}
              onChange={(url) => onChange('avatar', url)}
              onSave={onSave}
              setIsDeletingAvatar={setIsDeletingAvatar}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-md font-semibold text-gray-900 mb-4">Apply Now Button</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Apply Now Link</label>
            <input
              type="url"
              value={headerMods.applyNowLink || ''}
              onChange={(e) => onChange('applyNowLink', e.target.value)}
              placeholder="https://example.com/apply"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
            <input
              type="text"
              value={headerMods.applyNowText || 'Apply Now'}
              onChange={(e) => onChange('applyNowText', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Body Modifications Component
function BodyModifications({ template, onChange }: SettingsProps) {
  if (!template) return null;

  const bodyMods = template.bodyModifications || {};
  const availableTabs = [
    { id: 'todays-rates', label: "Today's Rates" },
    { id: 'get-custom-rate', label: 'Get My Custom Rate' },
    { id: 'document-checklist', label: 'Document Checklist' },
    { id: 'my-home-value', label: 'My Home Value' },
    { id: 'find-my-home', label: 'Find My Home' },
    { id: 'learning-center', label: 'Learning Center' },
    { id: 'neighborhood-reports', label: 'Neighborhood Reports' }
  ];

  const enabledTabs = bodyMods.enabledTabs || availableTabs.map(tab => tab.id);
  const activeTab = bodyMods.activeTab || 'todays-rates';
  
  // Filter available tabs to only show enabled tabs in the default active tab dropdown
  const enabledTabsList = availableTabs.filter(tab => enabledTabs.includes(tab.id));

  // Reset activeTab if it becomes disabled
  React.useEffect(() => {
    if (!enabledTabs.includes(activeTab) && enabledTabsList.length > 0) {
      onChange('activeTab', enabledTabsList[0].id);
    }
  }, [enabledTabs, activeTab, enabledTabsList]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-md font-semibold text-gray-900 mb-4">Tab Management</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Active Tab</label>
            <select
              value={activeTab}
              onChange={(e) => onChange('activeTab', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6]"
            >
              {enabledTabsList.map(tab => (
                <option key={tab.id} value={tab.id}>{tab.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Enabled Tabs</label>
            <div className="space-y-2">
              {availableTabs.map(tab => (
                <label key={tab.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enabledTabs.includes(tab.id)}
                    onChange={(e) => {
                      const newEnabledTabs = e.target.checked
                        ? [...enabledTabs, tab.id]
                        : enabledTabs.filter((id: string) => id !== tab.id);
                      onChange('enabledTabs', newEnabledTabs);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{tab.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-md font-semibold text-gray-900 mb-4">My Home Value Tab Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Home Value Widget URL (CloudCMA)
            </label>
            <input
              type="url"
              value={bodyMods.homeValueWidgetUrl || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                // Basic URL validation
                const url = e.target.value;
                if (url === '' || url.startsWith('http://') || url.startsWith('https://')) {
                  onChange('homeValueWidgetUrl', url);
                }
              }}
              placeholder="http://app.cloudcma.com/api_widget/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the CloudCMA widget URL for the My Home Value tab iframe. This URL will be used to display the home value estimation widget.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Right Sidebar Modifications Component
function RightSidebarModifications({ template, onChange }: SettingsProps) {
  if (!template) return null;

  const sidebarMods = template.rightSidebarModifications || {};

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-md font-semibold text-gray-900 mb-4">Company Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input
              type="text"
              value={sidebarMods.companyName ?? ''}
              onChange={(e) => onChange('companyName', e.target.value)}
              placeholder="Your Brand™"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo URL</label>
            <input
              type="url"
              value={sidebarMods.logo ?? ''}
              onChange={(e) => onChange('logo', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={sidebarMods.phone ?? ''}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={sidebarMods.email ?? ''}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="info@yourbrand.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              value={sidebarMods.address ?? ''}
              onChange={(e) => onChange('address', e.target.value)}
              placeholder="123 Main St. City"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6]"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-md font-semibold text-gray-900 mb-4">Social Media Links</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
            <input
              type="url"
              value={sidebarMods.facebook ?? ''}
              onChange={(e) => onChange('facebook', e.target.value)}
              placeholder="https://facebook.com/yourcompany"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Twitter URL</label>
            <input
              type="url"
              value={sidebarMods.twitter ?? ''}
              onChange={(e) => onChange('twitter', e.target.value)}
              placeholder="https://twitter.com/yourcompany"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
            <input
              type="url"
              value={sidebarMods.linkedin ?? ''}
              onChange={(e) => onChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/company/yourcompany"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
            <input
              type="url"
              value={sidebarMods.instagram ?? ''}
              onChange={(e) => onChange('instagram', e.target.value)}
              placeholder="https://instagram.com/yourcompany"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorsSettings({ template, onChange }: SettingsProps) {
  if (!template) return null;

  // Provide default values to prevent controlled/uncontrolled input errors
  const colors = {
    primary: template.colors?.primary || '#01bcc6',
    secondary: template.colors?.secondary || '#01bcc6',
    background: template.colors?.background || '#ffffff',
    text: template.colors?.text || '#111827',
    textSecondary: template.colors?.textSecondary || '#6b7280',
    border: template.colors?.border || '#e5e7eb',
    backgroundType: template.colors?.backgroundType || 'gradient',
    heroTextColor: template.colors?.heroTextColor || '#ffffff'
  };

  // Define theme presets
  const themes = [
    {
      value: 'default',
      label: 'LoanOff Default',
      primary: '#005b7c',
      secondary: '#01bcc6'
    },
    {
      value: 'theme1',
      label: 'Luxury',
      primary: '#064E3B',
      secondary: '#D4AF37'
    },
    {
      value: 'theme2',
      label: 'Modern',
      primary: '#374151',
      secondary: '#9CA3AF'
    },
    {
      value: 'theme3',
      label: 'Premium',
      primary: '#000000',
      secondary: '#62a0ea'
    }
  ];

  // Normalize color value for comparison (handles #, case, whitespace)
  const normalizeColor = (color: string) => {
    const cleaned = color.trim().toUpperCase();
    // Ensure it starts with # for consistent comparison
    return cleaned.startsWith('#') ? cleaned : `#${cleaned}`;
  };

  // Detect current theme based on primary and secondary colors
  const detectCurrentTheme = () => {
    const normalizedPrimary = normalizeColor(colors.primary);
    const normalizedSecondary = normalizeColor(colors.secondary);
    
    const matchingTheme = themes.find(
      theme => 
        normalizeColor(theme.primary) === normalizedPrimary &&
        normalizeColor(theme.secondary) === normalizedSecondary
    );
    
    return matchingTheme?.value || null;
  };

  const currentTheme = detectCurrentTheme();

  // Handle theme selection
  const handleThemeChange = (themeValue: string) => {
    const selectedTheme = themes.find(t => t.value === themeValue);
    if (selectedTheme) {
      onChange('primary', selectedTheme.primary);
      onChange('secondary', selectedTheme.secondary);
    }
  };

  // Prepare dropdown options
  const themeOptions = themes.map(theme => ({
    value: theme.value,
    label: theme.label
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Theme Presets</label>
        <SmartDropdown
          value={currentTheme}
          onChange={handleThemeChange}
          options={themeOptions}
          placeholder="Select a theme preset"
        />
        <p className="text-xs text-gray-500 mt-1">
          Apply preset color combinations. You can still customize individual colors below.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={colors.primary}
            onChange={(e) => onChange('primary', e.target.value)}
            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={colors.primary}
            onChange={(e) => onChange('primary', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={colors.secondary}
            onChange={(e) => onChange('secondary', e.target.value)}
            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={colors.secondary}
            onChange={(e) => onChange('secondary', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={colors.background}
            onChange={(e) => onChange('background', e.target.value)}
            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={colors.background}
            onChange={(e) => onChange('background', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Background Type</label>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="backgroundType"
              value="gradient"
              checked={colors.backgroundType === 'gradient'}
              onChange={(e) => onChange('backgroundType', e.target.value)}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Gradient</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="backgroundType"
              value="solid"
              checked={colors.backgroundType === 'solid'}
              onChange={(e) => onChange('backgroundType', e.target.value)}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Solid Color</span>
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {colors.backgroundType === 'gradient' 
            ? 'Uses gradient from primary to secondary color with liquid animations' 
            : 'Uses solid secondary color background with liquid animations'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={colors.text}
            onChange={(e) => onChange('text', e.target.value)}
            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={colors.text}
            onChange={(e) => onChange('text', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Hero Text Color</label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={colors.heroTextColor}
            onChange={(e) => onChange('heroTextColor', e.target.value)}
            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={colors.heroTextColor}
            onChange={(e) => onChange('heroTextColor', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Color for text in the hero section (officer name, contact info, etc.)
        </p>
      </div>
    </div>
  );
}

function TypographySettings({ template, onChange }: SettingsProps) {
  if (!template) return null;

  // Provide default values to prevent controlled/uncontrolled input errors
  const typography = {
    fontFamily: template.typography?.fontFamily || 'Inter',
    fontSize: template.typography?.fontSize || 16,
    fontWeight: template.typography?.fontWeight || {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
        <select
          value={typography.fontFamily}
          onChange={(e) => onChange('fontFamily', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="Inter">Inter</option>
          <option value="Roboto">Roboto</option>
          <option value="Open Sans">Open Sans</option>
          <option value="Lato">Lato</option>
          <option value="Poppins">Poppins</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Trebuchet MS">Trebuchet MS</option>
          <option value="Courier New">Courier New</option>
          <option value="Impact">Impact</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
          <option value="Tahoma">Tahoma</option>
          <option value="Calibri">Calibri</option>
          <option value="Segoe UI">Segoe UI</option>
          <option value="Montserrat">Montserrat</option>
          <option value="Source Sans Pro">Source Sans Pro</option>
          <option value="Nunito">Nunito</option>
          <option value="Raleway">Raleway</option>
          <option value="Ubuntu">Ubuntu</option>
          <option value="Playfair Display">Playfair Display</option>
          <option value="Merriweather">Merriweather</option>
          <option value="Crimson Text">Crimson Text</option>
          <option value="Libre Baskerville">Libre Baskerville</option>
          <option value="PT Serif">PT Serif</option>
          <option value="PT Sans">PT Sans</option>
          <option value="Droid Sans">Droid Sans</option>
          <option value="Droid Serif">Droid Serif</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
        <input
          type="range"
          min="12"
          max="24"
          value={typography.fontSize}
          onChange={(e) => onChange('fontSize', parseInt(e.target.value))}
          className="w-full"
        />
        <div className="text-sm text-gray-500 mt-1">{typography.fontSize}px</div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
          <p className="text-xs text-gray-500 mb-3">Control the thickness of text for different elements on your profile.</p>
          <div className="space-y-3">
            {(() => {
              // Define user-friendly labels and order them by importance (most visible first)
              const weightLabels: Record<string, { title: string; description: string; order: number }> = {
                bold: {
                  title: 'Officer Name & Main Headings',
                  description: 'Controls the boldness of your name in the header and main section headings',
                  order: 1
                },
                semibold: {
                  title: 'Section Titles & Tab Labels',
                  description: 'Affects section titles, tab navigation text, and subheadings',
                  order: 2
                },
                medium: {
                  title: 'Input Fields & Form Labels',
                  description: 'Controls the weight of form labels, input field text, and emphasized body text',
                  order: 3
                },
                normal: {
                  title: 'Body Text & Paragraphs',
                  description: 'Default weight for paragraphs, descriptions, and regular content text',
                  order: 4
                },
                light: {
                  title: 'Subtle Text & Secondary Info',
                  description: 'Used for less important text, hints, and secondary information',
                  order: 5
                }
              };
              
              // Sort by order (most important first)
              return Object.entries(typography.fontWeight)
                .map(([key, value]) => ({
                  key,
                  value,
                  label: weightLabels[key] || { 
                    title: key.charAt(0).toUpperCase() + key.slice(1), 
                    description: `${key} weight`,
                    order: 99
                  }
                }))
                .sort((a, b) => a.label.order - b.label.order)
                .map(({ key, value, label }) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <span className="text-sm font-medium text-gray-700 block">{label.title}</span>
                        <span className="text-xs text-gray-500 block mt-0.5">{label.description}</span>
                      </div>
                      <div className="flex items-center space-x-3">
              <input
                type="range"
                min="300"
                max="900"
                step="100"
                value={value as number}
                onChange={(e) => onChange(`fontWeight.${key}`, parseInt(e.target.value))}
                          className="w-24"
              />
                        <span className="text-sm font-medium text-gray-700 w-10 text-right">{value as number}</span>
            </div>
                    </div>
                  </div>
                ));
            })()}
        </div>
      </div>
    </div>
  );
}

function ContentSettings({ template, onChange }: SettingsProps) {
  if (!template) return null;

  // Provide default values to prevent controlled/uncontrolled input errors
  const content = {
    headline: template.content?.headline || 'Welcome to Our Service',
    subheadline: template.content?.subheadline || 'Get started with our amazing platform today.',
    ctaText: template.content?.ctaText || 'Get Started',
    companyName: template.content?.companyName || 'Your Company'
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
        <input
          type="text"
          value={content.headline}
          onChange={(e) => onChange('headline', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Subheadline</label>
        <textarea
          value={content.subheadline}
          onChange={(e) => onChange('subheadline', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">CTA Text</label>
        <input
          type="text"
          value={content.ctaText}
          onChange={(e) => onChange('ctaText', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
        <input
          type="text"
          value={content.companyName}
          onChange={(e) => onChange('companyName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
}

function LayoutSettings({ template, onChange }: SettingsProps) {
  if (!template) return null;

  // Provide default values to prevent controlled/uncontrolled input errors
  const layout = {
    borderRadius: template.layout?.borderRadius || 8
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
        <input
          type="range"
          min="0"
          max="16"
          value={layout.borderRadius}
          onChange={(e) => onChange('borderRadius', parseInt(e.target.value))}
          className="w-full"
        />
        <div className="text-sm text-gray-500 mt-1">{layout.borderRadius}px</div>
      </div>
    </div>
  );
}

function AdvancedSettings({ template, onChange }: SettingsProps) {
  if (!template) return null;

  // Provide default values to prevent controlled/uncontrolled input errors
  const advanced = {
    customCSS: template.advanced?.customCSS || '',
    accessibility: template.advanced?.accessibility || false
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Custom CSS</label>
        <textarea
          value={advanced.customCSS}
          onChange={(e) => onChange('customCSS', e.target.value)}
          rows={6}
          placeholder="/* Add your custom CSS here */"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-blue-500 font-mono"
          style={{
            borderColor: template?.colors?.border || '#e5e7eb',
            '--tw-ring-color': template?.colors?.primary || '#01bcc6'
          } as React.CSSProperties}
        />
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={advanced.accessibility}
            onChange={(e) => onChange('accessibility', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Accessibility Features</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">Enable enhanced accessibility features</p>
      </div>
    </div>
  );
}
