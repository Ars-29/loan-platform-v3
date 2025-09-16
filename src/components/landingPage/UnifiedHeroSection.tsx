'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { icons } from '@/components/ui/Icon';
import { useAuth } from '@/hooks/use-auth';
import { useProfileCache, type LoanOfficerProfile } from '@/hooks/use-profile-cache';

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
  templateCustomization
}: UnifiedHeroSectionProps) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading, error, getProfile } = useProfileCache();

  // Helper functions to get customized values
  const getOfficerName = () => {
    if (templateCustomization?.headerModifications?.officerName) {
      return templateCustomization.headerModifications.officerName;
    }
    return officerName || `${profile?.firstName || 'User'} ${profile?.lastName || 'Smith'}`;
  };

  const getPhone = () => {
    if (templateCustomization?.headerModifications?.phone) {
      return templateCustomization.headerModifications.phone;
    }
    return phone || profile?.phone || null;
  };

  const getEmail = () => {
    if (templateCustomization?.headerModifications?.email) {
      return templateCustomization.headerModifications.email;
    }
    return email || profile?.email || 'user@example.com';
  };

  const getProfileImage = () => {
    if (templateCustomization?.headerModifications?.avatar) {
      return templateCustomization.headerModifications.avatar;
    }
    return profileImage || profile?.avatar || '/default-avatar.png';
  };

  // Get customization data from template or props
  const getApplyNowText = () => {
    if (applyNowText) return applyNowText;
    if (templateCustomization?.headerModifications?.applyNowText) {
      return templateCustomization.headerModifications.applyNowText;
    }
    return 'Apply Now';
  };

  const getApplyNowLink = () => {
    if (applyNowLink) return applyNowLink;
    if (templateCustomization?.headerModifications?.applyNowLink) {
      return templateCustomization.headerModifications.applyNowLink;
    }
    return '#';
  };

  // Use helper functions to get display values
  const displayName = getOfficerName();
  const displayPhone = getPhone();
  const displayEmail = getEmail();
  const displayImage = getProfileImage();

  useEffect(() => {
    // Only fetch profile if we don't have the required props
    if (!officerName || !email) {
      console.log('🔄 UnifiedHeroSection: Fetching profile data');
      getProfile(user, authLoading);
    } else {
      console.log('✅ UnifiedHeroSection: Using provided props, skipping profile fetch');
    }
  }, [user, authLoading, getProfile, officerName, email]);

  // Debug logging
  console.log('🎨 Display values:', {
    displayName,
    displayPhone,
    displayEmail,
    profile: profile,
    user: user?.email
  });

  const { getTemplateSync } = useEfficientTemplates();
  const templateData = getTemplateSync(template);

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

  // Show loading state if we're still fetching data
  if (loading || !templateData) {
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

  // Show error state if there's an error
  if (error) {
    return (
      <section className={`relative overflow-hidden ${className}`}>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="text-red-600 mb-4">⚠️</div>
            <p className="text-gray-600">Error loading profile: {error}</p>
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
      <div className="relative z-10 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="text-center">
            {/* Profile Image */}
            <div className="relative inline-block mb-4">
              <div className="relative w-24 h-24 mx-auto">
                <Image
                  src={displayImage}
                  alt={displayName}
                  width={96}
                  height={96}
                  className="rounded-full object-cover border-4 border-white shadow-lg"
                  style={{ borderColor: colors.primary }}
                  onError={(e) => {
                    console.warn('⚠️ UnifiedHeroSection: Image failed to load:', displayImage);
                    // Fallback to initials if image fails
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-24 h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-bold text-2xl" style="background-color: ${colors.primary}; border-color: ${colors.primary}">
                          ${displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                      `;
                    }
                  }}
                />
                {/* Online Status Indicator */}
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
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

            {/* Status Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span 
                  className="text-sm font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  Available Now
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span 
                  className="text-sm font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  Quick Response
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}