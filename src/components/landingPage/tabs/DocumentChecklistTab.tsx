'use client';

import React, { useState, useEffect } from 'react';
import { typography } from '@/theme/theme';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { useAuth } from '@/hooks/use-auth';
import Icon from '@/components/ui/Icon';

interface DocumentChecklistTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
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
  { id: 12, title: 'Summary' }
];

export default function DocumentChecklistTab({
  selectedTemplate,
  className = ''
}: DocumentChecklistTabProps) {
  const { user } = useAuth();
  const { getTemplateSync } = useEfficientTemplates();
  const templateData = getTemplateSync(selectedTemplate);

  
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
    },
    select: {
      base: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white',
      error: 'w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white'
    }
  };
  const templateClasses = templateData?.template?.classes || {};
  const classes = {
    ...defaultClasses,
    ...templateClasses,
    button: { ...defaultClasses.button, ...(templateClasses.button || {}) },
    card: { ...defaultClasses.card, ...(templateClasses.card || {}) },
    heading: { ...defaultClasses.heading, ...(templateClasses.heading || {}) },
    body: { ...defaultClasses.body, ...(templateClasses.body || {}) },
    icon: { ...defaultClasses.icon, ...(templateClasses.icon || {}) },
    select: { ...defaultClasses.select, ...(templateClasses.select || {}) }
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
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="bankruptcy"
                    value="Yes"
                    checked={formData.bankruptcy === 'Yes'}
                    onChange={(e) => updateFormData('bankruptcy', e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className={`${classes.body.base}`}>Yes</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="bankruptcy"
                    value="No"
                    checked={formData.bankruptcy === 'No'}
                    onChange={(e) => updateFormData('bankruptcy', e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className={`${classes.body.base}`}>No</span>
                </label>
              </div>
            </div>

            {formData.bankruptcy === 'Yes' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80` }}>
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
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="employment"
                    value="Wage Earner"
                    checked={formData.employment === 'Wage Earner'}
                    onChange={(e) => updateFormData('employment', e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className={`${classes.body.base}`}>Wage Earner</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="employment"
                    value="Self Employed / 1099 Contractor"
                    checked={formData.employment === 'Self Employed / 1099 Contractor'}
                    onChange={(e) => updateFormData('employment', e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className={`${classes.body.base}`}>Self Employed / 1099 Contractor</span>
                </label>
              </div>
            </div>

            {formData.employment === 'Wage Earner' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80` }}>
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
                <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80` }}>
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
                  >
                    <option value="" disabled>Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {formData.missingTaxReturn === 'Yes' && (
                  <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80` }}>
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
              >
                <option value="" disabled>Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {formData.ownHome === 'Yes' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80` }}>
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
              >
                <option value="" disabled>Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {formData.payingRent === 'Yes' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80` }}>
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
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80` }}>
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
              >
                <option value="" disabled>Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {formData.secondHome === 'Yes' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80` }}>
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
              >
                <option value="" disabled>Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {formData.rentalIncome === 'Yes' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80` }}>
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
              >
                <option value="" disabled>Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {formData.useForLoan === 'Yes' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80` }}>
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
              >
                <option value="" disabled>Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {formData.giftFunds === 'Yes' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80` }}>
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
              >
                <option value="" disabled>Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {formData.divorced === 'Yes' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80` }}>
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
              >
                <option value="" disabled>Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {formData.childSupport === 'Yes' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80` }}>
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
              >
                <option value="" disabled>Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {formData.irsRepay === 'Yes' && (
              <div className={`${classes.card.container}`} style={{ backgroundColor: `${colors.background}80` }}>
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
          <div className="space-y-6">
            <div className={`${classes.card.container} bg-blue-50`}>
              <div className={`${classes.card.body}`}>
                <h3 className={`${classes.heading.h4} mb-4`}>
                  Your Required Documents Checklist
                </h3>
                <div className="bg-white p-4 rounded-lg border">
                  <pre className={`${classes.body.base} whitespace-pre-wrap`}>
                    • {summary}
                  </pre>
                </div>
                <button
                  onClick={() => window.print()}
                  className={`${classes.button.primary} mt-4`}
                >
                  Print / Save Checklist
                </button>
              </div>
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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className={`${classes.body.small}`} style={{ color: colors.textSecondary }}>
            Step {currentSlide + 1} of {slides.length}
          </span>
          <span className={`${classes.body.small}`} style={{ color: colors.textSecondary }}>
            {Math.round(((currentSlide + 1) / slides.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full rounded-full h-2" style={{ backgroundColor: colors.border }}>
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${((currentSlide + 1) / slides.length) * 100}%`,
              backgroundColor: colors.primary
            }}
          />
        </div>
      </div>

      {/* Current Slide */}
      <div className={`${classes.card.container} mb-6`}>
        <div className={`${classes.card.body}`}>
          <h3 className={`${classes.heading.h4} mb-6`}>
            {slides[currentSlide].title}
          </h3>
          {renderSlide()}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`${classes.button.secondary} ${
            currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{
            backgroundColor: currentSlide === 0 ? `${colors.border}50` : colors.background,
            borderColor: colors.border,
            color: currentSlide === 0 ? `${colors.textSecondary}50` : colors.text
          }}
        >
          <Icon 
            name="chevronLeft" 
            size={20} 
            className="mr-2" 
            color={currentSlide === 0 ? `${colors.textSecondary}50` : colors.text}
          />
          Previous
        </button>
        
        <button
          onClick={nextSlide}
          className={`${classes.button.primary}`}
          style={{
            backgroundColor: colors.primary,
            color: colors.background,
            borderColor: colors.primary
          }}
        >
          {currentSlide < slides.length - 2 ? 'Next' : 
           currentSlide === slides.length - 2 ? 'Generate Summary' : 'Start Over'}
          <Icon 
            name="chevronRight" 
            size={20} 
            className="ml-2" 
            color={colors.background}
          />
        </button>
      </div>
    </div>
  );
}