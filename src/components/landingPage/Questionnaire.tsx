'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import Link from 'next/link';
import { spacing, borderRadius, shadows, typography } from '@/theme/theme';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { icons } from '@/components/ui/Icon';

// Memoized step map to prevent recreation on every render
const STEP_MAP: Record<string, number> = {
  'landing': 0,
  'purchase-credit-score': 1,
  'refinance-veteran': 1,
  'purchase-down-payment-low': 2,
  'purchase-down-payment-mid': 2,
  'purchase-military': 2,
  'purchase-rural': 3,
  'purchase-construction': 3,
  'purchase-selling-home': 3,
  'refinance-veteran-purpose': 2,
  'refinance-non-veteran-purpose': 2,
  'refinance-veteran-equity': 3,
  'refinance-non-veteran-equity': 3,
  'refinance-lower-rate': 3,
};

interface QuestionnaireProps {
  template?: 'template1' | 'template2';
  // NEW: Public mode props
  isPublic?: boolean;
  publicTemplateData?: any;
}

function Questionnaire({ 
  template = 'template1',
  // NEW: Public mode props
  isPublic = false,
  publicTemplateData
}: QuestionnaireProps) {
  const { getTemplateSync } = useEfficientTemplates();
  
  // Template data fetching - support both public and auth modes
  const templateData = isPublic && publicTemplateData 
    ? publicTemplateData 
    : getTemplateSync(template);
  const colors = templateData?.template?.colors || {
    primary: '#ec4899',
    secondary: '#3b82f6',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };
  
  // Debug logging for template colors
  console.log('🔍 Questionnaire Debug:', {
    template,
    templateData,
    colors,
    primaryColor: colors.primary,
    backgroundColor: colors.background,
    timestamp: new Date().toISOString()
  });
  const [currentStep, setCurrentStep] = useState('landing');
  const [stepHistory, setStepHistory] = useState<string[]>(['landing']);
  const [isFinalized, setIsFinalized] = useState(false);

  // Memoized handlers to prevent unnecessary re-renders
  const handleStepChange = useCallback((step: string) => {
    setStepHistory(prev => [...prev, step]);
    setCurrentStep(step);
  }, []);

  const handleBack = useCallback(() => {
    if (stepHistory.length > 1) {
      const newHistory = stepHistory.slice(0, -1);
      setStepHistory(newHistory);
      setCurrentStep(newHistory[newHistory.length - 1]);
      setIsFinalized(false); // Reset finalized state when going back
    }
  }, [stepHistory]);

  const handleFinalize = useCallback(() => {
    setIsFinalized(true);
    // You can add additional logic here like analytics tracking, etc.
    console.log('Questionnaire finalized!', {
      currentStep,
      stepHistory,
      finalRecommendation: currentStep
    });
  }, [currentStep, stepHistory]);

  // Memoized calculations
  const stepNumber = useMemo(() => {
    return STEP_MAP[currentStep] || 0;
  }, [currentStep]);

  const totalSteps = useMemo(() => {
    if (currentStep.includes('purchase-')) return 4;
    if (currentStep.includes('refinance-')) return 4;
    return 1;
  }, [currentStep]);

  // Memoized progress indicator visibility
  const showProgress = useMemo(() => {
    return currentStep !== 'landing' && 
           !currentStep.includes('-loan') && 
           !currentStep.includes('heloc') && 
           !currentStep.includes('refinance') && 
           !currentStep.includes('streamline') && 
           !currentStep.includes('irrrl');
  }, [currentStep]);

  // Memoized check if user is on a result page
  const isOnResultPage = useMemo(() => {
    return currentStep.includes('-loan') || 
           currentStep.includes('heloc') || 
           currentStep.includes('refinance') || 
           currentStep.includes('streamline') || 
           currentStep.includes('irrrl');
  }, [currentStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 'landing':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg 
          }}>
            <h3 style={{ 
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text, 
              marginBottom: spacing.sm 
            }}>
              Select Your Loan Purpose
            </h3>
            <p style={{ 
              fontSize: typography.fontSize.base, 
              color: colors.textSecondary, 
              marginBottom: spacing.lg 
            }}>
              Choose the option that best describes your situation
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: spacing.md 
            }}>
              <button 
                onClick={() => handleStepChange('purchase-credit-score')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                <icons.homePurchase size={20} color={colors.background} />
                Home Purchase
              </button>
              <button 
                onClick={() => handleStepChange('refinance-veteran')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                <icons.homeRefinance size={20} color={colors.background} />
                Home Refinance
              </button>
            </div>
          </div>
        );

      case 'purchase-credit-score':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg 
          }}>
            <h3 style={{ 
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text, 
              marginBottom: spacing.sm 
            }}>
              What&apos;s Your Credit Score?
            </h3>
            <p style={{ 
              fontSize: typography.fontSize.base, 
              color: colors.textSecondary, 
              marginBottom: spacing.lg 
            }}>
              Your credit score helps determine which loan options are available to you
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: spacing.md 
            }}>
              <button 
                onClick={() => handleStepChange('fha-loan')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                <icons.rates size={20} color={colors.background} />
                Below 580
              </button>
              <button 
                onClick={() => handleStepChange('purchase-down-payment-low')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                <icons.calculators size={20} color={colors.background} />
                580-619
              </button>
              <button 
                onClick={() => handleStepChange('purchase-down-payment-mid')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                <icons.trendingUp size={20} color={colors.background} />
                620-639
              </button>
              <button 
                onClick={() => handleStepChange('purchase-military')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                <icons.star size={20} color={colors.background} />
                640 or higher
              </button>
            </div>
          </div>
        );

      case 'purchase-down-payment-low':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg 
          }}>
            <h3 style={{ 
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text, 
              marginBottom: spacing.sm 
            }}>
              How Much Can You Put Down?
            </h3>
            <p style={{ 
              fontSize: typography.fontSize.base, 
              color: colors.textSecondary, 
              marginBottom: spacing.lg 
            }}>
              Your down payment amount affects your loan options and monthly payments
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: spacing.md 
            }}>
              <button 
                onClick={() => handleStepChange('fha-loan')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                <icons.calculators size={20} color={colors.background} />
                Less than 3.5%
              </button>
              <button 
                onClick={() => handleStepChange('dpa-loan')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                <icons.calculators size={20} color={colors.background} />
                3.5% or more
              </button>
            </div>
          </div>
        );

      case 'purchase-down-payment-mid':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg 
          }}>
            <h3 style={{ 
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text, 
              marginBottom: spacing.lg 
            }}>
              How Much Can You Put Down?
            </h3>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: spacing.md 
            }}>
              <button 
                onClick={() => handleStepChange('dpa-loan')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                Less than 3%
              </button>
              <button 
                onClick={() => handleStepChange('fha-loan')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                3-5%
              </button>
              <button 
                onClick={() => handleStepChange('conventional-loan')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                5% or more
              </button>
            </div>
          </div>
        );

      case 'purchase-military':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg 
          }}>
            <h3 style={{ 
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text, 
              marginBottom: spacing.sm 
            }}>
              Are You a Veteran or Active Military?
            </h3>
            <p style={{ 
              fontSize: typography.fontSize.base, 
              color: colors.textSecondary, 
              marginBottom: spacing.lg 
            }}>
              VA loans offer excellent benefits including no down payment requirements
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: spacing.md 
            }}>
              <button 
                onClick={() => handleStepChange('va-loan')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                <icons.star size={20} color={colors.background} />
                Yes
              </button>
              <button 
                onClick={() => handleStepChange('purchase-rural')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                <icons.cancel size={20} color={colors.background} />
                No
              </button>
            </div>
          </div>
        );

      case 'purchase-rural':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg 
          }}>
            <h3 style={{ 
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text, 
              marginBottom: spacing.sm 
            }}>
              Is the Property in a Rural Area?
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: spacing.md 
            }}>
              <button 
                onClick={() => handleStepChange('usda-loan')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                Yes
              </button>
              <button 
                onClick={() => handleStepChange('purchase-construction')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                No
              </button>
            </div>
          </div>
        );

      case 'purchase-construction':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg 
          }}>
            <h3 style={{ 
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text, 
              marginBottom: spacing.sm 
            }}>
              Do You Need to Finance Construction?
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: spacing.md 
            }}>
              <button 
                onClick={() => handleStepChange('construction-loan')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                Yes
              </button>
              <button 
                onClick={() => handleStepChange('purchase-selling-home')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                No
              </button>
            </div>
          </div>
        );

      case 'purchase-selling-home':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg 
          }}>
            <h3 style={{ 
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text, 
              marginBottom: spacing.sm 
            }}>
              Are You Selling Your Current Home?
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: spacing.md 
            }}>
              <button 
                onClick={() => handleStepChange('bridge-loan')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                Yes
              </button>
              <button 
                onClick={() => handleStepChange('conventional-loan')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                No
              </button>
            </div>
          </div>
        );

      case 'refinance-veteran':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg 
          }}>
            <h3 style={{ 
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text, 
              marginBottom: spacing.sm 
            }}>
              Are You a Veteran?
            </h3>
            <p style={{ 
              fontSize: typography.fontSize.base, 
              color: colors.textSecondary, 
              marginBottom: spacing.lg 
            }}>
              Veterans have access to special refinance programs with great benefits
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: spacing.md 
            }}>
              <button 
                onClick={() => handleStepChange('refinance-veteran-purpose')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                <icons.star size={20} color={colors.background} />
                Yes
              </button>
              <button 
                onClick={() => handleStepChange('refinance-non-veteran-purpose')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                <icons.cancel size={20} color={colors.background} />
                No
              </button>
            </div>
          </div>
        );

      case 'refinance-veteran-purpose':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg 
          }}>
            <h3 style={{ 
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text, 
              marginBottom: spacing.sm 
            }}>
              What&apos;s Your Refinance Goal?
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: spacing.md 
            }}>
              <button 
                onClick={() => handleStepChange('refinance-veteran-equity')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                Access Equity
              </button>
              <button 
                onClick={() => handleStepChange('va-irrrl')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                Lower Rate
              </button>
            </div>
          </div>
        );

      case 'refinance-veteran-equity':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg 
          }}>
            <h3 style={{ 
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text, 
              marginBottom: spacing.sm 
            }}>
              How Do You Want to Access Equity?
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: spacing.md 
            }}>
              <button 
                onClick={() => handleStepChange('heloc')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                Open Line of Credit
              </button>
              <button 
                onClick={() => handleStepChange('cash-out-refinance')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                Cash Out Equity
              </button>
            </div>
          </div>
        );

      case 'refinance-non-veteran-purpose':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg 
          }}>
            <h3 style={{ 
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text, 
              marginBottom: spacing.sm 
            }}>
              What&apos;s Your Refinance Goal?
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: spacing.md 
            }}>
              <button 
                onClick={() => handleStepChange('refinance-non-veteran-equity')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                Access Equity
              </button>
              <button 
                onClick={() => handleStepChange('refinance-lower-rate')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                Lower Rate
              </button>
            </div>
          </div>
        );

      case 'refinance-non-veteran-equity':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg 
          }}>
            <h3 style={{ 
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text, 
              marginBottom: spacing.sm 
            }}>
              How Do You Want to Access Equity?
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: spacing.md 
            }}>
              <button 
                onClick={() => handleStepChange('heloc')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                Open Line of Credit
              </button>
              <button 
                onClick={() => handleStepChange('cash-out-refinance')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                Cash Out Equity
              </button>
            </div>
          </div>
        );

      case 'refinance-lower-rate':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg 
          }}>
            <h3 style={{ 
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text, 
              marginBottom: spacing.sm 
            }}>
              What&apos;s Your Current Loan Type?
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: spacing.md 
            }}>
              <button 
                onClick={() => handleStepChange('fha-streamline')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                FHA
              </button>
              <button 
                onClick={() => handleStepChange('usda-streamline')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                USDA
              </button>
              <button 
                onClick={() => handleStepChange('conventional-streamline')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                Conventional
              </button>
              <button 
                onClick={() => handleStepChange('rate-term-refinance')}
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                Other/Not Sure
              </button>
            </div>
          </div>
        );

      // Result Cards
      case 'conventional-loan':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg,
            border: `2px solid ${colors.primary}20`
          }}>
            <h3 style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: spacing.sm,
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text, 
              marginBottom: spacing.sm 
            }}>
              <icons.target size={24} color={colors.primary} />
              Recommended: Conventional Loan
            </h3>
            <p style={{ 
              fontSize: typography.fontSize.base, 
              color: colors.textSecondary, 
              marginBottom: spacing.lg 
            }}>
              A conventional loan might be your best option. These loans often offer competitive rates and flexible terms.
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center' 
            }}>
              <Link 
                href="/?loanType=Conventional" 
                style={{
                  backgroundColor:colors.primary,
                  color: colors.background,
                  borderColor: colors.primary
                }}
              >
                <icons.applyNow size={20} color={colors.background} />
                Get Started
              </Link>
            </div>
          </div>
        );

      case 'va-loan':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg,
            border: `2px solid ${colors.primary}20`
          }}>
            <h3 style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: spacing.sm,
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text, 
              marginBottom: spacing.sm 
            }}>
              <icons.target size={24} color={colors.primary} />
              Recommended: VA Loan
            </h3>
            <p style={{ 
              fontSize: typography.fontSize.base, 
              color: colors.textSecondary, 
              marginBottom: spacing.lg 
            }}>
              As a veteran or active military member, a VA loan could offer you excellent benefits, including no down payment options.
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center' 
            }}>
              <Link 
                href="/?loanType=VA" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.sm,
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: `${colors.primary} !important`,
                  color: `${colors.background} !important`,
                  border: 'none !important',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <icons.applyNow size={20} color={colors.background} />
                Get Started
              </Link>
            </div>
          </div>
        );

      case 'fha-loan':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg,
            border: `2px solid ${colors.primary}20`
          }}>
            <h3 style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: spacing.sm,
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text, 
              marginBottom: spacing.sm 
            }}>
              <icons.target size={24} color={colors.primary} />
              Recommended: FHA Loan
            </h3>
            <p style={{ 
              fontSize: typography.fontSize.base, 
              color: colors.textSecondary, 
              marginBottom: spacing.lg 
            }}>
              An FHA loan might be ideal for you, offering lower down payment requirements and more flexible credit guidelines.
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center' 
            }}>
              <Link 
                href="/?loanType=FHA" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: spacing.sm,
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: `${colors.primary} !important`,
                  color: `${colors.background} !important`,
                  border: 'none !important',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <icons.applyNow size={20} color={colors.background} />
                Get Started
              </Link>
            </div>
          </div>
        );

      case 'usda-loan':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg,
            border: `2px solid ${colors.primary}20`
          }}>
            <h3 style={{ 
              fontSize: typography.fontSize.xl, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text, 
              marginBottom: spacing.sm 
            }}>
              Recommended: USDA Loan
            </h3>
            <p style={{ 
              fontSize: typography.fontSize.base, 
              color: colors.textSecondary, 
              marginBottom: spacing.lg 
            }}>
              For rural properties, a USDA loan could offer you favorable terms, including potentially no down payment.
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center' 
            }}>
              <Link 
                href="/?loanType=USDA" 
                style={{ 
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: `${colors.primary} !important`,
                  color: `${colors.background} !important`,
                  border: 'none !important',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Get Started
              </Link>
            </div>
          </div>
        );

      case 'dpa-loan':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg,
            border: `2px solid ${colors.primary}20`
          }}>
            <h3>Recommended: Down Payment Assistance (DPA) Loan</h3>
            <p>A DPA loan could help you with your down payment, making homeownership more accessible.</p>
            <Link 
              href="/?loanType=Conventional&dpa=true" 
              style={{ 
                padding: `${spacing.md} ${spacing.lg}`,
                backgroundColor: `${colors.primary} !important`,
                color: `${colors.background} !important`,
                border: 'none !important',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Get Started
            </Link>
          </div>
        );

      case 'construction-loan':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg,
            border: `2px solid ${colors.primary}20`
          }}>
            <h3>Recommended: Construction Loan</h3>
            <p>A construction loan can help you finance both the purchase of land and the construction of your new home.</p>
            <Link href="/?loanType=Conventional&construction=true" style={{ 
                padding: `${spacing.md} ${spacing.lg}`,
                backgroundColor: `${colors.primary} !important`,
                color: `${colors.background} !important`,
                border: 'none !important',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
              Get Started
            </Link>
          </div>
        );

      case 'bridge-loan':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg,
            border: `2px solid ${colors.primary}20`
          }}>
            <h3>Recommended: Bridge Loan</h3>
            <p>A bridge loan can help you manage the transition between selling your current home and buying a new one.</p>
            <Link href="/?loanType=Conventional&bridge=true" style={{ 
                padding: `${spacing.md} ${spacing.lg}`,
                backgroundColor: `${colors.primary} !important`,
                color: `${colors.background} !important`,
                border: 'none !important',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
              Get Started
            </Link>
          </div>
        );

      case 'heloc':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg,
            border: `2px solid ${colors.primary}20`
          }}>
            <h3>Recommended: Home Equity Line of Credit (HELOC)</h3>
            <p>A HELOC can provide you with flexible access to your home&apos;s equity for various purposes.</p>
            <Link href="/?loanType=HELOC" style={{ 
                padding: `${spacing.md} ${spacing.lg}`,
                backgroundColor: `${colors.primary} !important`,
                color: `${colors.background} !important`,
                border: 'none !important',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
              Get Started
            </Link>
          </div>
        );

      case 'cash-out-refinance':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg,
            border: `2px solid ${colors.primary}20`
          }}>
            <h3>Recommended: Cash-Out Refinance</h3>
            <p>A cash-out refinance can help you access your home&apos;s equity while potentially improving your loan terms.</p>
            <Link href="/?loanType=Conventional&cashOut=true" style={{ 
                padding: `${spacing.md} ${spacing.lg}`,
                backgroundColor: `${colors.primary} !important`,
                color: `${colors.background} !important`,
                border: 'none !important',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
              Get Started
            </Link>
          </div>
        );

      case 'rate-term-refinance':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg,
            border: `2px solid ${colors.primary}20`
          }}>
            <h3>Recommended: Rate and Term Refinance</h3>
            <p>A rate and term refinance could help you lower your interest rate or adjust your loan term to better suit your needs.</p>
            <Link href="/?loanType=Conventional&refinance=true" style={{ 
                padding: `${spacing.md} ${spacing.lg}`,
                backgroundColor: `${colors.primary} !important`,
                color: `${colors.background} !important`,
                border: 'none !important',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
              Get Started
            </Link>
          </div>
        );

      case 'va-irrrl':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg,
            border: `2px solid ${colors.primary}20`
          }}>
            <h3>Recommended: VA Interest Rate Reduction Refinance Loan (IRRRL)</h3>
            <p>The VA IRRRL program offers a streamlined way for VA loan holders to potentially lower their interest rate.</p>
            <Link href="/?loanType=VA&irrrl=true" style={{ 
                padding: `${spacing.md} ${spacing.lg}`,
                backgroundColor: `${colors.primary} !important`,
                color: `${colors.background} !important`,
                border: 'none !important',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
              Get Started
            </Link>
          </div>
        );

      case 'fha-streamline':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg,
            border: `2px solid ${colors.primary}20`
          }}>
            <h3>Recommended: FHA Streamline Refinance</h3>
            <p>An FHA Streamline Refinance can help you refinance your existing FHA loan with reduced documentation and potentially lower costs.</p>
            <Link href="/?loanType=FHA&streamline=true" style={{ 
                padding: `${spacing.md} ${spacing.lg}`,
                backgroundColor: `${colors.primary} !important`,
                color: `${colors.background} !important`,
                border: 'none !important',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
              Get Started
            </Link>
          </div>
        );

      case 'usda-streamline':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg,
            border: `2px solid ${colors.primary}20`
          }}>
            <h3>Recommended: USDA Streamline Refinance</h3>
            <p>A USDA Streamline Refinance offers a simplified process to potentially improve the terms of your existing USDA loan.</p>
            <Link href="/?loanType=USDA&streamline=true" style={{ 
                padding: `${spacing.md} ${spacing.lg}`,
                backgroundColor: `${colors.primary} !important`,
                color: `${colors.background} !important`,
                border: 'none !important',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
              Get Started
            </Link>
          </div>
        );

      case 'conventional-streamline':
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg,
            border: `2px solid ${colors.primary}20`
          }}>
            <h3>Recommended: Conventional Streamline Refinance</h3>
            <p>A Conventional Streamline Refinance can help you refinance your existing conventional loan with a simplified process.</p>
            <Link href="/?loanType=Conventional&streamline=true" style={{ 
                padding: `${spacing.md} ${spacing.lg}`,
                backgroundColor: `${colors.primary} !important`,
                color: `${colors.background} !important`,
                border: 'none !important',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
              Get Started
            </Link>
          </div>
        );

      default:
        return (
          <div style={{ 
            backgroundColor: colors.background, 
            borderRadius: borderRadius.lg, 
            padding: spacing.lg, 
            boxShadow: shadows.lg 
          }}>
            <h3>Select Your Loan Purpose</h3>
            <button 
              onClick={() => handleStepChange('purchase-credit-score')}
              style={{ 
                padding: `${spacing.md} ${spacing.lg}`,
                backgroundColor: `${colors.primary} !important`,
                color: `${colors.background} !important`,
                border: 'none !important',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Home Purchase
            </button>
            <button 
              onClick={() => handleStepChange('refinance-veteran')}
              style={{ 
                padding: `${spacing.md} ${spacing.lg}`,
                backgroundColor: `${colors.primary} !important`,
                color: `${colors.background} !important`,
                border: 'none !important',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Home Refinance
            </button>
          </div>
        );
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: borderRadius.lg,
      boxShadow: shadows.lg,
      padding: spacing[6]
    }}>
      <h2 style={{
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        marginBottom: spacing[6],
        lineHeight: typography.lineHeight.tight
      }}>Find Your Ideal Loan</h2>
      
      {/* Progress Indicator */}
      {showProgress && (
        <div className="progress-indicator">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div 
              key={i} 
              className={`progress-dot ${i <= stepNumber ? 'active' : ''}`}
            />
          ))}
        </div>
      )}
      
      {/* Step Counter */}
      {showProgress && (
        <div className="text-center mb-4">
          <span className="step-counter">
            Step {stepNumber + 1} of {totalSteps}
          </span>
        </div>
      )}
      
      {/* Back Button */}
      {currentStep !== 'landing' && (
        <div className="mb-6">
          <button 
            onClick={handleBack}
            className="back-button"
          >
            ← Back
          </button>
        </div>
      )}
      
      {renderStep()}
      
      {/* Finalized Button - Only show on result pages and when not already finalized */}
      {isOnResultPage && !isFinalized && (
        <div style={{ marginTop: spacing[8], textAlign: 'center' }}>
          <button 
            onClick={handleFinalize}
            style={{
              backgroundColor: `${colors.primary} !important`,
              color: `${colors.background} !important`,
              padding: `${spacing[3]} ${spacing[8]}`,
              borderRadius: borderRadius.lg,
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              border: 'none !important',
              cursor: 'pointer',
              boxShadow: shadows.lg,
              transition: 'all 0.2s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2]
            }}
          >
            <icons.success size={20} color={colors.background} />
            Finalize My Choice
          </button>
          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
            marginTop: spacing[2]
          }}>
            Confirm your loan recommendation to proceed
          </p>
        </div>
      )}
      
      {/* Finalized Confirmation - Show when finalized */}
      {isFinalized && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
          <div className="text-green-600 text-4xl mb-4" style={{ display: 'flex', justifyContent: 'center' }}>
            <icons.success size={48} />
          </div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            Questionnaire Completed!
          </h3>
          <p className="text-green-700 mb-4">
            You&apos;ve successfully completed the loan finder questionnaire. 
            Your recommendation has been finalized.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/?loanType=Conventional" 
              className="text-white px-6 py-2 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: colors.primary,
                color: colors.background,
                display: 'flex', 
                alignItems: 'center', 
                gap: spacing[2]
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary;
              }}
            >
              <icons.applyNow size={20} color={colors.background} />
              Get My Rates
            </Link>
            <button 
              onClick={() => {
                setIsFinalized(false);
                setCurrentStep('landing');
                setStepHistory(['landing']);
              }}
              style={{
                backgroundColor: `${colors.textSecondary} !important`,
                color: `${colors.background} !important`,
                padding: `${spacing.md} ${spacing.lg}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                border: 'none !important',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex', 
                alignItems: 'center', 
                gap: spacing.sm
              }}
            >
              <icons.homeRefinance size={20} color={colors.background} />
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
export default memo(Questionnaire);
