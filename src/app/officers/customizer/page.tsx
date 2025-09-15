'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { useEfficientTemplates } from '@/hooks/use-efficient-templates';
import { useProfileCache } from '@/hooks/use-profile-cache';
import { TemplateProvider } from '@/contexts/TemplateContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';

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
  activeSection: 'colors' | 'typography' | 'content' | 'layout' | 'advanced';
}

export default function CustomizerPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, getProfile } = useProfileCache();
  const { getTemplate, getTemplateSync, isLoading: templatesLoading, error: templatesError, saveTemplateSettings } = useEfficientTemplates();
  
  const [customizerState, setCustomizerState] = useState<CustomizerState>({
    selectedTemplate: 'template1',
    customSettings: {},
    isPreviewMode: false,
    activeSection: 'colors'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Get officer information from profile cache
  const officerInfo = React.useMemo(() => {
    if (profile) {
      return {
        officerName: `${profile.firstName} ${profile.lastName}`,
        phone: profile.phone || undefined,
        email: profile.email || 'user@example.com',
      };
    }
    
    // Fallback to user data if profile not loaded
    if (user) {
      return {
        officerName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        phone: undefined,
        email: user.email || 'user@example.com',
      };
    }
    
    // Final fallback
    return {
      officerName: 'John Smith',
      phone: '(555) 123-4567',
      email: 'john@example.com',
    };
  }, [profile, user]);

  // Trigger profile fetching when user/auth state changes
  React.useEffect(() => {
    console.log('🔄 Customizer: Triggering profile fetch', { user: user?.email, authLoading, profileLoading });
    getProfile(user, authLoading);
  }, [user, authLoading, getProfile]);

  // Get current template data
  const templateData = getTemplateSync(customizerState.selectedTemplate);
  const currentTemplate = templateData?.template;
  
  // Deep merge template with custom settings for real-time preview
  const mergedTemplate = currentTemplate ? (() => {
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
    return merged;
  })() : null;

  // Load saved settings from efficient templates hook
  useEffect(() => {
    const templateData = getTemplateSync(customizerState.selectedTemplate);
    console.log('🔄 Customizer: Loading saved settings:', templateData);
    
    if (templateData?.template && templateData.metadata?.isCustomized) {
      // Load user's custom settings if they exist
      const userSettings = templateData.template;
      console.log('🔄 Customizer: Found user customizations:', userSettings);
      
      setCustomizerState(prev => ({
        ...prev,
        customSettings: {
          colors: userSettings.colors || {},
          typography: userSettings.typography || {},
          content: userSettings.content || {},
          layout: userSettings.layout || {},
          advanced: userSettings.advanced || {},
          classes: userSettings.classes || {}
        }
      }));
    } else {
      // Reset to empty settings if no customizations found
      console.log('🔄 Customizer: No customizations found, resetting settings');
      setCustomizerState(prev => ({
        ...prev,
        customSettings: {}
      }));
    }
  }, [customizerState.selectedTemplate, getTemplateSync]);

  // Fetch initial template when component mounts or template changes
  useEffect(() => {
    if (customizerState.selectedTemplate) {
      console.log('🔄 Customizer: Fetching template:', customizerState.selectedTemplate);
      getTemplate(customizerState.selectedTemplate).catch(error => {
        console.error('Error fetching initial template:', error);
      });
    }
  }, [customizerState.selectedTemplate, getTemplate]);

  // Handle template selection
  const handleTemplateSelect = useCallback(async (templateSlug: string) => {
    setCustomizerState(prev => ({
      ...prev,
      selectedTemplate: templateSlug,
      customSettings: {} // Reset custom settings when switching templates
    }));
    
    // Fetch the template if not already cached
    try {
      await getTemplate(templateSlug);
    } catch (error) {
      console.error('Error fetching template:', error);
    }
  }, [getTemplate]);

  // Handle section change
  const handleSectionChange = useCallback((section: CustomizerState['activeSection']) => {
    setCustomizerState(prev => ({
      ...prev,
      activeSection: section
    }));
  }, []);

  // Handle setting changes
  const handleSettingChange = useCallback((path: string, value: any) => {
    console.log('🔄 Customizer: Setting change:', { path, value });
    
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
    if (!user || !currentTemplate) return;
    
    setIsSaving(true);
    try {
      console.log('🔄 Customizer: Saving template settings:', {
        templateSlug: currentTemplate.slug,
        customSettings: customizerState.customSettings
      });
      
      // Save the custom settings with proper structure
      const settingsToSave = {
        colors: customizerState.customSettings.colors || {},
        typography: customizerState.customSettings.typography || {},
        content: customizerState.customSettings.content || {},
        layout: customizerState.customSettings.layout || {},
        advanced: customizerState.customSettings.advanced || {},
        classes: customizerState.customSettings.classes || {}
      };
      
      await saveTemplateSettings(
        currentTemplate.slug,
        settingsToSave,
        false // isPublished
      );
      
      setSaveMessage('Template saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('❌ Customizer: Error saving template:', error);
      setSaveMessage('Error saving template');
    } finally {
      setIsSaving(false);
    }
  }, [user, currentTemplate, customizerState.customSettings, saveTemplateSettings]);

  // Reset to original
  const handleReset = useCallback(() => {
    setCustomizerState(prev => ({
      ...prev,
      customSettings: {}
    }));
  }, []);

  // Loading state
  if (authLoading || templatesLoading || profileLoading) {
    return (
      <RouteGuard allowedRoles={['employee']}>
        <DashboardLayout 
          title="Template Customizer" 
          subtitle="Loading customizer..."
        >
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading customizer...</p>
            </div>
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  // Error state
  if (templatesError) {
    return (
      <RouteGuard allowedRoles={['employee']}>
        <DashboardLayout 
          title="Template Customizer" 
          subtitle="Error loading templates"
        >
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <Icon name="warning" size={48} />
              </div>
              <p className="text-red-600 mb-4">
                Error loading: {templatesError}
              </p>
              <Button onClick={() => window.location.reload()}>
                <Icon name="refresh" size={16} className="mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['employee']}>
      <DashboardLayout 
        title="Template Customizer" 
        subtitle="Customize your loan officer profile template in real-time"
      >
        <div className="min-h-screen bg-gray-50">
          {/* Header Controls */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
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
                      const templateData = getTemplateSync(templateSlug);
                      const templateName = templateData?.template?.name || (templateSlug === 'template1' ? 'Red Theme' : 'Purple Theme');
                      
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

          {/* Main Content */}
          <div className="flex h-[calc(100vh-120px)]">
            {/* Left Sidebar - Sections */}
            <div className={`w-80 bg-white border-r border-gray-200 transition-all duration-300 ${
              customizerState.isPreviewMode ? '-ml-80' : 'ml-0'
            }`}>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Customization Sections</h2>
                
                <div className="space-y-2">
                  {[
                    { id: 'colors', label: 'Colors', icon: Palette, description: 'Primary colors, backgrounds, text' },
                    { id: 'typography', label: 'Typography', icon: Type, description: 'Fonts, sizes, weights' },
                    { id: 'content', label: 'Content', icon: Settings, description: 'Text, headlines, CTAs' },
                    { id: 'layout', label: 'Layout', icon: Layout, description: 'Spacing, alignment, borders' },
                    { id: 'advanced', label: 'Advanced', icon: Settings, description: 'Custom CSS, accessibility' }
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

            {/* Center - Live Preview */}
            <div className="flex-1 bg-gray-100 overflow-auto">
              <div className="p-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
                  {mergedTemplate && (
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
                        />
                        
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
                            <div className="xl:col-span-3">
                              <LandingPageTabs
                                activeTab="todays-rates"
                                onTabChange={() => {}}
                                selectedTemplate={customizerState.selectedTemplate as 'template1' | 'template2'}
                                className="w-full"
                              />
                            </div>
                            <div className="xl:col-span-1">
                              <div className="sticky top-6 lg:top-8">
                                <UnifiedRightSidebar template={customizerState.selectedTemplate as 'template1' | 'template2'} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </React.Suspense>
                    </TemplateProvider>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Settings */}
            <div className={`w-80 bg-white border-l border-gray-200 transition-all duration-300 ${
              customizerState.isPreviewMode ? '-mr-80' : 'mr-0'
            }`}>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {customizerState.activeSection.charAt(0).toUpperCase() + customizerState.activeSection.slice(1)} Settings
                </h2>
                
                {/* Settings Content */}
                <div className="space-y-6">
                  {customizerState.activeSection === 'colors' && (
                    <ColorsSettings 
                      template={mergedTemplate} 
                      onChange={(path, value) => handleSettingChange(`colors.${path}`, value)}
                    />
                  )}
                  
                  {customizerState.activeSection === 'typography' && (
                    <TypographySettings 
                      template={mergedTemplate} 
                      onChange={(path, value) => handleSettingChange(`typography.${path}`, value)}
                    />
                  )}
                  
                  {customizerState.activeSection === 'content' && (
                    <ContentSettings 
                      template={mergedTemplate} 
                      onChange={(path, value) => handleSettingChange(`content.${path}`, value)}
                    />
                  )}
                  
                  {customizerState.activeSection === 'layout' && (
                    <LayoutSettings 
                      template={mergedTemplate} 
                      onChange={(path, value) => handleSettingChange(`layout.${path}`, value)}
                    />
                  )}
                  
                  {customizerState.activeSection === 'advanced' && (
                    <AdvancedSettings 
                      template={mergedTemplate} 
                      onChange={(path, value) => handleSettingChange(`advanced.${path}`, value)}
                    />
                  )}
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
