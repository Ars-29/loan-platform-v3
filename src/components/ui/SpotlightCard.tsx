'use client';

import React, { useRef, useState } from 'react';
import { spotlightColors } from '@/theme/theme';

interface Position {
  x: number;
  y: number;
}

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  spotlightColor?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'neutral' | 'purple' | 'pink' | 'lightBlue' | 'lightGreen' | 'lightPurple';
  onClick?: () => void;
  style?: React.CSSProperties;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor,
  variant = 'default',
  onClick,
  style,
  ...props
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState<number>(0);

  // Get spotlight color from theme or use custom color
  const currentSpotlightColor = spotlightColor || spotlightColors[variant] || spotlightColors.default;

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = e => {
    if (!divRef.current || isFocused) return;

    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(0.8);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(0.8);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  const baseClasses = `
    relative rounded-lg border border-gray-200 bg-white overflow-hidden transition-all duration-200 ease-in-out
    hover:shadow-lg hover:border-gray-300
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `.trim();

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={baseClasses}
      style={style}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${currentSpotlightColor}, transparent 80%)`
        }}
      />
      {children}
    </div>
  );
};

export default SpotlightCard;
