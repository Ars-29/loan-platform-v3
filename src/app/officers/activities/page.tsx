'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { dashboard } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';

interface ActivityItem {
  id: string;
  type: 'lead_created' | 'lead_updated' | 'lead_converted' | 'officer_added' | 'company_created' | 'login' | 'public_profile_view' | 'template_modified';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  companyId?: string;
  companyName?: string;
  leadId?: string;
  leadName?: string;
  leadFirstName?: string;
  leadLastName?: string;
  templateId?: string;
  templateName?: string;
  metadata?: Record<string, any>;
  icon: string;
  color: string;
}

export default function ActivitiesPage() {
  const { user, userRole, companyId, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSignedOut, setIsSignedOut] = useState(false);

  const fetchActivities = useCallback(async (retryCount = 0) => {
    if (!user || isSignedOut) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setIsSignedOut(true);
        return;
      }

      // Additional check: verify the session is still valid
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        setIsSignedOut(true);
        return;
      }

      const response = await fetch('/api/analytics/recent-activity', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error fetching activities:', response.status, errorText);
        
        if (response.status === 401) {
          setIsSignedOut(true);
          return;
        }
        
        throw new Error(`Failed to fetch activities: ${response.status}`);
      }

      const data = await response.json();
      setActivities(data.data?.activities || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities. Please try again.');
      
      // Retry logic for network errors
      if (retryCount < 2) {
        setTimeout(() => {
          fetchActivities(retryCount + 1);
        }, 1000 * (retryCount + 1));
      }
    } finally {
      setLoading(false);
    }
  }, [user, isSignedOut]);

  useEffect(() => {
    if (user && userRole && !authLoading) {
      fetchActivities();
    }
  }, [user, userRole, authLoading, fetchActivities]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lead_created':
      case 'lead_updated':
        return icons.document;
      case 'lead_converted':
        return icons.checkCircle;
      case 'officer_added':
        return icons.userPlus;
      case 'company_created':
        return icons.building;
      case 'login':
        return icons.logIn;
      case 'public_profile_view':
        return icons.eye;
      case 'template_modified':
        return icons.edit;
      default:
        return icons.activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'lead_created':
      case 'lead_updated':
        return '#10b981'; // green
      case 'lead_converted':
        return '#059669'; // dark green
      case 'officer_added':
        return '#3b82f6'; // blue
      case 'company_created':
        return '#8b5cf6'; // purple
      case 'login':
        return '#6b7280'; // gray
      case 'public_profile_view':
        return '#8b5cf6'; // purple
      case 'template_modified':
        return '#f59e0b'; // amber
      default:
        return '#6b7280'; // gray
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return activityTime.toLocaleDateString();
  };

  const handleActivityClick = (activity: ActivityItem) => {
    if (activity.leadId) {
      router.push(`/officers/leads`);
    } else if (activity.templateId) {
      router.push(`/officers/customizer`);
    }
  };

  if (authLoading) {
    return (
      <RouteGuard allowedRoles={['employee']}>
        <DashboardLayout>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01bcc6]"></div>
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  if (isSignedOut) {
    router.push('/auth');
    return null;
  }

  return (
    <RouteGuard allowedRoles={['employee']}>
      <DashboardLayout>
        <div style={dashboard.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#005b7c',
              margin: 0
            }}>
              Recent Activity
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                animation: 'pulse 2s infinite'
              }}></div>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Live</span>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01bcc6]"></div>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</div>
              <Button onClick={() => fetchActivities()}>Retry</Button>
            </div>
          ) : activities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ color: '#6b7280', marginBottom: '16px' }}>No recent activity</div>
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>Activity will appear here as it happens</p>
            </div>
          ) : (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {activities.map((activity, index) => (
                <div
                  key={`${activity.id}-${activity.timestamp}-${index}`}
                  className="recent-activity-item dashboard-card"
                  onClick={() => handleActivityClick(activity)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '20px',
                    borderBottom: index < activities.length - 1 ? '1px solid #f3f4f6' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-out',
                    borderRadius: '12px',
                    margin: '0 -8px 8px -8px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    backgroundColor: 'white',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #f3f4f6'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: `${getActivityColor(activity.type)}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                    flexShrink: 0
                  }}>
                    {React.createElement(getActivityIcon(activity.type), {
                      size: 20,
                      style: { color: getActivityColor(activity.type) }
                    })}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '4px'
                    }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#374151',
                        margin: 0,
                        lineHeight: '1.4'
                      }}>
                        {activity.title}
                      </h3>
                      <span style={{
                        fontSize: '14px',
                        color: '#9ca3af',
                        flexShrink: 0,
                        marginLeft: '12px'
                      }}>
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
