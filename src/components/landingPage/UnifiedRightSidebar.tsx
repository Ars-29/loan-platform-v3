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

  // Get company data - prioritize actual company data over template customizations
  const getCompanyName = () => {
    // First priority: Actual company data (from database)
    if (companyData?.name) {
      console.log('✅ UnifiedRightSidebar: Using company data name:', companyData.name);
      return companyData.name;
    }
    
    // Second priority: Public company data
    if (isPublic && publicCompanyData?.name) {
      console.log('✅ UnifiedRightSidebar: Using public company data name:', publicCompanyData.name);
      return publicCompanyData.name;
    }
    
    // Fallback: Default company name (no more template customization)
    console.log('⚠️ UnifiedRightSidebar: Using default company name');
    return 'Your Company';
  };

  const getCompanyLogo = () => {
    // First priority: Actual company data
    if (companyData?.logo) {
      console.log('✅ UnifiedRightSidebar: Using company data logo:', companyData.logo);
      return companyData.logo;
    }
    
    // Second priority: Public company data
    if (isPublic && publicCompanyData?.logo) {
      console.log('✅ UnifiedRightSidebar: Using public company data logo:', publicCompanyData.logo);
      return publicCompanyData.logo;
    }
    
    // Fallback: No logo (no more template customization)
    console.log('⚠️ UnifiedRightSidebar: No logo found');
    return null;
  };

  const getPhone = () => {
    // First priority: Actual company data
    if (companyData?.phone) {
      console.log('✅ UnifiedRightSidebar: Using company data phone:', companyData.phone);
      return companyData.phone;
    }
    
    // Second priority: Public company data
    if (isPublic && publicCompanyData?.phone) {
      console.log('✅ UnifiedRightSidebar: Using public company data phone:', publicCompanyData.phone);
      return publicCompanyData.phone;
    }
    
    // No fallback - return null if no data exists
    console.log('⚠️ UnifiedRightSidebar: No phone data found');
    return null;
  };

  const getEmail = () => {
    // First priority: Actual company data
    if (companyData?.email) {
      console.log('✅ UnifiedRightSidebar: Using company data email:', companyData.email);
      return companyData.email;
    }
    
    // Second priority: Public company data
    if (isPublic && publicCompanyData?.email) {
      console.log('✅ UnifiedRightSidebar: Using public company data email:', publicCompanyData.email);
      return publicCompanyData.email;
    }
    
    // No fallback - return null if no data exists
    console.log('⚠️ UnifiedRightSidebar: No email data found');
    return null;
  };

  const getAddress = () => {
    // First priority: Actual company data
    if (companyData?.address) {
      console.log('✅ UnifiedRightSidebar: Using company data address:', companyData.address);
      return companyData.address;
    }
    
    // Second priority: Public company data
    if (isPublic && publicCompanyData?.address) {
      console.log('✅ UnifiedRightSidebar: Using public company data address:', publicCompanyData.address);
      return publicCompanyData.address;
    }
    
    // No fallback - return null if no data exists
    console.log('⚠️ UnifiedRightSidebar: No address data found');
    return null;
  };

  const getWebsite = () => {
    // First priority: Actual company data
    if (companyData?.website) {
      console.log('✅ UnifiedRightSidebar: Using company data website:', companyData.website);
      return companyData.website;
    }
    
    // Second priority: Public company data
    if (isPublic && publicCompanyData?.website) {
      console.log('✅ UnifiedRightSidebar: Using public company data website:', publicCompanyData.website);
      return publicCompanyData.website;
    }
    
    // Fallback: Default website
    console.log('⚠️ UnifiedRightSidebar: Using default website');
    return 'https://yourcompany.com';
  };

  const getLicenseNumber = () => {
    // First priority: Actual company data
    if (companyData?.license_number) {
      console.log('✅ UnifiedRightSidebar: Using company data license number:', companyData.license_number);
      return companyData.license_number;
    }
    
    // Second priority: Public company data
    if (isPublic && publicCompanyData?.license_number) {
      console.log('✅ UnifiedRightSidebar: Using public company data license number:', publicCompanyData.license_number);
      return publicCompanyData.license_number;
    }
    
    // No fallback - return null if no data exists
    console.log('⚠️ UnifiedRightSidebar: No license number found');
    return null;
  };

  const getNmlsNumber = () => {
    // First priority: Actual company data
    if (companyData?.company_nmls_number) {
      console.log('✅ UnifiedRightSidebar: Using company data NMLS number:', companyData.company_nmls_number);
      return companyData.company_nmls_number;
    }
    
    // Second priority: Public company data
    if (isPublic && publicCompanyData?.company_nmls_number) {
      console.log('✅ UnifiedRightSidebar: Using public company data NMLS number:', publicCompanyData.company_nmls_number);
      return publicCompanyData.company_nmls_number;
    }
    
    // No fallback - return null if no data exists
    console.log('⚠️ UnifiedRightSidebar: No NMLS number found');
    return null;
  };

  // Memoize social links to avoid multiple calls
  const socialLinks = React.useMemo(() => {
    // First priority: Actual company data
    if (companyData?.company_social_media) {
      console.log('✅ UnifiedRightSidebar: Using company data social media:', companyData.company_social_media);
      return {
        facebook: companyData.company_social_media.facebook || '',
        twitter: companyData.company_social_media.twitter || '',
        linkedin: companyData.company_social_media.linkedin || '',
        instagram: companyData.company_social_media.instagram || ''
      };
    }
    
    // Second priority: Public company data
    if (isPublic && publicCompanyData?.company_social_media) {
      console.log('✅ UnifiedRightSidebar: Using public company data social media:', publicCompanyData.company_social_media);
      return {
        facebook: publicCompanyData.company_social_media.facebook || '',
        twitter: publicCompanyData.company_social_media.twitter || '',
        linkedin: publicCompanyData.company_social_media.linkedin || '',
        instagram: publicCompanyData.company_social_media.instagram || ''
      };
    }
    
    // Fallback: Empty social links (no more template customization)
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
  }, [isPublic, publicTemplateData, templateCustomization?.rightSidebarModifications]);

  
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
                  {React.createElement(icons.phone, { size: 18, color: colors.background })}
                </div>
                <span style={{ 
                  color: colors.text,
                  fontSize: getFontSize('base'),
                  fontWeight: typography.fontWeight.medium
                }}>
                  {getPhone()}
                </span>
              </div>
            )}
            
            {getEmail() && (
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
                  {React.createElement(icons.email, { size: 18, color: colors.background })}
                </div>
                <span style={{ 
                  color: colors.text,
                  fontSize: getFontSize('base'),
                  fontWeight: typography.fontWeight.medium
                }}>
                  {getEmail()}
                </span>
              </div>
            )}
            
            {getAddress() && (
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
                  {React.createElement(icons.location, { size: 18, color: colors.background })}
                </div>
                <span style={{ 
                  color: colors.text,
                  fontSize: getFontSize('base'),
                  fontWeight: typography.fontWeight.medium
                }}>
                  {getAddress()}
                </span>
              </div>
            )}

            {/* Website */}
            {getWebsite() && (
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
                  href={getWebsite().startsWith('http') ? getWebsite() : `https://${getWebsite()}`}
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
            )}

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

        {/* Spacing Section */}
        <div style={{ 
          marginTop: 'auto',
          height: '250px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
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
