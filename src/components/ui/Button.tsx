import React from 'react';
import { theme, RoleType } from '@/theme/theme';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  role?: RoleType;
  action?: 'create' | 'edit' | 'delete' | 'resend' | 'deactivate' | 'cancel' | 'submit';
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
        return `Delete ${roleTexts.entityName}`;
      case 'resend':
        return 'Resend';
      case 'deactivate':
        return 'Deactivate';
      case 'cancel':
        return 'Cancel';
      case 'submit':
        return 'Submit';
      default:
        return children;
    }
  };

  // Base button classes
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-md
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-sm h-10',
    lg: 'px-6 py-3 text-base h-12',
  };

  // Variant classes
  const variantClasses = {
    primary: `
      bg-pink-600 text-white
      hover:bg-pink-700
      focus:ring-pink-500
      active:bg-pink-800
    `,
    secondary: `
      bg-white text-gray-900 border border-gray-300
      hover:bg-gray-50
      focus:ring-pink-500
      active:bg-gray-100
    `,
    ghost: `
      bg-transparent text-gray-700
      hover:bg-gray-100
      focus:ring-pink-500
      active:bg-gray-200
    `,
    danger: `
      bg-red-600 text-white
      hover:bg-red-700
      focus:ring-red-500
      active:bg-red-800
    `,
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
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `.trim()}
      disabled={isDisabled}
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
  <Button role={role} action="resend" variant="ghost" size="sm" {...props} />
);

export const DeactivateButton: React.FC<Omit<ButtonProps, 'action'>> = ({ role, ...props }) => (
  <Button role={role} action="deactivate" variant="danger" size="sm" {...props} />
);

export const CancelButton: React.FC<Omit<ButtonProps, 'action'>> = ({ role, ...props }) => (
  <Button role={role} action="cancel" variant="ghost" {...props} />
);

export const SubmitButton: React.FC<Omit<ButtonProps, 'action'>> = ({ role, ...props }) => (
  <Button role={role} action="submit" {...props} />
);