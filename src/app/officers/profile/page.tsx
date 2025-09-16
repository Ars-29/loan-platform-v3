'use client';

import React, { useState, useMemo, lazy, Suspense } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { useProfileCache } from '@/hooks/use-profile-cache';
import { useTemplateSelection, useTemplate, useGlobalTemplates } from '@/contexts/UnifiedTemplateContext';

// Lazy load unified components
const UnifiedHeroSection = lazy(() => import('@/components/landingPage/UnifiedHeroSection'));
const UnifiedRightSidebar = lazy(() => import('@/components/landingPage/UnifiedRightSidebar'));
const LandingPageTabs = lazy(() => import('@/components/landingPage/LandingPageTabs'));

// Import types
import type { TabId } from '@/components/landingPage/LandingPageTabs';

// Skeleton Loading Component
const SkeletonLoader = React.memo(() => (
  <div style={{
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  }}>
    {/* Header Skeleton */}
    <div style={{
      height: '80px',
      backgroundColor: '#f3f4f6',
      borderBottom: '1px solid #e5e7eb'
    }} />
    
    {/* Hero Section Skeleton */}
    <div style={{
      height: '300px',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '200px',
        height: '200px',
        backgroundColor: '#e5e7eb',
        borderRadius: '50%'
      }} />
    </div>
    
    {/* Content Skeleton */}
    <div style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '32px 16px',
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '32px'
    }}>
      <div style={{
        height: '600px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px'
      }} />
      <div style={{
        height: '400px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px'
      }} />
    </div>
  </div>
));

SkeletonLoader.displayName = 'SkeletonLoader';

export default function OfficersProfilePage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const { profile, refreshProfile, loading: profileLoading, getProfile } = useProfileCache();
  const { selectedTemplate, isLoading: templateSelectionLoading } = useTemplateSelection();
  const { templateData, isLoading: templateLoading, isFallback } = useTemplate(selectedTemplate);
  const { refreshTemplate } = useGlobalTemplates();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('todays-rates');
  
  // Form data state - initialize with profile data when available
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Update form data when profile is loaded
  React.useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  // Trigger profile fetching when user/auth state changes
  React.useEffect(() => {
    console.log('🔄 Profile page: Triggering profile fetch', { user: user?.email, authLoading, profileLoading });
    getProfile(user, authLoading);
  }, [user, authLoading, getProfile]);

  // Debug template data
  React.useEffect(() => {
    console.log('🔄 Profile page: Template data debug:', {
      templateLoading,
      isFallback,
      hasTemplateData: !!templateData,
      templateDataKeys: templateData ? Object.keys(templateData) : [],
      templateId: templateData?.template?.id,
      rightSidebarModifications: templateData?.template?.rightSidebarModifications,
      companyName: templateData?.template?.rightSidebarModifications?.companyName,
      socialLinks: templateData?.template?.rightSidebarModifications,
      timestamp: new Date().toISOString()
    });
  }, [templateData, templateLoading, isFallback]);

  // Refresh template data when page becomes visible or focused (user navigates back from customizer)
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedTemplate) {
        console.log('🔄 Profile page: Page became visible, refreshing template data');
        refreshTemplate(selectedTemplate).catch(error => {
          console.error('❌ Profile page: Error refreshing template:', error);
        });
      }
    };

    const handleFocus = () => {
      if (selectedTemplate) {
        console.log('🔄 Profile page: Window focused, refreshing template data');
        refreshTemplate(selectedTemplate).catch(error => {
          console.error('❌ Profile page: Error refreshing template:', error);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [selectedTemplate]); // Remove refreshTemplate from dependencies

  // Memoize handlers to prevent unnecessary re-renders
  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSave = React.useCallback(async () => {
    // TODO: Implement profile update logic
    console.log('Saving profile:', formData);
    setIsEditing(false);
  }, [formData]);

  const handleCancel = React.useCallback(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
    setIsEditing(false);
  }, [profile]);

  const handleTabChange = React.useCallback((tabId: TabId) => {
    console.log('🔄 Profile page: Tab change requested:', tabId);
    setActiveTab(tabId);
    console.log('✅ Profile page: Tab changed to:', tabId);
  }, []);

  // Template selection is now handled globally in the customizer

  const handleRefreshProfile = React.useCallback(async () => {
    if (user) {
      console.log('🔄 Refreshing profile data...');
      await refreshProfile(user);
    }
  }, [user, refreshProfile]);

  // Memoize user information calculations using fetched profile data
  const officerInfo = useMemo(() => {
    if (profile) {
      const info = {
        officerName: `${profile.firstName} ${profile.lastName}`,
        phone: profile.phone || null, // Only show if exists in database
        email: profile.email || 'user@example.com',
      };
      console.log('🎯 Using fetched profile data for officerInfo:', info);
      return info;
    }
    
    // Fallback to form data if profile not loaded yet
    const officerName = formData.firstName && formData.lastName 
      ? `${formData.firstName} ${formData.lastName}`
      : 'John Smith';
    
    const fallbackInfo = {
      officerName,
      phone: formData.phone || null, // Only show if exists
      email: formData.email || 'john@example.com',
    };
    console.log('⚠️ Using fallback data for officerInfo:', fallbackInfo);
    return fallbackInfo;
  }, [profile, formData.firstName, formData.lastName, formData.phone, formData.email]);

  // Debug logging for loading states
  console.log('🔍 Profile page render state:', {
    authLoading,
    profileLoading,
    templateLoading,
    templateSelectionLoading,
    hasUser: !!user,
    hasProfile: !!profile,
    userEmail: user?.email,
    selectedTemplate,
    isFallback,
    templateDataKeys: Object.keys(templateData?.template || {}),
    templateColors: templateData?.template?.colors
  });

  // Show loading state while essential data is being fetched
  if (profileLoading || templateLoading || templateSelectionLoading) {
    return (
      <RouteGuard allowedRoles={['employee']}>
        <DashboardLayout 
          title="Loan Officer Profile" 
          subtitle="Loading your profile..."
        >
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4`} style={{ borderColor: templateData?.template?.colors?.primary || '#ec4899' }}></div>
              <p className="text-gray-600">Loading profile data...</p>
              <p className="text-sm text-gray-500 mt-2">
                Auth: {authLoading ? 'Loading' : 'Ready'} | Profile: {profileLoading ? 'Loading' : 'Ready'} | Template: {templateLoading ? 'Loading' : 'Ready'} | Selection: {templateSelectionLoading ? 'Loading' : 'Ready'}
              </p>
            </div>
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  // Template data is now managed globally and always available (with fallback)
  console.log('🎨 Profile page using template:', {
    selectedTemplate,
    templateName: templateData?.template?.name,
    templateColors: templateData?.template?.colors,
    isFallback
  });

  return (
    <RouteGuard allowedRoles={['employee']}>
      <DashboardLayout 
        title="Loan Officer Profile" 
        subtitle="Manage your professional profile and mortgage rates"
      >
        {/* Refresh Button */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => {
              console.log('🔄 Profile page: Manual refresh triggered');
              refreshTemplate(selectedTemplate).catch(error => {
                console.error('❌ Profile page: Error refreshing template:', error);
              });
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
          >
            🔄 Refresh Data
          </button>
        </div>
        
        <div className="min-h-screen bg-white">
          {/* Unified Template Rendering with Suspense */}
          <Suspense fallback={<SkeletonLoader />}>
            {/* Unified Hero Section */}
            <UnifiedHeroSection
              officerName={officerInfo.officerName}
              phone={officerInfo.phone || undefined}
              email={officerInfo.email}
              template={selectedTemplate as 'template1' | 'template2'}
              templateCustomization={templateData?.template}
            />

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
                {/* Main Content - Takes up 3/4 of the width on XL screens */}
                <div className="xl:col-span-3">
                  <LandingPageTabs
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    selectedTemplate={selectedTemplate as 'template1' | 'template2'}
                    className="w-full"
                    templateCustomization={templateData?.template}
                  />
                </div>

                {/* Right Sidebar - Takes up 1/4 of the width on XL screens */}
                <div className="xl:col-span-1">
                  <div className="sticky top-6 lg:top-8">
                    <UnifiedRightSidebar 
                      template={selectedTemplate as 'template1' | 'template2'} 
                      templateCustomization={templateData?.template}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 mt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  <p className="text-gray-400">
                    © 2024 Your Brand™. All rights reserved. | NMLS Consumer Access
                  </p>
                </div>
              </div>
            </footer>
          </Suspense>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
