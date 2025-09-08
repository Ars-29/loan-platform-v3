import React from 'react';
import { theme } from '@/theme/theme';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Centralized Input Component
 * 
 * Features:
 * - Consistent styling across the application
 * - Error states and validation messages
 * - Label and description support
 * - Icon support (left/right)
 * - Multiple sizes
 * - Form integration ready
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  description,
  size = 'md',
  variant = 'default',
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  // Generate unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-3 py-2 text-sm h-10',
    lg: 'px-4 py-3 text-base h-12',
  };

  // Variant classes
  const variantClasses = {
    default: `
      border-gray-300 
      focus:border-pink-500 focus:ring-pink-500
      placeholder-gray-400
    `,
    error: `
      border-red-300 
      focus:border-red-500 focus:ring-red-500
      placeholder-red-300
    `,
  };

  // Base input classes
  const baseClasses = `
    block w-full rounded-md border
    focus:outline-none focus:ring-1
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    transition-colors duration-200
    ${sizeClasses[size]}
    ${variantClasses[variant]}
  `;

  // Icon padding adjustments
  const iconPadding = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          id={inputId}
          className={`
            ${baseClasses}
            ${iconPadding}
            ${className}
          `.trim()}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {rightIcon}
            </div>
          </div>
        )}
      </div>
      
      {description && !error && (
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      )}
      
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

// Convenience components for common input types
export const EmailInput: React.FC<Omit<InputProps, 'type'>> = (props) => (
  <Input type="email" {...props} />
);

export const PasswordInput: React.FC<Omit<InputProps, 'type'>> = (props) => (
  <Input type="password" {...props} />
);

export const TextInput: React.FC<Omit<InputProps, 'type'>> = (props) => (
  <Input type="text" {...props} />
);

export const NumberInput: React.FC<Omit<InputProps, 'type'>> = (props) => (
  <Input type="number" {...props} />
);

export const UrlInput: React.FC<Omit<InputProps, 'type'>> = (props) => (
  <Input type="url" {...props} />
);

export const TelInput: React.FC<Omit<InputProps, 'type'>> = (props) => (
  <Input type="tel" {...props} />
);
