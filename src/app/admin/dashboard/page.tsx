'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { dashboard } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import SpotlightCard from '@/components/ui/SpotlightCard';
import RecentActivity from '@/components/analytics/RecentActivity';

// Interfaces for Company Admin data
interface CompanyStats {
  totalOfficers: number;
  totalLeads: number;
  conversionRate: number;
  thisWeekLeads: number;
  thisMonthLeads: number;
  activeOfficers: number;
  topPerformingOfficer: string;
  averageResponseTime: number;
}

interface Officer {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  is_active: boolean;
  lead_count: number;
  conversion_count: number;
}

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  officer_id: string;
}

export default function AdminDashboardPage() {
  const { user, userRole, companyId, loading: authLoading } = useAuth();
  const router = useRouter();

  // State for dashboard data
  const [companyStats, setCompanyStats] = useState<CompanyStats>({
    totalOfficers: 0,
    totalLeads: 0,
    conversionRate: 0,
    thisWeekLeads: 0,
    thisMonthLeads: 0,
    activeOfficers: 0,
    topPerformingOfficer: 'N/A',
    averageResponseTime: 0
  });
  const [recentOfficers, setRecentOfficers] = useState<Officer[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (authLoading || !user?.id || !companyId) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('🚀 Company Admin Dashboard: Starting data fetch for company:', companyId);
        console.log('🔍 Company Admin Dashboard: User object:', { id: user.id, email: user.email });
        console.log('🔍 Company Admin Dashboard: Company ID type:', typeof companyId, 'value:', companyId);

        // Fetch officers data - need to join with user_companies table
        console.log('🔍 Company Admin Dashboard: Fetching officers...');
        const { data: officersData, error: officersError } = await supabase
          .from('user_companies')
          .select(`
            user_id,
            role,
            users!inner(
              id,
              email,
              first_name,
              last_name,
              created_at,
              is_active
            )
          `)
          .eq('company_id', companyId)
          .eq('role', 'employee');

        if (officersError) {
          console.error('❌ Company Admin: Officers fetch error:', {
            message: officersError.message,
            details: officersError.details,
            hint: officersError.hint,
            code: officersError.code,
            fullError: officersError
          });
          throw officersError;
        }

        console.log('✅ Company Admin Dashboard: Fetched officers:', officersData?.length || 0);

        // Fetch leads data
        console.log('🔍 Company Admin Dashboard: Fetching leads...');
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (leadsError) {
          console.error('❌ Company Admin: Leads fetch error:', {
            message: leadsError.message,
            details: leadsError.details,
            hint: leadsError.hint,
            code: leadsError.code,
            fullError: leadsError
          });
          throw leadsError;
        }

        console.log('✅ Company Admin Dashboard: Fetched leads:', leadsData?.length || 0);

        // Process officers data and calculate their lead counts
        const processedOfficers: Officer[] = (officersData || []).map(officerCompany => {
          const officer = Array.isArray(officerCompany.users) ? officerCompany.users[0] : officerCompany.users;
          const officerLeads = leadsData?.filter(lead => lead.officer_id === officer.id) || [];
          const conversions = officerLeads.filter(lead => lead.status === 'converted');
          
          return {
            id: officer.id,
            email: officer.email,
            full_name: officer.first_name && officer.last_name 
              ? `${officer.first_name} ${officer.last_name}` 
              : officer.email.split('@')[0],
            created_at: officer.created_at,
            is_active: officer.is_active,
            lead_count: officerLeads.length,
            conversion_count: conversions.length
          };
        });

        // Calculate statistics
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const totalLeads = leadsData?.length || 0;
        const convertedLeads = leadsData?.filter(lead => lead.status === 'converted').length || 0;
        const thisWeekLeads = leadsData?.filter(lead => new Date(lead.created_at) >= oneWeekAgo).length || 0;
        const thisMonthLeads = leadsData?.filter(lead => new Date(lead.created_at) >= oneMonthAgo).length || 0;
        const activeOfficers = processedOfficers.filter(officer => officer.is_active).length;
        const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

        // Find top performing officer
        const topOfficer = processedOfficers.reduce((top, current) => 
          current.conversion_count > top.conversion_count ? current : top, 
          processedOfficers[0] || { full_name: 'N/A', conversion_count: 0 }
        );

        setCompanyStats({
          totalOfficers: processedOfficers.length,
          totalLeads,
          conversionRate,
          thisWeekLeads,
          thisMonthLeads,
          activeOfficers,
          topPerformingOfficer: topOfficer.full_name,
          averageResponseTime: 2.5 // Mock data - would calculate from actual response times
        });

        setRecentOfficers(processedOfficers.slice(0, 3));
        setRecentLeads((leadsData || []).slice(0, 3));

        console.log('✅ Company Admin Dashboard: Data loaded successfully');
        console.log('📊 Company Admin Dashboard: Stats:', {
          totalOfficers: processedOfficers.length,
          totalLeads: leadsData?.length || 0,
          conversionRate: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0
        });

      } catch (err) {
        console.error('❌ Company Admin Dashboard data fetch error:', {
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

  // Show loading state
  if (authLoading || loading) {
    return (
      <RouteGuard allowedRoles={['company_admin']}>
        <DashboardLayout 
          title="Company Admin Dashboard" 
          subtitle="Welcome to your company admin dashboard"
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
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              {authLoading ? 'Loading user data...' : 'Loading dashboard data...'}
            </p>
          </div>
        </DashboardLayout>
      </RouteGuard>
    );
  }

  // Show error state
  if (error) {
    return (
      <RouteGuard allowedRoles={['company_admin']}>
        <DashboardLayout 
          title="Company Admin Dashboard" 
          subtitle="Welcome to your company admin dashboard"
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
              backgroundColor: '#fee2e2',
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
    <RouteGuard allowedRoles={['company_admin']}>
      <DashboardLayout 
        title="Company Admin Dashboard" 
        subtitle="Welcome to your company admin dashboard"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          

          {/* Company Statistics */}
          <div style={dashboard.grid.cols4}>
            <SpotlightCard variant="primary" className="p-5">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: '#dbeafe'
                  }}>
                    {React.createElement(icons.profile, { 
                      size: 20, 
                      style: { color: '#2563eb' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={dashboard.statsCardLabel}>Loan Officers</p>
                  <p style={dashboard.statsCardValue}>{companyStats.totalOfficers}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard variant="success" className="p-5">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: '#dcfce7'
                  }}>
                    {React.createElement(icons.document, { 
                      size: 20, 
                      style: { color: '#16a34a' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={dashboard.statsCardLabel}>Total Leads</p>
                  <p style={dashboard.statsCardValue}>{companyStats.totalLeads}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard variant="warning" className="p-5">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: '#fef3c7'
                  }}>
                    {React.createElement(icons.trendingUp, { 
                      size: 20, 
                      style: { color: '#d97706' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={dashboard.statsCardLabel}>Conversion Rate</p>
                  <p style={dashboard.statsCardValue}>{companyStats.conversionRate}%</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard variant="purple" className="p-5">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: '#e0e7ff'
                  }}>
                    {React.createElement(icons.clock, { 
                      size: 20, 
                      style: { color: '#6366f1' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={dashboard.statsCardLabel}>Avg Response</p>
                  <p style={dashboard.statsCardValue}>{companyStats.averageResponseTime}h</p>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Performance Metrics */}
          <div style={dashboard.grid.cols3}>
            <SpotlightCard variant="neutral" className="p-5">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: '#f3e8ff'
                  }}>
                    {React.createElement(icons.star, { 
                      size: 20, 
                      style: { color: '#9333ea' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={dashboard.statsCardLabel}>Top Performer</p>
                  <p style={dashboard.statsCardValue}>{companyStats.topPerformingOfficer}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard variant="success" className="p-5">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: '#dcfce7'
                  }}>
                    {React.createElement(icons.checkCircle, { 
                      size: 20, 
                      style: { color: '#16a34a' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={dashboard.statsCardLabel}>Active Officers</p>
                  <p style={dashboard.statsCardValue}>{companyStats.activeOfficers}</p>
                </div>
              </div>
            </SpotlightCard>

            <SpotlightCard variant="primary" className="p-5">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: '#dbeafe'
                  }}>
                    {React.createElement(icons.calendar, { 
                      size: 20, 
                      style: { color: '#2563eb' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={dashboard.statsCardLabel}>This Week</p>
                  <p style={dashboard.statsCardValue}>{companyStats.thisWeekLeads}</p>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Quick Actions */}
          <SpotlightCard variant="neutral" className="p-6">
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'medium',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Quick Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <SpotlightCard 
                variant="primary" 
                onClick={() => router.push('/admin/loanofficers')}
                className="p-4 text-center cursor-pointer"
              >
                <div style={{
                  ...dashboard.quickActionIcon,
                  backgroundColor: '#dbeafe',
                  margin: '0 auto 8px auto'
                }}>
                  {React.createElement(icons.profile, { 
                    size: 20, 
                    style: { color: '#2563eb' } 
                  })}
                </div>
                <p style={dashboard.quickActionTitle}>Loan Officers</p>
              </SpotlightCard>

              <SpotlightCard 
                variant="success" 
                onClick={() => router.push('/admin/insights')}
                className="p-4 text-center cursor-pointer"
              >
                <div style={{
                  ...dashboard.quickActionIcon,
                  backgroundColor: '#dcfce7',
                  margin: '0 auto 8px auto'
                }}>
                  {React.createElement(icons.trendingUp, { 
                    size: 20, 
                    style: { color: '#16a34a' } 
                  })}
                </div>
                <p style={dashboard.quickActionTitle}>Leads Insights</p>
              </SpotlightCard>

              <SpotlightCard 
                variant="warning" 
                onClick={() => router.push('/admin/stats')}
                className="p-4 text-center cursor-pointer"
              >
                <div style={{
                  ...dashboard.quickActionIcon,
                  backgroundColor: '#fef3c7',
                  margin: '0 auto 8px auto'
                }}>
                  {React.createElement(icons.calculator, { 
                    size: 20, 
                    style: { color: '#d97706' } 
                  })}
                </div>
                <p style={dashboard.quickActionTitle}>Conversion Stats</p>
              </SpotlightCard>

              <SpotlightCard 
                variant="lightGreen" 
                onClick={() => router.push('/admin/settings')}
                className="p-4 text-center cursor-pointer"
              >
                <div style={{
                  ...dashboard.quickActionIcon,
                  backgroundColor: '#dcfce7',
                  margin: '0 auto 8px auto'
                }}>
                  {React.createElement(icons.settings, { 
                    size: 20, 
                    style: { color: '#16a34a' } 
                  })}
                </div>
                <p style={dashboard.quickActionTitle}>Settings</p>
              </SpotlightCard>
            </div>
          </SpotlightCard>

          {/* Team Management & Analytics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Recent Officers */}
            <SpotlightCard variant="neutral" className="p-6">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'medium',
                  color: '#111827'
                }}>
                  Recent Officers
                </h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push('/admin/loanofficers')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    color: '#374151'
                  }}
                >
                  View All
                </Button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentOfficers.length > 0 ? (
                  recentOfficers.map((officer, index) => (
                    <div
                      key={`officer-${officer.id}-${officer.created_at}-${index}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#dbeafe',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <span style={{ fontSize: '14px', fontWeight: 'medium', color: '#2563eb' }}>
                          {officer.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 'medium', color: '#111827', fontSize: '14px' }}>
                          {officer.full_name}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                          {officer.lead_count} leads • {officer.conversion_count} conversions
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                    No officers yet
                  </p>
                )}
              </div>
            </SpotlightCard>

            {/* Recent Leads */}
            <SpotlightCard variant="warning" className="p-6">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'medium',
                  color: '#111827'
                }}>
                  Recent Leads
                </h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push('/admin/insights')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    color: '#374151'
                  }}
                >
                  View All
                </Button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentLeads.length > 0 ? (
                  recentLeads.map((lead, index) => (
                    <div
                      key={`lead-${lead.id}-${lead.created_at}-${index}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: lead.priority === 'high' ? '#fef3c7' : '#dcfce7',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: 'medium', 
                          color: lead.priority === 'high' ? '#d97706' : '#16a34a' 
                        }}>
                          {lead.first_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 'medium', color: '#111827', fontSize: '14px' }}>
                          {lead.first_name} {lead.last_name}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                          {lead.status} • {lead.priority} priority
                        </p>
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
          </div>

          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
