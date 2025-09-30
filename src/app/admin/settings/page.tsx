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
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Save,
  Eye,
  EyeOff
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

export default function AdminSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { showNotification } = useNotification();
  const router = useRouter();
  
  // Form states
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
  
  // UI states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'email' | 'password' | 'avatar'>('personal');

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
    <DashboardLayout title="Settings" showBackButton={true}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'personal', label: 'Personal Info', icon: User },
              { id: 'email', label: 'Email', icon: Mail },
              { id: 'password', label: 'Password', icon: Lock },
              { id: 'avatar', label: 'Avatar', icon: Camera }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#005b7c] text-[#005b7c]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
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
      </div>
    </DashboardLayout>
  );
}
