'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { icons } from '@/components/ui/Icon';
import { useAuth } from '@/hooks/use-auth';
import { LayoutConfig, DEFAULT_CENTERED_LAYOUT, DEFAULT_HORIZONTAL_LAYOUT } from '@/types/layout-config';
import CustomizableLiquidBackground from '@/components/ui/CustomizableLiquidBackground';

interface UnifiedHeroSectionProps {
  officerName?: string;
  phone?: string;
  email?: string;
  profileImage?: string;
  template?: 'template1' | 'template2';
  className?: string;
  // New props for customization
  applyNowLink?: string;
  applyNowText?: string;
  // Template customization data
  templateCustomization?: {
    headerModifications?: {
      officerName?: string;
      phone?: string;
      email?: string;
      avatar?: string;
      applyNowText?: string;
      applyNowLink?: string;
    };
  };
  // NEW: Public mode props
  isPublic?: boolean;
  publicUserData?: {
    name: string;
    email: string;
    phone?: string;
    nmlsNumber?: string;
    avatar?: string;
  };
  publicTemplateData?: any;
  // NEW: Company data props
  companyData?: {
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
}

export default function UnifiedHeroSection({
  officerName,
  phone,
  email,
  profileImage,
  template = 'template1',
  className = "",
  applyNowLink,
  applyNowText,
  templateCustomization,
  // NEW: Public mode props
  isPublic = false,
  publicUserData,
  publicTemplateData,
  // NEW: Company data props
  companyData
}: UnifiedHeroSectionProps) {
  const { user, loading: authLoading } = useAuth();

  // Helper functions to get customized values
  const getOfficerName = () => {
    // Public mode: check template customizations FIRST
    if (isPublic && publicTemplateData?.template?.headerModifications?.officerName) {
      console.log('🔍 UnifiedHeroSection: Public mode - using template officerName:', publicTemplateData.template.headerModifications.officerName);
      return publicTemplateData.template.headerModifications.officerName;
    }
    // Public mode: fallback to public data
    if (isPublic && publicUserData?.name) {
      return publicUserData.name;
    }
    // Template customization: use custom data
    if (templateCustomization?.headerModifications?.officerName) {
      return templateCustomization.headerModifications.officerName;
    }
    // Fallback to props or auth data
    return officerName || user?.user_metadata?.full_name || `${user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'} ${user?.user_metadata?.last_name || 'Smith'}` || 'User';
  };

  const getPhone = () => {
    // Public mode: check template customizations FIRST
    if (isPublic && publicTemplateData?.template?.headerModifications?.phone) {
      return publicTemplateData.template.headerModifications.phone;
    }
    // Public mode: fallback to public data
    if (isPublic && publicUserData?.phone) {
      return publicUserData.phone;
    }
    // Template customization: use custom data
    if (templateCustomization?.headerModifications?.phone) {
      return templateCustomization.headerModifications.phone;
    }
    // Fallback to props or auth data
    return phone || user?.user_metadata?.phone || null;
  };

  const getEmail = () => {
    // Public mode: check template customizations FIRST
    if (isPublic && publicTemplateData?.template?.headerModifications?.email) {
      return publicTemplateData.template.headerModifications.email;
    }
    // Public mode: fallback to public data
    if (isPublic && publicUserData?.email) {
      return publicUserData.email;
    }
    // Template customization: use custom data
    if (templateCustomization?.headerModifications?.email) {
      return templateCustomization.headerModifications.email;
    }
    // Fallback to props or auth data
    return email || user?.email || 'user@example.com';
  };

  const getProfileImage = () => {
    // Public mode: check template customizations FIRST
    if (isPublic && publicTemplateData?.template?.headerModifications?.avatar) {
      console.log('🔍 UnifiedHeroSection: Public mode - using template avatar:', publicTemplateData.template.headerModifications.avatar);
      return publicTemplateData.template.headerModifications.avatar;
    }
    // Public mode: fallback to public data
    if (isPublic && publicUserData?.avatar) {
      return publicUserData.avatar;
    }
    // Template customization: use custom data
    if (templateCustomization?.headerModifications?.avatar) {
      return templateCustomization.headerModifications.avatar;
    }
    // Fallback to props or auth data
    return profileImage || user?.user_metadata?.avatar_url || null;
  };

  // Get customization data from template or props
  const getApplyNowText = () => {
    if (applyNowText) return applyNowText;
    // Public mode: check template data first
    if (isPublic && publicTemplateData?.template?.headerModifications?.applyNowText) {
      return publicTemplateData.template.headerModifications.applyNowText;
    }
    // Internal mode: check templateCustomization
    if (templateCustomization?.headerModifications?.applyNowText) {
      return templateCustomization.headerModifications.applyNowText;
    }
    return 'Apply Now';
  };

  const handleApplyNow = () => {
    // Get the officer's email
    const officerEmail = isPublic ? publicUserData?.email : email;
    const officerFirstName = isPublic ? publicUserData?.name?.split(' ')[0] : officerName?.split(' ')[0];
    
    if (!officerEmail) {
      console.warn('No officer email available for Apply Now functionality');
      return;
    }

    // Create mailto link
    const subject = encodeURIComponent('Loan Application Inquiry');
    const body = encodeURIComponent(`Hi ${officerFirstName || 'there'}, I'm interested in your loan services. Please contact me to discuss my application.`);
    
    window.location.href = `mailto:${officerEmail}?subject=${subject}&body=${body}`;
  };

  // Use helper functions to get display values
  const displayName = getOfficerName();
  const displayPhone = getPhone();
  const displayEmail = getEmail();
  const [imageError, setImageError] = useState(false);
  const displayImage = getProfileImage();
  const hasExplicitImage = !!displayImage;
  const showInitials = imageError || !hasExplicitImage;

  // No need for profile fetching - using user data directly

  // Debug logging
  console.log('🎨 UnifiedHeroSection Debug:', {
    isPublic,
    publicUserData,
    publicTemplateData: publicTemplateData?.template,
    headerModifications: publicTemplateData?.template?.headerModifications,
    displayName,
    displayPhone,
    displayEmail,
    user: user?.email
  });

  // Template data fetching - support both public and auth modes
  const { getTemplateSync } = useEfficientTemplates();
  const templateData = isPublic && publicTemplateData 
    ? publicTemplateData 
    : getTemplateSync(template);

  // Get layout configuration with better error handling
  const layoutConfig: LayoutConfig = (() => {
    const templateLayoutConfig = templateData?.template?.layoutConfig;
    
    if (templateLayoutConfig && templateLayoutConfig.headerLayout && templateLayoutConfig.mainContentLayout) {
      console.log('✅ Using template layoutConfig:', templateLayoutConfig);
      return templateLayoutConfig;
    }
    
    const fallbackConfig = template === 'template2' ? DEFAULT_HORIZONTAL_LAYOUT : DEFAULT_CENTERED_LAYOUT;
    console.log('⚠️ Using fallback layoutConfig for template:', template, fallbackConfig);
    return fallbackConfig;
  })();

  // Debug logging for template data
  console.log('🎨 Template data:', {
    template,
    templateData: templateData?.template,
    layoutConfig,
    templateCustomization
  });

  
  // Comprehensive template data usage
  const colors = templateData?.template?.colors || {
    primary: '#ec4899',
    secondary: '#01bcc6',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };
  
  const typography = templateData?.template?.typography || {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  };
  
  const content = templateData?.template?.content || {
    headline: 'Mortgage Solutions',
    subheadline: 'Find the perfect loan for your needs',
    ctaText: 'Get Started',
    ctaSecondary: 'Learn More',
    companyName: 'Your Company',
    tagline: 'Your trusted partner'
  };
  
  const layout = templateData?.template?.layout || {
    alignment: 'center',
    spacing: 16,
    borderRadius: 8,
    padding: 24
  };

  // Show loading state only if we're still fetching auth or template data
  // Debug template data loading
  console.log('🔍 UnifiedHeroSection loading check:', {
    authLoading,
    hasTemplateData: !!templateData,
    templateData: templateData,
    template,
    isPublic,
    publicTemplateData
  });

  // Only show loading if auth is still loading, not if template data is missing
  // The useTemplate hook should always provide fallback data
  if (authLoading) {
    console.log('⚠️ UnifiedHeroSection: Showing loading state due to auth loading');
    return (
      <section className={`relative overflow-hidden ${className}`}>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01bcc6] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </section>
    );
  }

  // Safety check: ensure we have template data before rendering
  if (!templateData?.template) {
    console.log('⚠️ UnifiedHeroSection: No template data available, using minimal fallback');
    return (
      <section className={`relative overflow-hidden ${className}`}>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile</h1>
            <p className="text-gray-600">Template data is loading...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className={`relative overflow-hidden ${className}`}
      style={{ fontFamily: typography.fontFamily }}
    >
      {/* Liquid Chrome Background with Template Colors */}
      <CustomizableLiquidBackground
        primaryColor={colors.primary}
        secondaryColor={colors.secondary}
        backgroundColor={colors.background}
        backgroundType={colors.backgroundType || 'gradient'}
        className="opacity-90"
      />

      {/* Main Content */}
      <div className={`relative z-10 ${layoutConfig?.headerLayout?.type === 'centered' ? 'py-12 lg:py-16' : 'py-20 lg:py-24'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 lg:py-2">
          {layoutConfig?.headerLayout?.type === 'centered' ? (
            // Centered Layout (Template1)
          <div className="text-center">
            {/* Profile Image */}
            <div className="relative inline-block mb-4">
                <div className={`relative ${layoutConfig?.headerLayout?.avatarSize === 'large' ? 'w-40 h-40' : 'w-32 h-32'} mx-auto`}>
                {showInitials ? (
                  <div
                      className={`${layoutConfig?.headerLayout?.avatarSize === 'large' ? 'w-40 h-40' : 'w-32 h-32'} rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-bold ${layoutConfig?.headerLayout?.avatarSize === 'large' ? 'text-4xl' : 'text-3xl'}`}
                    style={{ backgroundColor: colors.primary, borderColor: colors.primary }}
                  >
                    {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </div>
                ) : (
                    <div 
                      className="rounded-full border-4 border-white shadow-lg overflow-hidden"
                      style={{ 
                        borderColor: colors.primary,
                        width: layoutConfig?.headerLayout?.avatarSize === 'large' ? '160px' : '128px',
                        height: layoutConfig?.headerLayout?.avatarSize === 'large' ? '160px' : '128px'
                      }}
                    >
                  <Image
                    src={displayImage as string}
                    alt={displayName}
                        width={layoutConfig?.headerLayout?.avatarSize === 'large' ? 160 : 128}
                        height={layoutConfig?.headerLayout?.avatarSize === 'large' ? 160 : 128}
                        className="w-full h-full object-cover"
                        style={{ 
                          objectFit: 'cover',
                          objectPosition: 'center'
                        }}
                    onError={() => {
                      console.warn('⚠️ UnifiedHeroSection: Image failed to load:', displayImage);
                      setImageError(true);
                    }}
                  />
                    </div>
                )}
              </div>
            </div>

            {/* Officer Name */}
            <h1 
              className="text-4xl lg:text-5xl font-bold mb-4 text-white"
              style={{ 
                fontWeight: typography.fontWeight.bold
              }}
            >
              {displayName}
            </h1>

            {/* Contact Information */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 mb-6">
              {displayEmail && (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <span 
                    className="text-lg text-white opacity-90"
                  >
                    {displayEmail}
                  </span>
                </div>
              )}
              {displayPhone && (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <span 
                    className="text-lg text-white opacity-90"
                  >
                    {displayPhone}
                  </span>
                </div>
              )}
              {publicUserData?.nmlsNumber && (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm2 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span 
                    className="text-lg text-white opacity-90"
                  >
                    NMLS# {publicUserData.nmlsNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
              <button
                onClick={handleApplyNow}
                className="inline-flex items-center px-6 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-none"
                style={{
                  backgroundColor: colors.primary,
                  color: 'white',
                  fontWeight: typography.fontWeight.semibold,
                  borderRadius: `${layout.borderRadius}px`
                }}
              >
                {getApplyNowText()}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <a
                href="#contact"
                className="inline-flex items-center px-6 py-3 text-base font-semibold border-2 hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-white border-white hover:bg-white hover:text-gray-900"
                style={{
                  fontWeight: typography.fontWeight.semibold,
                  borderRadius: `${layout.borderRadius}px`
                }}
              >
                Contact {displayName.split(' ')[0]}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </a>
            </div>
            </div>
          ) : (
            // Horizontal Layout (Template2) - New Design
            <div className="flex items-start">
              {/* Left Section: Officer Info (80%) */}
              <div className="pr-8" style={{ width: '75%' }}>
                <div className="flex items-start space-x-6">
                  {/* Profile Image */}
                  <div className="relative">
                    <div className={`relative ${layoutConfig?.headerLayout?.avatarSize === 'large' ? 'w-52 h-52' : 'w-40 h-40'}`}>
                      {showInitials ? (
                        <div
                          className={`${layoutConfig?.headerLayout?.avatarSize === 'large' ? 'w-52 h-52' : 'w-40 h-40'} rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-bold ${layoutConfig?.headerLayout?.avatarSize === 'large' ? 'text-5xl' : 'text-4xl'}`}
                          style={{ backgroundColor: colors.primary, borderColor: colors.primary }}
                        >
                          {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </div>
                      ) : (
                        <div 
                          className="rounded-full border-4 border-white shadow-lg overflow-hidden"
                          style={{ 
                            borderColor: colors.primary,
                            width: layoutConfig?.headerLayout?.avatarSize === 'large' ? '208px' : '160px',
                            height: layoutConfig?.headerLayout?.avatarSize === 'large' ? '208px' : '160px'
                          }}
                        >
                          <Image
                            src={displayImage as string}
                            alt={displayName}
                            width={layoutConfig?.headerLayout?.avatarSize === 'large' ? 208 : 160}
                            height={layoutConfig?.headerLayout?.avatarSize === 'large' ? 208 : 160}
                            className="w-full h-full object-cover"
                            style={{ 
                              objectFit: 'cover',
                              objectPosition: 'center'
                            }}
                            onError={() => {
                              console.warn('⚠️ UnifiedHeroSection: Image failed to load:', displayImage);
                              setImageError(true);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Officer Info */}
                  <div className="flex flex-col">
                    <h1 
                      className="text-4xl lg:text-5xl font-bold text-white mb-4"
                      style={{ 
                        fontWeight: typography.fontWeight.bold
                      }}
                    >
                      {displayName}
                    </h1>
                    
                    {/* Officer Contact Info */}
                    <div className="flex items-center space-x-2 text-lg text-white opacity-90 mb-6">
                      {/* Officer Email */}
                      {displayEmail && (
                        <>
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 flex items-center justify-center">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                            </div>
                            <span>{displayEmail}</span>
                          </div>
                          
                          {/* Dot Separator */}
                          <span className="text-white opacity-50">•</span>
                        </>
                      )}
                      
                      {/* Officer Phone */}
                      {displayPhone && (
                        <>
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 flex items-center justify-center">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                              </svg>
                            </div>
                            <span>{displayPhone}</span>
                          </div>
                          
                          {/* Dot Separator */}
                          <span className="text-white opacity-50">•</span>
                        </>
                      )}
                      
                      {/* Officer NMLS# */}
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm2 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>NMLS# {(() => {
                          const userNmls = publicUserData?.nmlsNumber;
                          console.log('🔍 Template1 NMLS# Debug:', {
                            userNmls,
                            publicUserData,
                            companyData: companyData?.company_nmls_number,
                            templateNmls: templateData?.template?.headerModifications?.nmlsNumber,
                            finalValue: userNmls || 'N/A'
                          });
                          // Only use user's NMLS#, don't fall back to template customizations
                          return userNmls || 'N/A';
                        })()}</span>
                      </div>
                    </div>

                    {/* Action Buttons - Horizontal */}
                    <div className="flex space-x-4">
                      <button
                        onClick={handleApplyNow}
                        className="inline-flex items-center px-6 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-none"
                        style={{
                          backgroundColor: colors.primary,
                          color: 'white',
                          fontWeight: typography.fontWeight.semibold,
                          borderRadius: `${layout.borderRadius}px`
                        }}
                      >
                        Apply Now
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      
                      <a
                        href="#contact"
                        className="inline-flex items-center px-6 py-3 text-base font-semibold border-2 hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-white border-white hover:bg-white hover:text-gray-900"
                        style={{
                          fontWeight: typography.fontWeight.semibold,
                          borderRadius: `${layout.borderRadius}px`
                        }}
                      >
                        Contact Officer
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vertical Separator Line */}
              <div className="w-px h-64 bg-white opacity-30 mx-4"></div>

              {/* Right Section: Company Info (20%) */}
              <div className="pl-4" style={{ width: '25%' }}>
                <div className="flex items-start space-x-4">
                  {/* Company Logo */}
                  <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={{
                      backgroundColor: colors.background,
                      border: `2px solid ${colors.primary}`
                    }}
                  >
                    {companyData?.logo && companyData.logo.startsWith('http') ? (
                      <Image
                        src={companyData.logo}
                        alt={`${companyData.name} logo`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover rounded-full"
                        style={{
                          objectFit: 'cover',
                          objectPosition: 'center'
                        }}
                      />
                    ) : (
                      <span 
                        className="text-lg font-bold"
                        style={{ color: colors.primary }}
                      >
                        {(companyData?.name || 'Your Company').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  {/* Company Details */}
                  <div className="flex flex-col">
                    <h2 className="text-2xl lg:text-3xl font-semibold text-white mb-3">
                      {companyData?.name || 'Your Company'}
                    </h2>
                    
                    {/* Company Contact Info */}
                    <div className="space-y-2 text-base text-white opacity-90">
                      {/* Company Email */}
                      {companyData?.email && (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                          </div>
                          <span>{companyData.email}</span>
                        </div>
                      )}
                      
                      {/* Company NMLS# */}
                      {companyData?.company_nmls_number && (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm2 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span>{companyData.company_nmls_number}</span>
                        </div>
                      )}
                      
                      {/* Company License # */}
                      {companyData?.license_number && (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span>{companyData.license_number}</span>
                        </div>
                      )}
                      
                      {/* Company Phone */}
                      {companyData?.phone && (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                          </div>
                          <span>{companyData.phone}</span>
                        </div>
                      )}

                      {/* Company Website */}
                      {companyData?.website && (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <a 
                            href={companyData.website.startsWith('http') ? companyData.website : `https://${companyData.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                            style={{ color: colors.primary }}
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Social Media Links */}
                    {companyData?.company_social_media && (
                      <div className="flex items-center space-x-3 mt-4">
                        {companyData.company_social_media.facebook && (
                          <a
                            href={companyData.company_social_media.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-all"
                            style={{ backgroundColor: colors.primary }}
                          >
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </a>
                        )}
                        
                        {companyData.company_social_media.linkedin && (
                          <a
                            href={companyData.company_social_media.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-all"
                            style={{ backgroundColor: colors.primary }}
                          >
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </a>
                        )}
                        
                        {companyData.company_social_media.twitter && (
                          <a
                            href={companyData.company_social_media.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-all"
                            style={{ backgroundColor: colors.primary }}
                          >
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                          </a>
                        )}
                        
                        {companyData.company_social_media.instagram && (
                          <a
                            href={companyData.company_social_media.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-all"
                            style={{ backgroundColor: colors.primary }}
                          >
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
          </div>
          )}
        </div>
      </div>
    </section>
  );
}