'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { EmailInput, PasswordInput } from '@/components/ui/Input';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { useNotification } from '@/components/ui/Notification';
import { supabase } from '@/lib/supabase/client';
import { PageLoadingState } from '@/components/ui/LoadingState';
import { dashboard } from '@/theme/theme';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Save,
  Eye,
  EyeOff,
  Building2,
  Phone,
  Globe,
  MapPin,
  Award,
  Users,
  Calendar,
  MessageSquare,
  Upload
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CompanyProfile {
  id: string;
  name: string;
  // Legacy fields (existing)
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  address?: any;
  license_number?: string;
  // New fields (non-redundant)
  company_tagline?: string;
  company_description?: string;
  company_nmls_number?: string;
  company_established_year?: number;
  company_team_size?: string;
  company_specialties?: string[];
  company_awards?: string[];
  company_testimonials?: string[];
  company_social_media?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  company_branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoVariations?: string[];
  };
  company_contact_info?: {
    mainPhone?: string;
    mainEmail?: string;
    supportEmail?: string;
  };
  company_business_hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  company_service_areas?: string[];
  company_languages?: string[];
  company_certifications?: string[];
  company_version?: number;
}

export default function AdminSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  
  // Form states
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Personal Info form
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });
  
  // Email change form
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    currentPassword: ''
  });
  
  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Avatar upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Company logo upload
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null);

  // Company Profile form
  const [companyForm, setCompanyForm] = useState({
    // Legacy fields (existing)
    phone: '',
    email: '',
    website: '',
    logo: '',
    address: '',
    license_number: '',
    // New fields (non-redundant)
    company_tagline: '',
    company_description: '',
    company_nmls_number: '',
    companyEstablishedYear: new Date().getFullYear(),
    companyTeamSize: '',
    companySpecialties: [] as string[],
    companySocialMedia: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: ''
    },
    companyBranding: {
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
      logoVariations: [] as string[]
    },
    companyContactInfo: {
      mainPhone: '',
      mainEmail: '',
      supportEmail: ''
    },
    companyBusinessHours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '10:00 AM - 4:00 PM',
      sunday: 'Closed'
    },
    companyServiceAreas: [] as string[],
    companyLanguages: ['English'],
    companyCertifications: [] as string[]
  });
  
  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'email' | 'password' | 'avatar' | 'company'>('personal');
  const [previousTab, setPreviousTab] = useState<'personal' | 'email' | 'password' | 'avatar' | 'company' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle tab change with sliding animation
  const handleTabChange = (newTab: 'personal' | 'email' | 'password' | 'avatar' | 'company') => {
    if (newTab === activeTab || isAnimating) return;
    
    setPreviousTab(activeTab);
    setIsAnimating(true);
    
    // Determine slide direction based on tab order
    const tabOrder = ['personal', 'email', 'password', 'avatar', 'company'];
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(newTab);
    const slideDirection = newIndex > currentIndex ? 'slide-right' : 'slide-left';
    
    // Set the new active tab
    setActiveTab(newTab);
    
    // Reset animation after transition completes
    setTimeout(() => {
      setIsAnimating(false);
      setPreviousTab(null);
    }, 300);
  };

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setProfile(data);
        setPersonalInfo({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          phone: data.phone || ''
        });
        setEmailForm({
          newEmail: data.email || '',
          currentPassword: ''
        });
        setAvatarPreview(data.avatar);
      } catch (error) {
        console.error('Error fetching profile:', error);
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load profile data'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, showNotification]);

  // Fetch company profile
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      if (!user?.id) return;
      
      try {
        // Get user's company ID
        const { data: userCompany, error: userCompanyError } = await supabase
          .from('user_companies')
          .select('company_id')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        if (userCompanyError || !userCompany) {
          console.log('User is not a company admin or no company found');
          return;
        }

        // Fetch company profile data
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select(`
            id,
            name,
            phone,
            email,
            website,
            logo,
            address,
            license_number,
            company_tagline,
            company_description,
            company_nmls_number,
            company_established_year,
            company_team_size,
            company_specialties,
            company_awards,
            company_testimonials,
            company_social_media,
            company_branding,
            company_contact_info,
            company_business_hours,
            company_service_areas,
            company_languages,
            company_certifications
          `)
          .eq('id', userCompany.company_id)
          .single();

        if (companyError) throw companyError;

        setCompanyProfile(companyData);
        setCompanyLogoPreview(companyData.logo);
        setCompanyForm({
          // Legacy fields (existing)
          phone: companyData.phone || '',
          email: companyData.email || '',
          website: companyData.website || '',
          logo: companyData.logo || '',
          address: companyData.address || '',
          license_number: companyData.license_number || '',
          // New fields (non-redundant)
          company_tagline: companyData.company_tagline || '',
          company_description: companyData.company_description || '',
          company_nmls_number: companyData.company_nmls_number || '',
          companyEstablishedYear: companyData.company_established_year || new Date().getFullYear(),
          companyTeamSize: companyData.company_team_size || '',
          companySpecialties: companyData.company_specialties || [],
          companySocialMedia: companyData.company_social_media || {
            facebook: '',
            twitter: '',
            linkedin: '',
            instagram: ''
          },
          companyBranding: companyData.company_branding || {
            primaryColor: '#3b82f6',
            secondaryColor: '#1e40af',
            logoVariations: []
          },
          companyContactInfo: companyData.company_contact_info || {
            mainPhone: '',
            mainEmail: '',
            supportEmail: ''
          },
          companyBusinessHours: companyData.company_business_hours || {
            monday: '9:00 AM - 6:00 PM',
            tuesday: '9:00 AM - 6:00 PM',
            wednesday: '9:00 AM - 6:00 PM',
            thursday: '9:00 AM - 6:00 PM',
            friday: '9:00 AM - 6:00 PM',
            saturday: '10:00 AM - 4:00 PM',
            sunday: 'Closed'
          },
          companyServiceAreas: companyData.company_service_areas || [],
          companyLanguages: companyData.company_languages || ['English'],
          companyCertifications: companyData.company_certifications || []
        });
      } catch (error) {
        console.error('Error fetching company profile:', error);
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load company profile data'
        });
      }
    };

    fetchCompanyProfile();
  }, [user, showNotification]);

  // Handle personal info update
  const handlePersonalInfoUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('users')
        .update({
          first_name: personalInfo.firstName,
          last_name: personalInfo.lastName,
          phone: personalInfo.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Personal information updated successfully!'
      });
      
      // Refresh profile data
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) setProfile(data);
      
    } catch (error) {
      console.error('Error updating personal info:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update personal information'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle email change
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    try {
      setSaving(true);
      
      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: emailForm.currentPassword
      });

      if (signInError) {
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Current password is incorrect'
        });
        return;
      }

      // Update email with proper confirmation flow
      const { error: updateError } = await supabase.auth.updateUser({
        email: emailForm.newEmail
      }, {
        emailRedirectTo: `${window.location.origin}/auth/email-confirmation`
      });

      if (updateError) throw updateError;

      showNotification({
        type: 'success',
        title: 'Email Change Request Sent',
        message: `Confirmation emails sent to both ${user.email} and ${emailForm.newEmail}. You must click the confirmation link in BOTH emails to complete the change.`
      });
      
      // Update local state
      setEmailForm(prev => ({ ...prev, currentPassword: '' }));
      
    } catch (error) {
      console.error('Error changing email:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to change email'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle password reset request
  const handlePasswordReset = async () => {
    if (!user?.email) return;

    try {
      setSaving(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;

      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Password reset link sent to your email!'
      });
      
    } catch (error) {
      console.error('Error sending password reset:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to send password reset email'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle company profile update
  const handleCompanyProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !companyProfile?.id) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('companies')
        .update({
          // Legacy fields (existing)
          phone: companyForm.phone,
          email: companyForm.email,
          website: companyForm.website,
          logo: companyForm.logo,
          address: companyForm.address,
          license_number: companyForm.license_number,
          // New fields (non-redundant)
          company_tagline: companyForm.company_tagline,
          company_description: companyForm.company_description,
          company_nmls_number: companyForm.company_nmls_number,
          company_established_year: companyForm.companyEstablishedYear,
          company_team_size: companyForm.companyTeamSize,
          company_specialties: companyForm.companySpecialties,
          company_social_media: companyForm.companySocialMedia,
          company_branding: companyForm.companyBranding,
          company_contact_info: companyForm.companyContactInfo,
          company_business_hours: companyForm.companyBusinessHours,
          company_service_areas: companyForm.companyServiceAreas,
          company_languages: companyForm.companyLanguages,
          company_certifications: companyForm.companyCertifications,
          company_last_updated_by: user.id,
          company_version: (companyProfile.company_version || 1) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyProfile.id);

      if (error) throw error;

      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Company profile updated successfully!'
      });
      
    } catch (error) {
      console.error('Error updating company profile:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update company profile'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarFile || !user?.id) return;

    try {
      setSaving(true);
      
      // Upload to Supabase Storage (using dedicated user-avatars bucket)
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(fileName, avatarFile, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(fileName);

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          avatar: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Avatar updated successfully!'
      });
      setAvatarPreview(publicUrl);
      setAvatarFile(null);
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to upload avatar'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle company logo upload
  const handleCompanyLogoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyLogoFile || !user?.id || !companyProfile?.id) return;

    try {
      setSaving(true);
      
      // Upload to Supabase Storage
      const fileExt = companyLogoFile.name.split('.').pop();
      const fileName = `${companyProfile.id}.${fileExt}`;
      const filePath = `${companyProfile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, companyLogoFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath);

      // Update company profile
      const { error: updateError } = await supabase
        .from('companies')
        .update({ logo: publicUrl })
        .eq('id', companyProfile.id);

      if (updateError) throw updateError;

      showNotification({
        type: 'success',
        title: 'Success',
        message: 'Company logo updated successfully!'
      });

      // Update local state
      setCompanyLogoPreview(publicUrl);
      setCompanyLogoFile(null);
      setCompanyForm(prev => ({ ...prev, logo: publicUrl }));
      
    } catch (error) {
      console.error('Error uploading company logo:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to upload company logo'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle company logo file selection
  const handleCompanyLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompanyLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCompanyLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (authLoading || loading) {
    return (
      <PageLoadingState text="Loading settings..." />
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to access settings.</p>
          <Button onClick={() => router.push('/auth')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      showBreadcrumb={true}
      breadcrumbVariant="default"
      breadcrumbSize="md"
    >
      <div style={dashboard.card}>
        {/* Tab Navigation - Modern Dark Design */}
        <div className="mb-8">
          <nav className="inline-flex modern-tab-nav rounded-xl p-1">
            {[
              { id: 'personal', label: 'Personal Info', icon: User, badge: null },
              { id: 'email', label: 'Email', icon: Mail, badge: null },
              { id: 'password', label: 'Password', icon: Lock, badge: null },
              { id: 'avatar', label: 'Avatar', icon: Camera, badge: null },
              { id: 'company', label: 'Company Profile', icon: Building2, badge: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`tab-button flex items-center justify-center space-x-2 text-white font-medium rounded-lg ${
                  activeTab === tab.id
                    ? 'active'
                    : ''
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-2 bg-[#005b7c] text-white text-xs px-2 py-1 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Personal Info Tab */}
        {activeTab === 'personal' && (
          <SpotlightCard variant="default" className="p-6">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <p className="text-sm text-gray-600">Update your personal details</p>
            </CardHeader>
            <CardBody>
              <form onSubmit={handlePersonalInfoUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={personalInfo.firstName}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={personalInfo.lastName}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    loading={saving}
                    disabled={saving}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </Button>
                </div>
              </form>
            </CardBody>
          </SpotlightCard>
        )}

        {/* Email Tab */}
        {activeTab === 'email' && (
          <SpotlightCard variant="default" className="p-6">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Change Email</h3>
              <p className="text-sm text-gray-600">Update your email address</p>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleEmailChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Email
                  </label>
                  <input
                    type="email"
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={emailForm.currentPassword}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    loading={saving}
                    disabled={saving}
                    className="flex items-center space-x-2"
                  >
                    <Mail className="h-4 w-4" />
                    <span>{saving ? 'Updating...' : 'Update Email'}</span>
                  </Button>
                </div>
              </form>
            </CardBody>
          </SpotlightCard>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <SpotlightCard variant="default" className="p-6">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <p className="text-sm text-gray-600">Update your password securely</p>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                <div className="bg-[#01bcc6]/10 border border-[#01bcc6]/20 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Lock className="h-5 w-5 text-[#008eab]" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-[#005b7c]">
                        Secure Password Reset
                      </h3>
                      <div className="mt-2 text-sm text-[#008eab]">
                        <p>
                          For security reasons, password changes require email verification. 
                          Click the button below to receive a secure password reset link.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handlePasswordReset}
                    loading={saving}
                    disabled={saving}
                    className="flex items-center space-x-2"
                  >
                    <Lock className="h-4 w-4" />
                    <span>{saving ? 'Sending...' : 'Send Reset Link'}</span>
                  </Button>
                </div>
              </div>
            </CardBody>
          </SpotlightCard>
        )}

        {/* Avatar Tab */}
        {activeTab === 'avatar' && (
          <SpotlightCard variant="default" className="p-6">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
              <p className="text-sm text-gray-600">Upload and manage your avatar</p>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleAvatarUpload} className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {avatarPreview ? (
                        <Image
                          src={avatarPreview}
                          alt="Avatar preview"
                          width={96}
                          height={96}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose a new avatar
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#01bcc6]/10 file:text-[#005b7c] hover:file:bg-[#01bcc6]/20"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>

                {avatarFile && (
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      loading={saving}
                      disabled={saving}
                      className="flex items-center space-x-2"
                    >
                      <Camera className="h-4 w-4" />
                      <span>{saving ? 'Uploading...' : 'Upload Avatar'}</span>
                    </Button>
                  </div>
                )}
              </form>
            </CardBody>
          </SpotlightCard>
        )}

        {/* Company Profile Tab */}
        {activeTab === 'company' && (
          <SpotlightCard variant="default" className="p-6">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Company Profile</h3>
              <p className="text-sm text-gray-600">Manage your company information that appears on all officer profiles</p>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleCompanyProfileUpdate} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800 flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    Basic Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={companyProfile?.name || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">Company name cannot be changed here</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Tagline
                      </label>
                      <input
                        type="text"
                        value={companyForm.company_tagline}
                        onChange={(e) => setCompanyForm(prev => ({ ...prev, company_tagline: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Professional Mortgage Services"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Description
                    </label>
                    <textarea
                      value={companyForm.company_description}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, company_description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description of your company and services"
                    />
                  </div>
                </div>

                {/* Company Logo Upload */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800 flex items-center">
                    <Camera className="h-4 w-4 mr-2" />
                    Company Logo
                  </h4>
                  
                  <div className="flex items-center space-x-6">
                    {/* Logo Preview */}
                    <div className="flex-shrink-0">
                      {companyLogoPreview ? (
                        <div className="relative">
                          <Image
                            src={companyLogoPreview}
                            alt="Company Logo Preview"
                            width={96}
                            height={96}
                            className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1">
                      <div className="space-y-3">
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCompanyLogoSelect}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Upload a company logo (JPG, PNG, GIF, WebP - Max 5MB)
                          </p>
                        </div>

                        {companyLogoFile && (
                          <div className="flex space-x-3">
                            <Button
                              type="button"
                              onClick={handleCompanyLogoUpload}
                              loading={saving}
                              disabled={saving}
                              className="flex items-center space-x-2"
                            >
                              <Upload className="h-4 w-4" />
                              <span>{saving ? 'Uploading...' : 'Upload Logo'}</span>
                            </Button>
                            
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => {
                                setCompanyLogoFile(null);
                                setCompanyLogoPreview(companyProfile?.logo || null);
                              }}
                              disabled={saving}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800 flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Phone
                      </label>
                      <input
                        type="tel"
                        value={companyForm.phone}
                        onChange={(e) => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Email
                      </label>
                      <input
                        type="email"
                        value={companyForm.email}
                        onChange={(e) => setCompanyForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="info@yourcompany.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Website
                    </label>
                    <input
                      type="url"
                      value={companyForm.website}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>

                {/* Licensing Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800 flex items-center">
                    <Award className="h-4 w-4 mr-2" />
                    Licensing & Compliance
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        NMLS Number
                      </label>
                      <input
                        type="text"
                        value={companyForm.company_nmls_number}
                        onChange={(e) => setCompanyForm(prev => ({ ...prev, company_nmls_number: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="NMLS# 123456"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        License Number
                      </label>
                      <input
                        type="text"
                        value={companyForm.license_number}
                        onChange={(e) => setCompanyForm(prev => ({ ...prev, license_number: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="License #12345"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800 flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Social Media
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook URL
                      </label>
                      <input
                        type="url"
                        value={companyForm.companySocialMedia.facebook}
                        onChange={(e) => setCompanyForm(prev => ({ 
                          ...prev, 
                          companySocialMedia: { ...prev.companySocialMedia, facebook: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://facebook.com/yourcompany"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={companyForm.companySocialMedia.linkedin}
                        onChange={(e) => setCompanyForm(prev => ({ 
                          ...prev, 
                          companySocialMedia: { ...prev.companySocialMedia, linkedin: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://linkedin.com/company/yourcompany"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Twitter URL
                      </label>
                      <input
                        type="url"
                        value={companyForm.companySocialMedia.twitter}
                        onChange={(e) => setCompanyForm(prev => ({ 
                          ...prev, 
                          companySocialMedia: { ...prev.companySocialMedia, twitter: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://twitter.com/yourcompany"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instagram URL
                      </label>
                      <input
                        type="url"
                        value={companyForm.companySocialMedia.instagram}
                        onChange={(e) => setCompanyForm(prev => ({ 
                          ...prev, 
                          companySocialMedia: { ...prev.companySocialMedia, instagram: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://instagram.com/yourcompany"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    loading={saving}
                    disabled={saving}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Saving...' : 'Save Company Profile'}</span>
                  </Button>
                </div>
              </form>
            </CardBody>
          </SpotlightCard>
        )}
      </div>
    </DashboardLayout>
  );
}
