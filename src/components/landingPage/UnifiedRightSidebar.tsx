'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { useAuth } from '@/hooks/use-auth';
import { icons } from '@/components/ui/Icon';

interface UnifiedRightSidebarProps {
  template?: 'template1' | 'template2';
  className?: string;
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
}

export default function UnifiedRightSidebar({
  template = 'template1',
  className = "",
  templateCustomization
}: UnifiedRightSidebarProps) {
  const { user } = useAuth();
  const { getTemplateSync } = useEfficientTemplates();
  const templateData = getTemplateSync(template);

  // Debug when templateCustomization changes
  React.useEffect(() => {
    console.log('🔄 UnifiedRightSidebar: templateCustomization updated:', {
      templateCustomization,
      rightSidebarModifications: templateCustomization?.rightSidebarModifications,
      timestamp: new Date().toISOString()
    });
  }, [templateCustomization]);

  // Get customization data from template or props
  const getCompanyName = () => {
    console.log('🔄 UnifiedRightSidebar: Getting company name:', {
      templateCustomization,
      rightSidebarModifications: templateCustomization?.rightSidebarModifications,
      companyName: templateCustomization?.rightSidebarModifications?.companyName
    });
    
    if (templateCustomization?.rightSidebarModifications?.companyName) {
      console.log('✅ UnifiedRightSidebar: Using customized company name:', templateCustomization.rightSidebarModifications.companyName);
      return templateCustomization.rightSidebarModifications.companyName;
    }
    console.log('⚠️ UnifiedRightSidebar: Using default company name');
    return 'Your Brand™';
  };

  const getCompanyLogo = () => {
    console.log('🔄 UnifiedRightSidebar: Getting company logo:', {
      logo: templateCustomization?.rightSidebarModifications?.logo
    });
    
    if (templateCustomization?.rightSidebarModifications?.logo) {
      console.log('✅ UnifiedRightSidebar: Using customized logo');
      return templateCustomization.rightSidebarModifications.logo;
    }
    console.log('⚠️ UnifiedRightSidebar: Using default initials');
    return null; // Use default initials
  };

  const getPhone = () => {
    console.log('🔄 UnifiedRightSidebar: Getting phone:', {
      phone: templateCustomization?.rightSidebarModifications?.phone
    });
    
    if (templateCustomization?.rightSidebarModifications?.phone) {
      console.log('✅ UnifiedRightSidebar: Using customized phone:', templateCustomization.rightSidebarModifications.phone);
      return templateCustomization.rightSidebarModifications.phone;
    }
    console.log('⚠️ UnifiedRightSidebar: Using default phone');
    return '(555) 123-4567';
  };

  const getEmail = () => {
    console.log('🔄 UnifiedRightSidebar: Getting email:', {
      email: templateCustomization?.rightSidebarModifications?.email
    });
    
    if (templateCustomization?.rightSidebarModifications?.email) {
      console.log('✅ UnifiedRightSidebar: Using customized email:', templateCustomization.rightSidebarModifications.email);
      return templateCustomization.rightSidebarModifications.email;
    }
    console.log('⚠️ UnifiedRightSidebar: Using default email');
    return 'info@yourbrand.com';
  };

  const getAddress = () => {
    console.log('🔄 UnifiedRightSidebar: Getting address:', {
      address: templateCustomization?.rightSidebarModifications?.address
    });
    
    if (templateCustomization?.rightSidebarModifications?.address && 
        templateCustomization.rightSidebarModifications.address.trim() !== '') {
      console.log('✅ UnifiedRightSidebar: Using customized address:', templateCustomization.rightSidebarModifications.address);
      return templateCustomization.rightSidebarModifications.address;
    }
    console.log('⚠️ UnifiedRightSidebar: Using default address');
    return '123 Main St, City, State 12345';
  };

  // Memoize social links to avoid multiple calls
  const socialLinks = React.useMemo(() => {
    const socialMods = templateCustomization?.rightSidebarModifications || {};
    console.log('🔄 UnifiedRightSidebar: Getting social links:', socialMods);
    console.log('🔄 UnifiedRightSidebar: templateCustomization:', templateCustomization);
    
    const links = {
      facebook: socialMods.facebook || '',
      twitter: socialMods.twitter || '',
      linkedin: socialMods.linkedin || '',
      instagram: socialMods.instagram || ''
    };
    
    console.log('✅ UnifiedRightSidebar: Social links:', links);
    console.log('✅ UnifiedRightSidebar: Will show Facebook?', !!links.facebook);
    console.log('✅ UnifiedRightSidebar: Will show Twitter?', !!links.twitter);
    console.log('✅ UnifiedRightSidebar: Will show LinkedIn?', !!links.linkedin);
    console.log('✅ UnifiedRightSidebar: Will show Instagram?', !!links.instagram);
    return links;
  }, [templateCustomization?.rightSidebarModifications]);

  
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
  
  const layout = templateData?.template?.layout || {
    alignment: 'center',
    spacing: 18,
    borderRadius: 8,
    padding: { small: 8, medium: 16, large: 24, xlarge: 32 }
  };
  
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
      className={`rounded-lg border shadow-sm ${className}`}
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        padding: `${layout.padding.large}px`,
        fontFamily: typography.fontFamily
      }}
    >
      {/* Brand Logo */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: `${layout.spacing}px`,
        marginBottom: `${layout.padding.large}px`
      }}>
        {getCompanyLogo() ? (
          <Image 
            src={getCompanyLogo()!} 
            alt={getCompanyName()}
            width={48}
            height={48}
            style={{ 
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div 
            style={{ 
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${colors.primary}20`
            }}
          >
            <span 
              style={{ 
                color: colors.primary,
                fontSize: getFontSize('lg'),
                fontWeight: typography.fontWeight.bold
              }}
            >
              {getCompanyName().charAt(0)}
            </span>
          </div>
        )}
        <h3 style={{ 
          color: colors.text,
          fontSize: getFontSize('lg'),
          fontWeight: typography.fontWeight.semibold
        }}>
          {getCompanyName()}
        </h3>
      </div>

      {/* Customer Reviews */}
      <div style={{ marginBottom: `${layout.padding.large}px` }}>
        <h4 style={{ 
          color: colors.text,
          fontSize: getFontSize('base'),
          fontWeight: typography.fontWeight.semibold,
          marginBottom: `${layout.padding.medium}px`
        }}>
          Customer Reviews
        </h4>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: `${layout.spacing}px`
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            <span style={{ 
              color: colors.text,
              fontSize: getFontSize('sm'),
              fontWeight: typography.fontWeight.medium
            }}>Google</span>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: `${layout.spacing}px`
            }}>
              <span style={{ color: colors.secondary }}>★★★★★</span>
              <span style={{ 
                color: colors.textSecondary,
                fontSize: getFontSize('xs'),
                fontWeight: typography.fontWeight.normal
              }}>1030 reviews</span>
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            <span style={{ 
              color: colors.text,
              fontSize: getFontSize('sm'),
              fontWeight: typography.fontWeight.medium
            }}>Zillow</span>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: `${layout.spacing}px`
            }}>
              <span style={{ color: colors.secondary }}>★★★★★</span>
              <span style={{ 
                color: colors.textSecondary,
                fontSize: getFontSize('xs'),
                fontWeight: typography.fontWeight.normal
              }}>1030 reviews</span>
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between'
          }}>
            <span style={{ 
              color: colors.text,
              fontSize: getFontSize('sm'),
              fontWeight: typography.fontWeight.medium
            }}>X Platform</span>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: `${layout.spacing}px`
            }}>
              <span style={{ color: colors.secondary }}>★★★★★</span>
              <span style={{ 
                color: colors.textSecondary,
                fontSize: getFontSize('xs'),
                fontWeight: typography.fontWeight.normal
              }}>1030 reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div style={{ marginBottom: `${layout.padding.large}px` }}>
        <h4 style={{ 
          color: colors.text,
          fontSize: getFontSize('base'),
          fontWeight: typography.fontWeight.semibold,
          marginBottom: `${layout.padding.medium}px`
        }}>
          Contact Information
        </h4>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: `${layout.spacing}px`
        }}>
          <p style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: `${layout.spacing}px`,
            color: colors.text,
            fontSize: getFontSize('sm'),
            fontWeight: typography.fontWeight.normal
          }}>
            {React.createElement(icons.phone, { size: 16, color: colors.textSecondary })}
            <span>{getPhone()}</span>
          </p>
          <p style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: `${layout.spacing}px`,
            color: colors.text,
            fontSize: getFontSize('sm'),
            fontWeight: typography.fontWeight.normal
          }}>
            {React.createElement(icons.email, { size: 16, color: colors.textSecondary })}
            <span>{getEmail()}</span>
          </p>
          <p style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: `${layout.spacing}px`,
            color: colors.text,
            fontSize: getFontSize('sm'),
            fontWeight: typography.fontWeight.normal
          }}>
            {React.createElement(icons.location, { size: 16, color: colors.textSecondary })}
            <span>{getAddress()}</span>
          </p>
        </div>
      </div>

      {/* Follow Us */}
      <div>
        <h4 style={{ 
          color: colors.text,
          fontSize: getFontSize('base'),
          fontWeight: typography.fontWeight.semibold,
          marginBottom: `${layout.padding.medium}px`
        }}>
          Follow Us
        </h4>
        <div style={{ 
          display: 'flex', 
          gap: `${layout.spacing}px`
        }}>
          {socialLinks.facebook && (
            <a 
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.primary,
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {React.createElement(icons.facebook, { size: 16, color: colors.background })}
            </a>
          )}
          {socialLinks.twitter && (
            <a 
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.primary,
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {React.createElement(icons.twitter, { size: 16, color: colors.background })}
            </a>
          )}
          {socialLinks.linkedin && (
            <a 
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.primary,
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {React.createElement(icons.linkedin, { size: 16, color: colors.background })}
            </a>
          )}
          {socialLinks.instagram && (
            <a 
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.primary,
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {React.createElement(icons.instagram, { size: 16, color: colors.background })}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
