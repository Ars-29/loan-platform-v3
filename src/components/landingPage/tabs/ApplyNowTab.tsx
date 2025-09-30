'use client';

import React, { useState, useEffect } from 'react';
import { typography } from '@/theme/theme';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { useAuth } from '@/hooks/use-auth';
import Icon from '@/components/ui/Icon';

interface ApplyNowTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
  // NEW: Public mode props
  isPublic?: boolean;
  publicTemplateData?: any;
}

export default function ApplyNowTab({
  selectedTemplate,
  className = '',
  // NEW: Public mode props
  isPublic = false,
  publicTemplateData
}: ApplyNowTabProps) {
  const { user } = useAuth();
  const { getTemplateSync } = useEfficientTemplates();
  
  // Template data fetching - support both public and auth modes
  const templateData = isPublic && publicTemplateData 
    ? publicTemplateData 
    : getTemplateSync(selectedTemplate);

  
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
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  };
  
  const content = templateData?.template?.content || {
    headline: 'Apply for Your Loan',
    subheadline: 'Start your loan application process with our secure online platform',
    ctaText: 'Start Application',
    ctaSecondary: 'Learn More'
  };
  
  const layout = templateData?.template?.layout || {
    alignment: 'center',
    spacing: 18,
    borderRadius: 8,
    padding: { small: 8, medium: 16, large: 24, xlarge: 32 }
  };
  
  const defaultClasses = {
    button: {
      primary: selectedTemplate === 'template2' 
        ? 'px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white'
        : 'px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-gray-300',
      outline: selectedTemplate === 'template2'
        ? 'border-2 px-6 py-3 rounded-lg font-medium transition-all duration-200'
        : 'border-2 px-6 py-3 rounded-lg font-medium transition-all duration-200',
      ghost: selectedTemplate === 'template2'
        ? 'px-4 py-2 rounded-lg font-medium transition-all duration-200'
        : 'px-4 py-2 rounded-lg font-medium transition-all duration-200'
    },
    card: {
      container: 'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200',
      header: 'px-6 py-4 border-b border-gray-200',
      body: 'px-6 py-4',
      footer: 'px-6 py-4 border-t border-gray-200 bg-gray-50'
    },
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
    },
    icon: {
      primary: selectedTemplate === 'template2' 
        ? 'w-12 h-12 rounded-lg flex items-center justify-center mb-4'
        : 'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
      secondary: 'w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3',
      small: selectedTemplate === 'template2'
        ? 'w-8 h-8 rounded-lg flex items-center justify-center'
        : 'w-8 h-8 rounded-lg flex items-center justify-center'
    }
  };
  
  // More defensive approach for template classes
  const templateClasses = templateData?.template?.classes;
  const safeTemplateClasses = templateClasses && typeof templateClasses === 'object' ? templateClasses : {};
  
  const classes = {
    ...defaultClasses,
    ...safeTemplateClasses,
    button: { 
      ...defaultClasses.button, 
      ...(safeTemplateClasses?.button || {}) 
    },
    card: { 
      ...defaultClasses.card, 
      ...(safeTemplateClasses?.card || {}) 
    },
    heading: { 
      ...defaultClasses.heading, 
      ...(safeTemplateClasses?.heading || {}) 
    },
    body: { 
      ...defaultClasses.body, 
      ...(safeTemplateClasses?.body || {}) 
    },
    icon: { 
      ...defaultClasses.icon, 
      ...(safeTemplateClasses?.icon || {}) 
    }
  };
  
  const [applicationType, setApplicationType] = useState<'new' | 'existing'>('new');
  const [showIframe, setShowIframe] = useState(false);

  const handleStartApplication = () => {
    setShowIframe(true);
  };

  const handleExternalRedirect = () => {
    // In a real application, this would redirect to the external loan software
    window.open('https://example-loan-software.com/apply', '_blank');
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className={`${classes.card.header}`}>
        <h2 className={`${classes.heading.h2}`}>
          Apply for Your Loan
        </h2>
        <p className={`${classes.body.base}`}>
          Start your loan application process with our secure online platform
        </p>
      </div>

      {!showIframe ? (
        <>
          {/* Application Type Selection */}
          <div className={`${classes.card.container} mb-8`}>
            <div className={`${classes.card.body}`}>
              <h3 className={`${classes.heading.h4} mb-6`}>
                Choose Your Application Type
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                    applicationType === 'new'
                      ? 'border-gray-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={applicationType === 'new' ? {
                    borderColor: colors.primary,
                    backgroundColor: `${colors.primary}10`
                  } : {}}
                  onClick={() => setApplicationType('new')}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`${classes.icon.primary}`}>
                      <Icon name="plus" size={24} color={colors.primary} />
                    </div>
                    <div>
                      <h4 className={`${classes.heading.h6}`}>
                        New Application
                      </h4>
                      <p className={`${classes.body.small}`}>
                        Start a fresh loan application
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                    applicationType === 'existing'
                      ? 'border-gray-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={applicationType === 'existing' ? {
                    borderColor: colors.primary,
                    backgroundColor: `${colors.primary}10`
                  } : {}}
                  onClick={() => setApplicationType('existing')}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`${classes.icon.primary}`}>
                      <Icon name="document" size={24} color={colors.primary} />
                    </div>
                    <div>
                      <h4 className={`${classes.heading.h6}`}>
                        Continue Application
                      </h4>
                      <p className={`${classes.body.small}`}>
                        Resume your existing application
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Online Application */}
            <div className={`${classes.card.container}`}>
              <div className={`${classes.card.body}`}>
                <div className={`${classes.icon.primary}`}>
                  <Icon name="target" size={24} color={colors.primary} />
                </div>
                <h3 className={`${classes.heading.h5}`}>
                  Online Application
                </h3>
                <p className={`${classes.body.small} mb-4`}>
                  Complete your application securely online with our guided process
                </p>
                <button
                  onClick={handleStartApplication}
                  className={`${classes.button.primary} w-full flex items-center justify-center space-x-2`}
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.background,
                    borderColor: colors.primary
                  }}
                >
                  <Icon name="arrowRight" size={20} color={colors.background} />
                  <span>Start Online Application</span>
                </button>
              </div>
            </div>

            {/* External Application */}
            <div className={`${classes.card.container}`}>
              <div className={`${classes.card.body}`}>
                <div className={`${classes.icon.primary}`}>
                  <Icon name="externalLink" size={24} color={colors.primary} />
                </div>
                <h3 className={`${classes.heading.h5}`}>
                  External Platform
                </h3>
                <p className={`${classes.body.small} mb-4`}>
                  Apply through our integrated loan origination system
                </p>
                <button
                  onClick={handleExternalRedirect}
                  className={`${classes.button.outline} w-full flex items-center justify-center space-x-2`}
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.primary,
                    color: colors.primary
                  }}
                >
                  <Icon name="externalLink" size={20} color={colors.primary} />
                  <span>Go to External Platform</span>
                </button>
              </div>
            </div>
          </div>

          {/* Requirements Section */}
          <div className={`${classes.card.container}`}>
            <div className={`${classes.card.header}`}>
              <h3 className={`${classes.heading.h4}`}>
                Application Requirements
              </h3>
            </div>
            <div className={`${classes.card.body}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className={`${classes.heading.h6} mb-3`}>
                    Required Documents
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <Icon name="check" size={16} color={colors.primary} />
                      <span className={`${classes.body.small}`}>Government-issued ID</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Icon name="check" size={16} color={colors.primary} />
                      <span className={`${classes.body.small}`}>Social Security Number</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Icon name="check" size={16} color={colors.primary} />
                      <span className={`${classes.body.small}`}>Proof of Income</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Icon name="check" size={16} color={colors.primary} />
                      <span className={`${classes.body.small}`}>Bank Statements</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className={`${classes.heading.h6} mb-3`}>
                    Application Process
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <div className={`${classes.icon.small}`}>
                        <span className="text-sm font-bold" style={{ color: colors.text }}>1</span>
                      </div>
                      <span className={`${classes.body.small}`}>Complete Application</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className={`${classes.icon.small}`}>
                        <span className="text-sm font-bold" style={{ color: colors.text }}>2</span>
                      </div>
                      <span className={`${classes.body.small}`}>Upload Documents</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className={`${classes.icon.small}`}>
                        <span className="text-sm font-bold" style={{ color: colors.text }}>3</span>
                      </div>
                      <span className={`${classes.body.small}`}>Review & Submit</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className={`${classes.icon.small}`}>
                        <span className="text-sm font-bold" style={{ color: colors.text }}>4</span>
                      </div>
                      <span className={`${classes.body.small}`}>Get Pre-Approved</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Application Iframe */
        <div className={`${classes.card.container}`}>
          <div className={`${classes.card.header}`}>
            <div className="flex items-center justify-between">
              <h3 className={`${classes.heading.h3}`}>
                Loan Application
              </h3>
              <button
                onClick={() => setShowIframe(false)}
                className={`${classes.button.ghost}`}
              >
                <Icon name="close" size={20} />
              </button>
            </div>
          </div>
          
          <div className={`${classes.card.body}`}>
            <div className="text-center py-8">
              <Icon name="monitor" size={48} color={colors.textSecondary} className="mx-auto mb-4" />
              <h4 className={`${classes.heading.h4} text-gray-600 mb-2`}>
                Application Platform
              </h4>
              <p className={`${classes.body.base} text-gray-500 mb-4`}>
                Your loan application will open in a secure, integrated platform
              </p>
              <button
                onClick={() => setShowIframe(false)}
                className={`${classes.button.primary}`}
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                Back to Application Options
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}