'use client';

import { useState, lazy, Suspense } from 'react';
import Icon, { icons } from '@/components/ui/Icon';
import type { TabId } from '@/components/landingPage/LandingPageTabs';

// Lazy load unified components
const UnifiedHeroSection = lazy(() => import('@/components/landingPage/UnifiedHeroSection'));
const UnifiedRightSidebar = lazy(() => import('@/components/landingPage/UnifiedRightSidebar'));
const LandingPageTabs = lazy(() => import('@/components/landingPage/LandingPageTabs'));

interface PublicProfileContentProps {
  profileData: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      nmlsNumber?: string;
      avatar?: string;
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
    template?: any;
  };
  templateData: {
    template: any;
    pageSettings: any;
    metadata: {
      templateSlug: string;
      isCustomized: boolean;
      isPublished: boolean;
    };
  } | null;
  initialActiveTab?: TabId;
  onTabChange?: (tabId: TabId) => void;
  isPreview?: boolean;
  companyName?: string;
  forceMobileViewport?: boolean; // Force mobile viewport simulation
}

// Skeleton Loading Component
const SkeletonLoader = () => (
  <div style={{
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  }}>
    <div style={{
      height: '80px',
      backgroundColor: '#f3f4f6',
      borderBottom: '1px solid #e5e7eb'
    }} />
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

export default function PublicProfileContent({
  profileData,
  templateData,
  initialActiveTab = 'todays-rates',
  onTabChange,
  isPreview = false,
  companyName,
  forceMobileViewport = false
}: PublicProfileContentProps) {
  const [activeTab, setActiveTab] = useState<TabId>(initialActiveTab);

  // Debug: Log force mobile viewport state
  console.log('🔍 PublicProfileContent: forceMobileViewport =', forceMobileViewport);

  // Get the selected template from the fetched data
  const selectedTemplate = templateData?.template?.slug === 'template2' ? 'template2' : 'template1';

  // Tab change handler
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  // Memoize user information
  const officerInfo = {
    officerName: `${profileData?.user.firstName || ''} ${profileData?.user.lastName || ''}`,
    phone: profileData?.user.phone || null,
    email: profileData?.user.email || 'user@example.com',
  };

  if (!templateData) {
    return <SkeletonLoader />;
  }

  return (
    <div className={`min-h-screen bg-white overflow-x-auto overflow-y-auto ${forceMobileViewport ? 'mobile-viewport-simulator' : ''}`}>
      {/* Scroll bar styling with template border radius */}
      <style jsx global>{`
        .public-profile-container {
          container-type: inline-size;
          container-name: profile;
        }

        /* Hide scrollbars but keep functionality */
        ::-webkit-scrollbar {
          width: 0px;
          height: 0px;
          background: transparent;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: transparent;
        }
        
        /* Firefox */
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        /* Force mobile viewport simulation for customizer preview - Use container queries */
        .mobile-viewport-simulator {
          max-width: 375px !important;
          width: 375px !important;
        }
        
        /* Override all responsive breakpoints when in mobile viewport simulator */
        .mobile-viewport-simulator .md\\:px-4 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
        .mobile-viewport-simulator .md\\:py-4 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
        .mobile-viewport-simulator .md\\:px-6 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
        .mobile-viewport-simulator .md\\:py-6 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
        .mobile-viewport-simulator .md\\:p-3 { padding: 0.5rem !important; }
        .mobile-viewport-simulator .md\\:py-8 { padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
        .mobile-viewport-simulator .md\\:text-sm { font-size: 0.75rem !important; }
        .mobile-viewport-simulator .lg\\:flex-row { flex-direction: column !important; }
        .mobile-viewport-simulator .lg\\:w-64 { width: 100% !important; }
        .mobile-viewport-simulator .lg\\:gap-6 { gap: 1rem !important; }
        .mobile-viewport-simulator .xl\\:grid { display: flex !important; flex-direction: column !important; }
        .mobile-viewport-simulator .xl\\:grid-cols-4 { grid-template-columns: none !important; }
        .mobile-viewport-simulator .xl\\:col-span-3 { grid-column: auto !important; width: 100% !important; }
        .mobile-viewport-simulator .xl\\:col-span-1 { grid-column: auto !important; width: 100% !important; }
        .mobile-viewport-simulator .xl\\:sticky { position: static !important; }
        
        /* Ensure mobile responsiveness */
        @media (max-width: 768px) {
          .public-profile-container {
            overflow-x: auto;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            width: 100%;
            max-width: 100vw;
          }
          
          /* Ensure all child elements respect container width */
          .public-profile-container * {
            max-width: 100%;
            box-sizing: border-box;
          }
          
          /* Allow specific elements to overflow horizontally with scroll */
          .public-profile-container input,
          .public-profile-container select,
          .public-profile-container textarea {
            max-width: 100%;
          }
        }
        
        /* Ensure content doesn't overflow in mobile preview */
        .mobile-preview-content {
          width: 100%;
          overflow-x: auto;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
      
      {/* Unified Template Rendering with Suspense - PUBLIC MODE */}
      <Suspense fallback={<SkeletonLoader />}>
        {/* Main Content Area (container that wraps hero, content, footer) */}
        <div className={`w-full min-w-0 public-profile-container`}>
          <div 
            className="overflow-auto w-full"
            style={{ 
              borderRadius: `${templateData?.template?.layout?.borderRadius || 8}px`,
              minWidth: '300px'
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
                forceMobileView={forceMobileViewport}
              />
            </div>

            {/* Content Area - reduced padding and visible side borders */}
            <div 
              className={`p-2 border-x overflow-auto w-full ${forceMobileViewport ? '' : '@[48rem]:p-3'}`}
              style={{ 
                borderColor: templateData?.template?.colors?.border || '#e5e7eb',
                minWidth: '300px'
              }}
            >
              {(() => {
                // Get layout configuration
                const layoutConfig = templateData?.template?.layoutConfig;
                const isSidebarLayout = layoutConfig?.mainContentLayout?.type === 'sidebar';
                
                if (isSidebarLayout) {
                  // Sidebar Layout (Template2) - Stack vertically on mobile, horizontal on large screens
                  return (
                    <div className={`flex flex-col gap-4 w-full ${forceMobileViewport ? '' : '@[64rem]:flex-row @[64rem]:gap-6'}`}>
                      {/* Left Sidebar - Tabs List */}
                      <div className={`w-full overflow-x-auto ${forceMobileViewport ? '' : '@[64rem]:w-64 @[64rem]:flex-shrink-0'}`}>
                        <div className={forceMobileViewport ? '' : 'sticky top-6 @[64rem]:top-8'}>
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
                                  onClick={() => handleTabChange(tab.id as TabId)}
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
                                    className={`w-3 h-3 @[20rem]:w-4 @[20rem]:h-4 @[48rem]:w-5 @[48rem]:h-5 mr-3`}
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
                      <div className="flex-1 min-w-0 w-full overflow-auto">
                        <LandingPageTabs
                          isPublic={true}
                          publicTemplateData={templateData}
                          activeTab={activeTab}
                          onTabChange={handleTabChange}
                          selectedTemplate={selectedTemplate}
                          templateCustomization={profileData.template}
                          userId={profileData.user.id}
                          companyId={profileData.company.id}
                          hideTabNavigation={true}
                          forceMobileView={forceMobileViewport}
                        />
                      </div>
                    </div>
                  );
                } else {
                  const gridLayoutClasses = forceMobileViewport
                    ? ''
                    : selectedTemplate === 'template2'
                      ? '@[48rem]:gap-6'
                      : '@[48rem]:gap-6 @[80rem]:grid @[80rem]:grid-cols-4';
                  const gridContentClasses = forceMobileViewport
                    ? ''
                    : selectedTemplate === 'template2'
                      ? ''
                      : '@[80rem]:col-span-3';
                  // Grid Layout (Template1) - Responsive: Flex column on mobile, grid on desktop
                  return (
                    <div className={`flex flex-col gap-4 w-full ${gridLayoutClasses}`}>
                      <div className={`w-full overflow-x-auto ${gridContentClasses}`}>
                        <LandingPageTabs
                          isPublic={true}
                          publicTemplateData={templateData}
                          activeTab={activeTab}
                          onTabChange={handleTabChange}
                          selectedTemplate={selectedTemplate}
                          templateCustomization={profileData.template}
                          userId={profileData.user.id}
                          companyId={profileData.company.id}
                          forceMobileView={forceMobileViewport}
                        />
                      </div>
                      {selectedTemplate !== 'template2' && (
                        <div className={`w-full overflow-x-auto ${forceMobileViewport ? '' : '@[80rem]:col-span-1'}`}>
                          <div className={forceMobileViewport ? '' : '@[80rem]:sticky @[80rem]:top-6 @[96rem]:top-8'}>
                            <UnifiedRightSidebar 
                              isPublic={true}
                              publicCompanyData={profileData.company}
                              publicTemplateData={templateData}
                              templateCustomization={profileData.template}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              })()}
            </div>

            {/* Footer - rounded bottom corners */}
            <div 
              className="overflow-hidden w-full"
              style={{ 
                borderBottomLeftRadius: `${templateData?.template?.layout?.borderRadius || 8}px`,
                borderBottomRightRadius: `${templateData?.template?.layout?.borderRadius || 8}px`
              }}
            >
              <footer className={`bg-gray-900 text-white py-6 w-full ${forceMobileViewport ? '' : '@[48rem]:py-8'}`}>
                <div className="text-center px-4">
                  <p className={`text-xs text-white opacity-90 ${forceMobileViewport ? '' : '@[48rem]:text-sm'}`}>
                    © 2024 {companyName || profileData.company.name}™. All rights reserved. | NMLS Consumer Access
                  </p>
                  <p className={`text-xs text-white opacity-75 mt-2 ${forceMobileViewport ? '' : '@[48rem]:text-sm'}`}>
                    {isPreview ? 'This is a template preview.' : 'This is an official public profile page.'}
                  </p>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}

