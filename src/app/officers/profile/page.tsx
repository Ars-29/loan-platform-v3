'use client';

import React, { useState, useMemo, lazy, Suspense } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { useTemplateSelection, useTemplate, useGlobalTemplates } from '@/contexts/UnifiedTemplateContext';
import { supabase } from '@/lib/supabase/client';

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
  const { selectedTemplate, isLoading: templateSelectionLoading } = useTemplateSelection();
  const { templateData, isLoading: templateLoading, isFallback } = useTemplate(selectedTemplate);
  // Avoid noisy console when template fallback is expected briefly
  const templateReady = !!templateData?.template && !isFallback && !templateLoading;
  const { refreshTemplate } = useGlobalTemplates();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('todays-rates');
  
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

  // Debug template loading
  React.useEffect(() => {
    console.log('🔄 Profile page: Template loading state:', {
      templateLoading,
      isFallback,
      hasTemplateData: !!templateData,
      selectedTemplate,
      templateDataKeys: templateData ? Object.keys(templateData) : [],
      templateId: templateData?.template?.id,
      isCustomized: templateData?.metadata?.isCustomized
    });
  }, [templateData, templateLoading, isFallback]);

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


  // Debug loading states
  React.useEffect(() => {
    console.log('🔄 Profile page: Loading states:', {
      authLoading,
      templateLoading,
      templateSelectionLoading,
      hasUser: !!user,
      hasTemplate: !!templateData?.template
    });
  }, [authLoading, templateLoading, templateSelectionLoading, user, templateData]);

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
      >
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
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

          {/* Live Preview Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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