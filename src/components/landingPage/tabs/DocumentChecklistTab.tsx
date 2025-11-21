'use client';

import React, { useState, useEffect } from 'react';
import { typography } from '@/theme/theme';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { useAuth } from '@/hooks/use-auth';
import Icon from '@/components/ui/Icon';

interface DocumentChecklistTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
  // NEW: Public mode props
  isPublic?: boolean;
  publicTemplateData?: any;
}

interface FormData {
  bankruptcy: string;
  employment: string;
  missingTaxReturn: string;
  ownHome: string;
  payingRent: string;
  secondHome: string;
  rentalIncome: string;
  useForLoan: string;
  giftFunds: string;
  divorced: string;
  childSupport: string;
  irsRepay: string;
}

const slides = [
  { id: 0, title: 'Identification & Bankruptcy' },
  { id: 1, title: 'Asset Documentation' },
  { id: 2, title: 'Employment Type' },
  { id: 3, title: 'Home Ownership' },
  { id: 4, title: 'Rental Status' },
  { id: 5, title: 'Second Home' },
  { id: 6, title: 'Rental Income' },
  { id: 7, title: 'Loan Qualification' },
  { id: 8, title: 'Gift Funds' },
  { id: 9, title: 'Divorce Status' },
  { id: 10, title: 'Child Support' },
  { id: 11, title: 'IRS Repayment' },
  { id: 12, title: '' } // No title for summary
];

export default function DocumentChecklistTab({
  selectedTemplate,
  className = '',
  // NEW: Public mode props
  isPublic = false,
  publicTemplateData
}: DocumentChecklistTabProps) {
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
    headline: 'Document Checklist',
    subheadline: 'Complete this checklist to see what documents you need',
    ctaText: 'Next',
    ctaSecondary: 'Previous'
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
        ? 'px-6 py-3 font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white'
        : 'px-6 py-3 font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 font-medium transition-all duration-200 border border-gray-300',
      outline: selectedTemplate === 'template2'
        ? 'border-2 px-6 py-3 font-medium transition-all duration-200'
        : 'border-2 px-6 py-3 font-medium transition-all duration-200',
      ghost: selectedTemplate === 'template2'
        ? 'px-4 py-2 font-medium transition-all duration-200'
        : 'px-4 py-2 font-medium transition-all duration-200'
    },
    card: {
      container: 'bg-white transition-all duration-200',
      header: 'px-6 py-4 border-b border-gray-200',
      body: '',
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
        ? 'w-12 h-12 flex items-center justify-center mb-4'
        : 'w-12 h-12 flex items-center justify-center mb-4',
      secondary: 'w-10 h-10 bg-gray-100 flex items-center justify-center mb-3',
      small: selectedTemplate === 'template2'
        ? 'w-8 h-8 flex items-center justify-center'
        : 'w-8 h-8 flex items-center justify-center'
    },
    select: {
      base: 'w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#01bcc6] focus:border-transparent bg-white',
      error: 'w-full px-3 py-2 border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white'
    }
  };
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
    },
    select: { 
      ...defaultClasses.select, 
      ...(safeTemplateClasses?.select || {}) 
    }
  };
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    bankruptcy: '',
    employment: '',
    missingTaxReturn: '',
    ownHome: '',
    payingRent: '',
    secondHome: '',
    rentalIncome: '',
    useForLoan: '',
    giftFunds: '',
    divorced: '',
    childSupport: '',
    irsRepay: ''
  });
  const [summary, setSummary] = useState<string>('');

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateSlide = (slideIndex: number): boolean => {
    const slide = slides[slideIndex];
    
    switch (slideIndex) {
      case 0: // Identification & Bankruptcy
        return formData.bankruptcy !== '';
      case 1: // Asset Documentation
        return true; // No required fields
      case 2: // Employment Type
        if (formData.employment === '') return false;
        if (formData.employment === 'Self Employed / 1099 Contractor' && formData.missingTaxReturn === '') {
          return false;
        }
        return true;
      case 3: // Home Ownership
        return formData.ownHome !== '';
      case 4: // Rental Status
        return formData.payingRent !== '';
      case 5: // Second Home
        return formData.secondHome !== '';
      case 6: // Rental Income
        return formData.rentalIncome !== '';
      case 7: // Loan Qualification
        return formData.useForLoan !== '';
      case 8: // Gift Funds
        return true; // Optional
      case 9: // Divorce Status
        return formData.divorced !== '';
      case 10: // Child Support
        return formData.childSupport !== '';
      case 11: // IRS Repayment
        return formData.irsRepay !== '';
      default:
        return true;
    }
  };

  // Check if current slide is valid
  const isCurrentSlideValid = () => {
    return validateSlide(currentSlide);
  };

  const nextSlide = () => {
    if (!validateSlide(currentSlide)) {
      alert('Please answer all required questions.');
      return;
    }
    
    if (currentSlide < slides.length - 2) {
      setCurrentSlide(prev => prev + 1);
    } else if (currentSlide === slides.length - 2) {
      generateSummary();
      setCurrentSlide(prev => prev + 1);
    } else {
      // Reset form
      setFormData({
        bankruptcy: '',
        employment: '',
        missingTaxReturn: '',
        ownHome: '',
        payingRent: '',
        secondHome: '',
        rentalIncome: '',
        useForLoan: '',
        giftFunds: '',
        divorced: '',
        childSupport: '',
        irsRepay: ''
      });
      setSummary('');
      setCurrentSlide(0);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const generateSummary = () => {
    const docs = [
      '2 Bank Statements (2 most recent)',
      '401k & Stock Accounts (2 most recent)',
      "Unexpired Driver's License",
      "Unexpired Passport",
      "Copy of Social Security Card"
    ];

    if (formData.bankruptcy === 'Yes') {
      docs.push('Bankruptcy Docs Showing Discharge Date');
    }

    if (formData.employment === 'Wage Earner') {
      docs.push('30 Days Pay Stubs (Most Recent)', '2 Years W-2s (Most Recent)');
    } else if (formData.employment === 'Self Employed / 1099 Contractor') {
      docs.push(
        '2 Years Personal Tax Returns (Most Recent)',
        '2 Years Corporate Tax Returns (Most Recent)',
        '2 Years 1099s (Most Recent)',
        'Business License or Corp Filing'
      );
      if (formData.missingTaxReturn === 'Yes') {
        docs.push('Audited Profit & Loss Statement', 'Proof of YTD Income', 'CPA or Accountant Letter');
      }
    }

    if (formData.ownHome === 'Yes') {
      docs.push('Mortgage Statement', 'Home Insurance w/Declarations and RCE');
    }

    if (formData.payingRent === 'Yes') {
      docs.push('Copy of Lease Agreement', '12 Months Rent Receipts / Checks or Bank Statements');
    } else if (formData.payingRent === 'No') {
      docs.push('Letter from Borrower Living Rent-Free', 'Letter from Person You\'re Living With');
    }

    if (formData.secondHome === 'Yes') {
      docs.push('2nd Home Mortgage Statement', '2nd Home Insurance Docs');
    }

    if (formData.rentalIncome === 'Yes') {
      docs.push('Lease Agreements', '12 Months Rent Income Proof');
    }

    if (formData.useForLoan === 'Yes') {
      docs.push('Lease Agreements', '12 Months Rent Income Proof');
    }

    if (formData.giftFunds === 'Yes') {
      docs.push('Gift Letter', 'Donor Bank Statements Showing Funds');
    }

    if (formData.divorced === 'Yes') {
      docs.push('Complete and Final Divorce Decree (all pages)');
    }

    if (formData.childSupport === 'Yes') {
      docs.push('Child Support Agreement (all pages)');
    }

    if (formData.irsRepay === 'Yes') {
      docs.push('IRS Repayment Agreement or IRS Payoff (all pages)');
    }

    setSummary(docs.join('\n• '));
  };

  const downloadChecklist = () => {
    const docs = summary.split('\n• ').filter(doc => doc.trim());
    const checklistContent = `LOAN DOCUMENT CHECKLIST
Generated on: ${new Date().toLocaleDateString()}

REQUIRED DOCUMENTS:
${docs.map((doc, index) => `${index + 1}. ${doc.replace('• ', '')}`).join('\n')}

---
This checklist was generated based on your loan application responses.
Please gather all required documents before submitting your loan application.`;

    const blob = new Blob([checklistContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `loan-document-checklist-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const printChecklist = () => {
    const docs = summary.split('\n• ').filter(doc => doc.trim());
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Loan Document Checklist</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; font-family: ${typography.fontFamily}, sans-serif; }
              .no-print { display: none !important; }
            }
            body {
              font-family: ${typography.fontFamily}, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid ${colors.primary};
              padding-bottom: 20px;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              color: ${colors.text};
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 16px;
              color: ${colors.textSecondary};
              margin-bottom: 20px;
            }
            .date {
              font-size: 14px;
              color: ${colors.textSecondary};
            }
            .checklist {
              margin-top: 30px;
            }
            .checklist-title {
              font-size: 20px;
              font-weight: bold;
              color: ${colors.text};
              margin-bottom: 20px;
              text-align: center;
            }
            .document-item {
              display: flex;
              align-items: flex-start;
              margin-bottom: 12px;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .document-number {
              background: ${colors.primary};
              color: white;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: bold;
              margin-right: 15px;
              flex-shrink: 0;
            }
            .document-text {
              flex: 1;
              font-size: 14px;
              line-height: 1.5;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: ${colors.textSecondary};
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Loan Document Checklist</div>
            <div class="subtitle">Complete this step-by-step checklist to determine all required documents for your loan application</div>
            <div class="date">Generated on: ${new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="checklist">
            <div class="checklist-title">Your Required Documents Checklist</div>
            ${docs.map((doc, index) => `
              <div class="document-item">
                <div class="document-number">${index + 1}</div>
                <div class="document-text">${doc.replace('• ', '')}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <p>This checklist was generated based on your loan application responses.</p>
            <p>Please gather all required documents before submitting your loan application.</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const renderSlide = () => {
    switch (currentSlide) {
      case 0: // Identification & Bankruptcy
        return (
          <div className="space-y-6">
            <div>
              <label className={`${classes.body.base} font-medium mb-3 block`} style={{ color: colors.text }}>
                Identification <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" checked disabled className="w-5 h-5" />
                  <span className={`${classes.body.base}`}>Unexpired Driver's License</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" checked disabled className="w-5 h-5" />
                  <span className={`${classes.body.base}`}>Unexpired Passport</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" checked disabled className="w-5 h-5" />
                  <span className={`${classes.body.base}`}>Copy of Social Security Card</span>
                </div>
              </div>
              <p className={`${classes.body.small} ml-8`} style={{ color: colors.textSecondary }}>
                Must have two verified forms of ID
              </p>
            </div>

            <div>
              <label className={`${classes.body.base} font-medium mb-3 block`} style={{ color: colors.text }}>
                Have you filed for Bankruptcy? <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="bankruptcy"
                    value="Yes"
                    checked={formData.bankruptcy === 'Yes'}
                    onChange={(e) => updateFormData('bankruptcy', e.target.value)}
                    className="w-4 h-4"
                    style={{
                      accentColor: colors.primary
                    }}
                  />
                  <span className={`${classes.body.base}`}>Yes</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="bankruptcy"
                    value="No"
                    checked={formData.bankruptcy === 'No'}
                    onChange={(e) => updateFormData('bankruptcy', e.target.value)}
                    className="w-4 h-4"
                    style={{
                      accentColor: colors.primary
                    }}
                  />
                  <span className={`${classes.body.base}`}>No</span>
                </label>
              </div>
            </div>

            {formData.bankruptcy === 'Yes' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80`, borderRadius: `${layout.borderRadius}px` }}>
                <div className={`${classes.card.body}`}>
                  <label className={`${classes.heading.h6} mb-3 block`}>
                    Please attach the following bankruptcy documents:
                  </label>
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" checked disabled className="w-5 h-5" />
                    <span className={`${classes.body.base}`}>Bankruptcy Docs Showing Discharge Date</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 1: // Asset Documentation
        return (
          <div>
            <label className={`${classes.body.base} font-medium mb-3 block`} style={{ color: colors.text }}>
              Asset Documentation (required) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-3">
                <input type="checkbox" checked disabled className="w-5 h-5" />
                <span className={`${classes.body.base}`}>2 Bank Statements (2 most recent)</span>
              </div>
              <div className="flex items-center space-x-3">
                <input type="checkbox" checked disabled className="w-5 h-5" />
                <span className={`${classes.body.base}`}>401k & Stock Accounts (2 most recent)</span>
              </div>
            </div>
            <p className={`${classes.body.small} ml-8`} style={{ color: colors.textSecondary }}>
              Please attach all of the above. Must cover most recent 60 days
            </p>
          </div>
        );

      case 2: // Employment Type
        return (
          <div className="space-y-6">
            <div>
              <label className={`${classes.body.base} font-medium mb-3 block`} style={{ color: colors.text }}>
                What Best Describes Your Employment? <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="employment"
                    value="Wage Earner"
                    checked={formData.employment === 'Wage Earner'}
                    onChange={(e) => updateFormData('employment', e.target.value)}
                    className="w-4 h-4"
                    style={{
                      accentColor: colors.primary
                    }}
                  />
                  <span className={`${classes.body.base}`}>Wage Earner</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="employment"
                    value="Self Employed / 1099 Contractor"
                    checked={formData.employment === 'Self Employed / 1099 Contractor'}
                    onChange={(e) => updateFormData('employment', e.target.value)}
                    className="w-4 h-4"
                    style={{
                      accentColor: colors.primary
                    }}
                  />
                  <span className={`${classes.body.base}`}>Self Employed / 1099 Contractor</span>
                </label>
              </div>
            </div>

            {formData.employment === 'Wage Earner' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80`, borderRadius: `${layout.borderRadius}px` }}>
                <div className={`${classes.card.body}`}>
                  <label className={`${classes.heading.h6} mb-3 block`}>
                    Please provide ALL of the following:
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" checked disabled className="w-5 h-5" />
                      <span className={`${classes.body.base}`}>30 Days Pay Stubs (Most Recent)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" checked disabled className="w-5 h-5" />
                      <span className={`${classes.body.base}`}>2 Years W-2s (Most Recent)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formData.employment === 'Self Employed / 1099 Contractor' && (
              <>
                <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80`, borderRadius: `${layout.borderRadius}px` }}>
                  <div className={`${classes.card.body}`}>
                    <label className={`${classes.heading.h6} mb-3 block`}>
                      Please provide ALL of the following:
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" checked disabled className="w-5 h-5" />
                        <span className={`${classes.body.base}`}>2 Years Personal Tax Returns (Most Recent)</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" checked disabled className="w-5 h-5" />
                        <span className={`${classes.body.base}`}>2 Years Corporate Tax Returns (Most Recent)</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" checked disabled className="w-5 h-5" />
                        <span className={`${classes.body.base}`}>2 Years 1099s (Most Recent)</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input type="checkbox" checked disabled className="w-5 h-5" />
                        <span className={`${classes.body.base}`}>Business License or Corp Filing</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`${classes.body.base} font-medium mb-3 block`} style={{ color: colors.text }}>
                    Are you missing any business tax returns? <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formData.missingTaxReturn}
                    onChange={(e) => updateFormData('missingTaxReturn', e.target.value)}
                    className={`${classes.select.base}`}
                    style={{ 
                      borderRadius: `${layout.borderRadius}px`,
                      borderColor: colors.border
                    }}
                  >
                    <option value="" disabled>Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {formData.missingTaxReturn === 'Yes' && (
                  <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80`, borderRadius: `${layout.borderRadius}px` }}>
                    <div className={`${classes.card.body}`}>
                      <label className={`${classes.heading.h6} mb-3 block`}>
                        Please provide ALL of the following:
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <input type="checkbox" checked disabled className="w-5 h-5" />
                          <span className={`${classes.body.base}`}>Audited Profit & Loss Statement</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input type="checkbox" checked disabled className="w-5 h-5" />
                          <span className={`${classes.body.base}`}>Proof of YTD Income</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input type="checkbox" checked disabled className="w-5 h-5" />
                          <span className={`${classes.body.base}`}>CPA or Accountant Letter</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 3: // Home Ownership
        return (
          <div className="space-y-6">
            <div>
              <label className={`${classes.body.base} font-medium mb-3 block`} style={{ color: colors.text }}>
                Do you currently own a home? <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.ownHome}
                onChange={(e) => updateFormData('ownHome', e.target.value)}
                className={`${classes.select.base}`}
                style={{ 
                  borderRadius: `${layout.borderRadius}px`,
                  borderColor: colors.border
                }}
              >
                <option value="" disabled>Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {formData.ownHome === 'Yes' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80`, borderRadius: `${layout.borderRadius}px` }}>
                <div className={`${classes.card.body}`}>
                  <label className={`${classes.heading.h6} mb-3 block`}>
                    Please provide ALL of the following:
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" checked disabled className="w-5 h-5" />
                      <span className={`${classes.body.base}`}>Mortgage Statement</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" checked disabled className="w-5 h-5" />
                      <span className={`${classes.body.base}`}>Home Insurance w/Declarations and RCE</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 4: // Rental Status
        return (
          <div className="space-y-6">
            <div>
              <label className={`${classes.body.base} font-medium mb-3 block`} style={{ color: colors.text }}>
                Are you paying rent? <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.payingRent}
                onChange={(e) => updateFormData('payingRent', e.target.value)}
                className={`${classes.select.base}`}
                style={{ 
                  borderRadius: `${layout.borderRadius}px`,
                  borderColor: colors.border
                }}
              >
                <option value="" disabled>Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {formData.payingRent === 'Yes' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80`, borderRadius: `${layout.borderRadius}px` }}>
                <div className={`${classes.card.body}`}>
                  <label className={`${classes.heading.h6} mb-3 block`}>
                    Please provide ALL of the following:
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" checked disabled className="w-5 h-5" />
                      <span className={`${classes.body.base}`}>Copy of Lease Agreement</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" checked disabled className="w-5 h-5" />
                      <span className={`${classes.body.base}`}>12 Months Rent Receipts / Checks or Bank Statements</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formData.payingRent === 'No' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80`, borderRadius: `${layout.borderRadius}px` }}>
                <div className={`${classes.card.body}`}>
                  <label className={`${classes.heading.h6} mb-3 block`}>
                    Required document:
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" checked disabled className="w-5 h-5" />
                      <span className={`${classes.body.base}`}>Letter from Borrower Living Rent-Free</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" checked disabled className="w-5 h-5" />
                      <span className={`${classes.body.base}`}>Letter from Person You're Living With</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 5: // Second Home
        return (
          <div className="space-y-6">
            <div>
              <label className={`${classes.body.base} font-medium mb-3 block`} style={{ color: colors.text }}>
                Do you own a 2nd Home or Investment Property? <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.secondHome}
                onChange={(e) => updateFormData('secondHome', e.target.value)}
                className={`${classes.select.base}`}
                style={{ 
                  borderRadius: `${layout.borderRadius}px`,
                  borderColor: colors.border
                }}
              >
                <option value="" disabled>Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {formData.secondHome === 'Yes' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80`, borderRadius: `${layout.borderRadius}px` }}>
                <div className={`${classes.card.body}`}>
                  <label className={`${classes.heading.h6} mb-3 block`}>
                    Please provide ALL of the following:
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" checked disabled className="w-5 h-5" />
                      <span className={`${classes.body.base}`}>2nd Home Mortgage Statement</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" checked disabled className="w-5 h-5" />
                      <span className={`${classes.body.base}`}>2nd Home Insurance Docs</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 6: // Rental Income
        return (
          <div className="space-y-6">
            <div>
              <label className={`${classes.body.base} font-medium mb-3 block`} style={{ color: colors.text }}>
                Do you receive rental income? <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.rentalIncome}
                onChange={(e) => updateFormData('rentalIncome', e.target.value)}
                className={`${classes.select.base}`}
                style={{ 
                  borderRadius: `${layout.borderRadius}px`,
                  borderColor: colors.border
                }}
              >
                <option value="" disabled>Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {formData.rentalIncome === 'Yes' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80`, borderRadius: `${layout.borderRadius}px` }}>
                <div className={`${classes.card.body}`}>
                  <label className={`${classes.heading.h6} mb-3 block`}>
                    Please provide ALL of the following:
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" checked disabled className="w-5 h-5" />
                      <span className={`${classes.body.base}`}>Lease Agreements</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" checked disabled className="w-5 h-5" />
                      <span className={`${classes.body.base}`}>12 Months Rent Income Proof</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 7: // Loan Qualification
        return (
          <div className="space-y-6">
            <div>
              <label className={`${classes.body.base} font-medium mb-3 block`} style={{ color: colors.text }}>
                Will you use rental income to qualify? <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.useForLoan}
                onChange={(e) => updateFormData('useForLoan', e.target.value)}
                className={`${classes.select.base}`}
                style={{ 
                  borderRadius: `${layout.borderRadius}px`,
                  borderColor: colors.border
                }}
              >
                <option value="" disabled>Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {formData.useForLoan === 'Yes' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80`, borderRadius: `${layout.borderRadius}px` }}>
                <div className={`${classes.card.body}`}>
                  <label className={`${classes.heading.h6} mb-3 block`}>
                    Please provide ALL of the following:
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" checked disabled className="w-5 h-5" />
                      <span className={`${classes.body.base}`}>Lease Agreements</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" checked disabled className="w-5 h-5" />
                      <span className={`${classes.body.base}`}>12 Months Rent Income Proof</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 8: // Gift Funds
        return (
          <div className="space-y-6">
            <div>
              <label className={`${classes.body.base} font-medium mb-3 block`} style={{ color: colors.text }}>
                Will you use gift funds for your down payment?
              </label>
              <select
                value={formData.giftFunds}
                onChange={(e) => updateFormData('giftFunds', e.target.value)}
                className={`${classes.select.base}`}
                style={{ 
                  borderRadius: `${layout.borderRadius}px`,
                  borderColor: colors.border
                }}
              >
                <option value="" disabled>Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {formData.giftFunds === 'Yes' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80`, borderRadius: `${layout.borderRadius}px` }}>
                <div className={`${classes.card.body}`}>
                  <label className={`${classes.heading.h6} mb-3 block`}>
                    Please provide ALL of the following:
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" checked disabled className="w-5 h-5" />
                      <span className={`${classes.body.base}`}>Gift Letter</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" checked disabled className="w-5 h-5" />
                      <span className={`${classes.body.base}`}>Donor Bank Statements Showing Funds</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 9: // Divorce Status
        return (
          <div className="space-y-6">
            <div>
              <label className={`${classes.body.base} font-medium mb-3 block`} style={{ color: colors.text }}>
                Are you divorced or currently going through a divorce? <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.divorced}
                onChange={(e) => updateFormData('divorced', e.target.value)}
                className={`${classes.select.base}`}
                style={{ 
                  borderRadius: `${layout.borderRadius}px`,
                  borderColor: colors.border
                }}
              >
                <option value="" disabled>Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {formData.divorced === 'Yes' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80`, borderRadius: `${layout.borderRadius}px` }}>
                <div className={`${classes.card.body}`}>
                  <label className={`${classes.heading.h6} mb-3 block`}>
                    Please provide the following Divorce Documentation
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" checked disabled className="w-5 h-5" />
                      <span className={`${classes.body.base}`}>Complete and Final Divorce Decree (all pages)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 10: // Child Support
        return (
          <div className="space-y-6">
            <div>
              <label className={`${classes.body.base} font-medium mb-3 block`} style={{ color: colors.text }}>
                Are you required to pay child support? <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.childSupport}
                onChange={(e) => updateFormData('childSupport', e.target.value)}
                className={`${classes.select.base}`}
                style={{ 
                  borderRadius: `${layout.borderRadius}px`,
                  borderColor: colors.border
                }}
              >
                <option value="" disabled>Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {formData.childSupport === 'Yes' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80`, borderRadius: `${layout.borderRadius}px` }}>
                <div className={`${classes.card.body}`}>
                  <label className={`${classes.heading.h6} mb-3 block`}>
                    Please provide documentation of the child support agreement
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" checked disabled className="w-5 h-5" />
                      <span className={`${classes.body.base}`}>Child Support Agreement (all pages)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 11: // IRS Repayment
        return (
          <div className="space-y-6">
            <div>
              <label className={`${classes.body.base} font-medium mb-3 block`} style={{ color: colors.text }}>
                Are you in an IRS repayment agreement? <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={formData.irsRepay}
                onChange={(e) => updateFormData('irsRepay', e.target.value)}
                className={`${classes.select.base}`}
                style={{ 
                  borderRadius: `${layout.borderRadius}px`,
                  borderColor: colors.border
                }}
              >
                <option value="" disabled>Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {formData.irsRepay === 'Yes' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80`, borderRadius: `${layout.borderRadius}px` }}>
                <div className={`${classes.card.body}`}>
                  <label className={`${classes.heading.h6} mb-3 block`}>
                    Please provide a copy of your IRS Repayment Agreement
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" checked disabled className="w-5 h-5" />
                      <span className={`${classes.body.base}`}>IRS Repayment Agreement or IRS Payoff (all pages)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 12: // Summary
        return (
          <div className="w-full max-w-4xl mx-auto">
            {/* Summary Content */}
            <div className="bg-white rounded-2xl" style={{ 
              borderColor: colors.border,
              borderRadius: `${layout.borderRadius}px`
            }}>
              <h3 
                className="text-xl @sm:text-2xl font-bold mb-6 text-center"
                style={{ 
                  color: colors.text,
                  fontFamily: typography.fontFamily,
                  fontSize: '1.5rem',
                  fontWeight: typography.fontWeight.bold
                }}
              >
                Summary
              </h3>
              
              <div className="mb-6">
                <h4 
                  className="text-lg @sm:text-xl font-semibold mb-4"
                  style={{ 
                    color: colors.text,
                    fontFamily: typography.fontFamily,
                    fontSize: '1.1rem @sm:1.25rem',
                    fontWeight: typography.fontWeight.semibold
                  }}
                >
                  Your Required Documents Checklist
                </h4>
                
                <div className="space-y-3">
                  {summary.split('\n• ').map((doc, index) => (
                    doc.trim() && (
                      <div 
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50"
                        style={{ 
                          backgroundColor: index % 2 === 0 ? `${colors.primary}05` : 'transparent',
                          borderRadius: `${layout.borderRadius}px`
                        }}
                      >
                        <div 
                          className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                          style={{ backgroundColor: colors.primary }}
                        />
                        <span 
                          className="text-base leading-relaxed"
                          style={{ 
                            color: colors.text,
                            fontFamily: typography.fontFamily,
                            fontSize: '1rem',
                            fontWeight: typography.fontWeight.normal
                          }}
                        >
                          {doc.replace('• ', '')}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col @sm:flex-row gap-2 @sm:gap-4 justify-center">
                <button
                  onClick={downloadChecklist}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 @sm:px-6 @sm:py-3 text-xs @sm:text-base font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.background,
                    borderRadius: `${layout.borderRadius}px`,
                    fontFamily: typography.fontFamily,
                    fontWeight: typography.fontWeight.semibold,
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.secondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary;
                  }}
                >
                  <Icon name="download" size={16} color={colors.background} />
                  Download Checklist
                </button>
                
                <button
                  onClick={printChecklist}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 @sm:px-6 @sm:py-3 text-xs @sm:text-base font-semibold transition-all duration-300 transform hover:scale-105 border-2 hover:shadow-lg"
                  style={{
                    backgroundColor: colors.background,
                    color: colors.primary,
                    borderColor: colors.primary,
                    borderRadius: `${layout.borderRadius}px`,
                    fontFamily: typography.fontFamily,
                    fontWeight: typography.fontWeight.semibold
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${colors.primary}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.background;
                  }}
                >
                  <Icon name="fileText" size={16} color={colors.primary} />
                  Print Checklist
                </button>
              </div>
              <br />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className={`${classes.card.header}`}>
        <h2 className={`${classes.heading.h2}`}>
          Loan Document Checklist
        </h2>
        <p className={`${classes.body.base}`}>
          Complete this step-by-step checklist to determine all required documents for your loan application
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <span className={`${classes.body.small}`} style={{ color: colors.textSecondary }}>
            Step {currentSlide + 1} of {slides.length}
          </span>
          <span className={`${classes.body.small}`} style={{ color: colors.textSecondary }}>
            {Math.round(((currentSlide + 1) / slides.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full h-2" style={{ backgroundColor: colors.border, borderRadius: `${layout.borderRadius}px` }}>
          <div 
            className="h-2 transition-all duration-300"
            style={{ 
              width: `${((currentSlide + 1) / slides.length) * 100}%`,
              backgroundColor: colors.primary,
              borderRadius: `${layout.borderRadius}px`
            }}
          />
        </div>
      </div>

      {/* Current Slide */}
      <div className={`${classes.card.container} mb-6 border-0 !shadow-none`} style={{ borderRadius: `${layout.borderRadius}px` }}>
        <div className={`p-0`}>
          <h3 className={`${classes.heading.h4} mb-6`}>
            {slides[currentSlide]?.title || ''}
          </h3>
          {renderSlide()}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center gap-2 ">
        {/* Left Side - Previous Button */}
        <div>
          {currentSlide > 0 ? (
             <button
               onClick={prevSlide}
               className="flex items-center justify-center gap-2 px-3 py-2 @sm:px-6 @sm:py-3 font-medium transition-colors text-[13px] @sm:text-base"
               style={{
                 backgroundColor: colors.primary,
                 color: colors.background,
                 borderColor: colors.primary,
                 borderRadius: `${layout.borderRadius}px`,
                 border: 'none',
                 minWidth: '80px'
               }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary;
              }}
            >
              <Icon 
                name="chevronLeft" 
                size={16} 
                color={colors.background}
              />
              <span>Previous</span>
            </button>
          ) : (
            <div style={{ minWidth: '120px' }}></div>
          )}
        </div>
        
        {/* Right Side - Next/Generate Summary/Start Over Button */}
        <div>
          {/* Next Button */}
          {currentSlide < slides.length - 2 && (
            <button
              onClick={nextSlide}
              disabled={!isCurrentSlideValid()}
              className={`flex items-center justify-center gap-2 px-3 py-2 @sm:px-6 @sm:py-3 font-medium transition-colors text-[13px] @sm:text-base ${
                !isCurrentSlideValid() ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
              style={{
                backgroundColor: isCurrentSlideValid() ? colors.primary : colors.border,
                color: isCurrentSlideValid() ? colors.background : colors.textSecondary,
                borderColor: colors.primary,
                borderRadius: `${layout.borderRadius}px`,
                border: 'none',
                minWidth: '120px'
              }}
              onMouseEnter={(e) => {
                if (isCurrentSlideValid()) {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }
              }}
              onMouseLeave={(e) => {
                if (isCurrentSlideValid()) {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }
              }}
            >
              <span>Next</span>
              <Icon 
                name="chevronRight" 
                size={16} 
                color={isCurrentSlideValid() ? colors.background : colors.textSecondary}
              />
            </button>
          )}
          
          {/* Generate Summary Button */}
          {currentSlide === slides.length - 2 && (
            <button
              onClick={nextSlide}
              disabled={!isCurrentSlideValid()}
              className={`flex items-center justify-center gap-1 px-4 py-2 @sm:px-6 @sm:py-3 font-medium transition-colors text-[13px] @sm:text-base ${
                !isCurrentSlideValid() ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
              style={{
                backgroundColor: isCurrentSlideValid() ? colors.primary : colors.border,
                color: isCurrentSlideValid() ? colors.background : colors.textSecondary,
                borderColor: colors.primary,
                borderRadius: `${layout.borderRadius}px`,
                border: 'none',
                minWidth: '160px'
              }}
              onMouseEnter={(e) => {
                if (isCurrentSlideValid()) {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }
              }}
              onMouseLeave={(e) => {
                if (isCurrentSlideValid()) {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }
              }}
            >
              <Icon 
                name="fileText" 
                size={16} 
                color={isCurrentSlideValid() ? colors.background : colors.textSecondary}
              />
              <span>Generate Summary</span>
            </button>
          )}
          
          {/* Start Over Button */}
          {currentSlide === slides.length - 1 && (
            <button
              onClick={nextSlide}
              className="flex items-center justify-center gap-2 @sm:px-6 @sm:py-3 px-4 py-2 font-medium transition-colors text-[13px] @sm:text-base"
              style={{
                backgroundColor: colors.primary,
                color: colors.background,
                borderColor: colors.primary,
                borderRadius: `${layout.borderRadius}px`,
                border: 'none',
                minWidth: '140px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary;
              }}
            >
              <Icon 
                name="refresh" 
                size={16} 
                color={colors.background}
              />
              <span>Start Over</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}