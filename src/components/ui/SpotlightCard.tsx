'use client';

import React from 'react';
import { borderRadius, animationClasses } from '@/theme/theme';

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  variant?: 'default' | 'primary' | 'secondary';
  onClick?: () => void;
  style?: React.CSSProperties;
  animationDelay?: 1 | 2 | 3 | 4 | 5 | 6;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
  style,
  animationDelay,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300';
      case 'secondary':
        return 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 hover:border-gray-300';
      default:
        return 'bg-white border-gray-200 hover:border-gray-300';
    }
  };

  const getAnimationClass = () => {
    if (animationDelay) {
      return animationClasses.card.stagger[animationDelay.toString() as keyof typeof animationClasses.card.stagger];
    }
    return animationClasses.card.entrance;
  };

  const baseClasses = `
    relative border ${animationClasses.card.base}
    ${animationClasses.card.landingHover}
    ${animationClasses.card.borderGlow}
    ${animationClasses.card.active}
    ${onClick ? 'cursor-pointer group' : ''}
    ${getVariantStyles()}
    ${getAnimationClass()}
    ${className}
  `.trim();

  return (
    <div
      onClick={onClick}
      className={baseClasses}
      style={{
        borderRadius: borderRadius.lg,
        backdropFilter: 'blur(10px)',
        ...style
      }}
      {...props}
    >
      {/* Landing page style gradient overlay - NO WHITE ANIMATION */}
      <div 
        className={animationClasses.card.gradientOverlay}
        style={{ borderRadius: borderRadius.lg }}
      />
      {children}
    </div>
  );
};

export default SpotlightCard;
