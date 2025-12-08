'use client';

import React, { useState, useEffect } from 'react';
import { typography } from '@/theme/theme';
import { useEfficientTemplates } from '@/contexts/UnifiedTemplateContext';
import { useAuth } from '@/hooks/use-auth';
import Icon from '@/components/ui/Icon';
import { supabase } from '@/lib/supabase/client';

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
  userId?: string; // For fetching content
}

export default function LearningCenterTab({
  selectedTemplate,
  className = '',
  // NEW: Public mode props
  isPublic = false,
  publicTemplateData,
  userId
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
    secondary: '#01bcc6',
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
      primary: 'px-6 py-3 font-medium transition-all duration-200 shadow-sm hover:shadow-md text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 font-medium transition-all duration-200 border border-gray-300',
      outline: 'border-2 px-6 py-3 font-medium transition-all duration-200',
      ghost: 'px-4 py-2 font-medium transition-all duration-200'
    },
    card: {
      container: 'bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200',
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
        ? 'w-12 h-12 flex items-center justify-center mb-4'
        : 'w-12 h-12 flex items-center justify-center mb-4',
      secondary: 'w-10 h-10 bg-gray-100 flex items-center justify-center mb-3',
      small: selectedTemplate === 'template2'
        ? 'w-8 h-8 flex items-center justify-center'
        : 'w-8 h-8 flex items-center justify-center'
    },
    status: {
      success: 'text-green-600 bg-green-50 px-2 py-1 text-sm',
      warning: 'text-yellow-600 bg-yellow-50 px-2 py-1 text-sm',
      error: 'text-red-600 bg-red-50 px-2 py-1 text-sm',
      info: 'text-[#01bcc6] bg-[#01bcc6]/10 px-2 py-1 text-sm'
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
  
  // State for fetched content
  const [videos, setVideos] = useState<Video[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [videoDataMap, setVideoDataMap] = useState<Map<string, any>>(new Map()); // Store full video data with URLs
  const [loadingContent, setLoadingContent] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Mock data as fallback
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

  // Fetch content from API
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoadingContent(true);
        const officerId = userId || (isPublic ? (publicTemplateData?.profileData?.user?.id) : user?.id);
        
        if (!officerId) {
          // Use mock data if no officer ID
          setVideos(mockVideos);
          setFaqs(mockFAQs);
          setLoadingContent(false);
          return;
        }

        if (isPublic) {
          // Fetch from public API
          const response = await fetch(`/api/public/content/${officerId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              // Transform API data to component format
              const videosList = (data.data.videos || []).map((v: any) => ({
                id: v.id,
                title: v.title,
                description: v.description || '',
                duration: v.duration || '',
                thumbnail: v.thumbnailUrl || '',
                category: v.category
              }));
              setVideos(videosList);
              // Store full video data for URL access
              const videoMap = new Map();
              (data.data.videos || []).forEach((v: any) => {
                videoMap.set(v.id, v);
              });
              setVideoDataMap(videoMap);
              setFaqs((data.data.faqs || []).map((f: any) => ({
                id: f.id,
                question: f.question,
                answer: f.answer,
                category: f.category
              })));
              setGuides(data.data.guides || []);
            }
          }
        } else {
          // Fetch from authenticated API
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) {
            // Use mock data if no auth token
            setVideos(mockVideos);
            setFaqs(mockFAQs);
            setLoadingContent(false);
            return;
          }

          const [faqsRes, videosRes, guidesRes] = await Promise.all([
            fetch('/api/officers/content/faqs', {
              headers: { 'Authorization': `Bearer ${session.access_token}` }
            }),
            fetch('/api/officers/content/videos', {
              headers: { 'Authorization': `Bearer ${session.access_token}` }
            }),
            fetch('/api/officers/content/guides', {
              headers: { 'Authorization': `Bearer ${session.access_token}` }
            })
          ]);

          if (videosRes.ok) {
            const videosData = await videosRes.json();
            if (videosData.success) {
              const videosList = (videosData.data || []).map((v: any) => ({
                id: v.id,
                title: v.title,
                description: v.description || '',
                duration: v.duration || '',
                thumbnail: v.thumbnailUrl || '',
                category: v.category
              }));
              setVideos(videosList);
              // Store full video data for URL access
              const videoMap = new Map();
              (videosData.data || []).forEach((v: any) => {
                videoMap.set(v.id, v);
              });
              setVideoDataMap(videoMap);
            }
          }

          if (faqsRes.ok) {
            const faqsData = await faqsRes.json();
            if (faqsData.success) {
              setFaqs((faqsData.data || []).map((f: any) => ({
                id: f.id,
                question: f.question,
                answer: f.answer,
                category: f.category
              })));
            }
          }

          if (guidesRes.ok) {
            const guidesData = await guidesRes.json();
            if (guidesData.success) {
              setGuides(guidesData.data || []);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        // Fallback to mock data on error
        setVideos(mockVideos);
        setFaqs(mockFAQs);
      } finally {
        setLoadingContent(false);
      }
    };

    fetchContent();
  }, [user, userId, isPublic, publicTemplateData]);

  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  const filteredFAQs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);
  
  const filteredGuides = selectedCategory === 'all'
    ? guides
    : guides.filter((guide: any) => guide.category === selectedCategory);

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
      <div className="mb-8 mt-8">
        <div className="flex space-x-1 bg-gray-100 p-1" style={{ borderRadius: `${layout.borderRadius}px` }}>
          {[
            { id: 'videos', label: 'Videos', icon: 'play' },
            { id: 'faq', label: 'FAQ', icon: 'help-circle' },
            { id: 'guides', label: 'Guides', icon: 'book' }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 font-medium transition-all duration-200 ${
                activeSection === section.id
                  ? 'shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white'
              }`}
              style={activeSection === section.id ? {
                backgroundColor: colors.primary,
                color: colors.background,
                borderRadius: `${layout.borderRadius}px`
              } : {
                borderRadius: `${layout.borderRadius}px`
              }}
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
              className={`px-4 py-2 font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'border'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={selectedCategory === category.id ? {
                backgroundColor: `${colors.primary}20`,
                color: colors.primary,
                borderColor: colors.primary,
                borderRadius: `${layout.borderRadius}px`
              } : {
                borderRadius: `${layout.borderRadius}px`
              }}
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
            <div key={video.id} className={`${classes.card.container}`} style={{ borderRadius: `${layout.borderRadius}px` }}>
              <div className={`${classes.card.body}`}>
                <div className="relative mb-4">
                  {video.thumbnail ? (
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full aspect-video object-cover"
                      style={{ borderRadius: `${layout.borderRadius}px` }}
                    />
                  ) : (
                    <div className="aspect-video bg-gray-200 flex items-center justify-center" style={{ borderRadius: `${layout.borderRadius}px` }}>
                      <Icon name="play" size={48} color={colors.textSecondary} />
                    </div>
                  )}
                  {video.duration && (
                    <div className={`absolute bottom-2 right-2 ${classes.status.info}`} style={{ borderRadius: `${layout.borderRadius}px` }}>
                      {video.duration}
                    </div>
                  )}
                </div>
                <h3 className={`${classes.heading.h5} mb-2`}>
                  {video.title}
                </h3>
                <p className={`${classes.body.small} mb-4`}>
                  {video.description}
                </p>
                <button 
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 font-medium transition-colors"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.background,
                    borderColor: colors.primary,
                    borderRadius: `${layout.borderRadius}px`,
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.secondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary;
                  }}
                  onClick={() => {
                    setSelectedVideo(video);
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
            <div key={faq.id} className={`${classes.card.container}`} style={{ borderRadius: `${layout.borderRadius}px` }}>
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
          {filteredGuides.length === 0 ? (
            <div className={`${classes.card.container} col-span-2`} style={{ borderRadius: `${layout.borderRadius}px` }}>
              <div className={`${classes.card.body} text-center`}>
                <p className={classes.body.base}>No guides available yet.</p>
              </div>
            </div>
          ) : (
            filteredGuides.map((guide: any) => (
              <div key={guide.id} className={`${classes.card.container}`} style={{ borderRadius: `${layout.borderRadius}px` }}>
                <div className={`${classes.card.body}`}>
                  <div className={`${classes.icon.primary}`}>
                    <Icon name="book" size={24} color={colors.primary} />
                  </div>
                  <h3 className={`${classes.heading.h5}`}>
                    {guide.name}
                  </h3>
                  <p className={`${classes.body.small} mb-4`}>
                    {guide.file_name}
                  </p>
                  <a
                    href={guide.funnelUrl || guide.funnel_url || guide.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 font-medium transition-colors border-2"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.primary,
                      color: colors.primary,
                      borderRadius: `${layout.borderRadius}px`,
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.primary + '10';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = colors.background;
                    }}
                  >
                    Download Guide
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Call to Action */}
      <div className={`${classes.card.container} mt-6`} style={{ borderRadius: `${layout.borderRadius}px` }}>
        <div className={`${classes.card.body} text-center`}>
          <h3 className={`${classes.heading.h4} mb-2`}>
            Need Personalized Help?
          </h3>
          <p className={`${classes.body.base} mb-6`}>
            Our loan officers are here to answer your questions and guide you through the process
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="flex items-center justify-center gap-2 px-6 py-3 font-medium transition-colors"
              style={{
                backgroundColor: colors.primary,
                color: colors.background,
                borderColor: colors.primary,
                borderRadius: `${layout.borderRadius}px`,
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary;
              }}
            >
              <Icon name="phone" size={20} color={colors.background} />
              <span>Call Now</span>
            </button>
            <button 
              className="flex items-center justify-center gap-2 px-6 py-3 font-medium transition-colors border-2"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.primary,
                color: colors.primary,
                borderRadius: `${layout.borderRadius}px`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary + '10';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.background;
              }}
            >
              <Icon name="mail" size={20} color={colors.primary} />
              <span>Send Message</span>
            </button>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="relative bg-black rounded-lg w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ borderRadius: `${layout.borderRadius}px` }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className={`${classes.heading.h5}`} style={{ color: colors.background }}>
                {selectedVideo.title}
              </h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Icon name="close" size={24} />
              </button>
            </div>
            
            {/* Video Player */}
            <div className="relative flex-1 flex items-center justify-center p-4">
              {(() => {
                const videoData = videoDataMap.get(selectedVideo.id);
                const videoUrl = videoData?.videoUrl || videoData?.video_url;
                if (videoUrl) {
                  return (
                    <video
                      controls
                      autoPlay
                      className="w-full h-full max-h-[70vh]"
                      style={{ borderRadius: `${layout.borderRadius}px` }}
                    >
                      <source src={videoUrl} type="video/mp4" />
                      <source src={videoUrl} type="video/webm" />
                      <source src={videoUrl} type="video/quicktime" />
                      Your browser does not support the video tag.
                    </video>
                  );
                }
                return (
                  <p className="text-white">Video URL not available</p>
                );
              })()}
            </div>
            
            {/* Video Description */}
            {selectedVideo.description && (
              <div className="p-4 border-t border-gray-700">
                <p className={`${classes.body.small}`} style={{ color: colors.textSecondary }}>
                  {selectedVideo.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}