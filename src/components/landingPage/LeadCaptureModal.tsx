'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { icons } from '@/components/ui/Icon';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanProduct: {
    id: string;
    lenderName: string;
    loanProgram: string;
    loanType: string;
    loanTerm: number;
    interestRate: number;
    apr: number;
    monthlyPayment: number;
    fees: number;
    points: number;
    credits: number;
    lockPeriod: number;
  };
  onSubmit: (leadData: LeadData) => Promise<void>;
  template?: 'template1' | 'template2';
}

export interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  creditScore: string;
  loanDetails: {
    productId: string;
    lenderName: string;
    loanProgram: string;
    loanType: string;
    loanTerm: number;
    interestRate: number;
    apr: number;
    monthlyPayment: number;
    fees: number;
    points: number;
    credits: number;
    lockPeriod: number;
  };
}

export default function LeadCaptureModal({ 
  isOpen, 
  onClose, 
  loanProduct, 
  onSubmit,
  template = 'template1'
}: LeadCaptureModalProps) {
  const { getTemplateSync } = useEfficientTemplates();
  const templateData = getTemplateSync(template);
  
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
    headline: 'Get Started',
    subheadline: 'Complete your information to get started with this loan',
    ctaText: 'Get Started',
    ctaSecondary: 'Cancel'
  };
  
  const layout = templateData?.template?.layout || {
    alignment: 'center',
    spacing: 18,
    borderRadius: 8,
    padding: { small: 8, medium: 16, large: 24, xlarge: 32 }
  };
  
  const defaultClasses = {
    button: {
      primary: 'px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-gray-300'
    },
    card: {
      container: 'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200',
      header: 'px-6 py-4 border-b border-gray-200',
      body: 'px-6 py-4'
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
    input: {
      base: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200',
      error: 'border-red-300 focus:ring-red-500 focus:border-red-500'
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
    input: { ...defaultClasses.input, ...(templateClasses.input || {}) }
  };
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    creditScore: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('🔍 LeadCaptureModal - loanProduct:', loanProduct);
      
      const leadData: LeadData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        creditScore: formData.creditScore.trim(),
        loanDetails: {
          productId: loanProduct.id,
          lenderName: loanProduct.lenderName,
          loanProgram: loanProduct.loanProgram,
          loanType: loanProduct.loanType,
          loanTerm: loanProduct.loanTerm,
          interestRate: loanProduct.interestRate,
          apr: loanProduct.apr,
          monthlyPayment: loanProduct.monthlyPayment,
          fees: loanProduct.fees,
          points: loanProduct.points,
          credits: loanProduct.credits,
          lockPeriod: loanProduct.lockPeriod,
        }
      };
      
      console.log('🔍 LeadCaptureModal - leadData:', leadData);
      
      await onSubmit(leadData);
      
      // Reset form and close modal on success
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        creditScore: '',
      });
      onClose();
      
    } catch (error) {
      console.error('Error submitting lead:', error);
      setErrors({ submit: 'Failed to submit your information. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        creditScore: '',
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          style={{ fontFamily: typography.fontFamily }}
        >
          <div 
            className={`${classes.card.container} max-w-lg w-full max-h-[90vh] overflow-y-auto`}
            style={{ 
              backgroundColor: colors.background,
              borderRadius: `${layout.borderRadius}px`
            }}
          >
            {/* Header */}
            <div className={`${classes.card.header}`} style={{ borderBottomColor: colors.border }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`${classes.heading.h2}`} style={{ color: colors.text }}>
                    {content.headline}
                  </h2>
                  <p className={`${classes.body.small}`} style={{ color: colors.textSecondary }}>
                    {content.subheadline}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="p-2 rounded-md transition-colors hover:bg-gray-100"
                  style={{ 
                    color: colors.textSecondary,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {React.createElement(icons.close, { size: 20 })}
                </button>
              </div>
            </div>

            {/* Loan Product Summary */}
            <div 
              className="p-4 border-b"
              style={{ 
                backgroundColor: `${colors.primary}10`,
                borderBottomColor: colors.border,
                padding: `${layout.padding.medium}px`
              }}
            >
              <h3 className={`${classes.heading.h5}`} style={{ color: colors.text }}>
                Selected Loan Product
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className={`${classes.body.small}`}>
                  <span style={{ color: colors.textSecondary }}>Lender:</span>
                  <span className="ml-1 font-medium" style={{ color: colors.text }}>
                    {loanProduct.lenderName}
                  </span>
                </div>
                <div className={`${classes.body.small}`}>
                  <span style={{ color: colors.textSecondary }}>Program:</span>
                  <span className="ml-1 font-medium" style={{ color: colors.text }}>
                    {loanProduct.loanProgram}
                  </span>
                </div>
                <div className={`${classes.body.small}`}>
                  <span style={{ color: colors.textSecondary }}>Rate:</span>
                  <span className="ml-1 font-medium" style={{ color: colors.text }}>
                    {loanProduct.interestRate.toFixed(3)}%
                  </span>
                </div>
                <div className={`${classes.body.small}`}>
                  <span style={{ color: colors.textSecondary }}>Monthly Payment:</span>
                  <span className="ml-1 font-medium" style={{ color: colors.text }}>
                    ${loanProduct.monthlyPayment.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form 
              onSubmit={handleSubmit} 
              className={`${classes.card.body}`}
              style={{ padding: `${layout.padding.large}px` }}
            >
              <div className="mb-6">
                <h3 className={`${classes.heading.h5} mb-4`} style={{ color: colors.text }}>
                  Your Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`${classes.body.small} font-medium block mb-1`} style={{ color: colors.text }}>
                      First Name *
                    </label>
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      error={errors.firstName || undefined}
                      disabled={isSubmitting}
                      className={errors.firstName ? classes.input.error : classes.input.base}
                    />
                    {errors.firstName && (
                      <p className={`${classes.body.xs} mt-1`} style={{ color: colors.primary }}>
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className={`${classes.body.small} font-medium block mb-1`} style={{ color: colors.text }}>
                      Last Name *
                    </label>
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      error={errors.lastName || undefined}
                      disabled={isSubmitting}
                      className={errors.lastName ? classes.input.error : classes.input.base}
                    />
                    {errors.lastName && (
                      <p className={`${classes.body.xs} mt-1`} style={{ color: colors.primary }}>
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className={`${classes.body.small} font-medium block mb-1`} style={{ color: colors.text }}>
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    error={errors.email || undefined}
                    disabled={isSubmitting}
                    className={errors.email ? classes.input.error : classes.input.base}
                  />
                  {errors.email && (
                    <p className={`${classes.body.xs} mt-1`} style={{ color: colors.primary }}>
                      {errors.email}
                    </p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className={`${classes.body.small} font-medium block mb-1`} style={{ color: colors.text }}>
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    error={errors.phone || undefined}
                    disabled={isSubmitting}
                    className={errors.phone ? classes.input.error : classes.input.base}
                  />
                  {errors.phone && (
                    <p className={`${classes.body.xs} mt-1`} style={{ color: colors.primary }}>
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <label className={`${classes.body.small} font-medium block mb-1`} style={{ color: colors.text }}>
                  Credit Score (Optional)
                </label>
                <Input
                  type="text"
                  name="creditScore"
                  value={formData.creditScore}
                  onChange={handleInputChange}
                  placeholder="e.g., 750 or 700-750"
                  error={errors.creditScore || undefined}
                  disabled={isSubmitting}
                  className={errors.creditScore ? classes.input.error : classes.input.base}
                />
                {errors.creditScore && (
                  <p className={`${classes.body.xs} mt-1`} style={{ color: colors.primary }}>
                    {errors.creditScore}
                  </p>
                )}
              </div>

              {errors.submit && (
                <div 
                  className="p-3 rounded-md mb-4"
                  style={{
                    backgroundColor: `${colors.primary}10`,
                    border: `1px solid ${colors.primary}20`,
                    borderRadius: `${layout.borderRadius}px`
                  }}
                >
                  <p className={`${classes.body.small}`} style={{ color: colors.primary }}>
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className={classes.button.secondary}
                >
                  {content.ctaSecondary}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className={classes.button.primary}
                  style={{ backgroundColor: colors.primary }}
                >
                  {isSubmitting ? 'Submitting...' : content.ctaText}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
