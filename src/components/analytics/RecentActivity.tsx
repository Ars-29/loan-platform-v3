'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { dashboard } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';
import { useRouter } from 'next/navigation';

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

interface RecentActivityProps {
  className?: string;
}

export default function RecentActivity({ className }: RecentActivityProps) {
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
        console.error('API Error:', errorText);
        
        // If it's a "Company not found" error and we haven't retried yet, retry after a delay
        if (response.status === 404 && errorText.includes('Company not found') && retryCount < 2) {
          console.log(`⚠️ Company not found, retrying in ${(retryCount + 1) * 2} seconds... (attempt ${retryCount + 1}/3)`);
          setTimeout(() => {
            fetchActivities(retryCount + 1);
          }, (retryCount + 1) * 2000); // 2s, 4s delays
          return;
        }
        
        if (response.status === 401 || response.status === 403) {
          // Invalid token - user is signed out
          setIsSignedOut(true);
          return;
        }
        throw new Error(`Failed to fetch activities: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      
      console.log('📊 Recent Activity Response:', result);
      
      if (result.success) {
        // Deduplicate activities by ID to prevent duplicate keys
        const uniqueActivities = result.data.activities.reduce((acc: ActivityItem[], activity: ActivityItem) => {
          if (!acc.find(item => item.id === activity.id)) {
            acc.push(activity);
          }
          return acc;
        }, []);
        
        console.log(`📊 Setting ${uniqueActivities.length} unique activities`);
        setActivities(uniqueActivities);
        setError(null);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      if (err instanceof Error && (err.message.includes('Invalid token') || err.message.includes('401'))) {
        setIsSignedOut(true);
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, [user, isSignedOut]);

  // Handle sign-out cleanup
  useEffect(() => {
    if (!user && !authLoading) {
      setIsSignedOut(true);
      setActivities([]);
      setError(null);
      setLoading(false);
    } else if (user && isSignedOut) {
      setIsSignedOut(false);
    }
  }, [user, authLoading, isSignedOut]);

  // Immediate cleanup when user becomes null
  useEffect(() => {
    if (!user) {
      setIsSignedOut(true);
      setActivities([]);
      setError(null);
      setLoading(false);
    }
  }, [user]);

  // Listen to Supabase auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsSignedOut(true);
        setActivities([]);
        setError(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN' && session) {
        setIsSignedOut(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user || !userRole || isSignedOut) return;

    let leadsSubscription: any;
    let usersSubscription: any;
    let companiesSubscription: any;

    const setupSubscriptions = async () => {
      // Subscribe to leads changes
      if (userRole.role === 'super_admin') {
        // Super admin - all leads
        leadsSubscription = supabase
          .channel('leads-changes')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'leads'
            }, 
            (payload) => {
              if (!isSignedOut) {
                fetchActivities(); // Refresh activities
              }
            }
          )
          .subscribe();

        // Subscribe to companies changes
        companiesSubscription = supabase
          .channel('companies-changes')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'companies'
            }, 
            (payload) => {
              if (!isSignedOut) {
                fetchActivities();
              }
            }
          )
          .subscribe();

      } else if (userRole.role === 'company_admin' && companyId) {
        // Company admin - company leads only
        leadsSubscription = supabase
          .channel('company-leads-changes')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'leads',
              filter: `company_id=eq.${companyId}`
            }, 
            (payload) => {
              if (!isSignedOut) {
                fetchActivities();
              }
            }
          )
          .subscribe();

        // Subscribe to users in company
        usersSubscription = supabase
          .channel('company-users-changes')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'users'
            }, 
            (payload) => {
              if (!isSignedOut) {
                fetchActivities();
              }
            }
          )
          .subscribe();

      } else if (userRole.role === 'employee' && companyId) {
        // Employee - their own leads and company leads
        leadsSubscription = supabase
          .channel('employee-leads-changes')
          .on('postgres_changes', 
            { 
              event: '*', 
              schema: 'public', 
              table: 'leads',
              filter: `company_id=eq.${companyId}`
            }, 
            (payload) => {
              if (!isSignedOut) {
                fetchActivities();
              }
            }
          )
          .subscribe();
      }
    };

    setupSubscriptions();

    // Cleanup subscriptions on unmount
    return () => {
      if (leadsSubscription) {
        supabase.removeChannel(leadsSubscription);
      }
      if (usersSubscription) {
        supabase.removeChannel(usersSubscription);
      }
      if (companiesSubscription) {
        supabase.removeChannel(companiesSubscription);
      }
    };
  }, [user, userRole, companyId, fetchActivities]);

  // Initial fetch
  useEffect(() => {
    if (!isSignedOut) {
      fetchActivities();
    }
  }, [fetchActivities, isSignedOut]);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lead_created':
      case 'lead_updated':
      case 'lead_converted':
        return icons.fileText;
      case 'officer_added':
        return icons.userPlus;
      case 'company_created':
        return icons.building;
      case 'login':
        return icons.logIn;
      case 'public_profile_view':
        return icons.eye;
      case 'template_modified':
        return icons.palette;
      default:
        return icons.activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'lead_created': return '#01bcc6';
      case 'lead_updated': return '#10b981';
      case 'lead_converted': return '#f59e0b';
      case 'officer_added': return '#8b5cf6';
      case 'company_created': return '#ef4444';
      case 'login': return '#6b7280';
      case 'public_profile_view': return '#8b5cf6';
      case 'template_modified': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const handleActivityClick = (activity: ActivityItem) => {
    console.log('🔍 Activity clicked:', activity);
    console.log('🔍 User role:', userRole);
    
    if (!userRole) {
      console.log('❌ No user role found');
      return;
    }

    switch (activity.type) {
      case 'lead_created':
      case 'lead_updated':
      case 'lead_converted':
        console.log('🔍 Lead activity clicked:', activity.type);
        console.log('🔍 Lead data:', { leadId: activity.leadId, leadName: activity.leadName, userName: activity.userName });
        
        if (userRole.role === 'employee') {
          // For loan officers, need leadId and firstName/lastName to create slug
          if (activity.leadId && activity.leadFirstName && activity.leadLastName) {
            // Create slug from lead name and ID (same format as leads page)
            const leadSlug = `${activity.leadFirstName.toLowerCase()}-${activity.leadLastName.toLowerCase()}-${activity.leadId.slice(-8)}`;
            const url = `/officers/leads/${leadSlug}`;
            console.log('🔍 Navigating to (employee):', url);
            router.push(url);
          } else {
            console.log('❌ Missing leadId or leadFirstName/leadLastName for employee navigation');
          }
        } else if (activity.leadId && activity.leadFirstName && activity.leadLastName && activity.userName) {
          // For admin roles, need all data including userName
          // Create slug from lead name and ID (same format as leads page)
          const leadSlug = `${activity.leadFirstName.toLowerCase()}-${activity.leadLastName.toLowerCase()}-${activity.leadId.slice(-8)}`;
          
          // Create officer slug from officer name
          const officerSlug = activity.userName.toLowerCase().replace(/\s+/g, '-');
          
          console.log('🔍 Generated slugs:', { leadSlug, officerSlug });
          console.log('🔍 User role:', userRole.role);
          
          if (userRole.role === 'super_admin') {
            const url = `/super-admin/officers/${officerSlug}/leads/${leadSlug}`;
            console.log('🔍 Navigating to:', url);
            router.push(url);
          } else if (userRole.role === 'company_admin') {
            const url = `/admin/insights/loanofficers/${officerSlug}/leads/${leadSlug}`;
            console.log('🔍 Navigating to:', url);
            router.push(url);
          }
        } else {
          console.log('❌ Missing required data for lead navigation:', {
            leadId: !!activity.leadId,
            leadName: !!activity.leadName,
            userName: !!activity.userName,
            role: userRole.role
          });
        }
        break;
      case 'officer_added':
        // Navigate to the main officers list page, not a specific officer
        if (userRole.role === 'super_admin') {
          router.push(`/super-admin/officers`);
        } else if (userRole.role === 'company_admin') {
          router.push(`/admin/loanofficers`);
        }
        break;
      case 'company_created':
        if (userRole.role === 'super_admin' && activity.companyId) {
          router.push(`/super-admin/companies`);
        }
        break;
      case 'public_profile_view':
        // Navigate to profile page for loan officers
        if (userRole.role === 'employee') {
          router.push('/officers/profile');
        }
        break;
      case 'template_modified':
        // Navigate to customizer page for loan officers
        if (userRole.role === 'employee') {
          router.push('/officers/customizer');
        }
        break;
      default:
        // For login and other activities, just go to dashboard
        if (userRole.role === 'super_admin') {
          router.push('/super-admin/dashboard');
        } else if (userRole.role === 'company_admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/officers/dashboard');
        }
    }
  };

  if (loading) {
    return (
      <div style={dashboard.card} className={className}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#005b7c',
          marginBottom: '16px'
        }}>
          Recent Activity
        </h3>
        <div style={{
          textAlign: 'center',
          padding: '32px 0',
          color: '#6b7280'
        }}>
          <div style={{
            display: 'inline-block',
            width: '24px',
            height: '24px',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #01bcc6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '8px'
          }}></div>
          <p style={{ fontSize: '14px' }}>Loading activities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={dashboard.card} className={className}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#005b7c',
          marginBottom: '16px'
        }}>
          Recent Activity
        </h3>
        <div style={{
          textAlign: 'center',
          padding: '32px 0',
          color: '#ef4444'
        }}>
          <p style={{ fontSize: '14px' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={dashboard.card} className={className}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#005b7c'
        }}>
          Recent Activity
        </h3>
        <div style={{
          fontSize: '12px',
          color: '#6b7280',
          backgroundColor: '#f3f4f6',
          padding: '4px 8px',
          borderRadius: '4px'
        }}>
          Live
        </div>
      </div>

      {activities.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '32px 0',
          color: '#6b7280'
        }}>
          {React.createElement(icons.document, { 
            size: 48, 
            style: { 
              margin: '0 auto 8px auto',
              color: '#9ca3af'
            } 
          })}
          <h3 style={{
            marginTop: '8px',
            fontSize: '14px',
            fontWeight: 'medium',
            color: '#111827'
          }}>
            No recent activity
          </h3>
          <p style={{
            marginTop: '4px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Activity will appear here as it happens
          </p>
        </div>
      ) : (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {activities.map((activity, index) => (
            <div
              key={`${activity.id}-${activity.timestamp}-${index}`}
              className="recent-activity-item"
              onClick={() => handleActivityClick(activity)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: '12px 0',
                borderBottom: index < activities.length - 1 ? '1px solid #f3f4f6' : 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease-in-out',
                borderRadius: '8px',
                margin: '0 -8px',
                paddingLeft: '8px',
                paddingRight: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: `${getActivityColor(activity.type)}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
                flexShrink: 0
              }}>
                {React.createElement(getActivityIcon(activity.type), {
                  size: 16,
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
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: 'medium',
                    color: '#111827',
                    margin: 0
                  }}>
                    {activity.title}
                  </h4>
                  <span style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginLeft: '8px',
                    flexShrink: 0
                  }}>
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
                <p style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  {activity.description}
                </p>
                {activity.userName && (
                  <p style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    margin: '4px 0 0 0'
                  }}>
                    by {activity.userName}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activities.length > 0 && (
        <div style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #f3f4f6',
          textAlign: 'center'
        }}>
          <button
            style={{
              fontSize: '14px',
              color: '#01bcc6',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#008eab';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#01bcc6';
            }}
          >
            View All Activity
          </button>
        </div>
      )}
    </div>
  );
}
