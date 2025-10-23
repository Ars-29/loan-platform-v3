import React from 'react';
import { theme, borderRadius, animationClasses } from '@/theme/theme';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  shadow?: 'sm' | 'md' | 'lg' | 'none';
  border?: boolean;
  hover?: boolean;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Centralized Card Component System
 * 
 * Features:
 * - Consistent card styling across the application
 * - Multiple padding and shadow variants
 * - Header, Body, Footer sections
 * - Hover effects
 * - Border options
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  border = true,
  hover = false,
}) => {
  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  // Shadow classes
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  // Base card classes
  const baseClasses = `
    bg-white ${animationClasses.card.base}
    ${animationClasses.card.landingHover}
    ${animationClasses.card.borderGlow}
    ${border ? 'border border-gray-200' : ''}
    ${shadowClasses[shadow]}
    ${paddingClasses[padding]}
  `;

  return (
    <div 
      className={`${baseClasses} ${className}`.trim()}
      style={{ borderRadius: borderRadius.lg }} // 16px - CONSISTENT WITH ALL CARDS
    >
      {/* Landing page style gradient overlay */}
      <div 
        className={animationClasses.card.gradientOverlay}
        style={{ borderRadius: borderRadius.lg }}
      />
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg ${className}`}>
      {children}
    </div>
  );
};

// Convenience components for common card layouts
export const SimpleCard: React.FC<Omit<CardProps, 'padding'>> = (props) => (
  <Card padding="md" {...props} />
);

export const CompactCard: React.FC<Omit<CardProps, 'padding'>> = (props) => (
  <Card padding="sm" {...props} />
);

export const SpaciousCard: React.FC<Omit<CardProps, 'padding'>> = (props) => (
  <Card padding="lg" {...props} />
);

export const HoverCard: React.FC<Omit<CardProps, 'hover'>> = (props) => (
  <Card hover={true} {...props} />
);

export const FlatCard: React.FC<Omit<CardProps, 'shadow' | 'border'>> = (props) => (
  <Card shadow="none" border={false} {...props} />
);

