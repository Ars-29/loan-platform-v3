import React, { useEffect } from 'react';
import { theme, RoleType } from '@/theme/theme';
import { Button, CancelButton, SubmitButton } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  role?: RoleType;
  action?: 'create' | 'edit' | 'delete' | 'confirm';
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  className?: string;
}

/**
 * Centralized Modal Component
 * 
 * Features:
 * - Role-based text variants
 * - Multiple sizes
 * - Form submission handling
 * - Loading states
 * - Keyboard navigation (ESC to close)
 * - Focus management
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  role,
  action = 'create',
  onSubmit,
  submitText,
  cancelText,
  loading = false,
  className = '',
}) => {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Get role-based text
  const getRoleBasedText = () => {
    if (!role) return { submit: submitText || 'Submit', cancel: cancelText || 'Cancel' };
    
    const roleTexts = theme.roleTexts[role];
    
    switch (action) {
      case 'create':
        return {
          submit: submitText || `Create ${roleTexts.entityName}`,
          cancel: cancelText || 'Cancel',
        };
      case 'edit':
        return {
          submit: submitText || `Update ${roleTexts.entityName}`,
          cancel: cancelText || 'Cancel',
        };
      case 'delete':
        return {
          submit: submitText || `Delete ${roleTexts.entityName}`,
          cancel: cancelText || 'Cancel',
        };
      case 'confirm':
        return {
          submit: submitText || 'Confirm',
          cancel: cancelText || 'Cancel',
        };
      default:
        return {
          submit: submitText || 'Submit',
          cancel: cancelText || 'Cancel',
        };
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  const { submit, cancel } = getRoleBasedText();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`
            relative bg-white rounded-lg shadow-xl w-full
            ${sizeClasses[size]}
            ${className}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 rounded-md p-1"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {children}
          </div>

          {/* Footer */}
          {onSubmit && (
            <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <CancelButton
                role={role}
                onClick={onClose}
                disabled={loading}
              >
                {cancel}
              </CancelButton>
              <SubmitButton
                role={role}
                onClick={onSubmit}
                loading={loading}
                disabled={loading}
              >
                {submit}
              </SubmitButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Specialized modal components for common use cases
export const CreateModal: React.FC<Omit<ModalProps, 'action'>> = ({ role, ...props }) => (
  <Modal role={role} action="create" {...props} />
);

export const EditModal: React.FC<Omit<ModalProps, 'action'>> = ({ role, ...props }) => (
  <Modal role={role} action="edit" {...props} />
);

export const DeleteModal: React.FC<Omit<ModalProps, 'action'>> = ({ role, ...props }) => (
  <Modal role={role} action="delete" {...props} />
);

export const ConfirmModal: React.FC<Omit<ModalProps, 'action'>> = ({ role, ...props }) => (
  <Modal role={role} action="confirm" {...props} />
);

// Form Modal with built-in form handling
export interface FormModalProps extends Omit<ModalProps, 'children'> {
  formData: Record<string, any>;
  onFormDataChange: (data: Record<string, any>) => void;
  fields: FormField[];
  validationErrors?: Record<string, string>;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'url' | 'tel';
  required?: boolean;
  placeholder?: string;
  description?: string;
}

export const FormModal: React.FC<FormModalProps> = ({
  formData,
  onFormDataChange,
  fields,
  validationErrors = {},
  onSubmit,
  ...modalProps
}) => {
  const handleInputChange = (name: string, value: string) => {
    onFormDataChange({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <Modal {...modalProps} onSubmit={onSubmit}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className={`
                w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent
                ${validationErrors[field.name] ? 'border-red-300' : 'border-gray-300'}
              `}
            />
            {field.description && (
              <p className="mt-1 text-xs text-gray-500">{field.description}</p>
            )}
            {validationErrors[field.name] && (
              <p className="mt-1 text-xs text-red-600">{validationErrors[field.name]}</p>
            )}
          </div>
        ))}
      </form>
    </Modal>
  );
};
