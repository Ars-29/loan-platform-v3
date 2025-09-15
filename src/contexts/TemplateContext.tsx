'use client';

import React, { createContext, useContext, ReactNode } from 'react';

// Template Context Types
interface TemplateContextType {
  templateData: any;
  isCustomizerMode: boolean;
  customTemplate?: any;
  officerInfo?: {
    officerName: string;
    phone?: string;
    email: string;
  };
}

// Create the context
const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

// Export the context for use in hooks
export { TemplateContext };

// Template Provider Component
interface TemplateProviderProps {
  children: ReactNode;
  templateData?: any;
  isCustomizerMode?: boolean;
  customTemplate?: any;
  officerInfo?: {
    officerName: string;
    phone?: string;
    email: string;
  };
}

export const TemplateProvider: React.FC<TemplateProviderProps> = ({
  children,
  templateData,
  isCustomizerMode = false,
  customTemplate,
  officerInfo
}) => {
  const contextValue: TemplateContextType = {
    templateData,
    isCustomizerMode,
    customTemplate,
    officerInfo
  };

  return (
    <TemplateContext.Provider value={contextValue}>
      {children}
    </TemplateContext.Provider>
  );
};

// Hook to use template context
export const useTemplateContext = (): TemplateContextType => {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplateContext must be used within a TemplateProvider');
  }
  return context;
};

// Hook to check if we're in customizer mode
export const useIsCustomizerMode = (): boolean => {
  const context = useContext(TemplateContext);
  return context?.isCustomizerMode || false;
};

// Hook to get custom template if available
export const useCustomTemplate = (templateSlug: string): any => {
  const context = useContext(TemplateContext);
  
  if (context?.isCustomizerMode && context?.customTemplate) {
    return context.customTemplate;
  }
  
  return null;
};

// Hook to get officer info if available
export const useCustomizerOfficerInfo = (): {
  officerName: string;
  phone?: string;
  email: string;
} | null => {
  const context = useContext(TemplateContext);
  
  if (context?.isCustomizerMode && context?.officerInfo) {
    return context.officerInfo;
  }
  
  return null;
};
