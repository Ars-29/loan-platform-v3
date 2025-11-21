'use client';

import React, { useState, useMemo, lazy, Suspense } from 'react';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const { selectedTemplate, setSelectedTemplate, isLoading: templateSelectionLoading } = useTemplateSelection();
  const { templateData, isLoading: templateLoading, isFallback } = useTemplate(selectedTemplate);
  // Avoid noisy console when template fallback is expected briefly
  const templateReady = !!templateData?.template && !isFallback && !templateLoading;
  const { refreshTemplate } = useGlobalTemplates();
  
  // Track the last pathname to detect navigation to this page
  const lastPathnameRef = React.useRef<string | null>(null);
  
  // Ensure template data is fetched when navigating to this page
  // This ensures fresh template data when navigating from other routes
  React.useEffect(() => {
    if (selectedTemplate && user && pathname === '/officers/profile') {
      const isNavigatingToThisPage = lastPathnameRef.current !== pathname;
      
      if (isNavigatingToThisPage) {
        // Navigated to this page - clear caches and refresh template
        console.log('🔄 Profile page: Navigation detected, clearing caches and refreshing template:', selectedTemplate);
        
        // Clear all template caches to ensure fresh data
        if (typeof window !== 'undefined') {
          const cacheKey = `template_${user.id}_${selectedTemplate}`;
          localStorage.removeItem(cacheKey);
          console.log('🗑️ Cleared cache on navigation:', cacheKey);
        }
        
        // Force refresh after clearing cache
        refreshTemplate(selectedTemplate).catch((error) => {
          console.error('❌ Error refreshing template:', error);
        });
        lastPathnameRef.current = pathname;
      }
    }
  }, [pathname, selectedTemplate, user, refreshTemplate]);
  
  // Ensure template is refreshed when selectedTemplate changes (template dropdown)
  React.useEffect(() => {
    if (selectedTemplate && user && lastPathnameRef.current === pathname) {
      // Only run if we're already on this page (not during initial navigation)
      const currentTemplate = templateData?.template;
      if (!currentTemplate || currentTemplate.slug !== selectedTemplate) {
        console.log('🔄 Profile page: Template selection changed, refreshing:', selectedTemplate);
        refreshTemplate(selectedTemplate).catch((error) => {
          console.error('❌ Error refreshing template:', error);
        });
      }
    }
  }, [selectedTemplate, refreshTemplate, user, templateData?.template?.slug, pathname]);
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
      
      // Clear all caches before updating
      if (typeof window !== 'undefined' && user) {
        // Clear both old and new template caches
        [selectedTemplate, templateSlug].forEach(slug => {
          if (slug) {
            const cacheKey = `template_${user.id}_${slug}`;
            localStorage.removeItem(cacheKey);
            console.log('🗑️ Cleared cache for:', cacheKey);
          }
        });
        
        // Clear template cache API
        try {
          await fetch(`/api/cache/template?userId=${user.id}&slug=${templateSlug}`, {
            method: 'DELETE'
          });
        } catch (e) {
          console.log('⚠️ Could not clear server cache:', e);
        }
      }
      
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
        
        // Update the global template selection FIRST
        setSelectedTemplate(templateSlug);
        
        // Force a small delay to ensure state updates propagate
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Explicitly refresh the template to ensure colors update immediately
        await refreshTemplate(templateSlug);
        
        // Force re-render by triggering a state change
        console.log('✅ Template refresh complete, colors should be updated');
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
        <style jsx global>{`
          /* Ensure profile page is scrollable on all devices */
          @media (max-width: 768px) {
            .profile-page-container {
              overflow-x: auto;
              overflow-y: auto;
              -webkit-overflow-scrolling: touch;
              width: 100%;
            }
          }
        `}</style>
        <div className="space-y-4 md:space-y-6 profile-page-container overflow-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#005b7c] hover:bg-[#01bcc6] rounded-full flex items-center justify-center text-white text-lg md:text-xl font-bold flex-shrink-0">
                  {officerInfo.officerName.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 truncate">{officerInfo.officerName}</h2>
                  <p className="text-sm md:text-base text-gray-600 truncate">{officerInfo.email}</p>
                  {officerInfo.phone && <p className="text-sm md:text-base text-gray-600">{officerInfo.phone}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Public Link Management Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 overflow-x-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Public Profile Link</h3>
              <div className="text-xs md:text-sm text-gray-500">
                Share your profile with borrowers
              </div>
            </div>
            
            {/* Public Profile Template Selector */}
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4 className="text-xs md:text-sm font-medium text-gray-900 mb-1">Public Profile Template</h4>
                  <p className="text-xs text-gray-500">Choose which template visitors will see</p>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={publicProfileTemplate}
                    onChange={(e) => handlePublicProfileTemplateChange(e.target.value)}
                    disabled={isUpdatingTemplate}
                    className="px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 rounded-md text-xs md:text-sm focus:ring-2 focus:ring-[#01bcc6] focus:border-[#01bcc6] bg-white disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    <option value="template1">Template1</option>
                    <option value="template2">Template2</option>
                  </select>
                  {isUpdatingTemplate && (
                    <div className="text-xs text-gray-500 whitespace-nowrap">Updating...</div>
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
              <div className="space-y-3 md:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="text-xs md:text-sm font-medium text-green-800">Public link is active</span>
                    </div>
                    <p className="text-xs md:text-sm text-green-600 mt-1">
                      Your profile is publicly accessible
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Button
                      onClick={copyPublicLink}
                      variant="primary"
                      size="sm"
                      className="bg-[#01bcc6] hover:bg-[#008eab] text-white text-xs md:text-sm px-3 py-1.5"
                    >
                      Copy Link
                    </Button>
                    <Button
                      onClick={deactivatePublicLink}
                      variant="danger"
                      size="sm"
                      className="text-xs md:text-sm px-3 py-1.5"
                    >
                      Deactivate
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 text-xs md:text-sm">
                  <div className="min-w-0">
                    <span className="font-medium text-gray-700">Public URL:</span>
                    <p className="text-gray-600 break-all overflow-wrap-anywhere">
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

        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}