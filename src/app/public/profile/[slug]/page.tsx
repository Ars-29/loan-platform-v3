'use client';

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

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
  const [applying, setApplying] = useState(false);
  
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

  const handleApplyNow = async () => {
    if (!profileData) return;

    try {
      setApplying(true);
      
      // Here you would typically redirect to an application form
      // or open a modal with application details
      // For now, we'll just show a success message
      
      // You could redirect to a contact form or application page
      const subject = encodeURIComponent('Loan Application Inquiry');
      const body = encodeURIComponent(`Hi ${profileData.user.firstName}, I'm interested in your loan services. Please contact me to discuss my application.`);
      
      window.location.href = `mailto:${profileData.user.email}?subject=${subject}&body=${body}`;
      
    } catch (err) {
      console.error('Error applying:', err);
    } finally {
      setApplying(false);
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
      {/* Apply Now Button */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
          <Button 
            onClick={handleApplyNow}
            disabled={applying}
            variant="primary"
            size="sm"
          >
            {applying ? 'Processing...' : 'Apply Now'}
          </Button>
        </div>
      </div>

      {/* Unified Template Rendering with Suspense - PUBLIC MODE */}
      <Suspense fallback={<SkeletonLoader />}>
        {/* Unified Hero Section - PUBLIC MODE */}
        <UnifiedHeroSection
          isPublic={true}
          publicUserData={{
            name: officerInfo.officerName,
            email: officerInfo.email,
            phone: officerInfo.phone || undefined,
            avatar: profileData.user.avatar
          }}
          publicTemplateData={templateData}
          template={selectedTemplate}
          templateCustomization={profileData.template}
        />

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Takes up 2/3 of the width */}
            <div className="lg:col-span-2">
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

            {/* Right Sidebar - Takes up 1/3 of the width */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <UnifiedRightSidebar 
                  isPublic={true}
                  publicCompanyData={{
                    name: profileData.company.name,
                    logo: profileData.company.logo,
                    phone: profileData.company.phone,
                    email: profileData.company.email,
                    address: profileData.company.address,
                    website: profileData.company.website
                  }}
                  publicTemplateData={templateData}
                  template={selectedTemplate} 
                  templateCustomization={profileData.template}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          </div>
        </footer>
      </Suspense>
    </div>
  );
}
