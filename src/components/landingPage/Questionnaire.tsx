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
  // Completion callback to trigger rate results
  onComplete?: (answers: Record<string, any>) => void;
}

function Questionnaire({ 
  template = 'template1',
  // NEW: Public mode props
  isPublic = false,
  publicTemplateData,
  // Completion callback
  onComplete
}: QuestionnaireProps) {
  const { getTemplateSync } = useEfficientTemplates();
  
  // Template data fetching - support both public and auth modes
  const templateData = isPublic && publicTemplateData 
    ? publicTemplateData 
    : getTemplateSync(template);
  const colors = templateData?.template?.colors || {
    primary: '#ec4899',
    secondary: '#01bcc6',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };
  
  const layout = templateData?.template?.layout || {
    alignment: 'center',
    spacing: 18,
    borderRadius: 8,
    padding: { small: 8, medium: 16, large: 24, xlarge: 32 }
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
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, any>>({});

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
    
    // Collect final answers based on the current step (final recommendation)
    const finalAnswers = {
      ...questionnaireAnswers,
      finalRecommendation: currentStep,
      stepHistory: stepHistory
    };
    
    console.log('Questionnaire finalized!', {
      currentStep,
      stepHistory,
      finalRecommendation: currentStep,
      allAnswers: finalAnswers
    });
    
    // Call completion callback if provided
    if (onComplete) {
      onComplete(finalAnswers);
    }
  }, [currentStep, stepHistory, questionnaireAnswers, onComplete]);

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
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <icons.homePurchase size={20} color={colors.background} />
                <span>Home Purchase</span>
              </button>
              <button 
                onClick={() => handleStepChange('refinance-veteran')}
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <icons.homeRefinance size={20} color={colors.background} />
                <span>Home Refinance</span>
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
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <icons.rates size={20} color={colors.background} />
                <span>Below 580</span>
              </button>
              <button 
                onClick={() => handleStepChange('purchase-down-payment-low')}
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <icons.calculators size={20} color={colors.background} />
                <span>580-619</span>
              </button>
              <button 
                onClick={() => handleStepChange('purchase-down-payment-mid')}
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <icons.trendingUp size={20} color={colors.background} />
                <span>620-639</span>
              </button>
              <button 
                onClick={() => handleStepChange('purchase-military')}
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <icons.star size={20} color={colors.background} />
                <span>640 or higher</span>
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
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <icons.calculators size={20} color={colors.background} />
                <span>Less than 3.5%</span>
              </button>
              <button 
                onClick={() => handleStepChange('dpa-loan')}
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <icons.calculators size={20} color={colors.background} />
                <span>3.5% or more</span>
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
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <span>Less than 3%</span>
              </button>
              <button 
                onClick={() => handleStepChange('fha-loan')}
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <span>3-5%</span>
              </button>
              <button 
                onClick={() => handleStepChange('conventional-loan')}
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <span>5% or more</span>
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
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <icons.star size={20} color={colors.background} />
                <span>Yes</span>
              </button>
              <button 
                onClick={() => handleStepChange('purchase-rural')}
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <icons.cancel size={20} color={colors.background} />
                <span>No</span>
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
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <span>Yes</span>
              </button>
              <button 
                onClick={() => handleStepChange('purchase-construction')}
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <span>No</span>
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
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <span>Yes</span>
              </button>
              <button 
                onClick={() => handleStepChange('purchase-selling-home')}
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <span>No</span>
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
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <span>Yes</span>
              </button>
              <button 
                onClick={() => handleStepChange('conventional-loan')}
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <span>No</span>
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
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <icons.star size={20} color={colors.background} />
                <span>Yes</span>
              </button>
              <button 
                onClick={() => handleStepChange('refinance-non-veteran-purpose')}
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <icons.cancel size={20} color={colors.background} />
                <span>No</span>
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
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <span>Access Equity</span>
              </button>
              <button 
                onClick={() => handleStepChange('va-irrrl')}
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <span>Lower Rate</span>
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
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <span>Open Line of Credit</span>
              </button>
              <button 
                onClick={() => handleStepChange('cash-out-refinance')}
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <span>Cash Out Equity</span>
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
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <span>Access Equity</span>
              </button>
              <button 
                onClick={() => handleStepChange('refinance-lower-rate')}
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <span>Lower Rate</span>
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
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <span>Open Line of Credit</span>
              </button>
              <button 
                onClick={() => handleStepChange('cash-out-refinance')}
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <span>Cash Out Equity</span>
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
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <span>FHA</span>
              </button>
              <button 
                onClick={() => handleStepChange('usda-streamline')}
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <span>USDA</span>
              </button>
              <button 
                onClick={() => handleStepChange('conventional-streamline')}
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                }}
              >
                <span>Conventional</span>
              </button>
              <button 
                onClick={() => handleStepChange('rate-term-refinance')}
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
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
                className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.background,
                  borderRadius: `${layout.borderRadius}px`,
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
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
            className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: colors.background,
              color: colors.primary,
              border: `1px solid ${colors.primary}`,
              borderRadius: `${layout.borderRadius}px`
            }}
            onMouseEnter={(e) => {
              // Convert hex to rgba for hover effect
              const hex = colors.primary.replace('#', '');
              const r = parseInt(hex.substr(0, 2), 16);
              const g = parseInt(hex.substr(2, 2), 16);
              const b = parseInt(hex.substr(4, 2), 16);
              e.currentTarget.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.1)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.background;
            }}
          >
            <span>← Back</span>
          </button>
        </div>
      )}
      
      {renderStep()}
      
      {/* Finalized Button - Only show on result pages and when not already finalized */}
      {isOnResultPage && !isFinalized && (
        <div style={{ marginTop: spacing[8], textAlign: 'center' }}>
          <button 
            onClick={handleFinalize}
            className="flex items-center space-x-2 px-8 py-3 text-lg font-semibold transition-colors"
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
              borderRadius: `${layout.borderRadius}px`,
              border: 'none',
              boxShadow: shadows.lg
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary;
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
            <button 
              onClick={() => {
                // If onComplete callback is provided, call it to show rate results
                if (onComplete) {
                  const finalAnswers = {
                    ...questionnaireAnswers,
                    finalRecommendation: currentStep,
                    stepHistory: stepHistory
                  };
                  onComplete(finalAnswers);
                } else {
                  // Fallback to redirect if no callback provided
                  window.location.href = '/?loanType=Conventional';
                }
              }}
              className="flex items-center space-x-2 px-6 py-2 text-white font-medium transition-colors"
              style={{ 
                backgroundColor: colors.primary,
                color: colors.background,
                borderRadius: `${layout.borderRadius}px`,
                border: 'none'
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
            </button>
            <button 
              onClick={() => {
                setIsFinalized(false);
                setCurrentStep('landing');
                setStepHistory(['landing']);
              }}
              className="flex items-center space-x-3 px-4 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: colors.textSecondary,
                color: colors.background,
                borderRadius: `${layout.borderRadius}px`,
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.border;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.textSecondary;
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
