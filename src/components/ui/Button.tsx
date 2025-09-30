"use client";

import React from 'react';
import { theme, RoleType, colors, spacing, borderRadius, typography } from '@/theme/theme';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'white' | 'outline-white';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  role?: RoleType;
  action?: 'create' | 'edit' | 'delete' | 'resend' | 'deactivate' | 'reactivate' | 'cancel' | 'submit';
  children?: React.ReactNode;
}

/**
 * Centralized Button Component
 * 
 * Features:
 * - Role-based text variants (super_admin, company_admin, employee)
 * - Consistent styling across the application
 * - Loading states and disabled states
 * - Multiple variants and sizes
 * - Action-specific text (create, edit, delete, etc.)
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  role,
  action,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Get role-based text if role and action are provided
  const getRoleBasedText = () => {
    if (!role || !action) return children;
    
    const roleTexts = theme.roleTexts[role];
    
    switch (action) {
      case 'create':
        return roleTexts.createButton;
      case 'edit':
        return `Edit ${roleTexts.entityName}`;
      case 'delete':
        return roleTexts.actions.delete;
      case 'resend':
        return roleTexts.actions.resend;
      case 'deactivate':
        return roleTexts.actions.deactivate;
      case 'reactivate':
        return roleTexts.actions.reactivate;
      case 'cancel':
        return 'Cancel';
      case 'submit':
        return 'Submit';
      default:
        return children;
    }
  };

  // Size tokens from theme
  const sizeStyle: Record<NonNullable<ButtonProps['size']>, React.CSSProperties> = {
    sm: { padding: `${spacing[2]} ${spacing[3]}`, fontSize: typography.fontSize.sm as unknown as number, height: 32 },
    md: { padding: `${spacing[2]} ${spacing[4]}`, fontSize: typography.fontSize.sm as unknown as number, height: 40 },
    lg: { padding: `${spacing[3]} ${spacing[6]}`, fontSize: typography.fontSize.base as unknown as number, height: 48 },
  };

  // Variant tokens from theme - Simple styling like Back button
  const variantStyle: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
    primary: {
      backgroundColor: colors.primary[600],
      color: '#ffffff',
      border: 'none',
    },
    secondary: {
      backgroundColor: '#ffffff',
      color: colors.gray[900],
      border: 'none',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.gray[700],
      border: 'none',
    },
    danger: {
      backgroundColor: '#dc2626',
      color: '#ffffff',
      border: 'none',
    },
    white: {
      backgroundColor: '#ffffff',
      color: colors.gray[900],
      border: 'none',
    },
    'outline-white': {
      backgroundColor: 'transparent',
      color: '#ffffff',
      border: 'none',
    },
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const buttonText = getRoleBasedText();
  const isDisabled = disabled || loading;

  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${variant === 'primary' ? 'btn-primary-solid' : ''} ${className}`.trim()}
      disabled={isDisabled}
      style={{
        borderRadius: borderRadius.md as unknown as number,
        ...sizeStyle[size],
        ...variantStyle[variant],
      }}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {buttonText}
    </button>
  );
};

// Convenience components for common use cases
export const CreateButton: React.FC<Omit<ButtonProps, 'action'>> = ({ role, ...props }) => (
  <Button role={role} action="create" {...props} />
);

export const EditButton: React.FC<Omit<ButtonProps, 'action'>> = ({ role, ...props }) => (
  <Button role={role} action="edit" variant="secondary" size="sm" {...props} />
);

export const DeleteButton: React.FC<Omit<ButtonProps, 'action'>> = ({ role, ...props }) => (
  <Button role={role} action="delete" variant="danger" size="sm" {...props} />
);

export const ResendButton: React.FC<Omit<ButtonProps, 'action'>> = ({ role, ...props }) => (
  <Button role={role} action="resend" variant="primary" size="sm" {...props} />
);

export const DeactivateButton: React.FC<Omit<ButtonProps, 'action'>> = ({ role, ...props }) => (
  <Button role={role} action="deactivate" variant="danger" size="sm" {...props} />
);

export const ReactivateButton: React.FC<Omit<ButtonProps, 'action'>> = ({ role, ...props }) => (
  <Button role={role} action="reactivate" variant="primary" size="sm" {...props} />
);

export const CancelButton: React.FC<Omit<ButtonProps, 'action'>> = ({ role, ...props }) => (
  <Button role={role} action="cancel" variant="ghost" {...props} />
);

export const SubmitButton: React.FC<Omit<ButtonProps, 'action'>> = ({ role, ...props }) => (
  <Button role={role} action="submit" {...props} />
);