'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { useNotification } from '@/components/ui/Notification';
import { PageLoadingState } from '@/components/ui/LoadingState';
import { supabase } from '@/lib/supabase/client';
import Icon from '@/components/ui/Icon';
import SpotlightCard from '@/components/ui/SpotlightCard';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: string;
  cloudinaryPublicId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Guide {
  id: string;
  name: string;
  category: string;
  file_url: string;
  file_name: string;
  file_type: string;
  cloudinary_public_id: string;
  funnelUrl?: string;
  created_at?: string;
  updated_at?: string;
}

// Categories for FAQs and Guides (keep existing)
const categories = [
  { id: 'mortgage-basics', name: 'Mortgage Basics' },
  { id: 'first-time-buyer', name: 'First-Time Buyer' },
  { id: 'credit', name: 'Credit & Scores' },
  { id: 'financing', name: 'Financing' },
  { id: 'application', name: 'Application Process' },
  { id: 'process', name: 'Closing Process' }
];

// Video loan categories - all sub-categories from all 3 tabs
const videoCategories = [
  // Purchase Loans
  { id: 'conventional', name: 'Conventional', group: 'Purchase Loans' },
  { id: 'va-loan', name: 'VA Loan', group: 'Purchase Loans' },
  { id: 'fha-loan', name: 'FHA Loan', group: 'Purchase Loans' },
  { id: 'jumbo-loan', name: 'Jumbo Loan', group: 'Purchase Loans' },
  { id: 'usda-loan', name: 'USDA Loan', group: 'Purchase Loans' },
  { id: '2nd-mortgage', name: '2nd Mortgage', group: 'Purchase Loans' },
  { id: 'construction-loan', name: 'Construction Loan', group: 'Purchase Loans' },
  { id: 'down-payment-assistance-loan', name: 'Down Payment Assistance Loan', group: 'Purchase Loans' },
  // Refinance Loans
  { id: 'streamline', name: 'Streamline', group: 'Refinance Loans' },
  { id: 'va-irrrl', name: 'VA IRRRL', group: 'Refinance Loans' },
  { id: 'heloc', name: 'HELOC', group: 'Refinance Loans' },
  { id: 'cash-out', name: 'Cash-Out', group: 'Refinance Loans' },
  // Non-QM Loans
  { id: '1099-loans', name: '1099 Loans', group: 'Non-QM Loans' },
  { id: 'va-irrrl', name: 'VA IRRRL', group: 'Non-QM Loans' },
  { id: 'heloc', name: 'HELOC', group: 'Non-QM Loans' },
  { id: 'cash-out', name: 'Cash-Out', group: 'Non-QM Loans' }
];

type TabType = 'faqs' | 'videos' | 'guides';

export default function ContentManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const { showNotification } = useNotification();
  
  const [activeTab, setActiveTab] = useState<TabType>('faqs');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  
  // FAQ states
  const [faqForm, setFaqForm] = useState<FAQ[]>([]);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [deletingFaq, setDeletingFaq] = useState<string | null>(null);
  const [savingFaqs, setSavingFaqs] = useState(false);
  const [updatingFaq, setUpdatingFaq] = useState<string | null>(null);
  const [deletingFaqId, setDeletingFaqId] = useState<string | null>(null);
  
  // Video states
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    category: '',
    videoFile: null as File | null,
    thumbnailFile: null as File | null
  });
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoPreview, setVideoPreview] = useState<{ url: string; thumbnail: string; duration: string } | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [updatingVideo, setUpdatingVideo] = useState<string | null>(null);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  
  // Guide states
  const [guideForm, setGuideForm] = useState({
    name: '',
    category: '',
    file: null as File | null,
    funnelUrl: ''
  });
  const [guideUploadProgress, setGuideUploadProgress] = useState(0);
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [deletingGuide, setDeletingGuide] = useState<string | null>(null);
  const [uploadingGuide, setUploadingGuide] = useState(false);
  const [updatingGuide, setUpdatingGuide] = useState<string | null>(null);
  const [deletingGuideId, setDeletingGuideId] = useState<string | null>(null);

  // Refs to prevent unnecessary refetches
  const hasLoadedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  // Get auth token
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  // Fetch all content
  const fetchContent = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const [faqsRes, videosRes, guidesRes] = await Promise.all([
        fetch('/api/officers/content/faqs', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/officers/content/videos', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/officers/content/guides', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (faqsRes.ok) {
        const faqsData = await faqsRes.json();
        setFaqs(faqsData.data || []);
      }
      if (videosRes.ok) {
        const videosData = await videosRes.json();
        setVideos(videosData.data || []);
      }
      if (guidesRes.ok) {
        const guidesData = await guidesRes.json();
        setGuides(guidesData.data || []);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load content'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      const userId = user.id;
      
      // Only fetch if:
      // 1. We haven't loaded yet, OR
      // 2. The user ID actually changed
      if (!hasLoadedRef.current || lastUserIdRef.current !== userId) {
        hasLoadedRef.current = true;
        lastUserIdRef.current = userId;
        fetchContent();
      }
    }
  }, [user?.id, authLoading]);

  // FAQ handlers
  const addFaqToForm = () => {
    setFaqForm([...faqForm, { id: '', question: '', answer: '', category: '' }]);
  };

  const removeFaqFromForm = (index: number) => {
    setFaqForm(faqForm.filter((_, i) => i !== index));
  };

  const updateFaqInForm = (index: number, field: keyof FAQ, value: string) => {
    const updated = [...faqForm];
    updated[index] = { ...updated[index], [field]: value };
    setFaqForm(updated);
  };

  const saveAllFaqs = async () => {
    if (faqForm.length === 0) {
      showNotification({
        type: 'warning',
        title: 'No FAQs',
        message: 'Please add at least one FAQ'
      });
      return;
    }

    // Validate that all FAQs have required fields
    const missingFields: string[] = [];
    faqForm.forEach((faq, index) => {
      if (!faq.question) missingFields.push(`FAQ ${index + 1}: Question`);
      if (!faq.answer) missingFields.push(`FAQ ${index + 1}: Answer`);
      if (!faq.category) missingFields.push(`FAQ ${index + 1}: Category`);
    });

    if (missingFields.length > 0) {
      showNotification({
        type: 'warning',
        title: 'Missing Information',
        message: `Please fill in the following required fields: ${missingFields.join(', ')}`
      });
      return;
    }

    try {
      setSavingFaqs(true);
      const token = await getAuthToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch('/api/officers/content/faqs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ faqs: faqForm })
      });

      const data = await response.json();
      if (data.success) {
        showNotification({
          type: 'success',
          title: 'Success',
          message: `Successfully created ${faqForm.length} FAQ(s)`
        });
        setFaqForm([]);
        fetchContent();
      } else {
        throw new Error(data.error || 'Failed to save FAQs');
      }
    } catch (error) {
      console.error('Error saving FAQs:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to save FAQs'
      });
    } finally {
      setSavingFaqs(false);
    }
  };

  const updateFaq = async (faq: FAQ) => {
    // Validate required fields
    const missingFields: string[] = [];
    if (!faq.question) missingFields.push('Question');
    if (!faq.answer) missingFields.push('Answer');
    if (!faq.category) missingFields.push('Category');

    if (missingFields.length > 0) {
      showNotification({
        type: 'warning',
        title: 'Missing Information',
        message: `Please fill in the following required fields: ${missingFields.join(', ')}`
      });
      return;
    }

    try {
      setUpdatingFaq(faq.id);
      const token = await getAuthToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`/api/officers/content/faqs/${faq.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: faq.question,
          answer: faq.answer,
          category: faq.category
        })
      });

      const data = await response.json();
      if (data.success) {
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'FAQ updated successfully'
        });
        setEditingFaq(null);
        fetchContent();
      } else {
        throw new Error(data.error || 'Failed to update FAQ');
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update FAQ'
      });
    } finally {
      setUpdatingFaq(null);
    }
  };

  const deleteFaq = async (id: string) => {
    try {
      setDeletingFaqId(id);
      const token = await getAuthToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`/api/officers/content/faqs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'FAQ deleted successfully'
        });
        setDeletingFaq(null);
        fetchContent();
      } else {
        throw new Error(data.error || 'Failed to delete FAQ');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete FAQ'
      });
    } finally {
      setDeletingFaqId(null);
    }
  };

  // Video handlers
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoForm({ ...videoForm, videoFile: file });
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoForm({ ...videoForm, thumbnailFile: file });
    }
  };

  const uploadVideo = async () => {
    const missingFields: string[] = [];
    if (!videoForm.videoFile) missingFields.push('Video File');
    if (!videoForm.title) missingFields.push('Title');
    if (!videoForm.category) missingFields.push('Category');

    if (missingFields.length > 0) {
      showNotification({
        type: 'warning',
        title: 'Missing Information',
        message: `Please fill in the following required fields: ${missingFields.join(', ')}`
      });
      return;
    }

    try {
      setUploadingVideo(true);
      setVideoUploadProgress(0);
      const token = await getAuthToken();
      if (!token) throw new Error('No authentication token');

      // Upload video
      const formData = new FormData();
      formData.append('video', videoForm.videoFile!);
      if (videoForm.thumbnailFile) {
        formData.append('thumbnail', videoForm.thumbnailFile);
      }

      const uploadRes = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Failed to upload video');
      }

      setVideoUploadProgress(100);
      setVideoPreview({
        url: uploadData.data.video_url,
        thumbnail: uploadData.data.thumbnail_url,
        duration: uploadData.data.duration
      });

      // Save video to database
      const saveRes = await fetch('/api/officers/content/videos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: videoForm.title,
          description: videoForm.description,
          category: videoForm.category,
          video_url: uploadData.data.video_url,
          thumbnail_url: uploadData.data.thumbnail_url,
          duration: uploadData.data.duration,
          cloudinary_public_id: uploadData.data.public_id
        })
      });

      const saveData = await saveRes.json();
      if (saveData.success) {
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Video uploaded and saved successfully'
        });
        setVideoForm({ title: '', description: '', category: '', videoFile: null, thumbnailFile: null });
        setVideoPreview(null);
        setVideoUploadProgress(0);
        fetchContent();
      } else {
        throw new Error(saveData.error || 'Failed to save video');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to upload video'
      });
      setVideoUploadProgress(0);
    } finally {
      setUploadingVideo(false);
    }
  };

  const updateVideo = async (video: Video) => {
    // Validate required fields
    const missingFields: string[] = [];
    if (!video.title) missingFields.push('Title');
    if (!video.category) missingFields.push('Category');

    if (missingFields.length > 0) {
      showNotification({
        type: 'warning',
        title: 'Missing Information',
        message: `Please fill in the following required fields: ${missingFields.join(', ')}`
      });
      return;
    }

    try {
      setUpdatingVideo(video.id);
      const token = await getAuthToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`/api/officers/content/videos/${video.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: video.title,
          description: video.description,
          category: video.category,
          thumbnail_url: video.thumbnailUrl
        })
      });

      const data = await response.json();
      if (data.success) {
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Video updated successfully'
        });
        setEditingVideo(null);
        fetchContent();
      } else {
        throw new Error(data.error || 'Failed to update video');
      }
    } catch (error) {
      console.error('Error updating video:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update video'
      });
    } finally {
      setUpdatingVideo(null);
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      setDeletingVideoId(id);
      const token = await getAuthToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`/api/officers/content/videos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Video deleted successfully'
        });
        setDeletingVideo(null);
        fetchContent();
      } else {
        throw new Error(data.error || 'Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete video'
      });
    } finally {
      setDeletingVideoId(null);
    }
  };

  // Guide handlers
  const handleGuideFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGuideForm({ ...guideForm, file, name: file.name });
    }
  };

  const uploadGuide = async () => {
    const missingFields: string[] = [];
    if (!guideForm.file) missingFields.push('File');
    if (!guideForm.name) missingFields.push('Name');
    if (!guideForm.category) missingFields.push('Category');

    if (missingFields.length > 0) {
      showNotification({
        type: 'warning',
        title: 'Missing Information',
        message: `Please fill in the following required fields: ${missingFields.join(', ')}`
      });
      return;
    }

    try {
      setUploadingGuide(true);
      setGuideUploadProgress(0);
      const token = await getAuthToken();
      if (!token) throw new Error('No authentication token');

      // Upload guide
      const formData = new FormData();
      formData.append('guide', guideForm.file!);

      const uploadRes = await fetch('/api/upload/guide', {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Failed to upload guide');
      }

      setGuideUploadProgress(100);

      // Save guide to database
      const saveRes = await fetch('/api/officers/content/guides', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: guideForm.name,
          category: guideForm.category,
          file_url: uploadData.data.file_url,
          file_name: uploadData.data.file_name,
          file_type: uploadData.data.file_type,
          cloudinary_public_id: uploadData.data.public_id,
          funnel_url: guideForm.funnelUrl || null
        })
      });

      const saveData = await saveRes.json();
      if (saveData.success) {
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Guide uploaded and saved successfully'
        });
        setGuideForm({ name: '', category: '', file: null, funnelUrl: '' });
        setGuideUploadProgress(0);
        fetchContent();
      } else {
        throw new Error(saveData.error || 'Failed to save guide');
      }
    } catch (error) {
      console.error('Error uploading guide:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to upload guide'
      });
      setGuideUploadProgress(0);
    } finally {
      setUploadingGuide(false);
    }
  };

  const updateGuide = async (guide: Guide) => {
    // Validate required fields
    const missingFields: string[] = [];
    if (!guide.name) missingFields.push('Name');
    if (!guide.category) missingFields.push('Category');

    if (missingFields.length > 0) {
      showNotification({
        type: 'warning',
        title: 'Missing Information',
        message: `Please fill in the following required fields: ${missingFields.join(', ')}`
      });
      return;
    }

    try {
      setUpdatingGuide(guide.id);
      const token = await getAuthToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`/api/officers/content/guides/${guide.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: guide.name,
          category: guide.category,
          funnel_url: guide.funnelUrl || null
        })
      });

      const data = await response.json();
      if (data.success) {
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Guide updated successfully'
        });
        setEditingGuide(null);
        fetchContent();
      } else {
        throw new Error(data.error || 'Failed to update guide');
      }
    } catch (error) {
      console.error('Error updating guide:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update guide'
      });
    } finally {
      setUpdatingGuide(null);
    }
  };

  const deleteGuide = async (id: string) => {
    try {
      setDeletingGuideId(id);
      const token = await getAuthToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`/api/officers/content/guides/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        showNotification({
          type: 'success',
          title: 'Success',
          message: 'Guide deleted successfully'
        });
        setDeletingGuide(null);
        fetchContent();
      } else {
        throw new Error(data.error || 'Failed to delete guide');
      }
    } catch (error) {
      console.error('Error deleting guide:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete guide'
      });
    } finally {
      setDeletingGuideId(null);
    }
  };

  // Spinner component helper
  const Spinner = ({ className = 'text-white' }: { className?: string }) => (
    <svg
      className={`animate-spin -ml-1 mr-2 h-4 w-4 ${className}`}
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

  if (authLoading || loading) {
    return <PageLoadingState />;
  }

  return (
    <DashboardLayout>
      <div className="p-0 sm:p-6">
        <h1 className="text-3xl font-bold mb-6">Content Management</h1>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'videos', label: 'Videos', icon: 'play' },
              { id: 'faqs', label: 'FAQs', icon: 'help-circle' },
              { id: 'guides', label: 'Guides', icon: 'book' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 font-medium transition-all duration-200 rounded-lg ${
                  activeTab === tab.id
                    ? 'bg-white shadow-sm text-[#005b7c]'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon name={tab.icon as any} size={20} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <div className="space-y-6">
            <SpotlightCard variant="default" className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add FAQs</h2>
                <button
                  type="button"
                  onClick={addFaqToForm}
                  className="flex items-center gap-2 px-4 py-2 bg-[#005b7c] text-white rounded-lg hover:bg-[#004a65] transition-colors"
                >
                  <Icon name="plus" size={16} />
                  Add Another FAQ
                </button>
              </div>

              {faqForm.length === 0 ? (
                <p className="text-gray-500 mb-4">No FAQs added yet. Click "Add Another FAQ" to get started.</p>
              ) : (
                <div className="space-y-4">
                  {faqForm.map((faq, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold">FAQ {index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => removeFaqFromForm(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Icon name="delete" size={20} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Question *</label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => updateFaqInForm(index, 'question', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Enter question"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Answer *</label>
                          <textarea
                            value={faq.answer}
                            onChange={(e) => updateFaqInForm(index, 'answer', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            rows={3}
                            placeholder="Enter answer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Category *</label>
                          <select
                            value={faq.category}
                            onChange={(e) => updateFaqInForm(index, 'category', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="">Select category</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={saveAllFaqs}
                    disabled={savingFaqs}
                    className="w-full px-6 py-3 bg-[#005b7c] text-white rounded-lg hover:bg-[#004a65] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {savingFaqs && <Spinner />}
                    {savingFaqs ? 'Saving...' : 'Save All FAQs'}
                  </button>
                </div>
              )}
            </SpotlightCard>

            {/* Existing FAQs */}
            <SpotlightCard variant="default" className="p-6">
              <h2 className="text-xl font-bold mb-4">Existing FAQs ({faqs.length})</h2>
              {faqs.length === 0 ? (
                <p className="text-gray-500">No FAQs yet. Add your first FAQ above.</p>
              ) : (
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="border rounded-lg p-4">
                      {editingFaq?.id === faq.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editingFaq.question}
                            onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                          <textarea
                            value={editingFaq.answer}
                            onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                            rows={3}
                          />
                          <select
                            value={editingFaq.category}
                            onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => updateFaq(editingFaq)}
                              disabled={updatingFaq === editingFaq.id}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              {updatingFaq === editingFaq.id && <Spinner />}
                              {updatingFaq === editingFaq.id ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingFaq(null)}
                              disabled={updatingFaq === editingFaq.id}
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">{faq.question}</h3>
                              <p className="text-gray-600 mt-1">{faq.answer}</p>
                              <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {categories.find(c => c.id === faq.category)?.name || faq.category}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingFaq(faq)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Icon name="edit" size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingFaq(faq.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Icon name="delete" size={18} />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SpotlightCard>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            <SpotlightCard variant="default" className="p-6">
              <h2 className="text-xl font-bold mb-4">Add Video</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Video File * (Max 100MB)</label>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                    onChange={handleVideoFileChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Thumbnail (Optional)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleThumbnailFileChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {!videoForm.thumbnailFile && (
                    <p className="text-sm text-gray-500 mt-1">If not provided, a thumbnail will be auto-generated.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter video title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    placeholder="Enter video description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    value={videoForm.category}
                    onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select category</option>
                    {['Purchase Loans', 'Refinance Loans', 'Non-QM Loans'].map((group) => (
                      <optgroup key={group} label={group}>
                        {videoCategories
                          .filter(cat => cat.group === group)
                          .map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                {videoUploadProgress > 0 && videoUploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-[#005b7c] h-2.5 rounded-full transition-all"
                      style={{ width: `${videoUploadProgress}%` }}
                    />
                  </div>
                )}
                {videoPreview && (
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-green-600 mb-2">Video uploaded successfully!</p>
                    <p className="text-sm">Duration: {videoPreview.duration}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={uploadVideo}
                  disabled={uploadingVideo || (videoUploadProgress > 0 && videoUploadProgress < 100)}
                  className="w-full px-6 py-3 bg-[#005b7c] text-white rounded-lg hover:bg-[#004a65] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {uploadingVideo && <Spinner />}
                  {uploadingVideo ? 'Uploading...' : 'Upload Video'}
                </button>
              </div>
            </SpotlightCard>

            {/* Existing Videos */}
            <SpotlightCard variant="default" className="p-6">
              <h2 className="text-xl font-bold mb-4">Existing Videos ({videos.length})</h2>
              {videos.length === 0 ? (
                <p className="text-gray-500">No videos yet. Upload your first video above.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map((video) => (
                    <div key={video.id} className="border rounded-lg p-4">
                      {editingVideo?.id === video.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editingVideo.title}
                            onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                          <textarea
                            value={editingVideo.description || ''}
                            onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                            rows={2}
                          />
                          <select
                            value={editingVideo.category}
                            onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          >
                            {['Purchase Loans', 'Refinance Loans', 'Non-QM Loans'].map((group) => (
                              <optgroup key={group} label={group}>
                                {videoCategories
                                  .filter(cat => cat.group === group)
                                  .map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                  ))}
                              </optgroup>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => updateVideo(editingVideo)}
                              disabled={updatingVideo === editingVideo.id}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              {updatingVideo === editingVideo.id && <Spinner />}
                              {updatingVideo === editingVideo.id ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingVideo(null)}
                              disabled={updatingVideo === editingVideo.id}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {video.thumbnailUrl && (
                            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-32 object-cover rounded mb-2" />
                          )}
                          <h3 className="font-semibold text-sm mb-1">{video.title}</h3>
                          <p className="text-xs text-gray-600 mb-2">{video.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {videoCategories.find(c => c.id === video.category)?.name || categories.find(c => c.id === video.category)?.name || video.category}
                            </span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingVideo(video)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Icon name="edit" size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingVideo(video.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Icon name="delete" size={16} />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SpotlightCard>
          </div>
        )}

        {/* Guides Tab */}
        {activeTab === 'guides' && (
          <div className="space-y-6">
            <SpotlightCard variant="default" className="p-6">
              <h2 className="text-xl font-bold mb-4">Add Guide</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">File * (PDF, DOC, DOCX, TXT, RTF - Max 5MB)</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.rtf"
                    onChange={handleGuideFileChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    value={guideForm.name}
                    onChange={(e) => setGuideForm({ ...guideForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Guide name (auto-filled from filename)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    value={guideForm.category}
                    onChange={(e) => setGuideForm({ ...guideForm, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Funnel URL (Optional)</label>
                  <input
                    type="text"
                    value={guideForm.funnelUrl}
                    onChange={(e) => setGuideForm({ ...guideForm, funnelUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://app.syncly360.com/v2/preview/..."
                  />
                  <p className="text-sm text-gray-500 mt-1">If provided, clicking "Download Guide" will redirect to this URL instead of downloading the file.</p>
                </div>
                {guideUploadProgress > 0 && guideUploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-[#005b7c] h-2.5 rounded-full transition-all"
                      style={{ width: `${guideUploadProgress}%` }}
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={uploadGuide}
                  disabled={uploadingGuide || (guideUploadProgress > 0 && guideUploadProgress < 100)}
                  className="w-full px-6 py-3 bg-[#005b7c] text-white rounded-lg hover:bg-[#004a65] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {uploadingGuide && <Spinner />}
                  {uploadingGuide ? 'Uploading...' : 'Upload Guide'}
                </button>
              </div>
            </SpotlightCard>

            {/* Existing Guides */}
            <SpotlightCard variant="default" className="p-6">
              <h2 className="text-xl font-bold mb-4">Existing Guides ({guides.length})</h2>
              {guides.length === 0 ? (
                <p className="text-gray-500">No guides yet. Upload your first guide above.</p>
              ) : (
                <div className="space-y-4">
                  {guides.map((guide) => (
                    <div key={guide.id} className="border rounded-lg p-4">
                      {editingGuide?.id === guide.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editingGuide.name}
                            onChange={(e) => setEditingGuide({ ...editingGuide, name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                          <select
                            value={editingGuide.category}
                            onChange={(e) => setEditingGuide({ ...editingGuide, category: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                          <div>
                            <label className="block text-sm font-medium mb-1">Funnel URL (Optional)</label>
                            <input
                              type="text"
                              value={editingGuide.funnelUrl || ''}
                              onChange={(e) => setEditingGuide({ ...editingGuide, funnelUrl: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg"
                              placeholder="https://app.syncly360.com/v2/preview/..."
                            />
                            <p className="text-sm text-gray-500 mt-1">If provided, clicking "Download Guide" will redirect to this URL instead of downloading the file.</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => updateGuide(editingGuide)}
                              disabled={updatingGuide === editingGuide.id}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              {updatingGuide === editingGuide.id && <Spinner />}
                              {updatingGuide === editingGuide.id ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingGuide(null)}
                              disabled={updatingGuide === editingGuide.id}
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{guide.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{guide.file_name}</p>
                            <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {categories.find(c => c.id === guide.category)?.name || guide.category}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={guide.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800"
                            >
                              <Icon name="download" size={18} />
                            </a>
                            <button
                              type="button"
                              onClick={() => setEditingGuide(guide)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Icon name="edit" size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingGuide(guide.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Icon name="delete" size={18} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SpotlightCard>
          </div>
        )}

        {/* Delete Confirmation Modals */}
        {deletingFaq && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">Delete FAQ</h3>
              <p className="mb-6">Are you sure you want to delete this FAQ? This action cannot be undone.</p>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setDeletingFaq(null)}
                  disabled={deletingFaqId === deletingFaq}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => deleteFaq(deletingFaq)}
                  disabled={deletingFaqId === deletingFaq}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {deletingFaqId === deletingFaq && <Spinner />}
                  {deletingFaqId === deletingFaq ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {deletingVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">Delete Video</h3>
              <p className="mb-6">Are you sure you want to delete this video? This action cannot be undone.</p>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setDeletingVideo(null)}
                  disabled={deletingVideoId === deletingVideo}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => deleteVideo(deletingVideo)}
                  disabled={deletingVideoId === deletingVideo}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {deletingVideoId === deletingVideo && <Spinner />}
                  {deletingVideoId === deletingVideo ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {deletingGuide && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">Delete Guide</h3>
              <p className="mb-6">Are you sure you want to delete this guide? This action cannot be undone.</p>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setDeletingGuide(null)}
                  disabled={deletingGuideId === deletingGuide}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => deleteGuide(deletingGuide)}
                  disabled={deletingGuideId === deletingGuide}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {deletingGuideId === deletingGuide && <Spinner />}
                  {deletingGuideId === deletingGuide ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

