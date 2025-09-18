'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { useTemplateSelection, useTemplate, useGlobalTemplates, TemplateProvider } from '@/contexts/UnifiedTemplateContext';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import Image from 'next/image';

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
  Download, 
  Eye, 
  RefreshCw,
  ChevronLeft,
  ChevronRight
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

export default function CustomizerPage() {
  const { user, userRole, loading: authLoading } = useAuth();
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

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const loadedTemplateRef = useRef<string | null>(null);

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

  // Toggle preview mode
  const togglePreviewMode = useCallback(() => {
    setCustomizerState(prev => ({
      ...prev,
      isPreviewMode: !prev.isPreviewMode
    }));
  }, []);

  // Save template
  const handleSave = useCallback(async () => {
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
  }, [user, customizerState.selectedTemplate, customizerState.customSettings, refreshTemplate]);

  // Reset to original
  const handleReset = useCallback(() => {
    setCustomizerState(prev => ({
      ...prev,
      customSettings: {}
    }));
  }, []);

  return (
    <RouteGuard allowedRoles={['employee']}>
      <DashboardLayout 
        title="Template Customizer" 
        subtitle="Customize your loan officer profile template in real-time"
      >
        <div className="h-screen flex flex-col bg-gray-50">
          {/* Header Controls */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">Template Customizer</h1>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Template:</span>
                  <select
                    value={customizerState.selectedTemplate}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    {['template1', 'template2'].map(templateSlug => {
                      const templateName = templateSlug === 'template1' ? 'Red Theme' : 'Purple Theme';
                      
                      return (
                        <option key={templateSlug} value={templateSlug}>
                          {templateName}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="secondary"
                  onClick={togglePreviewMode}
                  className={customizerState.isPreviewMode ? '' : ''}
                  style={customizerState.isPreviewMode ? {
                    backgroundColor: `${mergedTemplate?.colors?.primary || '#ec4899'}10`,
                    borderColor: mergedTemplate?.colors?.primary || '#ec4899',
                    color: mergedTemplate?.colors?.primary || '#ec4899'
                  } : {}}
                >
                  <Icon name={customizerState.isPreviewMode ? "chevronLeft" : "play"} size={16} className="mr-2" />
                  {customizerState.isPreviewMode ? 'Exit Preview' : 'Preview Mode'}
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  disabled={Object.keys(customizerState.customSettings).length === 0}
                >
                  <Icon name="refresh" size={16} className="mr-2" />
                  Reset
                </Button>
                
                <Button
                  onClick={handleSave}
                  disabled={isSaving || Object.keys(customizerState.customSettings).length === 0}
                >
                  <Icon name="save" size={16} className="mr-2" />
                  {isSaving ? 'Saving...' : 'Save Template'}
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

          {/* Main Content - Takes remaining height */}
          <div className="flex flex-1 min-h-0">
            {/* Left Sidebar - Sections or Section Details */}
            <div className={`w-80 bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 ${
              customizerState.isPreviewMode ? '-ml-80' : 'ml-0'
            }`}>
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
                        { id: 'rightSidebar', label: 'Right Sidebar Mods', icon: Palette, description: 'Social media, company info, reviews' }
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
                      {customizerState.activeSection.charAt(0).toUpperCase() + customizerState.activeSection.slice(1)} Settings
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
            <div className="flex-1 bg-gray-100 overflow-hidden">
              <div className="h-full overflow-auto">
                <div className="p-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-full">
                    <TemplateProvider
                      templateData={mergedTemplate}
                      isCustomizerMode={true}
                      customTemplate={mergedTemplate}
                      officerInfo={officerInfo}
                    >
                      <React.Suspense fallback={
                        <div className="flex items-center justify-center h-96">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                        </div>
                      }>
                        {/* Live Preview Components with Real Officer Data and Merged Template */}
                        <UnifiedHeroSection
                          officerName={officerInfo.officerName}
                          phone={officerInfo.phone || undefined}
                          email={officerInfo.email}
                          template={customizerState.selectedTemplate as 'template1' | 'template2'}
                          templateCustomization={mergedTemplate}
                        />
                        
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
                            <div className="xl:col-span-3">
                              <LandingPageTabs
                                activeTab="todays-rates"
                                onTabChange={() => {}}
                                selectedTemplate={customizerState.selectedTemplate as 'template1' | 'template2'}
                                className="w-full"
                                templateCustomization={mergedTemplate}
                              />
                            </div>
                            <div className="xl:col-span-1">
                              <div className="sticky top-6 lg:top-8">
                                <UnifiedRightSidebar 
                                  template={customizerState.selectedTemplate as 'template1' | 'template2'} 
                                  templateCustomization={mergedTemplate}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </React.Suspense>
                    </TemplateProvider>
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
    { id: 'typography', label: 'Typography', icon: Type, component: TypographySettings },
    { id: 'content', label: 'Content', icon: Settings, component: ContentSettings },
    { id: 'layout', label: 'Layout', icon: Layout, component: LayoutSettings },
    { id: 'advanced', label: 'Advanced', icon: Settings, component: AdvancedSettings }
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
function AvatarUploadComponent({ currentAvatar, onChange }: { currentAvatar: string; onChange: (url: string) => void }) {
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update the avatar URL
      onChange(result.data.url);
      console.log('✅ Avatar uploaded successfully:', result.data.url);

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

  const clearAvatar = () => {
    onChange('');
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
              ? 'bg-pink-100 text-pink-700 border border-pink-300'
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
              ? 'bg-pink-100 text-pink-700 border border-pink-300'
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            disabled={isUploading}
          />
          {isUploading && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
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
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Preview</p>
              <p className="text-xs text-gray-500 truncate">
                {previewUrl || currentAvatar}
              </p>
            </div>
            <button
              type="button"
              onClick={clearAvatar}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Header Modifications Component
function HeaderModifications({ template, officerInfo, onChange }: HeaderModificationsProps) {
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={headerMods.phone || officerInfo.phone || ''}
              onChange={(e) => onChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={headerMods.email || officerInfo.email}
              onChange={(e) => onChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
            <AvatarUploadComponent 
              currentAvatar={headerMods.avatar || ''}
              onChange={(url) => onChange('avatar', url)}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
            <input
              type="text"
              value={headerMods.applyNowText || 'Apply Now'}
              onChange={(e) => onChange('applyNowText', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
    { id: 'apply-now', label: 'Apply Now' },
    { id: 'my-home-value', label: 'My Home Value' },
    { id: 'find-my-home', label: 'Find My Home' },
    { id: 'learning-center', label: 'Learning Center' }
  ];

  const enabledTabs = bodyMods.enabledTabs || availableTabs.map(tab => tab.id);
  const activeTab = bodyMods.activeTab || 'todays-rates';

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
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              {availableTabs.map(tab => (
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
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700">{tab.label}</span>
                </label>
              ))}
            </div>
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
              value={sidebarMods.companyName || 'Your Brand™'}
              onChange={(e) => onChange('companyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo URL</label>
            <input
              type="url"
              value={sidebarMods.logo || ''}
              onChange={(e) => onChange('logo', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={sidebarMods.phone || '(555) 123-4567'}
              onChange={(e) => onChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={sidebarMods.email || 'info@yourbrand.com'}
              onChange={(e) => onChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              value={sidebarMods.address || '123 Main St. City'}
              onChange={(e) => onChange('address', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
              value={sidebarMods.facebook || ''}
              onChange={(e) => onChange('facebook', e.target.value)}
              placeholder="https://facebook.com/yourcompany"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Twitter URL</label>
            <input
              type="url"
              value={sidebarMods.twitter || ''}
              onChange={(e) => onChange('twitter', e.target.value)}
              placeholder="https://twitter.com/yourcompany"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
            <input
              type="url"
              value={sidebarMods.linkedin || ''}
              onChange={(e) => onChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/company/yourcompany"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
            <input
              type="url"
              value={sidebarMods.instagram || ''}
              onChange={(e) => onChange('instagram', e.target.value)}
              placeholder="https://instagram.com/yourcompany"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
    primary: template.colors?.primary || '#ec4899',
    secondary: template.colors?.secondary || '#3b82f6',
    background: template.colors?.background || '#ffffff',
    text: template.colors?.text || '#111827',
    textSecondary: template.colors?.textSecondary || '#6b7280',
    border: template.colors?.border || '#e5e7eb'
  };

  return (
    <div className="space-y-4">
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
        </div>
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
        </div>
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          <option value="Inter">Inter</option>
          <option value="Roboto">Roboto</option>
          <option value="Open Sans">Open Sans</option>
          <option value="Lato">Lato</option>
          <option value="Poppins">Poppins</option>
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
        <div className="space-y-2">
          {Object.entries(typography.fontWeight).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 capitalize">{key}</span>
              <input
                type="range"
                min="300"
                max="900"
                step="100"
                value={value as number}
                onChange={(e) => onChange(`fontWeight.${key}`, parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-500 w-8">{value as number}</span>
            </div>
          ))}
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Subheadline</label>
        <textarea
          value={content.subheadline}
          onChange={(e) => onChange('subheadline', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">CTA Text</label>
        <input
          type="text"
          value={content.ctaText}
          onChange={(e) => onChange('ctaText', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
        <input
          type="text"
          value={content.companyName}
          onChange={(e) => onChange('companyName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        />
      </div>
    </div>
  );
}

function LayoutSettings({ template, onChange }: SettingsProps) {
  if (!template) return null;

  // Provide default values to prevent controlled/uncontrolled input errors
  const layout = {
    alignment: template.layout?.alignment || 'center',
    spacing: template.layout?.spacing || 16,
    borderRadius: template.layout?.borderRadius || 8
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
        <select
          value={layout.alignment}
          onChange={(e) => onChange('alignment', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Spacing</label>
        <input
          type="range"
          min="8"
          max="32"
          value={layout.spacing}
          onChange={(e) => onChange('spacing', parseInt(e.target.value))}
          className="w-full"
        />
        <div className="text-sm text-gray-500 mt-1">{layout.spacing}px</div>
      </div>

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
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:border-pink-500 font-mono"
          style={{
            borderColor: template?.colors?.border || '#e5e7eb',
            '--tw-ring-color': template?.colors?.primary || '#ec4899'
          } as React.CSSProperties}
        />
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={advanced.accessibility}
            onChange={(e) => onChange('accessibility', e.target.checked)}
            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
          />
          <span className="text-sm font-medium text-gray-700">Accessibility Features</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">Enable enhanced accessibility features</p>
      </div>
    </div>
  );
}
