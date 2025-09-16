'use client';

import React, { useState, useEffect } from 'react';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { useAuth } from '@/hooks/use-auth';
import Icon from '@/components/ui/Icon';

interface TemplateSelectorProps {
  onTemplateChange?: (templateSlug: string) => void;
  className?: string;
}

export default function TemplateSelector({ 
  onTemplateChange, 
  className = '' 
}: TemplateSelectorProps) {
  const { user } = useAuth();
  const { getTemplateSync, fetchTemplate, templateData, isLoading, error, saveTemplateSettings } = useEfficientTemplates();
  
  // Get available templates from the database
  const availableTemplates = ['template1', 'template2']; // Template slugs
  const currentTemplate = templateData.template1?.template || templateData.template2?.template;
  
  // Check if user has custom settings
  const hasCustomSettings = Object.keys(templateData).some(slug => templateData[slug]?.metadata?.isCustomized);

  // Get template colors for styling
  const template1Data = getTemplateSync('template1');
  const template2Data = getTemplateSync('template2');
  
  const colors = template1Data?.template?.colors || {
    primary: '#ec4899',
    secondary: '#3b82f6',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('template1');

  // Fetch templates when component mounts
  useEffect(() => {
    if (user) {
      console.log('🔍 TemplateSelector: Fetching templates for user');
      console.log('🔍 TemplateSelector: Current templateData:', templateData);
      // Always fetch templates to ensure we have the latest data
      Promise.all([
        fetchTemplate('template1'),
        fetchTemplate('template2')
      ]).then(() => {
        console.log('✅ TemplateSelector: Templates fetched successfully');
      }).catch(err => {
        console.error('❌ TemplateSelector: Failed to fetch templates:', err);
      });
    }
  }, [user, fetchTemplate]);

  const handleTemplateToggle = async () => {
    if (!user) {
      console.error('No user authenticated');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const newTemplate = selectedTemplate === 'template1' ? 'template2' : 'template1';
      console.log('🔍 TemplateSelector: Switching to template:', newTemplate);
      
      // Save template selection using efficient templates hook
      await saveTemplateSettings(newTemplate, {}, false);
      
      setSelectedTemplate(newTemplate);
      console.log('✅ TemplateSelector: Template switched successfully');
      
      // Notify parent component
      onTemplateChange?.(newTemplate);
      
    } catch (err) {
      console.error('❌ TemplateSelector: Error switching template:', err);
      setSaveError(err instanceof Error ? err.message : 'Failed to switch template');
    } finally {
      setIsSaving(false);
    }
  };

  // Debug logging
  console.log('🔍 TemplateSelector: Rendering with data:', {
    availableTemplates,
    templateData,
    isLoading,
    error,
    selectedTemplate,
    template1Data: getTemplateSync('template1'),
    template2Data: getTemplateSync('template2')
  });

  // Show loading state while templates are being fetched
  if (isLoading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Choose Template
          </h3>
          <p className="text-sm text-gray-600">
            Loading templates...
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Choose Template
        </h3>
        <p className="text-sm text-gray-600">
          Switch between available templates
        </p>
      </div>

      {/* Template Toggle Button */}
      <div className="mb-4">
        <div className="relative inline-flex items-center bg-gray-100 rounded-lg p-1">
          {/* Template 1 Option */}
          <button
            onClick={() => selectedTemplate !== 'template1' && handleTemplateToggle()}
            disabled={isSaving}
            className={`relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              selectedTemplate === 'template1'
                ? 'text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={{
              backgroundColor: selectedTemplate === 'template1' ? colors.primary : 'transparent',
              minWidth: '120px'
            }}
          >
            <div className="flex items-center justify-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full border-2"
                style={{ 
                  backgroundColor: selectedTemplate === 'template1' ? colors.background : colors.primary,
                  borderColor: colors.primary
                }}
              />
              <span>
                {template1Data?.template?.name || 'Red Template'}
              </span>
            </div>
          </button>

          {/* Template 2 Option */}
          <button
            onClick={() => selectedTemplate !== 'template2' && handleTemplateToggle()}
            disabled={isSaving}
            className={`relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              selectedTemplate === 'template2'
                ? 'text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={{
              backgroundColor: selectedTemplate === 'template2' ? colors.primary : 'transparent',
              minWidth: '120px'
            }}
          >
            <div className="flex items-center justify-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full border-2"
                style={{ 
                  backgroundColor: selectedTemplate === 'template2' ? colors.background : colors.primary,
                  borderColor: colors.primary
                }}
              />
              <span>
                {template2Data?.template?.name || 'Purple Theme'}
              </span>
            </div>
          </button>
        </div>

        {/* Loading indicator */}
        {isSaving && (
          <div className="mt-2 flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600 mr-2"></div>
            <span className="text-sm text-gray-600">Switching template...</span>
          </div>
        )}

        {/* Error message */}
        {saveError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {saveError}
          </div>
        )}
      </div>

      {/* Template Preview Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Template 1 Preview */}
        <div 
          className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
            selectedTemplate === 'template1'
              ? 'border-2'
              : 'border border-gray-200 hover:border-gray-300'
          }`}
          style={{
            borderColor: selectedTemplate === 'template1' ? colors.primary : undefined,
            backgroundColor: selectedTemplate === 'template1' ? `${colors.primary}05` : undefined
          }}
          onClick={() => selectedTemplate !== 'template1' && handleTemplateToggle()}
        >
          <div className="flex items-center space-x-3">
            {/* Template Preview */}
            <div 
              className="w-8 h-8 rounded border-2 border-gray-300"
              style={{ 
                backgroundColor: template1Data?.template?.colors?.primary || '#ec4899' 
              }}
            />
            
            {/* Template Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900 truncate">
                  {template1Data?.template?.name || 'Red Template'}
                </h4>
                {selectedTemplate === 'template1' && (
                  <Icon name="check" size={16} className="text-green-600" />
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">
                {template1Data?.template?.name || 'Template 1'}
              </p>
            </div>
          </div>
        </div>

        {/* Template 2 Preview */}
        <div 
          className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
            selectedTemplate === 'template2'
              ? 'border-2'
              : 'border border-gray-200 hover:border-gray-300'
          }`}
          style={{
            borderColor: selectedTemplate === 'template2' ? colors.primary : undefined,
            backgroundColor: selectedTemplate === 'template2' ? `${colors.primary}05` : undefined
          }}
          onClick={() => selectedTemplate !== 'template2' && handleTemplateToggle()}
        >
          <div className="flex items-center space-x-3">
            {/* Template Preview */}
            <div 
              className="w-8 h-8 rounded border-2 border-gray-300"
              style={{ 
                backgroundColor: template2Data?.template?.colors?.primary || '#9333ea' 
              }}
            />
            
            {/* Template Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900 truncate">
                  {template2Data?.template?.name || 'Purple Theme'}
                </h4>
                {selectedTemplate === 'template2' && (
                  <Icon name="check" size={16} className="text-green-600" />
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">
                {template2Data?.template?.name || 'Template 2'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
          <div className="flex items-center space-x-2">
            <Icon name="profile" size={12} className="text-blue-600" />
            <span className="text-blue-700">
              {user.email} • User • Employee
            </span>
          </div>
          {hasCustomSettings && (
            <div className="flex items-center space-x-2 mt-1">
              <Icon name="edit" size={12} className="text-green-600" />
              <span className="text-green-700">Custom settings applied</span>
            </div>
          )}
        </div>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
          <div className="text-gray-600">
            <div>Template Count: {Object.keys(templateData).length}</div>
            <div>Template1: {getTemplateSync('template1') ? '✓' : '✗'}</div>
            <div>Template2: {getTemplateSync('template2') ? '✓' : '✗'}</div>
            <div>Selected: {selectedTemplate}</div>
            {error && <div className="text-red-600">Error: {error}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
