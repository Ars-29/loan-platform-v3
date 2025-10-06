'use client';

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Icon, { icons } from '@/components/ui/Icon';

// Lazy load unified components (same as internal profile)
const UnifiedHeroSection = lazy(() => import('@/components/landingPage/UnifiedHeroSection'));
const UnifiedRightSidebar = lazy(() => import('@/components/landingPage/UnifiedRightSidebar'));
const LandingPageTabs = lazy(() => import('@/components/landingPage/LandingPageTabs'));

// Import types
import type { TabId } from '@/components/landingPage/LandingPageTabs';

interface PublicProfileData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nmlsNumber?: string;
    avatar?: string;
    role: string;
    isActive: boolean;
  };
  company: {
    id: string;
    name: string;
    logo?: string;
    website?: string;
    address?: any;
    phone?: string;
    email?: string;
    license_number?: string;
    company_nmls_number?: string;
    company_social_media?: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
    };
  };
  publicLink: {
    id: string;
    publicSlug: string;
    isActive: boolean;
    currentUses: number;
    maxUses?: number;
    expiresAt?: string;
  };
  pageSettings?: {
    template: string;
    settings: any;
    templateId: string;
  };
  template?: any;
}

interface PublicTemplateData {
  template: any;
  pageSettings: any;
  metadata: {
    templateSlug: string;
    isCustomized: boolean;
    isPublished: boolean;
  };
}

// Skeleton Loading Component (same as internal profile)
const SkeletonLoader = () => (
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
      padding: '2rem',
      backgroundColor: '#ffffff'
    }}>
      <div style={{
        height: '20px',
        backgroundColor: '#e5e7eb',
        marginBottom: '1rem',
        borderRadius: '4px'
      }} />
      <div style={{
        height: '20px',
        backgroundColor: '#e5e7eb',
        marginBottom: '1rem',
        borderRadius: '4px',
        width: '60%'
      }} />
    </div>
  </div>
);

export default function PublicProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [profileData, setProfileData] = useState<PublicProfileData | null>(null);
  const [templateData, setTemplateData] = useState<PublicTemplateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tab state (template is determined by the fetched data)
  const [activeTab, setActiveTab] = useState<TabId>('todays-rates');

  useEffect(() => {
    if (slug) {
      // Clear any previous error state and cached data when fetching new data
      setError(null);
      setLoading(true);
      setProfileData(null);
      setTemplateData(null);
      fetchPublicProfile();
    }
  }, [slug]);

  // Add a refresh mechanism that can be triggered externally
  const refreshProfile = useCallback(() => {
    console.log('🔄 Refreshing public profile data...');
    setError(null);
    setLoading(true);
    setProfileData(null);
    setTemplateData(null);
    fetchPublicProfile();
  }, [slug]);

  // Add periodic refresh to check if link status has changed
  useEffect(() => {
    if (error && (error.includes('no longer available') || error.includes('not found'))) {
      console.log('🔄 Link appears to be deactivated, setting up periodic refresh...');
      
      const interval = setInterval(() => {
        console.log('🔄 Checking if link has been reactivated...');
        refreshProfile();
      }, 5000); // Check every 5 seconds

      // Clean up interval after 2 minutes
      const timeout = setTimeout(() => {
        clearInterval(interval);
        console.log('⏰ Stopped checking for link reactivation');
      }, 120000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [error, refreshProfile]);

  // Separate effect to handle template selection after component mounts
  useEffect(() => {
    if (profileData?.user?.id && !templateData) {
      const fetchTemplate = async () => {
        try {
          // The API will now determine the template from the database
          // Add cache-busting parameter to prevent browser caching
          const templateCacheBuster = Date.now();
          const templateResponse = await fetch(`/api/public-templates/${profileData.user.id}?t=${templateCacheBuster}`);
          const templateResult = await templateResponse.json();
          console.log('🎨 Template API response:', templateResult);
          
          if (templateResult.success) {
            setTemplateData(templateResult.data);
          } else {
            console.error('❌ Template API error:', templateResult.message);
          }
        } catch (err) {
          console.error('❌ Error fetching template:', err);
        }
      };

      fetchTemplate();
    }
  }, [profileData?.user?.id, templateData]);

  const fetchPublicProfile = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching public profile for slug:', slug);
      
      // Fetch profile data and template data in parallel
      // Add cache-busting parameter to prevent browser caching
      const cacheBuster = Date.now();
      const [profileResponse, templateResponse] = await Promise.all([
        fetch(`/api/public-profile/${slug}?t=${cacheBuster}`),
        // We'll fetch template data after we get the profile data
        Promise.resolve(null)
      ]);
      
      console.log('📡 Profile API response status:', profileResponse.status);
      const profileResult = await profileResponse.json();
      console.log('📦 Profile API response data:', profileResult);

      if (profileResult.success) {
        setProfileData(profileResult.data);
        // Template fetching is handled in the separate useEffect
      } else {
        // Handle different types of errors more gracefully
        const errorMessage = profileResult.message || 'Failed to load profile';
        
        if (errorMessage.includes('no longer available') || errorMessage.includes('not found')) {
          // This is expected behavior when link is deactivated, log as info
          console.log('ℹ️ Profile link is currently unavailable:', errorMessage);
        } else {
          // This is an actual error, log as error
          console.error('❌ Profile API returned error:', errorMessage);
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      console.error('❌ Error fetching public profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };


  // Get the selected template from the fetched data
  const selectedTemplate = templateData?.template?.slug === 'template2' ? 'template2' : 'template1';

  // Tab change handler (same as internal profile)
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
  };

  // Memoize user information (same as internal profile)
  const officerInfo = {
    officerName: `${profileData?.user.firstName || ''} ${profileData?.user.lastName || ''}`,
    phone: profileData?.user.phone || null,
    email: profileData?.user.email || 'user@example.com',
  };

  // Debug: Always show loading state first
  console.log('🔍 Component render state:', { loading, error, profileData: !!profileData, slug });

  if (loading) {
    console.log('📱 Rendering loading state');
    return <SkeletonLoader />;
  }

  if (error) {
    console.log('❌ Rendering error state:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {(error.includes('no longer available') || error.includes('not found')) 
              ? 'Profile Temporarily Unavailable' 
              : 'Profile Not Available'
            }
          </h1>
          <p className="text-gray-600 mb-6">
            {(error.includes('no longer available') || error.includes('not found'))
              ? 'This profile link is currently inactive. It may be reactivated soon.'
              : error
            }
          </p>
          <div className="space-y-3">
            <Button 
              onClick={refreshProfile}
              variant="primary"
              className="w-full"
            >
              🔄 Try Again
            </Button>
            <Button 
              onClick={() => window.location.href = '/'}
              variant="secondary"
              className="w-full"
            >
              Go to Homepage
            </Button>
          </div>
          {(error.includes('no longer available') || error.includes('not found')) && (
            <p className="text-sm text-gray-500 mt-4">
              This page will automatically check for updates every 5 seconds.
            </p>
          )}
        </Card>
      </div>
    );
  }

  if (!profileData) {
    console.log('📱 Rendering no data state');
    return <SkeletonLoader />;
  }

  console.log('✅ Rendering profile data:', profileData);

  return (
    <div className="min-h-screen bg-white">
      {/* Scroll bar styling with template border radius */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: ${templateData?.template?.layout?.borderRadius || 8}px;
        }
        ::-webkit-scrollbar-thumb {
          background: ${templateData?.template?.colors?.primary || '#ec4899'};
          border-radius: ${templateData?.template?.layout?.borderRadius || 8}px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${templateData?.template?.colors?.secondary || '#01bcc6'};
        }
      `}</style>
      {/* Unified Template Rendering with Suspense - PUBLIC MODE */}
      <Suspense fallback={<SkeletonLoader />}>
        {/* Main Content Area (container that wraps hero, content, footer) */}
        <div className="w-full px-4 py-4 lg:px-6 lg:py-6">
          <div 
            className="overflow-hidden"
            style={{ 
              borderRadius: `${templateData?.template?.layout?.borderRadius || 8}px`
            }}
          >
            {/* Hero Section - rounded top corners */}
            <div 
              className="overflow-hidden"
              style={{ 
                borderTopLeftRadius: `${templateData?.template?.layout?.borderRadius || 8}px`,
                borderTopRightRadius: `${templateData?.template?.layout?.borderRadius || 8}px`
              }}
            >
        <UnifiedHeroSection
          isPublic={true}
          publicUserData={{
            name: officerInfo.officerName,
            email: officerInfo.email,
            phone: officerInfo.phone || undefined,
            nmlsNumber: profileData.user.nmlsNumber,
            avatar: profileData.user.avatar
          }}
          publicTemplateData={templateData}
          template={selectedTemplate}
          templateCustomization={profileData.template}
                companyData={{
                  id: profileData.company.id,
                  name: profileData.company.name,
                  logo: profileData.company.logo,
                  phone: profileData.company.phone,
                  email: profileData.company.email,
                  address: profileData.company.address,
                  website: profileData.company.website,
                  license_number: profileData.company.license_number,
                  company_nmls_number: profileData.company.company_nmls_number,
                  company_social_media: profileData.company.company_social_media
                }}
              />
            </div>

            {/* Content Area - reduced padding and visible side borders */}
            <div 
              className="p-3 border-x"
              style={{ borderColor: templateData?.template?.colors?.border || '#e5e7eb' }}
            >
            {(() => {
            // Get layout configuration
            const layoutConfig = templateData?.template?.layoutConfig;
            const isSidebarLayout = layoutConfig?.mainContentLayout?.type === 'sidebar';
            
            if (isSidebarLayout) {
              // Sidebar Layout (Template2) - Left sidebar with tabs list, right content area
              return (
                <div className="flex gap-6 lg:gap-4">
                  {/* Left Sidebar - Tabs List */}
                  <div className="w-64 flex-shrink-0">
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
                            color: templateData?.template?.colors?.text || '#111827',
                            fontFamily: (templateData?.template?.typography?.fontFamily && (templateData?.template?.typography?.fontFamily.body || templateData?.template?.typography?.fontFamily)) || undefined
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
                                borderRadius: `${templateData?.template?.layout?.borderRadius || 8}px`,
                                fontFamily: (templateData?.template?.typography?.fontFamily && (templateData?.template?.typography?.fontFamily.body || templateData?.template?.typography?.fontFamily)) || undefined
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
                      isPublic={true}
                      publicTemplateData={templateData}
                      activeTab={activeTab}
                      onTabChange={handleTabChange}
                      selectedTemplate={selectedTemplate}
                      templateCustomization={profileData.template}
                      userId={profileData.user.id}
                      companyId={profileData.company.id}
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
                isPublic={true}
                publicTemplateData={templateData}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                selectedTemplate={selectedTemplate}
                templateCustomization={profileData.template}
                userId={profileData.user.id}
                companyId={profileData.company.id}
              />
            </div>
                  <div className="xl:col-span-1">
                    <div className="sticky top-6 lg:top-8">
                <UnifiedRightSidebar 
                  isPublic={true}
                  publicCompanyData={{
                    name: profileData.company.name,
                    logo: profileData.company.logo,
                    phone: profileData.company.phone,
                    email: profileData.company.email,
                    address: profileData.company.address,
                          website: profileData.company.website,
                          license_number: profileData.company.license_number,
                          company_nmls_number: profileData.company.company_nmls_number,
                          company_social_media: profileData.company.company_social_media
                  }}
                  publicTemplateData={templateData}
                  template={selectedTemplate} 
                  templateCustomization={profileData.template}
                        companyData={{
                          id: profileData.company.id,
                          name: profileData.company.name,
                          logo: profileData.company.logo,
                          phone: profileData.company.phone,
                          email: profileData.company.email,
                          address: profileData.company.address,
                          website: profileData.company.website,
                          license_number: profileData.company.license_number,
                          company_nmls_number: profileData.company.company_nmls_number,
                          company_social_media: profileData.company.company_social_media
                        }}
                />
              </div>
            </div>
          </div>
              );
            }
          })()}
        </div>

            {/* Footer - rounded bottom corners */}
            <div 
              className="overflow-hidden"
              style={{ 
                borderBottomLeftRadius: `${templateData?.template?.layout?.borderRadius || 8}px`,
                borderBottomRightRadius: `${templateData?.template?.layout?.borderRadius || 8}px`
              }}
            >
              <footer className="bg-gray-900 text-white py-8">
            <div className="text-center">
              <p className="text-white opacity-90">
                © 2024 {profileData.company.name}™. All rights reserved. | NMLS Consumer Access
              </p>
              <p className="text-sm text-white opacity-75 mt-2">
                This is an official public profile page.
              </p>
              {profileData.publicLink.maxUses && (
                <p className="text-xs text-white opacity-60 mt-1">
                  Profile views: {profileData.publicLink.currentUses} / {profileData.publicLink.maxUses}
                </p>
              )}
                </div>
              </footer>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
