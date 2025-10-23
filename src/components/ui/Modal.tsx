'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

// FormField interface for dynamic form generation
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: (value: any) => string | null;
}

// FormModal props interface
interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  role?: string;
  action?: string;
  formData: Record<string, any>;
  onFormDataChange: (data: Record<string, any>) => void;
  fields: FormField[];
  validationErrors: Record<string, string>;
  onSubmit: () => void;
  loading?: boolean;
  className?: string;
}

export default function Modal({ isOpen, onClose, title, children, className = '' }: ModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// FormModal component for dynamic form generation
export function FormModal({
  isOpen,
  onClose,
  title,
  formData,
  onFormDataChange,
  fields,
  validationErrors,
  onSubmit,
  loading = false,
  className = ''
}: FormModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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

  const handleInputChange = (fieldName: string, value: string) => {
    onFormDataChange({
      ...formData,
      [fieldName]: value
    });
  };

  const renderField = (field: FormField) => {
    const hasError = validationErrors[field.name];
    
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#01bcc6] focus:border-[#01bcc6] ${
              hasError ? 'border-red-300' : 'border-gray-300'
            }`}
            rows={3}
            disabled={loading}
          />
        );
      
      case 'select':
        return (
          <select
            id={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#01bcc6] focus:border-[#01bcc6] ${
              hasError ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            id={field.name}
            type={field.type}
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#01bcc6] focus:border-[#01bcc6] ${
              hasError ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loading}
          />
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {renderField(field)}
                {validationErrors[field.name] && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors[field.name]}</p>
                )}
              </div>
            ))}
            
            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                className="flex-1"
              >
                {loading ? 'Processing...' : 'Submit'}
              </Button>
              
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}