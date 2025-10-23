'use client';

import React, { useState, useMemo, lazy, Suspense } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { useTemplateSelection, useTemplate, useGlobalTemplates } from '@/contexts/UnifiedTemplateContext';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Icon, { icons } from '@/components/ui/Icon';

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
  const { user, userRole, companyId, loading: authLoading } = useAuth();
  const { selectedTemplate, setSelectedTemplate, isLoading: templateSelectionLoading } = useTemplateSelection();
  const { templateData, isLoading: templateLoading, isFallback } = useTemplate(selectedTemplate);
  // Avoid noisy console when template fallback is expected briefly
  const templateReady = !!templateData?.template && !isFallback && !templateLoading;
  const { refreshTemplate } = useGlobalTemplates();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('todays-rates');
  
  // Public link state
  const [publicLink, setPublicLink] = useState<any>(null);
  const [publicLinkLoading, setPublicLinkLoading] = useState(false);
  const [publicLinkError, setPublicLinkError] = useState<string | null>(null);
  
  // Company data state
  const [companyData, setCompanyData] = useState<any>(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  
  // User NMLS# state
  const [userNmlsNumber, setUserNmlsNumber] = useState<string | null>(null);
  
  // Public profile template state
  const [publicProfileTemplate, setPublicProfileTemplate] = useState<string>(selectedTemplate || 'template1');
  const [isUpdatingTemplate, setIsUpdatingTemplate] = useState(false);
  
  // Form data state - initialize with user data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Update form data when user is available
  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.user_metadata?.first_name || user.email?.split('@')[0] || 'User',
        lastName: user.user_metadata?.last_name || 'Smith',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
      });
    }
  }, [user]);

  const fetchUserNmlsNumber = React.useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('🔍 Fetching user NMLS# for userId:', user.id);
      
      const response = await fetch(`/api/users/${user.id}/nmls`);
      const result = await response.json();
      
      console.log('🔍 User NMLS# API response:', result);
      console.log('🔍 User NMLS# API status:', response.status);
      console.log('🔍 User NMLS# API headers:', response.headers);
      
      if (result.success) {
        console.log('✅ User NMLS# fetched:', result.data.nmlsNumber);
        setUserNmlsNumber(result.data.nmlsNumber);
      } else {
        console.log('❌ Failed to fetch user NMLS#:', result.error || result.message);
        console.log('❌ Full error response:', result);
        setUserNmlsNumber(null);
      }
    } catch (error) {
      console.error('❌ Error fetching user NMLS#:', error);
      setUserNmlsNumber(null);
    }
  }, [user]);

  const fetchCompanyData = React.useCallback(async () => {
    if (!companyId) return;
    
    try {
      setCompanyLoading(true);
      console.log('🔍 Fetching company data for companyId:', companyId);
      
      const response = await fetch(`/api/companies/details?companyId=${companyId}`);
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Company data fetched:', result.data);
        setCompanyData(result.data);
      } else {
        console.log('❌ Failed to fetch company data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setCompanyLoading(false);
    }
  }, [companyId]);

  const fetchPublicLink = React.useCallback(async () => {
    if (!user) return;
    
    try {
      setPublicLinkLoading(true);
      setPublicLinkError(null);
      
      // Get user's company ID from API
      const companyResponse = await fetch(`/api/user-company?userId=${user.id}`);
      const companyResult = await companyResponse.json();

      if (!companyResult.success) {
        setPublicLinkError(companyResult.message);
        return;
      }

      const userCompany = companyResult.data;

      const response = await fetch(`/api/public-links?userId=${user.id}&companyId=${userCompany.companyId}`);
      const result = await response.json();
      console.log('🔍 Fetch Public Link API Response:', result);

      if (result.success) {
        console.log('✅ Setting public link data from fetch:', result.data);
        setPublicLink(result.data);
      } else {
        console.log('❌ Fetch API returned error:', result.message);
        setPublicLinkError(result.message);
      }
    } catch (error) {
      console.error('Error fetching public link:', error);
      setPublicLinkError('Failed to fetch public link');
    } finally {
      setPublicLinkLoading(false);
    }
  }, [user]);

  // Fetch company data
  React.useEffect(() => {
    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId, fetchCompanyData]);

  // Fetch user NMLS#
  React.useEffect(() => {
    if (user) {
      fetchUserNmlsNumber();
    }
  }, [user, fetchUserNmlsNumber]);

  // Fetch public link data
  React.useEffect(() => {
    if (user) {
      fetchPublicLink();
    }
  }, [user, fetchPublicLink]);

  // Load current public profile template
  React.useEffect(() => {
    const loadPublicProfileTemplate = async () => {
      if (!user) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          console.log('⚠️ No session token available for loading public profile template');
          return;
        }
        
        const response = await fetch('/api/templates/get-public-profile-template', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.templateSlug) {
            console.log('✅ Loaded public profile template:', result.templateSlug);
            setPublicProfileTemplate(result.templateSlug);
          }
        }
      } catch (error) {
        console.error('❌ Error loading public profile template:', error);
      }
    };

    loadPublicProfileTemplate();
  }, [user]);

  const createPublicLink = React.useCallback(async () => {
    if (!user) return;
    
    try {
      setPublicLinkLoading(true);
      setPublicLinkError(null);
      
      // Get user's company ID from API
      const companyResponse = await fetch(`/api/user-company?userId=${user.id}`);
      const companyResult = await companyResponse.json();

      if (!companyResult.success) {
        setPublicLinkError(companyResult.message);
        return;
      }

      const userCompany = companyResult.data;

      const response = await fetch('/api/public-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          companyId: userCompany.companyId,
        }),
      });

      const result = await response.json();
      console.log('🔗 Create/Reactivate Public Link API Response:', result);

      if (result.success) {
        console.log('✅ Setting public link data:', result.data);
        setPublicLink(result.data);
      } else {
        console.log('❌ API returned error:', result.message);
        setPublicLinkError(result.message);
      }
    } catch (error) {
      console.error('Error creating public link:', error);
      setPublicLinkError('Failed to create public link');
    } finally {
      setPublicLinkLoading(false);
    }
  }, [user]);

  const deactivatePublicLink = async () => {
    if (!publicLink) return;
    
    try {
      setPublicLinkLoading(true);
      setPublicLinkError(null);

      const response = await fetch(`/api/public-links?linkId=${publicLink.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      console.log('🗑️ Deactivate Public Link API Response:', result);

      if (result.success) {
        console.log('✅ Deactivating public link, setting to null');
        setPublicLink(null);
      } else {
        console.log('❌ Deactivate API returned error:', result.message);
        setPublicLinkError(result.message);
      }
    } catch (error) {
      console.error('Error deactivating public link:', error);
      setPublicLinkError('Failed to deactivate public link');
    } finally {
      setPublicLinkLoading(false);
    }
  };

  const copyPublicLink = () => {
    if (publicLink) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const publicUrl = `${baseUrl}/public/profile/${publicLink.publicSlug}`;
      navigator.clipboard.writeText(publicUrl);
      console.log('Copied public URL:', publicUrl);
    }
  };

  // Handle public profile template change
  const handlePublicProfileTemplateChange = async (templateSlug: string) => {
    setIsUpdatingTemplate(true);
    setPublicProfileTemplate(templateSlug);
    
    try {
      console.log('🔄 Updating public profile template to:', templateSlug);
      
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('❌ No session token available');
        return;
      }
      
      const response = await fetch('/api/templates/update-public-profile-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          templateSlug: templateSlug
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Public profile template updated successfully:', result);
        
        // Also update the global template selection for consistency
        setSelectedTemplate(templateSlug);
      } else {
        const errorResult = await response.json();
        console.error('❌ Failed to update public profile template:', errorResult);
        // Revert the local state if the API call failed
        setPublicProfileTemplate(selectedTemplate || 'template1');
      }
    } catch (error) {
      console.error('❌ Error updating public profile template:', error);
      // Revert the local state if there was an error
      setPublicProfileTemplate(selectedTemplate || 'template1');
    } finally {
      setIsUpdatingTemplate(false);
    }
  };

  // Debug template loading - Use useMemo to prevent infinite loops
  const templateDebugInfo = React.useMemo(() => ({
    templateLoading,
    isFallback,
    hasTemplateData: !!templateData,
    selectedTemplate,
    templateDataKeys: templateData ? Object.keys(templateData) : [],
    templateId: templateData?.template?.id,
    isCustomized: templateData?.metadata?.isCustomized
  }), [templateLoading, isFallback, selectedTemplate, templateData?.template?.id, templateData?.metadata?.isCustomized]);

  React.useEffect(() => {
    console.log('🔄 Profile page: Template loading state:', templateDebugInfo);
  }, [templateDebugInfo]);

  // Debug public link state
  React.useEffect(() => {
    console.log('🔗 Profile page: Public link state:', {
      publicLink: publicLink ? {
        id: publicLink.id,
        publicSlug: publicLink.publicSlug,
        isActive: publicLink.isActive,
        currentUses: publicLink.currentUses
      } : null,
      publicLinkLoading,
      publicLinkError
    });
  }, [publicLink, publicLinkLoading, publicLinkError]);

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


  // Debug loading states - Remove templateData from dependencies to prevent infinite loop
  React.useEffect(() => {
    console.log('🔄 Profile page: Loading states:', {
      authLoading,
      templateLoading,
      templateSelectionLoading,
      hasUser: !!user,
      hasTemplate: !!templateData?.template
    });
  }, [authLoading, templateLoading, templateSelectionLoading, user]);

  // Only show loading spinner when there's no user (let RouteGuard handle this)
  // Remove the blocking condition that was causing the stuck loading issue
  // if (authLoading || profileLoading) { ... }

  // Template data is now managed globally and always available (with fallback)
  console.log('🎨 Profile page using template:', {
    selectedTemplate,
    templateName: templateData?.template?.name,
    templateColors: templateData?.template?.colors,
    isFallback,
    templateLoading
  });

  const handleSave = async () => {
    if (!user) return;
    
    setIsEditing(false);
    
    try {
      // Update user profile in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone || null,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        return;
      }
      
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleCancel = () => {
    // Reset form data to current user data
    if (user) {
      setFormData({
        firstName: user.user_metadata?.first_name || user.email?.split('@')[0] || 'User',
        lastName: user.user_metadata?.last_name || 'Smith',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
      });
    }
    setIsEditing(false);
  };

  return (
    <RouteGuard allowedRoles={['employee']}>
      <DashboardLayout 
        showBreadcrumb={true}
        breadcrumbVariant="default"
        breadcrumbSize="md"
      >
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[#005b7c] hover:bg-[#01bcc6] rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {officerInfo.officerName.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{officerInfo.officerName}</h2>
                  <p className="text-gray-600">{officerInfo.email}</p>
                  {officerInfo.phone && <p className="text-gray-600">{officerInfo.phone}</p>}
                </div>
              </div>
              
            </div>
          </div>

          {/* Public Link Management Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Public Profile Link</h3>
              <div className="text-sm text-gray-500">
                Share your profile with borrowers
              </div>
            </div>
            
            {/* Public Profile Template Selector */}
            <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Public Profile Template</h4>
                  <p className="text-xs text-gray-500">Choose which template visitors will see</p>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={publicProfileTemplate}
                    onChange={(e) => handlePublicProfileTemplateChange(e.target.value)}
                    disabled={isUpdatingTemplate}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6] bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="template1">Template1</option>
                    <option value="template2">Template2</option>
                  </select>
                  {isUpdatingTemplate && (
                    <div className="text-xs text-gray-500">Updating...</div>
                  )}
                </div>
              </div>
            </div>
            
            {publicLinkError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{publicLinkError}</p>
              </div>
            )}

            {publicLink ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-800">Public link is active</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Your profile is publicly accessible
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={copyPublicLink}
                      variant="primary"
                      size="sm"
                      className="bg-[#01bcc6] hover:bg-[#008eab] text-white"
                    >
                      Copy Link
                    </Button>
                    <Button
                      onClick={deactivatePublicLink}
                      variant="danger"
                      size="sm"
                    >
                      Deactivate
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Public URL:</span>
                    <p className="text-gray-600 break-all">
                      {typeof window !== 'undefined' ? window.location.origin : 'localhost:3000'}/public/profile/{publicLink.publicSlug}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Views:</span>
                    <p className="text-gray-600">{publicLink.currentUses}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <p className="text-gray-600">
                      {new Date(publicLink.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Public Link</h4>
                <p className="text-gray-600 mb-4">
                  Create a public link to share your profile with borrowers
                </p>
                <Button
                  onClick={createPublicLink}
                  disabled={publicLinkLoading}
                  variant="primary"
                >
                  {publicLinkLoading ? 'Creating...' : 'Create Public Link'}
                </Button>
              </div>
            )}
          </div>

          {/* Live Preview Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
            {/* Unified Template Rendering with Suspense */}
            <Suspense fallback={<SkeletonLoader />}>
              <div className="border border-gray-200 rounded-lg overflow-visible">
                <UnifiedHeroSection
                  officerName={officerInfo.officerName}
                  phone={officerInfo.phone || undefined}
                  email={officerInfo.email}
                  template={(() => {
                    console.log('🔍 Profile page template selection:', {
                      selectedTemplate,
                      templateType: typeof selectedTemplate,
                      isTemplate1: selectedTemplate === 'template1',
                      isTemplate2: selectedTemplate === 'template2'
                    });
                    return selectedTemplate as 'template1' | 'template2';
                  })()}
                  templateCustomization={(() => {
                    console.log('🔍 Profile page template data:', {
                      templateData,
                      templateCustomization: templateData?.template,
                      headerModifications: templateData?.template?.headerModifications,
                      nmlsNumber: templateData?.template?.headerModifications?.nmlsNumber
                    });
                    return templateData?.template;
                  })()}
                  publicUserData={{
                    name: officerInfo.officerName,
                    email: officerInfo.email,
                    phone: officerInfo.phone || undefined,
                    nmlsNumber: (() => {
                      console.log('🔍 Profile page passing NMLS# to UnifiedHeroSection:', {
                        userNmlsNumber,
                        officerInfo,
                        user: user?.id,
                        finalValue: userNmlsNumber || undefined
                      });
                      console.log('🔍 Profile page userNmlsNumber state:', userNmlsNumber);
                      console.log('🔍 Profile page user object:', user);
                      return userNmlsNumber || undefined;
                    })(),
                    avatar: undefined
                  }}
                  companyData={companyData ? {
                    id: companyData.id,
                    name: companyData.name,
                    logo: companyData.logo,
                    website: companyData.website,
                    phone: companyData.phone || companyData.admin_email,
                    email: companyData.email || companyData.admin_email,
                    license_number: companyData.license_number,
                    company_nmls_number: companyData.company_nmls_number,
                    company_social_media: companyData.company_social_media
                  } : undefined}
                />
                
                <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-6 py-8 lg:py-6">
                  {(() => {
                    // Get layout configuration
                    const layoutConfig = templateData?.template?.layoutConfig;
                    const isSidebarLayout = layoutConfig?.mainContentLayout?.type === 'sidebar';
                    
                    if (isSidebarLayout) {
                      // Sidebar Layout (Template2) - Left sidebar with tabs list, right content area
                      return (
                        <div className="flex gap-8 lg:gap-6">
                          {/* Left Sidebar - Tabs List */}
                          <div className="w-72 flex-shrink-0">
                            <div className="sticky top-6 lg:top-8">
                              <div 
                                className="rounded-lg shadow-sm border p-4"
                                style={{
                                  backgroundColor: templateData?.template?.colors?.background || '#ffffff',
                                  borderColor: templateData?.template?.colors?.border || '#e5e7eb',
                                  borderRadius: `${templateData?.template?.layout?.borderRadius || 8}px`
                                }}
                              >
                                <h3 
                                  className="text-lg font-semibold mb-4"
                                  style={{
                                    color: templateData?.template?.colors?.text || '#111827'
                                  }}
                                >
                                  Navigation
                                </h3>
                                <nav className="space-y-1">
                                  {[
                                    { id: 'todays-rates', label: "Today's Rates", icon: 'rates' },
                                    { id: 'get-custom-rate', label: 'Get My Custom Rate', icon: 'custom' },
                                    { id: 'document-checklist', label: 'Document Checklist', icon: 'document' },
                                    { id: 'apply-now', label: 'Apply Now', icon: 'applyNow' },
                                    { id: 'my-home-value', label: 'My Home Value', icon: 'home' },
                                    { id: 'find-my-home', label: 'Find My Home', icon: 'home' },
                                    { id: 'learning-center', label: 'Learning Center', icon: 'about' }
                                  ].map((tab) => (
                                    <button
                                      key={tab.id}
                                      onClick={() => setActiveTab(tab.id as TabId)}
                                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                                        activeTab === tab.id
                                          ? 'shadow-sm'
                                          : 'hover:bg-gray-50'
                                      }`}
                                      style={{
                                        backgroundColor: activeTab === tab.id 
                                          ? (selectedTemplate === 'template2' 
                                              ? templateData?.template?.colors?.primary || '#3b82f6'
                                              : `${templateData?.template?.colors?.primary || '#3b82f6'}25`)
                                          : 'transparent',
                                        color: activeTab === tab.id 
                                          ? (selectedTemplate === 'template2' 
                                              ? templateData?.template?.colors?.background || '#ffffff'
                                              : templateData?.template?.colors?.primary || '#3b82f6')
                                          : templateData?.template?.colors?.textSecondary || '#6b7280',
                                        border: activeTab === tab.id 
                                          ? (selectedTemplate === 'template2' 
                                              ? `1px solid ${templateData?.template?.colors?.primary || '#3b82f6'}`
                                              : `1px solid ${templateData?.template?.colors?.primary || '#3b82f6'}50`)
                                          : '1px solid transparent',
                                        borderRadius: `${templateData?.template?.layout?.borderRadius || 8}px`
                                      }}
                                    >
                                      <Icon 
                                        name={tab.icon as keyof typeof icons} 
                                        className={`w-4 h-4 mr-3`}
                                        color={activeTab === tab.id 
                                          ? (selectedTemplate === 'template2' 
                                              ? templateData?.template?.colors?.background || '#ffffff'
                                              : templateData?.template?.colors?.primary || '#3b82f6')
                                          : templateData?.template?.colors?.textSecondary || '#6b7280'
                                        }
                                      />
                                      {tab.label}
                                    </button>
                                  ))}
                                </nav>
                              </div>
                            </div>
                          </div>
                          
                          {/* Right Content Area - Selected Tab Details */}
                          <div className="flex-1">
                            <LandingPageTabs
                              activeTab={activeTab}
                              onTabChange={setActiveTab}
                              selectedTemplate={selectedTemplate as 'template1' | 'template2'}
                              className="w-full"
                              templateCustomization={templateData?.template}
                              userId={user?.id}
                              companyId={companyId || undefined}
                              hideTabNavigation={true} // Hide the tab navigation since we have sidebar
                            />
                          </div>
                        </div>
                      );
                    } else {
                      // Grid Layout (Template1) - Current layout
                      return (
                  <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    <div className="xl:col-span-3">
                      <LandingPageTabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        selectedTemplate={selectedTemplate as 'template1' | 'template2'}
                        className="w-full"
                        templateCustomization={templateData?.template}
                        userId={user?.id}
                        companyId={companyId || undefined}
                      />
                    </div>
                    <div className="xl:col-span-1">
                      <div className="sticky top-6 lg:top-8">
                        <UnifiedRightSidebar 
                          template={selectedTemplate as 'template1' | 'template2'} 
                          templateCustomization={templateData?.template}
                          companyData={companyData ? {
                            id: companyData.id,
                            name: companyData.name,
                            logo: companyData.logo,
                            website: companyData.website,
                            phone: companyData.phone || companyData.admin_email,
                            email: companyData.email || companyData.admin_email,
                            license_number: companyData.license_number,
                            company_nmls_number: companyData.company_nmls_number,
                            company_social_media: companyData.company_social_media
                          } : undefined}
                        />
                      </div>
                    </div>
                  </div>
                      );
                    }
                  })()}
                </div>
              </div>
            </Suspense>
          </div>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}