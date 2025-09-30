'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { useTemplateSelection, useTemplate } from '@/contexts/UnifiedTemplateContext';
import { DashboardLoadingState } from '@/components/ui/LoadingState';
import { supabase } from '@/lib/supabase/client';
import { dashboard } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import SpotlightCard from '@/components/ui/SpotlightCard';
import RecentActivity from '@/components/analytics/RecentActivity';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: string;
  loan_amount?: number;
  credit_score?: number;
  created_at: string;
  updated_at: string;
  company_id: string;
  officer_id: string;
}

interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  lost: number;
  highPriority: number;
  urgentPriority: number;
  thisWeek: number;
  thisMonth: number;
}

interface PublicLink {
  id: string;
  user_id: string;
  company_id: string;
  public_slug: string;
  is_active: boolean;
  expires_at?: string;
  max_uses?: number;
  current_uses: number;
  created_at: string;
  updated_at: string;
}

export default function OfficersDashboardPage() {
  const { user, userRole, companyId, loading: authLoading } = useAuth();
  const { selectedTemplate, setSelectedTemplate } = useTemplateSelection();
  const { templateData } = useTemplate(selectedTemplate);
  const router = useRouter();

  // State for dashboard data
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadStats, setLeadStats] = useState<LeadStats>({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
    lost: 0,
    highPriority: 0,
    urgentPriority: 0,
    thisWeek: 0,
    thisMonth: 0
  });
  const [publicLink, setPublicLink] = useState<PublicLink | null>(null);
  const [publicProfileTemplate, setPublicProfileTemplate] = useState<string>('template1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      // Wait for auth to complete and ensure we have required data
      if (authLoading || !user?.id || !companyId) {
        if (authLoading) {
          console.log('🔄 Dashboard: Waiting for auth to complete...');
        } else if (!user?.id) {
          console.log('🔄 Dashboard: Waiting for user data...');
        } else if (!companyId) {
          console.log('🔄 Dashboard: Waiting for company data...');
        }
        return;
      }

      console.log('🚀 Dashboard: Starting data fetch for user:', user.id, 'company:', companyId);
      console.log('🔍 Dashboard: User object:', { id: user.id, email: user.email });
      console.log('🔍 Dashboard: Company ID type:', typeof companyId, 'value:', companyId);

      try {
        setLoading(true);
        setError(null);

        // Test the query step by step
        console.log('🔍 Dashboard: Testing leads query...');
        
        // First, let's test if we can access the leads table at all
        console.log('🔍 Dashboard: Testing basic leads access...');
        const { data: testData, error: testError } = await supabase
          .from('leads')
          .select('id')
          .limit(1);
        
        if (testError) {
          console.error('❌ Dashboard: Basic leads access failed:', testError);
          throw testError;
        }
        
        console.log('✅ Dashboard: Basic leads access successful, found:', testData?.length || 0, 'records');
        
        // Now try the full query
        console.log('🔍 Dashboard: Testing full leads query with filters...');
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select('*')
          .eq('officer_id', user.id)
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (leadsError) {
          console.error('❌ Dashboard: Leads fetch error:', {
            message: leadsError.message,
            details: leadsError.details,
            hint: leadsError.hint,
            code: leadsError.code,
            fullError: leadsError
          });
          throw leadsError;
        }

        console.log('✅ Dashboard: Fetched leads:', leadsData?.length || 0);
        setLeads(leadsData || []);

        // Calculate lead statistics
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const stats: LeadStats = {
          total: leadsData?.length || 0,
          new: leadsData?.filter(lead => lead.status === 'new').length || 0,
          contacted: leadsData?.filter(lead => lead.status === 'contacted').length || 0,
          qualified: leadsData?.filter(lead => lead.status === 'qualified').length || 0,
          converted: leadsData?.filter(lead => lead.status === 'converted').length || 0,
          lost: leadsData?.filter(lead => lead.status === 'lost').length || 0,
          highPriority: leadsData?.filter(lead => lead.priority === 'high').length || 0,
          urgentPriority: leadsData?.filter(lead => lead.priority === 'urgent').length || 0,
          thisWeek: leadsData?.filter(lead => new Date(lead.created_at) >= oneWeekAgo).length || 0,
          thisMonth: leadsData?.filter(lead => new Date(lead.created_at) >= oneMonthAgo).length || 0
        };

        console.log('📊 Dashboard: Calculated stats:', stats);
        
        // Debug priority counts
        const highPriorityLeads = leadsData?.filter(lead => lead.priority === 'high') || [];
        const urgentPriorityLeads = leadsData?.filter(lead => lead.priority === 'urgent') || [];
        console.log('🔍 Dashboard: High priority leads:', highPriorityLeads.length, highPriorityLeads.map(l => ({ name: `${l.first_name} ${l.last_name}`, priority: l.priority })));
        console.log('🔍 Dashboard: Urgent priority leads:', urgentPriorityLeads.length, urgentPriorityLeads.map(l => ({ name: `${l.first_name} ${l.last_name}`, priority: l.priority })));
        console.log('🔍 Dashboard: Total high+urgent:', highPriorityLeads.length + urgentPriorityLeads.length);
        
        setLeadStats(stats);

        // Fetch public link data
        const { data: publicLinkData, error: publicLinkError } = await supabase
          .from('loan_officer_public_links')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (publicLinkError && publicLinkError.code !== 'PGRST116') {
          console.warn('⚠️ Dashboard: Public link fetch error:', publicLinkError);
        } else if (publicLinkData) {
          console.log('✅ Dashboard: Found public link:', publicLinkData.public_slug);
          setPublicLink(publicLinkData);
        } else {
          console.log('ℹ️ Dashboard: No public link found');
        }

        // Fetch public profile template from database
        console.log('🔍 Dashboard: Fetching public profile template...');
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            const response = await fetch('/api/templates/get-public-profile-template', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const result = await response.json();
              if (result.success && result.templateSlug) {
                console.log('✅ Dashboard: Found public profile template:', result.templateSlug);
                setPublicProfileTemplate(result.templateSlug);
              } else {
                console.log('ℹ️ Dashboard: No public profile template found in database, using localStorage fallback');
                const savedTemplate = localStorage.getItem('publicProfileTemplate');
                if (savedTemplate) {
                  setPublicProfileTemplate(savedTemplate);
                }
              }
            } else {
              console.log('ℹ️ Dashboard: Failed to fetch public profile template from database, using localStorage fallback');
              const savedTemplate = localStorage.getItem('publicProfileTemplate');
              if (savedTemplate) {
                setPublicProfileTemplate(savedTemplate);
              }
            }
          } else {
            console.log('ℹ️ Dashboard: No session token, using localStorage fallback');
            const savedTemplate = localStorage.getItem('publicProfileTemplate');
            if (savedTemplate) {
              setPublicProfileTemplate(savedTemplate);
            }
          }
        } catch (error) {
          console.error('❌ Dashboard: Error fetching public profile template:', error);
          // Fallback to localStorage
          const savedTemplate = localStorage.getItem('publicProfileTemplate');
          if (savedTemplate) {
            setPublicProfileTemplate(savedTemplate);
          }
        }

      } catch (err) {
        console.error('❌ Dashboard data fetch error:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          name: err instanceof Error ? err.name : 'Unknown',
          stack: err instanceof Error ? err.stack : undefined,
          fullError: err
        });
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id, companyId, authLoading]);

  // Get recent leads (last 3)
  const recentLeads = leads.slice(0, 3);

  // Get priority leads (last 3)
  const priorityLeads = leads.filter(lead => lead.priority === 'high' || lead.priority === 'urgent').slice(0, 3);

  // Get public profile template name
  const getPublicProfileTemplateName = (templateSlug: string) => {
    switch (templateSlug) {
      case 'template1':
        return 'Red Theme';
      case 'template2':
        return 'Purple Theme';
      default:
        return 'Default Template';
    }
  };

  // Show loading state while auth is loading or data is being fetched
  if (authLoading || loading) {
    return (
      <RouteGuard allowedRoles={['employee']}>
        <DashboardLayout 
          title="Loan Officer Dashboard" 
          subtitle="Welcome to your loan officer dashboard"
        >
          <DashboardLoadingState />
        </DashboardLayout>
      </RouteGuard>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <RouteGuard allowedRoles={['employee']}>
        <DashboardLayout 
          title="Loan Officer Dashboard" 
          subtitle="Welcome to your loan officer dashboard"
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'rgba(1, 188, 198, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {React.createElement(icons.alertCircle, { 
                size: 24, 
                style: { color: '#dc2626' } 
              })}
            </div>
            <p style={{ color: '#dc2626', fontSize: '16px', fontWeight: 'medium' }}>
              Error loading dashboard
            </p>
            <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </p>
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={['employee']}>
      <DashboardLayout 
        title="Loan Officer Dashboard" 
        subtitle="Welcome to your loan officer dashboard"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          

          {/* Lead Statistics */}
          <div style={dashboard.grid.cols4}>
            <SpotlightCard variant="default" className="p-5">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: 'rgba(1, 188, 198, 0.1)'
                  }}>
                    {React.createElement(icons.document, { 
                      size: 20, 
                      style: { color: '#008eab' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={dashboard.statsCardLabel}>Total Leads</p>
                  <p style={dashboard.statsCardValue}>{leadStats.total}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard variant="default" className="p-5">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: 'rgba(1, 188, 198, 0.1)'
                  }}>
                    {React.createElement(icons.checkCircle, { 
                      size: 20, 
                      style: { color: '#008eab' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={dashboard.statsCardLabel}>Converted</p>
                  <p style={dashboard.statsCardValue}>{leadStats.converted}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard variant="default" className="p-5">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: 'rgba(1, 188, 198, 0.1)'
                  }}>
                    {React.createElement(icons.alertTriangle, { 
                      size: 20, 
                      style: { color: '#008eab' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={dashboard.statsCardLabel}>High Priority</p>
                  <p style={dashboard.statsCardValue}>{leadStats.highPriority + leadStats.urgentPriority}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard variant="default" className="p-5">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: 'rgba(1, 188, 198, 0.1)'
                  }}>
                    {React.createElement(icons.trendingUp, { 
                      size: 20, 
                      style: { color: '#008eab' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={dashboard.statsCardLabel}>This Week</p>
                  <p style={dashboard.statsCardValue}>{leadStats.thisWeek}</p>
              </div>
            </div>
            </SpotlightCard>
          </div>

          {/* Quick Actions */}
          <div style={dashboard.card}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#005b7c',
              marginBottom: '16px'
            }}>
              Quick Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <SpotlightCard 
                variant="default" 
                onClick={() => router.push('/officers/leads')}
                className="p-4 text-center cursor-pointer"
                style={{ backgroundColor: 'white', border: '1px solid rgba(1, 188, 198, 0.2)' }}
              >
                <div style={{
                  ...dashboard.quickActionIcon,
                  backgroundColor: 'rgba(1, 188, 198, 0.1)',
                  margin: '0 auto 8px auto'
                }}>
                  {React.createElement(icons.document, { 
                    size: 20, 
                    style: { color: '#008eab' } 
                  })}
                </div>
                <p style={dashboard.quickActionTitle}>Leads</p>
              </SpotlightCard>

              <SpotlightCard 
                variant="default" 
                onClick={() => router.push('/officers/profile')}
                className="p-4 text-center cursor-pointer"
                style={{ backgroundColor: 'white', border: '1px solid rgba(1, 188, 198, 0.2)' }}
              >
                <div style={{
                  ...dashboard.quickActionIcon,
                  backgroundColor: 'rgba(1, 188, 198, 0.1)',
                  margin: '0 auto 8px auto'
                }}>
                  {React.createElement(icons.profile, { 
                    size: 20, 
                    style: { color: '#008eab' } 
                  })}
                </div>
                <p style={dashboard.quickActionTitle}>Profile</p>
              </SpotlightCard>

              <SpotlightCard 
                variant="default" 
                onClick={() => router.push('/officers/customizer')}
                className="p-4 text-center cursor-pointer"
                style={{ backgroundColor: 'white', border: '1px solid rgba(1, 188, 198, 0.2)' }}
              >
                <div style={{
                  ...dashboard.quickActionIcon,
                  backgroundColor: 'rgba(1, 188, 198, 0.1)',
                  margin: '0 auto 8px auto'
                }}>
                  {React.createElement(icons.edit, { 
                    size: 20, 
                    style: { color: '#008eab' } 
                  })}
                </div>
                <p style={dashboard.quickActionTitle}>Customizer</p>
              </SpotlightCard>

              <SpotlightCard 
                variant="default" 
                onClick={() => router.push('/officers/settings')}
                className="p-4 text-center cursor-pointer"
                style={{ backgroundColor: 'white', border: '1px solid rgba(1, 188, 198, 0.2)' }}
              >
                <div style={{
                  ...dashboard.quickActionIcon,
                  backgroundColor: 'rgba(1, 188, 198, 0.1)',
                  margin: '0 auto 8px auto'
                }}>
                  {React.createElement(icons.settings, { 
                    size: 20, 
                    style: { color: '#008eab' } 
                  })}
                </div>
                <p style={dashboard.quickActionTitle}>Settings</p>
              </SpotlightCard>
            </div>
          </div>

          {/* Working Cards Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Recent Leads Card */}
            <SpotlightCard variant="default" className="p-6">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#005b7c'
                }}>
                  Recent Leads
                </h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/officers/leads')}
                  className="bg-[#01bcc6] hover:bg-[#008eab] text-white"
                >
                  View All
                </Button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentLeads.length > 0 ? (
                  recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        border: '1px solid rgba(1, 188, 198, 0.2)',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        const leadSlug = `${lead.first_name.toLowerCase()}-${lead.last_name.toLowerCase()}-${lead.id.slice(-8)}`;
                        router.push(`/officers/leads/${leadSlug}`);
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 'medium', color: '#111827', fontSize: '14px' }}>
                          {lead.first_name} {lead.last_name}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                          {lead.email}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'medium',
                          backgroundColor: lead.status === 'new' ? 'rgba(1, 188, 198, 0.1)' : 
                                         lead.status === 'contacted' ? 'rgba(1, 188, 198, 0.1)' :
                                         lead.status === 'qualified' ? 'rgba(1, 188, 198, 0.1)' :
                                         lead.status === 'converted' ? 'rgba(1, 188, 198, 0.1)' : 'rgba(1, 188, 198, 0.1)',
                          color: lead.status === 'new' ? '#008eab' :
                                lead.status === 'contacted' ? '#008eab' :
                                lead.status === 'qualified' ? '#008eab' :
                                lead.status === 'converted' ? '#008eab' : '#008eab'
                        }}>
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                    No leads yet
                  </p>
                )}
              </div>
            </SpotlightCard>

            {/* Priority Leads Card */}
            <SpotlightCard variant="default" className="p-6">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#005b7c'
                }}>
                  Priority Leads
                </h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/officers/leads?priority=high')}
                  className="bg-[#01bcc6] hover:bg-[#008eab] text-white"
                >
                  View All
                </Button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {priorityLeads.length > 0 ? (
                  priorityLeads.map((lead) => (
                    <div
                      key={lead.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        border: `1px solid rgba(1, 188, 198, 0.2)`,
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        const leadSlug = `${lead.first_name.toLowerCase()}-${lead.last_name.toLowerCase()}-${lead.id.slice(-8)}`;
                        router.push(`/officers/leads/${leadSlug}`);
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 'medium', color: '#111827', fontSize: '14px' }}>
                          {lead.first_name} {lead.last_name}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                          {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)} Priority
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'medium',
                          backgroundColor: lead.priority === 'urgent' ? 'rgba(1, 188, 198, 0.1)' : 'rgba(1, 188, 198, 0.1)',
                          color: lead.priority === 'urgent' ? '#008eab' : '#008eab'
                        }}>
                          {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                    No priority leads
                  </p>
                )}
              </div>
            </SpotlightCard>
          </div>

          {/* Public Profile Information */}
          <SpotlightCard variant="default" className="p-6">
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#005b7c',
              marginBottom: '16px'
            }}>
              Public Profile
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Template Selection */}
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#005b7c', marginBottom: '12px' }}>
                  Selected Template
                </h4>
                <SpotlightCard variant="default" className="p-4" style={{ backgroundColor: '#f9fafb', border: '1px solid rgba(1, 188, 198, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'rgba(1, 188, 198, 0.1)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      {React.createElement(icons.palette, { 
                        size: 16, 
                        style: { color: '#008eab' } 
                      })}
                    </div>
                    <div>
                      <p style={{ fontWeight: 'medium', color: '#111827' }}>
                        {getPublicProfileTemplateName(publicProfileTemplate)}
                      </p>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        Public Profile Template
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => router.push('/officers/customizer')}
                    style={{ 
                      width: 'auto',
                      minWidth: '140px',
                      padding: '8px 16px',
                      border: 'none',
                      color: 'white',
                      fontWeight: '500',
                      borderRadius: '6px',
                fontSize: '14px',
                      alignSelf: 'center'
                    }}
                    className="btn-primary-solid"
                  >
                    Customize Template
                  </Button>
                </SpotlightCard>
              </div>

              {/* Public Link */}
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#005b7c', marginBottom: '12px' }}>
                  Public Link
                </h4>
                <SpotlightCard variant="default" className="p-4" style={{ backgroundColor: '#f9fafb', border: '1px solid rgba(1, 188, 198, 0.2)' }}>
                  {publicLink ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: 'rgba(1, 188, 198, 0.1)',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '12px'
                        }}>
                          {React.createElement(icons.link, { 
                            size: 16, 
                            style: { color: '#008eab' } 
                          })}
                        </div>
                        <div>
                          <p style={{ fontWeight: 'medium', color: '#111827' }}>
                            Active Public Link
                          </p>
                          <p style={{ fontSize: '14px', color: '#6b7280' }}>
                            {window.location.origin}/public/profile/{publicLink.public_slug}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => router.push('/officers/profile')}
                          style={{ 
                            width: 'auto',
                            minWidth: '120px',
                            padding: '8px 16px',
                            background: '#005b7c',
                            border: 'none',
                            color: 'white',
                            fontWeight: '500',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        >
                          Manage Profile
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => window.open(`${window.location.origin}/public/profile/${publicLink.public_slug}`, '_blank')}
                          style={{ 
                            width: 'auto',
                            minWidth: '100px',
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            color: 'white',
                            fontWeight: '500',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        >
                          Open Link
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: 'rgba(1, 188, 198, 0.1)',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '12px'
                        }}>
                          {React.createElement(icons.alertCircle, { 
                            size: 16, 
                            style: { color: '#008eab' } 
                          })}
                        </div>
                        <div>
                          <p style={{ fontWeight: 'medium', color: '#111827' }}>
                            No Public Link
                          </p>
                          <p style={{ fontSize: '14px', color: '#6b7280' }}>
                            Create your public profile
              </p>
            </div>
          </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => router.push('/officers/profile')}
                    style={{ 
                      width: 'auto',
                      minWidth: '140px',
                      padding: '8px 16px',
                      border: 'none',
                      color: 'white',
                      fontWeight: '500',
                      borderRadius: '6px',
                      fontSize: '14px',
                      alignSelf: 'center'
                    }}
                    className="btn-primary-solid"
                      >
                        Create Profile
                      </Button>
                    </div>
                  )}
                </SpotlightCard>
              </div>
            </div>
            </SpotlightCard>

          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}