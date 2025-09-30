'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { DashboardLoadingState } from '@/components/ui/LoadingState';
import { dashboard } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import SpotlightCard from '@/components/ui/SpotlightCard';
import RecentActivity from '@/components/analytics/RecentActivity';

// Interfaces for Super Admin data
interface PlatformStats {
  totalCompanies: number;
  totalOfficers: number;
  totalLeads: number;
  platformConversionRate: number;
  activeCompanies: number;
  thisWeekLeads: number;
  thisMonthLeads: number;
  topPerformingCompany: string;
  averageResponseTime: number;
}

interface Company {
  id: string;
  name: string;
  email: string;
  created_at: string;
  is_active: boolean;
  officer_count: number;
  lead_count: number;
  conversion_count: number;
  slug: string;
}

interface Officer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string;
  created_at: string;
  is_active: boolean;
  lead_count: number;
  conversion_count: number;
  slug: string;
}

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  company_name: string;
  officer_name: string;
  created_at: string;
}

export default function SuperAdminDashboardPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();

  // State for dashboard data
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    totalCompanies: 0,
    totalOfficers: 0,
    totalLeads: 0,
    platformConversionRate: 0,
    activeCompanies: 0,
    thisWeekLeads: 0,
    thisMonthLeads: 0,
    topPerformingCompany: 'N/A',
    averageResponseTime: 0
  });
  const [recentCompanies, setRecentCompanies] = useState<Company[]>([]);
  const [recentOfficers, setRecentOfficers] = useState<Officer[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (authLoading || !user?.id) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('🚀 Super Admin Dashboard: Starting data fetch');

        // Fetch companies data
        console.log('🔍 Super Admin Dashboard: Fetching companies...');
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('id, name, email, created_at, is_active')
          .order('created_at', { ascending: false });

        if (companiesError) {
          console.error('❌ Super Admin: Companies fetch error:', companiesError);
          throw companiesError;
        }

        // Fetch officers data
        console.log('🔍 Super Admin Dashboard: Fetching officers...');
        const { data: officersData, error: officersError } = await supabase
          .from('user_companies')
          .select(`
            user_id,
            role,
            companies!inner(name),
            users!inner(
              id,
              email,
              first_name,
              last_name,
              created_at,
              is_active
            )
          `)
          .eq('role', 'employee');

        if (officersError) {
          console.error('❌ Super Admin: Officers fetch error:', officersError);
          throw officersError;
        }

        // Fetch leads data
        console.log('🔍 Super Admin Dashboard: Fetching leads...');
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select(`
            id,
            first_name,
            last_name,
            email,
            status,
            priority,
            created_at,
            companies!inner(name),
            users!inner(id, first_name, last_name)
          `)
          .order('created_at', { ascending: false })
          .limit(100);

        if (leadsError) {
          console.error('❌ Super Admin: Leads fetch error:', leadsError);
          throw leadsError;
        }

        console.log('✅ Super Admin Dashboard: Fetched data successfully');

        // Process companies data
        const processedCompanies: Company[] = (companiesData || []).map(company => {
          const companyOfficers = officersData?.filter(oc => {
            const company = Array.isArray(oc.companies) ? oc.companies[0] : oc.companies;
            return company?.name === company.name;
          }) || [];
          const companyLeads = leadsData?.filter(lead => {
            const leadCompany = Array.isArray(lead.companies) ? lead.companies[0] : lead.companies;
            return leadCompany?.name === company.name;
          }) || [];
          const conversions = companyLeads.filter(lead => lead.status === 'converted');
          
          return {
            id: company.id,
            name: company.name,
            email: company.email,
            created_at: company.created_at,
            is_active: company.is_active,
            officer_count: companyOfficers.length,
            lead_count: companyLeads.length,
            conversion_count: conversions.length,
            slug: company.name.toLowerCase().replace(/\s+/g, '-')
          };
        });

        // Process officers data
        const processedOfficers: Officer[] = (officersData || []).map(officerCompany => {
          const officer = Array.isArray(officerCompany.users) ? officerCompany.users[0] : officerCompany.users;
          const company = Array.isArray(officerCompany.companies) ? officerCompany.companies[0] : officerCompany.companies;
          const officerLeads = leadsData?.filter(lead => {
            const leadUser = Array.isArray(lead.users) ? lead.users[0] : lead.users;
            return leadUser?.id === officer.id;
          }) || [];
          const conversions = officerLeads.filter(lead => lead.status === 'converted');
          
          return {
            id: officer.id,
            email: officer.email,
            first_name: officer.first_name,
            last_name: officer.last_name,
            company_name: company?.name || 'Unknown',
            created_at: officer.created_at,
            is_active: officer.is_active,
            lead_count: officerLeads.length,
            conversion_count: conversions.length,
            slug: `${officer.first_name} ${officer.last_name}`.toLowerCase().replace(/\s+/g, '-')
          };
        });

        // Process leads data
        const processedLeads: Lead[] = (leadsData || []).map(lead => {
          const company = Array.isArray(lead.companies) ? lead.companies[0] : lead.companies;
          const officer = Array.isArray(lead.users) ? lead.users[0] : lead.users;
          
          return {
            id: lead.id,
            first_name: lead.first_name,
            last_name: lead.last_name,
            email: lead.email,
            status: lead.status,
            priority: lead.priority,
            company_name: company?.name || 'Unknown',
            officer_name: officer ? `${officer.first_name} ${officer.last_name}` : 'Unknown',
            created_at: lead.created_at
          };
        });

        // Deduplicate processed data to prevent duplicate keys
        const uniqueCompanies = processedCompanies.reduce((acc: Company[], company: Company) => {
          if (!acc.find(item => item.id === company.id)) {
            acc.push(company);
          }
          return acc;
        }, []);

        const uniqueOfficers = processedOfficers.reduce((acc: Officer[], officer: Officer) => {
          if (!acc.find(item => item.id === officer.id)) {
            acc.push(officer);
          }
          return acc;
        }, []);

        const uniqueLeads = processedLeads.reduce((acc: Lead[], lead: Lead) => {
          if (!acc.find(item => item.id === lead.id)) {
            acc.push(lead);
          }
          return acc;
        }, []);

        // Calculate platform statistics
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const totalLeads = uniqueLeads.length || 0;
        const convertedLeads = uniqueLeads.filter(lead => lead.status === 'converted').length || 0;
        const thisWeekLeads = uniqueLeads.filter(lead => new Date(lead.created_at) >= oneWeekAgo).length || 0;
        const thisMonthLeads = uniqueLeads.filter(lead => new Date(lead.created_at) >= oneMonthAgo).length || 0;
        const activeCompanies = uniqueCompanies.filter(company => company.is_active).length;
        const platformConversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

        // Find top performing company
        const topCompany = uniqueCompanies.reduce((top, current) => 
          current.conversion_count > top.conversion_count ? current : top, 
          uniqueCompanies[0] || { name: 'N/A', conversion_count: 0 }
        );

        setPlatformStats({
          totalCompanies: uniqueCompanies.length,
          totalOfficers: uniqueOfficers.length,
          totalLeads,
          platformConversionRate,
          activeCompanies,
          thisWeekLeads,
          thisMonthLeads,
          topPerformingCompany: topCompany.name,
          averageResponseTime: 2.1 // Mock data - would calculate from actual response times
        });

        setRecentCompanies(uniqueCompanies.slice(0, 3));
        setRecentOfficers(uniqueOfficers.slice(0, 3));
        setRecentLeads(uniqueLeads.slice(0, 3));

        console.log('✅ Super Admin Dashboard: Data loaded successfully');
        console.log('📊 Super Admin Dashboard: Stats:', {
          totalCompanies: uniqueCompanies.length,
          totalOfficers: uniqueOfficers.length,
          totalLeads,
          platformConversionRate
        });

      } catch (err) {
        console.error('❌ Super Admin Dashboard data fetch error:', {
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
  }, [user?.id, authLoading]);

  // Show loading state
  if (authLoading || loading) {
    return (
      <RouteGuard allowedRoles={['super_admin']}>
        <DashboardLayout 
          title="Super Admin Dashboard" 
          subtitle="Welcome to your super admin dashboard"
        >
          <DashboardLoadingState 
            text={authLoading ? 'Loading user data...' : 'Loading platform data...'} 
          />
        </DashboardLayout>
      </RouteGuard>
    );
  }

  // Show error state
  if (error) {
    return (
      <RouteGuard allowedRoles={['super_admin']}>
        <DashboardLayout 
          title="Super Admin Dashboard" 
          subtitle="Welcome to your super admin dashboard"
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
              backgroundColor: '#EBDBC7',
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
    <RouteGuard allowedRoles={['super_admin']}>
      <DashboardLayout 
        title="Super Admin Dashboard" 
        subtitle="Welcome to your super admin dashboard"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Platform Statistics */}
          <div style={dashboard.grid.cols4}>
            <SpotlightCard variant="default" className="p-5">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: 'rgba(1, 188, 198, 0.1)'
                  }}>
                    {React.createElement(icons.building, { 
                      size: 20, 
                      style: { color: '#008eab' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={dashboard.statsCardLabel}>Total Companies</p>
                  <p style={dashboard.statsCardValue}>{platformStats.totalCompanies}</p>
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
                    {React.createElement(icons.profile, { 
                      size: 20, 
                      style: { color: '#008eab' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={dashboard.statsCardLabel}>Total Officers</p>
                  <p style={dashboard.statsCardValue}>{platformStats.totalOfficers}</p>
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
                    {React.createElement(icons.document, { 
                      size: 20, 
                      style: { color: '#008eab' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={dashboard.statsCardLabel}>Total Leads</p>
                  <p style={dashboard.statsCardValue}>{platformStats.totalLeads}</p>
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
                  <p style={dashboard.statsCardLabel}>Platform Conversion</p>
                  <p style={dashboard.statsCardValue}>{platformStats.platformConversionRate}%</p>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Platform Performance Metrics */}
          <div style={dashboard.grid.cols3}>
            <SpotlightCard variant="default" className="p-5">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    ...dashboard.statsCardIcon,
                    backgroundColor: 'rgba(1, 188, 198, 0.1)'
                  }}>
                    {React.createElement(icons.star, { 
                      size: 20, 
                      style: { color: '#008eab' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={dashboard.statsCardLabel}>Top Company</p>
                  <p style={dashboard.statsCardValue}>{platformStats.topPerformingCompany}</p>
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
                  <p style={dashboard.statsCardLabel}>Active Companies</p>
                  <p style={dashboard.statsCardValue}>{platformStats.activeCompanies}</p>
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
                    {React.createElement(icons.calendar, { 
                      size: 20, 
                      style: { color: '#008eab' } 
                    })}
                  </div>
                </div>
                <div style={dashboard.statsCardContent}>
                  <p style={dashboard.statsCardLabel}>This Week</p>
                  <p style={dashboard.statsCardValue}>{platformStats.thisWeekLeads}</p>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Quick Actions */}
          <SpotlightCard variant="default" className="p-6">
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#005b7c',
              marginBottom: '16px'
            }}>
              Quick Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              <SpotlightCard 
                variant="default" 
                onClick={() => router.push('/super-admin/companies')}
                className="p-4 text-center cursor-pointer"
                style={{ backgroundColor: 'white', border: '1px solid rgba(1, 188, 198, 0.2)' }}
              >
                <div style={{
                  ...dashboard.quickActionIcon,
                  backgroundColor: 'rgba(1, 188, 198, 0.1)',
                  margin: '0 auto 8px auto'
                }}>
                  {React.createElement(icons.building, { 
                    size: 20, 
                    style: { color: '#008eab' } 
                  })}
                </div>
                <p style={dashboard.quickActionTitle}>Companies</p>
              </SpotlightCard>

              <SpotlightCard 
                variant="default" 
                onClick={() => router.push('/super-admin/officers')}
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
                <p style={dashboard.quickActionTitle}>Loan Officers</p>
              </SpotlightCard>

              <SpotlightCard 
                variant="default" 
                onClick={() => router.push('/super-admin/insights')}
                className="p-4 text-center cursor-pointer"
                style={{ backgroundColor: 'white', border: '1px solid rgba(1, 188, 198, 0.2)' }}
              >
                <div style={{
                  ...dashboard.quickActionIcon,
                  backgroundColor: 'rgba(1, 188, 198, 0.1)',
                  margin: '0 auto 8px auto'
                }}>
                  {React.createElement(icons.trendingUp, { 
                    size: 20, 
                    style: { color: '#008eab' } 
                  })}
                </div>
                <p style={dashboard.quickActionTitle}>Leads Insights</p>
              </SpotlightCard>

              <SpotlightCard 
                variant="default" 
                onClick={() => router.push('/super-admin/stats')}
                className="p-4 text-center cursor-pointer"
                style={{ backgroundColor: 'white', border: '1px solid rgba(1, 188, 198, 0.2)' }}
              >
                <div style={{
                  ...dashboard.quickActionIcon,
                  backgroundColor: 'rgba(1, 188, 198, 0.1)',
                  margin: '0 auto 8px auto'
                }}>
                  {React.createElement(icons.calculator, { 
                    size: 20, 
                    style: { color: '#008eab' } 
                  })}
                </div>
                <p style={dashboard.quickActionTitle}>Conversion Stats</p>
              </SpotlightCard>

              <SpotlightCard 
                variant="default" 
                onClick={() => router.push('/super-admin/settings')}
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
          </SpotlightCard>

          {/* Platform Management & Analytics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {/* Recent Companies */}
            <SpotlightCard variant="default" className="p-6">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#005b7c'
                }}>
                  Recent Companies
                </h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/super-admin/companies')}
                  className="bg-[#01bcc6] hover:bg-[#008eab] text-white"
                >
                  View All
                </Button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentCompanies.length > 0 ? (
                  recentCompanies.map((company, index) => (
                    <div
                      key={`company-${company.id}-${company.created_at}-${index}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid rgba(1, 188, 198, 0.2)'
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: 'rgba(1, 188, 198, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <span style={{ fontSize: '14px', fontWeight: 'medium', color: '#2563eb' }}>
                          {company.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 'medium', color: '#111827', fontSize: '14px' }}>
                          {company.name}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                          {company.officer_count} officers • {company.lead_count} leads
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                    No companies yet
                  </p>
                )}
              </div>
            </SpotlightCard>

            {/* Recent Officers */}
            <SpotlightCard variant="default" className="p-6">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#005b7c'
                }}>
                  Recent Officers
                </h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/super-admin/officers')}
                  className="bg-[#01bcc6] hover:bg-[#008eab] text-white"
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
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid rgba(1, 188, 198, 0.2)'
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: 'rgba(1, 188, 198, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <span style={{ fontSize: '14px', fontWeight: 'medium', color: '#16a34a' }}>
                          {officer.first_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 'medium', color: '#111827', fontSize: '14px' }}>
                          {officer.first_name} {officer.last_name}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                          {officer.company_name} • {officer.lead_count} leads
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
                  onClick={() => router.push('/super-admin/insights')}
                  className="bg-[#01bcc6] hover:bg-[#008eab] text-white"
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
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid rgba(1, 188, 198, 0.2)'
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
                          {lead.company_name} • {lead.status}
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
