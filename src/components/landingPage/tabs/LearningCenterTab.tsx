'use client';

import React, { useState, useEffect } from 'react';
import { typography } from '@/theme/theme';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { useAuth } from '@/hooks/use-auth';
import Icon from '@/components/ui/Icon';

interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  category: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface LearningCenterTabProps {
  selectedTemplate: 'template1' | 'template2';
  className?: string;
  // NEW: Public mode props
  isPublic?: boolean;
  publicTemplateData?: any;
}

export default function LearningCenterTab({
  selectedTemplate,
  className = '',
  // NEW: Public mode props
  isPublic = false,
  publicTemplateData
}: LearningCenterTabProps) {
  const { user } = useAuth();
  const { getTemplateSync } = useEfficientTemplates();
  
  // Template data fetching - support both public and auth modes
  const templateData = isPublic && publicTemplateData 
    ? publicTemplateData 
    : getTemplateSync(selectedTemplate);

  
  // Comprehensive template data usage
  const colors = templateData?.template?.colors || {
    primary: '#ec4899',
    secondary: '#3b82f6',
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb'
  };
  
  const typography = templateData?.template?.typography || {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  };
  
  const content = templateData?.template?.content || {
    headline: 'Learning Center',
    subheadline: 'Educational resources to help you navigate the home buying process',
    ctaText: 'Watch Video',
    ctaSecondary: 'Download Guide'
  };
  
  const layout = templateData?.template?.layout || {
    alignment: 'center',
    spacing: 18,
    borderRadius: 8,
    padding: { small: 8, medium: 16, large: 24, xlarge: 32 }
  };
  
  const defaultClasses = {
    button: {
      primary: 'px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-gray-300',
      outline: 'border-2 px-6 py-3 rounded-lg font-medium transition-all duration-200',
      ghost: 'px-4 py-2 rounded-lg font-medium transition-all duration-200'
    },
    card: {
      container: 'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200',
      header: 'px-6 py-4 border-b border-gray-200',
      body: 'px-6 py-4',
      footer: 'px-6 py-4 border-t border-gray-200 bg-gray-50'
    },
    heading: {
      h1: 'text-3xl font-bold text-gray-900 mb-4',
      h2: 'text-2xl font-bold text-gray-900 mb-3',
      h3: 'text-xl font-semibold text-gray-900 mb-2',
      h4: 'text-lg font-semibold text-gray-900 mb-2',
      h5: 'text-base font-semibold text-gray-900 mb-2',
      h6: 'text-sm font-semibold text-gray-900 mb-1'
    },
    body: {
      large: 'text-lg text-gray-700 leading-relaxed',
      base: 'text-base text-gray-700 leading-relaxed',
      small: 'text-sm text-gray-600 leading-relaxed',
      xs: 'text-xs text-gray-500 leading-normal'
    },
    icon: {
      primary: selectedTemplate === 'template2' 
        ? 'w-12 h-12 rounded-lg flex items-center justify-center mb-4'
        : 'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
      secondary: 'w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3',
      small: selectedTemplate === 'template2'
        ? 'w-8 h-8 rounded-lg flex items-center justify-center'
        : 'w-8 h-8 rounded-lg flex items-center justify-center'
    },
    status: {
      success: 'text-green-600 bg-green-50 px-2 py-1 rounded text-sm',
      warning: 'text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-sm',
      error: 'text-red-600 bg-red-50 px-2 py-1 rounded text-sm',
      info: 'text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm'
    }
  };
  const templateClasses = templateData?.template?.classes;
  const safeTemplateClasses = templateClasses && typeof templateClasses === 'object' ? templateClasses : {};
  const classes = {
    ...defaultClasses,
    ...safeTemplateClasses,
button: { 
      ...defaultClasses.button, 
      ...(safeTemplateClasses?.button || {}) 
    },
    card: { 
      ...defaultClasses.card, 
      ...(safeTemplateClasses?.card || {}) 
    },
    heading: { 
      ...defaultClasses.heading, 
      ...(safeTemplateClasses?.heading || {}) 
    },
    body: { 
      ...defaultClasses.body, 
      ...(safeTemplateClasses?.body || {}) 
    },
    icon: { 
      ...defaultClasses.icon, 
      ...(safeTemplateClasses?.icon || {}) 
    },
    status: { 
      ...defaultClasses.status, 
      ...(safeTemplateClasses?.status || {}) 
    }
  };
  const [activeSection, setActiveSection] = useState<'videos' | 'faq' | 'guides'>('videos');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const mockVideos: Video[] = [
    {
      id: '1',
      title: 'Understanding Mortgage Rates',
      description: 'Learn how mortgage rates are determined and what affects them',
      duration: '8:45',
      thumbnail: '/api/placeholder/300/200',
      category: 'mortgage-basics'
    },
    {
      id: '2',
      title: 'First-Time Home Buyer Guide',
      description: 'Complete guide for first-time home buyers',
      duration: '12:30',
      thumbnail: '/api/placeholder/300/200',
      category: 'first-time-buyer'
    },
    {
      id: '3',
      title: 'Credit Score Improvement',
      description: 'Tips to improve your credit score for better rates',
      duration: '6:15',
      thumbnail: '/api/placeholder/300/200',
      category: 'credit'
    },
    {
      id: '4',
      title: 'Down Payment Strategies',
      description: 'Different ways to save for your down payment',
      duration: '9:20',
      thumbnail: '/api/placeholder/300/200',
      category: 'financing'
    }
  ];

  const mockFAQs: FAQ[] = [
    {
      id: '1',
      question: 'What is a good credit score for a mortgage?',
      answer: 'A credit score of 620 or higher is generally considered good for conventional loans, while FHA loans may accept scores as low as 580.',
      category: 'credit'
    },
    {
      id: '2',
      question: 'How much down payment do I need?',
      answer: 'Conventional loans typically require 5-20% down, while FHA loans can go as low as 3.5% down payment.',
      category: 'financing'
    },
    {
      id: '3',
      question: 'What documents do I need for pre-approval?',
      answer: 'You\'ll need pay stubs, tax returns, bank statements, and employment verification documents.',
      category: 'application'
    },
    {
      id: '4',
      question: 'How long does the mortgage process take?',
      answer: 'The typical mortgage process takes 30-45 days from application to closing.',
      category: 'process'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'mortgage-basics', name: 'Mortgage Basics' },
    { id: 'first-time-buyer', name: 'First-Time Buyer' },
    { id: 'credit', name: 'Credit & Scores' },
    { id: 'financing', name: 'Financing' },
    { id: 'application', name: 'Application Process' },
    { id: 'process', name: 'Closing Process' }
  ];

  const filteredVideos = selectedCategory === 'all' 
    ? mockVideos 
    : mockVideos.filter(video => video.category === selectedCategory);

  const filteredFAQs = selectedCategory === 'all' 
    ? mockFAQs 
    : mockFAQs.filter(faq => faq.category === selectedCategory);

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className={`${classes.card.header}`}>
        <h2 className={`${classes.heading.h2}`}>
          Learning Center
        </h2>
        <p className={`${classes.body.base}`}>
          Educational resources to help you navigate the home buying process
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'videos', label: 'Videos', icon: 'play' },
            { id: 'faq', label: 'FAQ', icon: 'help-circle' },
            { id: 'guides', label: 'Guides', icon: 'book' }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md font-medium transition-all duration-200 ${
                activeSection === section.id
                  ? 'shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white'
              }`}
              style={activeSection === section.id ? {
                backgroundColor: colors.primary,
                color: colors.background
              } : {}}
            >
              <Icon name={section.icon as any} size={20} />
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'border'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={selectedCategory === category.id ? {
                backgroundColor: `${colors.primary}20`,
                color: colors.primary,
                borderColor: colors.primary
              } : {}}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      {activeSection === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div key={video.id} className={`${classes.card.container}`}>
              <div className={`${classes.card.body}`}>
                <div className="relative mb-4">
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <Icon name="play" size={48} color={colors.textSecondary} />
                  </div>
                  <div className={`absolute bottom-2 right-2 ${classes.status.info}`}>
                    {video.duration}
                  </div>
                </div>
                <h3 className={`${classes.heading.h5} mb-2`}>
                  {video.title}
                </h3>
                <p className={`${classes.body.small} mb-4`}>
                  {video.description}
                </p>
                <button 
                  className={`${classes.button.primary} w-full flex items-center justify-center space-x-2`}
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.background,
                    borderColor: colors.primary
                  }}
                >
                  <Icon name="play" size={16} color={colors.background} />
                  <span>Watch Video</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'faq' && (
        <div className="space-y-4">
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className={`${classes.card.container}`}>
              <div className={`${classes.card.body}`}>
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  className="w-full text-left flex items-center justify-between"
                >
                  <h3 className={`${classes.heading.h5}`}>
                    {faq.question}
                  </h3>
                  <Icon 
                    name={expandedFAQ === faq.id ? 'chevronUp' : 'chevronDown'} 
                    size={20} 
                    color={colors.textSecondary}
                  />
                </button>
                {expandedFAQ === faq.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className={`${classes.body.base}`}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'guides' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`${classes.card.container}`}>
            <div className={`${classes.card.body}`}>
              <div className={`${classes.icon.primary}`}>
                  <Icon name="book" size={24} color={colors.primary} />
              </div>
              <h3 className={`${classes.heading.h5}`}>
                First-Time Home Buyer Guide
              </h3>
              <p className={`${classes.body.small} mb-4`}>
                Complete step-by-step guide for first-time home buyers
              </p>
              <button 
                className={`${classes.button.outline} w-full`}
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.primary,
                  color: colors.primary
                }}
              >
                Download Guide
              </button>
            </div>
          </div>

          <div className={`${classes.card.container}`}>
            <div className={`${classes.card.body}`}>
              <div className={`${classes.icon.primary}`}>
                  <Icon name="calculator" size={24} color={colors.primary} />
              </div>
              <h3 className={`${classes.heading.h5}`}>
                Mortgage Calculator Guide
              </h3>
              <p className={`${classes.body.small} mb-4`}>
                Learn how to calculate your monthly payments and affordability
              </p>
              <button 
                className={`${classes.button.outline} w-full`}
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.primary,
                  color: colors.primary
                }}
              >
                Download Guide
              </button>
            </div>
          </div>

          <div className={`${classes.card.container}`}>
            <div className={`${classes.card.body}`}>
              <div className={`${classes.icon.primary}`}>
                <Icon name="shield" size={24} color={colors.primary} />
              </div>
              <h3 className={`${classes.heading.h5}`}>
                Credit Score Improvement
              </h3>
              <p className={`${classes.body.small} mb-4`}>
                Tips and strategies to improve your credit score
              </p>
              <button 
                className={`${classes.button.outline} w-full`}
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.primary,
                  color: colors.primary
                }}
              >
                Download Guide
              </button>
            </div>
          </div>

          <div className={`${classes.card.container}`}>
            <div className={`${classes.card.body}`}>
              <div className={`${classes.icon.primary}`}>
                  <Icon name="fileText" size={24} color={colors.primary} />
              </div>
              <h3 className={`${classes.heading.h5}`}>
                Document Checklist
              </h3>
              <p className={`${classes.body.small} mb-4`}>
                Complete list of documents needed for your mortgage application
              </p>
              <button 
                className={`${classes.button.outline} w-full`}
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.primary,
                  color: colors.primary
                }}
              >
                Download Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className={`${classes.card.container} mt-8`}>
        <div className={`${classes.card.body} text-center`}>
          <h3 className={`${classes.heading.h4} mb-2`}>
            Need Personalized Help?
          </h3>
          <p className={`${classes.body.base} mb-6`}>
            Our loan officers are here to answer your questions and guide you through the process
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className={`${classes.button.primary} flex items-center justify-center space-x-2`}
              style={{
                backgroundColor: colors.primary,
                color: colors.background,
                borderColor: colors.primary
              }}
            >
              <Icon name="phone" size={20} color={colors.background} />
              <span>Call Now</span>
            </button>
            <button 
              className={`${classes.button.outline} flex items-center justify-center space-x-2`}
              style={{
                backgroundColor: colors.background,
                borderColor: colors.primary,
                color: colors.primary
              }}
            >
              <Icon name="mail" size={20} color={colors.primary} />
              <span>Send Message</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}