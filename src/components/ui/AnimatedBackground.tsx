'use client';

import React from 'react';

interface AnimatedBackgroundProps {
  variant?: 'gradient' | 'dots' | 'waves' | 'geometric' | 'floating';
  className?: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  variant = 'gradient', 
  className = '' 
}) => {
  const renderBackground = () => {
    switch (variant) {
      case 'gradient':
        return (
          <div className={`absolute inset-0 overflow-hidden ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#01bcc6]/10 via-[#008eab]/5 to-[#005b7c]/10 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-[#01bcc6]/5 via-transparent to-[#008eab]/10 animate-pulse delay-1000"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#01bcc6]/5 to-transparent animate-pulse delay-2000"></div>
          </div>
        );

      case 'dots':
        return (
          <div className={`absolute inset-0 overflow-hidden ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#F7F1E9] to-[#EBDBC7]"></div>
            <div className="absolute inset-0 opacity-30">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-[#01bcc6] rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 opacity-20">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-4 h-4 bg-[#008eab] rounded-full animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${3 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          </div>
        );

      case 'waves':
        return (
          <div className={`absolute inset-0 overflow-hidden ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#F7F1E9] to-[#EBDBC7]"></div>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
              <defs>
                <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#01bcc6" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#008eab" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#008eab" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#005b7c" stopOpacity="0.03" />
                </linearGradient>
              </defs>
              <path
                d="M0,400 Q300,200 600,400 T1200,400 L1200,800 L0,800 Z"
                fill="url(#wave1)"
                className="animate-pulse"
              />
              <path
                d="M0,500 Q400,300 800,500 T1200,500 L1200,800 L0,800 Z"
                fill="url(#wave2)"
                className="animate-pulse delay-1000"
              />
            </svg>
          </div>
        );

      case 'geometric':
        return (
          <div className={`absolute inset-0 overflow-hidden ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#F7F1E9] to-[#EBDBC7]"></div>
            <div className="absolute inset-0 opacity-20">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute border-2 border-[#01bcc6] animate-spin"
                  style={{
                    width: `${20 + Math.random() * 60}px`,
                    height: `${20 + Math.random() * 60}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${8 + Math.random() * 4}s`,
                    borderRadius: Math.random() > 0.5 ? '50%' : '0%'
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 opacity-10">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-[#008eab] animate-pulse"
                  style={{
                    width: `${40 + Math.random() * 80}px`,
                    height: `${40 + Math.random() * 80}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${4 + Math.random() * 2}s`,
                    borderRadius: Math.random() > 0.5 ? '50%' : '20%'
                  }}
                />
              ))}
            </div>
          </div>
        );

      case 'floating':
        return (
          <div className={`absolute inset-0 overflow-hidden ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#F7F1E9] to-[#EBDBC7]"></div>
            <div className="absolute inset-0 opacity-30">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-gradient-to-br from-[#01bcc6]/20 to-[#008eab]/10 rounded-full animate-bounce"
                  style={{
                    width: `${60 + Math.random() * 120}px`,
                    height: `${60 + Math.random() * 120}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${6 + Math.random() * 4}s`
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 opacity-20">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-gradient-to-br from-[#008eab]/15 to-[#005b7c]/10 rounded-full animate-pulse"
                  style={{
                    width: `${100 + Math.random() * 200}px`,
                    height: `${100 + Math.random() * 200}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${8 + Math.random() * 4}s`
                  }}
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return renderBackground();
};

export default AnimatedBackground;
