'use client';

import React, { useState, useMemo, lazy, Suspense } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { useTemplateSelection, useTemplate, useGlobalTemplates } from '@/contexts/UnifiedTemplateContext';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

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
  const { selectedTemplate, isLoading: templateSelectionLoading } = useTemplateSelection();
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

  // Fetch public link data
  React.useEffect(() => {
    if (user) {
      fetchPublicLink();
    }
  }, [user, fetchPublicLink]);

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
        title="Loan Officer Profile"
        showBackButton={true}
      >
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="bg-[#F7F1E9]/30 rounded-lg shadow-sm border border-gray-200 p-6">
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
          <div className="bg-[#F7F1E9]/30 rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Public Profile Link</h3>
              <div className="text-sm text-gray-500">
                Share your profile with borrowers
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
          <div className="bg-[#F7F1E9]/30 rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
            {/* Unified Template Rendering with Suspense */}
            <Suspense fallback={<SkeletonLoader />}>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <UnifiedHeroSection
                  officerName={officerInfo.officerName}
                  phone={officerInfo.phone || undefined}
                  email={officerInfo.email}
                  template={selectedTemplate as 'template1' | 'template2'}
                  templateCustomization={templateData?.template}
                />
                
                <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-4 py-6 lg:py-4">
                  <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-4">
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
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Suspense>
          </div>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}