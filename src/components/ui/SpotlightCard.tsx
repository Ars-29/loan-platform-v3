'use client';

import React from 'react';

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  variant?: 'default' | 'primary' | 'secondary';
  onClick?: () => void;
  style?: React.CSSProperties;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
  style,
  ...props
}) => {
  const baseClasses = `
    relative rounded-lg border border-gray-200 bg-[#F7F1E9]/30 transition-all duration-200 ease-in-out
    hover:shadow-lg hover:border-gray-300
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `.trim();

  return (
    <div
      onClick={onClick}
      className={baseClasses}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

export default SpotlightCard;
