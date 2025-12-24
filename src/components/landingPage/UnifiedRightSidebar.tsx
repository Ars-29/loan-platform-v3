'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { useAuth } from '@/hooks/use-auth';
import { icons } from '@/components/ui/Icon';

interface UnifiedRightSidebarProps {
  template?: 'template1' | 'template2';
  className?: string;
  // Public mode props
  isPublic?: boolean;
  publicCompanyData?: {
    name: string;
    logo?: string;
    phone?: string;
    email?: string;
    address?: any;
    website?: string;
    license_number?: string;
    company_nmls_number?: string;
    company_social_media?: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
    };
  };
  publicTemplateData?: any;
  // Template customization data
  templateCustomization?: {
    rightSidebarModifications?: {
      companyName?: string;
      logo?: string;
      phone?: string;
      email?: string;
      address?: string;
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
    };
  };
  // NEW: Company data props for both public and private modes
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

export default function UnifiedRightSidebar({
  template = 'template1',
  className = "",
  isPublic = false,
  publicCompanyData,
  publicTemplateData,
  templateCustomization,
  companyData
}: UnifiedRightSidebarProps) {
  const { user } = useAuth();
  const { getTemplateSync } = useEfficientTemplates();
  const templateData = publicTemplateData || getTemplateSync(template);
  const [emailCopied, setEmailCopied] = React.useState(false);

  // Debug template data
  React.useEffect(() => {
    console.log('🔄 UnifiedRightSidebar: Template data updated:', {
      isPublic,
      hasPublicTemplateData: !!publicTemplateData,
      hasTemplateData: !!templateData,
      templateDataStructure: templateData ? Object.keys(templateData) : null,
      templateColors: templateData?.template?.colors,
      templateLayout: templateData?.template?.layout,
      timestamp: new Date().toISOString()
    });
  }, [templateData, publicTemplateData, isPublic]);

  // Debug when templateCustomization changes
  React.useEffect(() => {
    console.log('🔄 UnifiedRightSidebar: templateCustomization updated:', {
      templateCustomization,
      rightSidebarModifications: templateCustomization?.rightSidebarModifications,
      timestamp: new Date().toISOString()
    });
  }, [templateCustomization]);

  // Helper function to validate if a string is a valid URL
  const isValidUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return false;
    
    // Check if it's a valid URL
    try {
      const urlObj = new URL(trimmedUrl);
      // Must be http or https
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      // If URL constructor fails, check if it's a relative path starting with /
      if (trimmedUrl.startsWith('/')) {
        return true;
      }
      return false;
    }
  };

  // Get company data - check template customizations first, then fallback to publicCompanyData/companyData
  const getCompanyName = () => {
    // Priority 1: Public template data (for public mode)
    if (isPublic && publicTemplateData?.template?.rightSidebarModifications?.companyName) {
      console.log('✅ UnifiedRightSidebar: Using public template data company name:', publicTemplateData.template.rightSidebarModifications.companyName);
      return publicTemplateData.template.rightSidebarModifications.companyName;
    }
    // Priority 2: Template customization (what user set in customizer)
    if (templateCustomization?.rightSidebarModifications?.companyName) {
      console.log('✅ UnifiedRightSidebar: Using template customization company name:', templateCustomization.rightSidebarModifications.companyName);
      return templateCustomization.rightSidebarModifications.companyName;
    }
    // Priority 3: Fallback to companyData/publicCompanyData
    if (isPublic && publicCompanyData?.name) {
      console.log('✅ UnifiedRightSidebar: Using public company data name:', publicCompanyData.name);
      return publicCompanyData.name;
    }
    if (companyData?.name) {
      console.log('✅ UnifiedRightSidebar: Using companyData name:', companyData.name);
      return companyData.name;
    }
    // Final fallback: Default company name
    console.log('⚠️ UnifiedRightSidebar: Using default company name');
    return 'Your Company';
  };

  const getCompanyLogo = () => {
    // Priority 1: Public template data (for public mode)
    if (isPublic && publicTemplateData?.template?.rightSidebarModifications?.logo) {
      const logo = publicTemplateData.template.rightSidebarModifications.logo;
      if (isValidUrl(logo)) {
        console.log('✅ UnifiedRightSidebar: Using public template data logo:', logo);
        return logo;
      }
    }
    // Priority 2: Template customization (what user set in customizer)
    const logo = templateCustomization?.rightSidebarModifications?.logo;
    if (logo && isValidUrl(logo)) {
      console.log('✅ UnifiedRightSidebar: Using template customization logo:', logo);
      return logo;
    }
    // Priority 3: Fallback to companyData/publicCompanyData
    if (isPublic && publicCompanyData?.logo && isValidUrl(publicCompanyData.logo)) {
      console.log('✅ UnifiedRightSidebar: Using public company data logo:', publicCompanyData.logo);
      return publicCompanyData.logo;
    }
    if (companyData?.logo && isValidUrl(companyData.logo)) {
      console.log('✅ UnifiedRightSidebar: Using companyData logo:', companyData.logo);
      return companyData.logo;
    }
    // Fallback: No logo
    console.log('⚠️ UnifiedRightSidebar: No logo found');
    return null;
  };

  const getPhone = () => {
    // Priority 1: Public template data (for public mode)
    if (isPublic && publicTemplateData?.template?.rightSidebarModifications?.phone) {
      console.log('✅ UnifiedRightSidebar: Using public template data phone:', publicTemplateData.template.rightSidebarModifications.phone);
      return publicTemplateData.template.rightSidebarModifications.phone;
    }
    // Priority 2: Template customization (what user set in customizer)
    if (templateCustomization?.rightSidebarModifications?.phone) {
      console.log('✅ UnifiedRightSidebar: Using template customization phone:', templateCustomization.rightSidebarModifications.phone);
      return templateCustomization.rightSidebarModifications.phone;
    }
    // Priority 3: Fallback to companyData/publicCompanyData
    if (isPublic && publicCompanyData?.phone) {
      console.log('✅ UnifiedRightSidebar: Using public company data phone:', publicCompanyData.phone);
      return publicCompanyData.phone;
    }
    if (companyData?.phone) {
      console.log('✅ UnifiedRightSidebar: Using companyData phone:', companyData.phone);
      return companyData.phone;
    }
    // No fallback - return null if no data exists
    console.log('⚠️ UnifiedRightSidebar: No phone data found');
    return null;
  };

  const getEmail = () => {
    // Priority 1: Public template data (for public mode)
    if (isPublic && publicTemplateData?.template?.rightSidebarModifications?.email) {
      console.log('✅ UnifiedRightSidebar: Using public template data email:', publicTemplateData.template.rightSidebarModifications.email);
      return publicTemplateData.template.rightSidebarModifications.email;
    }
    // Priority 2: Template customization (what user set in customizer)
    if (templateCustomization?.rightSidebarModifications?.email) {
      console.log('✅ UnifiedRightSidebar: Using template customization email:', templateCustomization.rightSidebarModifications.email);
      return templateCustomization.rightSidebarModifications.email;
    }
    // Priority 3: Fallback to companyData/publicCompanyData
    if (isPublic && publicCompanyData?.email) {
      console.log('✅ UnifiedRightSidebar: Using public company data email:', publicCompanyData.email);
      return publicCompanyData.email;
    }
    if (companyData?.email) {
      console.log('✅ UnifiedRightSidebar: Using companyData email:', companyData.email);
      return companyData.email;
    }
    // No fallback - return null if no data exists
    console.log('⚠️ UnifiedRightSidebar: No email data found');
    return null;
  };

  const getAddress = () => {
    // Priority 1: Public template data (for public mode)
    if (isPublic && publicTemplateData?.template?.rightSidebarModifications?.address) {
      console.log('✅ UnifiedRightSidebar: Using public template data address:', publicTemplateData.template.rightSidebarModifications.address);
      return publicTemplateData.template.rightSidebarModifications.address;
    }
    // Priority 2: Template customization (what user set in customizer)
    if (templateCustomization?.rightSidebarModifications?.address) {
      console.log('✅ UnifiedRightSidebar: Using template customization address:', templateCustomization.rightSidebarModifications.address);
      return templateCustomization.rightSidebarModifications.address;
    }
    // Priority 3: Fallback to companyData/publicCompanyData
    if (isPublic && publicCompanyData?.address) {
      console.log('✅ UnifiedRightSidebar: Using public company data address:', publicCompanyData.address);
      return publicCompanyData.address;
    }
    if (companyData?.address) {
      console.log('✅ UnifiedRightSidebar: Using companyData address:', companyData.address);
      return companyData.address;
    }
    // No fallback - return null if no data exists
    console.log('⚠️ UnifiedRightSidebar: No address data found');
    return null;
  };

  const getWebsite = (): string | null => {
    // Priority 1: Public template data (for public mode) - website may exist in publicTemplateData even if not in type
    if (isPublic && publicTemplateData?.template?.rightSidebarModifications?.website) {
      console.log('✅ UnifiedRightSidebar: Using public template data website:', publicTemplateData.template.rightSidebarModifications.website);
      return publicTemplateData.template.rightSidebarModifications.website;
    }
    // Priority 2: Fallback to companyData/publicCompanyData (website not in rightSidebarModifications type)
    if (isPublic && publicCompanyData?.website) {
      console.log('✅ UnifiedRightSidebar: Using public company data website:', publicCompanyData.website);
      return publicCompanyData.website;
    }
    if (companyData?.website) {
      console.log('✅ UnifiedRightSidebar: Using companyData website:', companyData.website);
      return companyData.website;
    }
    // No fallback - return null if no data exists
    console.log('⚠️ UnifiedRightSidebar: No website data found');
    return null;
  };

  const getLicenseNumber = () => {
    // Priority 1: Public template data (for public mode) - license_number may exist in publicTemplateData even if not in type
    if (isPublic && publicTemplateData?.template?.rightSidebarModifications?.license_number) {
      console.log('✅ UnifiedRightSidebar: Using public template data license number:', publicTemplateData.template.rightSidebarModifications.license_number);
      return publicTemplateData.template.rightSidebarModifications.license_number;
    }
    // Priority 2: Fallback to companyData/publicCompanyData (license_number not in rightSidebarModifications type)
    if (isPublic && publicCompanyData?.license_number) {
      console.log('✅ UnifiedRightSidebar: Using public company data license number:', publicCompanyData.license_number);
      return publicCompanyData.license_number;
    }
    if (companyData?.license_number) {
      console.log('✅ UnifiedRightSidebar: Using companyData license number:', companyData.license_number);
      return companyData.license_number;
    }
    // No fallback - return null if no data exists
    console.log('⚠️ UnifiedRightSidebar: No license number data found');
    return null;
  };

  const getNmlsNumber = () => {
    // Priority 1: Public template data (for public mode) - company_nmls_number may exist in publicTemplateData even if not in type
    if (isPublic && publicTemplateData?.template?.rightSidebarModifications?.company_nmls_number) {
      console.log('✅ UnifiedRightSidebar: Using public template data NMLS number:', publicTemplateData.template.rightSidebarModifications.company_nmls_number);
      return publicTemplateData.template.rightSidebarModifications.company_nmls_number;
    }
    // Priority 2: Fallback to companyData/publicCompanyData (company_nmls_number not in rightSidebarModifications type)
    if (isPublic && publicCompanyData?.company_nmls_number) {
      console.log('✅ UnifiedRightSidebar: Using public company data NMLS number:', publicCompanyData.company_nmls_number);
      return publicCompanyData.company_nmls_number;
    }
    if (companyData?.company_nmls_number) {
      console.log('✅ UnifiedRightSidebar: Using companyData NMLS number:', companyData.company_nmls_number);
      return companyData.company_nmls_number;
    }
    // No fallback - return null if no data exists
    console.log('⚠️ UnifiedRightSidebar: No NMLS number data found');
    return null;
  };

  // Memoize social links - check template customizations first, then fallback to companyData
  const socialLinks = React.useMemo(() => {
    // Priority 1: Public template data (for public mode)
    if (isPublic && publicTemplateData?.template?.rightSidebarModifications) {
      const mods = publicTemplateData.template.rightSidebarModifications;
      const hasAnyValue = mods.facebook || mods.twitter || mods.linkedin || mods.instagram;
      if (hasAnyValue) {
        console.log('✅ UnifiedRightSidebar: Using public template data social media:', mods);
        return {
          facebook: mods.facebook || '',
          twitter: mods.twitter || '',
          linkedin: mods.linkedin || '',
          instagram: mods.instagram || ''
        };
      }
    }
    // Priority 2: Template customization (rightSidebarModifications)
    if (templateCustomization?.rightSidebarModifications) {
      const sidebarMods = templateCustomization.rightSidebarModifications;
      const hasAnyValue = sidebarMods.facebook || 
                         sidebarMods.twitter || 
                         sidebarMods.linkedin || 
                         sidebarMods.instagram;
      
      if (hasAnyValue) {
        console.log('✅ UnifiedRightSidebar: Using template customization social media:', sidebarMods);
        return {
          facebook: sidebarMods.facebook || '',
          twitter: sidebarMods.twitter || '',
          linkedin: sidebarMods.linkedin || '',
          instagram: sidebarMods.instagram || ''
        };
      }
    }
    // Priority 3: Fallback to companyData/publicCompanyData
    if (isPublic && publicCompanyData?.company_social_media) {
      const social = publicCompanyData.company_social_media;
      const hasAnyValue = social.facebook || social.twitter || social.linkedin || social.instagram;
      if (hasAnyValue) {
        console.log('✅ UnifiedRightSidebar: Using public company data social media:', social);
        return {
          facebook: social.facebook || '',
          twitter: social.twitter || '',
          linkedin: social.linkedin || '',
          instagram: social.instagram || ''
        };
      }
    }
    if (companyData?.company_social_media) {
      const social = companyData.company_social_media;
      const hasAnyValue = social.facebook || social.twitter || social.linkedin || social.instagram;
      if (hasAnyValue) {
        console.log('✅ UnifiedRightSidebar: Using companyData social media:', social);
        return {
          facebook: social.facebook || '',
          twitter: social.twitter || '',
          linkedin: social.linkedin || '',
          instagram: social.instagram || ''
        };
      }
    }
    
    // Fallback: Empty social links
    console.log('⚠️ UnifiedRightSidebar: No social media links found');
    const links = {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: ''
    };
    
    console.log('✅ UnifiedRightSidebar: Social links:', links);
    console.log('✅ UnifiedRightSidebar: Will show Facebook?', !!links.facebook);
    console.log('✅ UnifiedRightSidebar: Will show Twitter?', !!links.twitter);
    console.log('✅ UnifiedRightSidebar: Will show LinkedIn?', !!links.linkedin);
    console.log('✅ UnifiedRightSidebar: Will show Instagram?', !!links.instagram);
    return links;
  }, [isPublic, publicTemplateData?.template?.rightSidebarModifications, templateCustomization?.rightSidebarModifications, publicCompanyData?.company_social_media, companyData?.company_social_media]);

  
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
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  };
  
  // Layout data removed - using hardcoded Tailwind classes for consistent spacing
  
  // Helper function to get font size
  const getFontSize = (size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl') => {
    if (typeof typography.fontSize === 'object') {
      return typography.fontSize[size];
    }
    // Fallback sizes if fontSize is a number
    const fallbackSizes = {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24
    };
    return fallbackSizes[size];
  };
  
  const classes = templateData?.template?.classes || {
    heading: {
      h1: 'text-3xl font-bold text-gray-900 mb-4',
      h2: 'text-2xl font-bold text-gray-900 mb-3',
      h3: 'text-xl font-semibold text-gray-900 mb-2',
      h4: 'text-lg font-semibold text-gray-900 mb-2',
      h5: 'text-base font-semibold text-gray-900 mb-2',
      h6: 'text-sm font-semibold text-gray-900 mb-1'
    },
    body: {
      large: 'text-lg text-gray-700 leading-relaxed',
      base: 'text-base text-gray-700 leading-relaxed',
      small: 'text-sm text-gray-600 leading-relaxed',
      xs: 'text-xs text-gray-500 leading-normal'
    }
  };

  // Debug social links rendering
  console.log('🔄 UnifiedRightSidebar: Rendering social links:', {
    facebook: socialLinks.facebook,
    twitter: socialLinks.twitter,
    linkedin: socialLinks.linkedin,
    instagram: socialLinks.instagram,
    allSocialLinks: socialLinks
  });

  return (
    <div 
      className={`rounded-lg border shadow-lg p-6 flex flex-col relative w-full max-w-full ${className}`}
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        borderRadius: `${templateData?.template?.layout?.borderRadius || 8}px`,
        fontFamily: typography.fontFamily,
        boxShadow: `0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
      }}
    >
      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col">
        {/* Brand Section - Enhanced Design */}
        <div className="flex items-center gap-5 mb-8 pb-6 border-b" style={{ 
          borderBottomColor: colors.border,
          borderBottomWidth: '2px'
        }}>
          {/* Brand logo - perfect circular design with primary border */}
          <div 
            className="flex-shrink-0 overflow-hidden"
            style={{ 
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: `3px solid ${colors.primary}`,
              backgroundColor: colors.background,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${colors.primary}20`
            }}
          >
            {getCompanyLogo() ? (
              <Image 
                src={getCompanyLogo()!} 
                alt={getCompanyName()}
                width={50}
                height={50}
                className="w-full h-full"
                style={{ 
                  borderRadius: '50%',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
              />
            ) : (
              <span 
                style={{ 
                  color: colors.primary,
                  fontSize: getFontSize('xl'),
                  fontWeight: typography.fontWeight.bold
                }}
              >
                {getCompanyName().charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h3 style={{ 
              color: colors.text,
              fontSize: getFontSize('2xl'),
              fontWeight: typography.fontWeight.bold,
              marginTop: 0,
              marginRight: 0,
              marginLeft: 0,
              marginBottom: '8px',
              lineHeight: '1.2'
            }}>
              {getCompanyName()}
            </h3>
            
          </div>
        </div>

        {/* Customer Reviews Section - COMMENTED OUT FOR MINIMAL DESIGN */}
        {/* 
        <div style={{ marginBottom: `${layout.padding.large}px` }}>
          <h4 style={{ 
            color: colors.secondary,
            fontSize: getFontSize('lg'),
            fontWeight: typography.fontWeight.bold,
            marginTop: 0,
            marginRight: 0,
            marginLeft: 0,
            marginBottom: `${layout.padding.medium}px`
          }}>
            Customer Reviews
          </h4>
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: `${layout.padding.small}px`
          }}>
            {[
              { platform: 'Google', reviews: '1030' },
              { platform: 'Zillow', reviews: '1030' },
              { platform: 'X Platform', reviews: '1030' }
            ].map((review, index) => (
              <div 
                key={index}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: `${layout.padding.small}px`,
                  backgroundColor: `${colors.primary}08`,
                  borderRadius: `${templateData?.template?.layout?.borderRadius || 8}px`,
                  border: `1px solid ${colors.border}`
                }}
              >
                <span style={{ 
                  color: colors.text,
                  fontSize: getFontSize('sm'),
                  fontWeight: typography.fontWeight.medium
                }}>
                  {review.platform}
                </span>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: `${layout.padding.small}px`
                }}>
                  <span style={{ color: colors.primary, fontSize: getFontSize('sm') }}>★★★★★</span>
                  <span style={{ 
                    color: colors.textSecondary,
                    fontSize: getFontSize('xs'),
                    fontWeight: typography.fontWeight.normal
                  }}>
                    {review.reviews} reviews
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        */}

        {/* Contact Information Section - Enhanced Design */}
        <div className="mb-6 flex flex-col">
          <div className="flex flex-col gap-3">
            {getPhone() && (
              <div 
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ 
                  backgroundColor: `${colors.primary}10`,
                  borderRadius: `${templateData?.template?.layout?.borderRadius || 8}px`,
                  overflow: 'hidden'
                }}
              >
                <div 
                  style={{ 
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.primary,
                    flexShrink: 0
                  }}
                >
                  {React.createElement(icons.phone, { size: 18, color: colors.background })}
                </div>
                <span 
                  className="truncate"
                  style={{ 
                    color: colors.text,
                    fontSize: getFontSize('base'),
                    fontWeight: typography.fontWeight.medium,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                    flex: 1
                  }}
                  title={getPhone() || ''}
                >
                  {getPhone()}
                </span>
              </div>
            )}
            
            {getEmail() && (
              <div 
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ 
                  backgroundColor: `${colors.primary}10`,
                  borderRadius: `${templateData?.template?.layout?.borderRadius || 8}px`,
                  overflow: 'hidden'
                }}
              >
                <div 
                  style={{ 
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.primary,
                    flexShrink: 0
                  }}
                >
                  {React.createElement(icons.email, { size: 18, color: colors.background })}
                </div>
                <span 
                  className="truncate"
                  style={{ 
                    color: colors.text,
                    fontSize: getFontSize('base'),
                    fontWeight: typography.fontWeight.medium,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                    flex: 1
                  }}
                  title={getEmail() || ''}
                >
                  {getEmail()}
                </span>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(getEmail() || '');
                      setEmailCopied(true);
                      setTimeout(() => setEmailCopied(false), 2000);
                    } catch (err) {
                      console.error('Failed to copy email:', err);
                    }
                  }}
                  style={{
                    background: emailCopied ? `${colors.primary}20` : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: emailCopied ? colors.primary : colors.textSecondary,
                    flexShrink: 0,
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!emailCopied) {
                      e.currentTarget.style.backgroundColor = `${colors.primary}20`;
                      e.currentTarget.style.color = colors.primary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!emailCopied) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = colors.textSecondary;
                    }
                  }}
                  title={emailCopied ? "Email copied!" : "Copy email to clipboard"}
                >
                  {emailCopied ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  )}
                </button>
              </div>
            )}
            
            {(() => {
              const address = getAddress();
              if (!address) return null;
              
              const addressText = typeof address === 'string' ? address : JSON.stringify(address);
              
              return (
                <div 
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ 
                    backgroundColor: `${colors.primary}10`,
                    borderRadius: `${templateData?.template?.layout?.borderRadius || 8}px`,
                    overflow: 'hidden'
                  }}
                >
                  <div 
                    style={{ 
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.primary,
                      flexShrink: 0
                    }}
                  >
                    {React.createElement(icons.location, { size: 18, color: colors.background })}
                  </div>
                  <span 
                    className="truncate max-w-[140px] text-base" 
                    style={{ 
                      color: colors.text,
                      fontSize: getFontSize('base'),
                      fontWeight: typography.fontWeight.medium,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                      flex: 1,
                      maxWidth: '140px'
                    }}
                    title={addressText}
                  >
                    {addressText}
                  </span>
                </div>
              );
            })()}

            {/* Website */}
            {(() => {
              const website = getWebsite();
              if (!website) return null;
              
              return (
                <div 
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ 
                    backgroundColor: `${colors.primary}10`,
                    borderRadius: `${templateData?.template?.layout?.borderRadius || 8}px`
                  }}
                >
                  <div 
                    style={{ 
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.primary
                    }}
                  >
                    {React.createElement(icons.externalLink, { size: 18, color: colors.background })}
                  </div>
                  <a 
                    href={website.startsWith('http') ? website : `https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      color: colors.primary,
                      fontSize: getFontSize('base'),
                      fontWeight: typography.fontWeight.medium,
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.textDecoration = 'underline'}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.textDecoration = 'none'}
                  >
                    Visit Website
                  </a>
                </div>
              );
            })()}

            {/* License Number */}
            {getLicenseNumber() && (
              <div 
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ 
                  backgroundColor: `${colors.primary}10`,
                  borderRadius: `${templateData?.template?.layout?.borderRadius || 8}px`
                }}
              >
                <div 
                  style={{ 
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.primary
                  }}
                >
                  {React.createElement(icons.shield, { size: 18, color: colors.background })}
                </div>
                <span style={{ 
                  color: colors.text,
                  fontSize: getFontSize('base'),
                  fontWeight: typography.fontWeight.medium
                }}>
                  {getLicenseNumber()}
                </span>
              </div>
            )}

            {/* NMLS Number */}
            {getNmlsNumber() && (
              <div 
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ 
                  backgroundColor: `${colors.primary}10`,
                  borderRadius: `${templateData?.template?.layout?.borderRadius || 8}px`
                }}
              >
                <div 
                  style={{ 
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.primary
                  }}
                >
                  {React.createElement(icons.building, { size: 18, color: colors.background })}
                </div>
                <span style={{ 
                  color: colors.text,
                  fontSize: getFontSize('base'),
                  fontWeight: typography.fontWeight.medium
                }}>
                  {getNmlsNumber()}
                </span>
              </div>
            )}
          </div>
        </div>


        {/* Follow Us Section - Enhanced Design */}
        <div className="pt-6 pb-4 bg-white flex-shrink-0 flex flex-col justify-center border-t" style={{ 
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: '2px'
        }}>
          <h4 className="text-lg font-semibold mb-4 text-center" style={{ 
            color: colors.text,
            fontSize: getFontSize('lg'),
            fontWeight: typography.fontWeight.semibold
          }}>
            Follow Us
          </h4>
          <div className="flex gap-3 justify-center flex-wrap">
          {socialLinks.facebook && (
            <a 
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110"
              style={{
                backgroundColor: colors.primary,
                boxShadow: `0 4px 12px ${colors.primary}30`
              }}
            >
              {React.createElement(icons.facebook, { size: 18, color: colors.background })}
            </a>
          )}
          {socialLinks.twitter && (
            <a 
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110"
              style={{
                backgroundColor: colors.primary,
                boxShadow: `0 4px 12px ${colors.primary}30`
              }}
            >
              {React.createElement(icons.twitter, { size: 18, color: colors.background })}
            </a>
          )}
          {socialLinks.linkedin && (
            <a 
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110"
              style={{
                backgroundColor: colors.primary,
                boxShadow: `0 4px 12px ${colors.primary}30`
              }}
            >
              {React.createElement(icons.linkedin, { size: 18, color: colors.background })}
            </a>
          )}
          {socialLinks.instagram && (
            <a 
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110"
              style={{
                backgroundColor: colors.primary,
                boxShadow: `0 4px 12px ${colors.primary}30`
              }}
            >
              {React.createElement(icons.instagram, { size: 18, color: colors.background })}
            </a>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
