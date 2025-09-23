'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { icons } from '@/components/ui/Icon';
import { useAuth } from '@/hooks/use-auth';

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
    avatar?: string;
  };
  publicTemplateData?: any;
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
  publicTemplateData
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

  const getApplyNowLink = () => {
    if (applyNowLink) return applyNowLink;
    // Public mode: check template data first
    if (isPublic && publicTemplateData?.template?.headerModifications?.applyNowLink) {
      return publicTemplateData.template.headerModifications.applyNowLink;
    }
    // Internal mode: check templateCustomization
    if (templateCustomization?.headerModifications?.applyNowLink) {
      return templateCustomization.headerModifications.applyNowLink;
    }
    return '#';
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

  // Debug logging for template data
  console.log('🎨 Template data:', {
    template,
    templateData: templateData?.template,
    templateCustomization
  });

  
  // Comprehensive template data usage
  const colors = templateData?.template?.colors || {
    primary: '#ec4899',
    secondary: '#3b82f6',
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
  if (authLoading || !templateData) {
    return (
      <section className={`relative overflow-hidden ${className}`}>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </section>
    );
  }

  // No error state needed since we're not fetching profile data

  return (
    <section 
      className={`relative overflow-hidden ${className}`}
      style={{ fontFamily: typography.fontFamily }}
    >
      {/* Enhanced Background with Database Secondary Color */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: colors.secondary }}
      />
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 animate-pulse" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M50 10c22.091 0 40 17.909 40 40s-17.909 40-40 40S10 72.091 10 50 27.909 10 50 10zm0 5c19.33 0 35 15.67 35 35s-15.67 35-35 35S15 69.33 15 50 30.67 15 50 15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full opacity-10 animate-bounce" style={{ backgroundColor: colors.primary }}></div>
        <div className="absolute top-40 right-20 w-16 h-16 rounded-full opacity-10 animate-bounce" style={{ backgroundColor: colors.primary, animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 rounded-full opacity-10 animate-bounce" style={{ backgroundColor: colors.primary, animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 right-10 w-24 h-24 rounded-full opacity-10 animate-bounce" style={{ backgroundColor: colors.primary, animationDelay: '3s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 py-2 lg:py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 lg:py-2">
          <div className="text-center">
            {/* Profile Image */}
            <div className="relative inline-block mb-4">
              <div className="relative w-24 h-24 mx-auto">
                {showInitials ? (
                  <div
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-bold text-2xl"
                    style={{ backgroundColor: colors.primary, borderColor: colors.primary }}
                  >
                    {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </div>
                ) : (
                  <Image
                    src={displayImage as string}
                    alt={displayName}
                    width={96}
                    height={96}
                    className="rounded-full object-cover border-4 border-white shadow-lg"
                    style={{ borderColor: colors.primary }}
                    onError={() => {
                      console.warn('⚠️ UnifiedHeroSection: Image failed to load:', displayImage);
                      setImageError(true);
                    }}
                  />
                )}
                
              </div>
            </div>

            {/* Officer Name */}
            <h1 
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{ 
                color: colors.text,
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
                    className="text-lg"
                    style={{ color: colors.textSecondary }}
                  >
                    {displayEmail}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
              <a
                href={getApplyNowLink()}
                className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{
                  backgroundColor: colors.primary,
                  color: 'white',
                  fontWeight: typography.fontWeight.semibold
                }}
              >
                {getApplyNowText()}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              
              <a
                href="#contact"
                className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-lg border-2 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                style={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  backgroundColor: 'transparent',
                  fontWeight: typography.fontWeight.semibold
                }}
              >
                Contact {displayName.split(' ')[0]}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </a>
            </div>

            
          </div>
        </div>
      </div>
    </section>
  );
}