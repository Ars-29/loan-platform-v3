'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { useRouter } from 'next/navigation';

interface CompanyData {
  id: string;
  name: string;
  loanOfficers: LoanOfficerData[];
  totalLeads: number;
  totalConverted: number;
  conversionRate: number;
  showOfficers?: boolean;
}

interface LoanOfficerData {
  id: string;
  name: string;
  email: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  lastActivity: string;
}

interface SimpleLeadsData {
  companies: CompanyData[];
  totalCompanies: number;
  totalLoanOfficers: number;
  totalLeads: number;
  totalConverted: number;
  overallConversionRate: number;
}

export default function SimpleLeadsInsights({ isSuperAdmin = false }: { isSuperAdmin?: boolean }) {
  const { user, accessToken } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<SimpleLeadsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);

      if (isSuperAdmin) {
        // For Super Admin, fetch companies data
        const response = await fetch('/api/analytics/simple-leads-insights', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch leads data');
        }

        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.success) {
          // Transform the API response to match the expected data structure
          const transformedData: SimpleLeadsData = {
            companies: result.companies.map((company: any) => ({
              id: company.id,
              name: company.name,
              loanOfficers: [], // Will be populated when officers are fetched
              totalLeads: company.totalLeads || 0,
              totalConverted: company.convertedLeads || 0,
              conversionRate: company.conversionRate || 0
            })),
            totalCompanies: result.totalCompanies || 0,
            totalLoanOfficers: result.totalLoanOfficers || 0,
            totalLeads: result.totalLeads || 0,
            totalConverted: result.totalConverted || 0,
            overallConversionRate: result.overallConversionRate || 0
          };
          setData(transformedData);
        } else {
          throw new Error(result.error || 'Failed to fetch data');
        }
      } else {
        // For Company Admin, directly fetch officers data
        const response = await fetch('/api/analytics/simple-leads-insights', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch leads data');
        }

        const result = await response.json();
        console.log('Company Admin API Response:', result);
        
        if (result.success) {
          // For Company Admin, we need to get the company info and officers
          const company = result.companies[0]; // Company Admin only has one company
          if (company) {
            // Fetch officers for this company
            const officersResponse = await fetch(`/api/analytics/simple-leads-insights?companyId=${company.id}`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (officersResponse.ok) {
              const officersResult = await officersResponse.json();
              console.log('Officers API Response:', officersResult);
              
              if (officersResult.success && officersResult.officers) {
                const transformedData: SimpleLeadsData = {
                  companies: [{
                    id: company.id,
                    name: company.name,
                    loanOfficers: officersResult.officers.map((officer: any) => ({
                      id: officer.id,
                      name: `${officer.firstName} ${officer.lastName}`.trim(),
                      email: officer.email,
                      totalLeads: officer.totalLeads,
                      convertedLeads: officer.convertedLeads,
                      conversionRate: officer.conversionRate,
                      lastActivity: 'Recent'
                    })),
                    totalLeads: company.totalLeads || 0,
                    totalConverted: company.convertedLeads || 0,
                    conversionRate: company.conversionRate || 0,
                    showOfficers: true // Auto-expand for Company Admin
                  }],
                  totalCompanies: 1,
                  totalLoanOfficers: officersResult.officers.length,
                  totalLeads: company.totalLeads || 0,
                  totalConverted: company.convertedLeads || 0,
                  overallConversionRate: company.conversionRate || 0
                };
                setData(transformedData);
              }
            }
          }
        } else {
          throw new Error(result.error || 'Failed to fetch data');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficersForCompany = async (companyId: string) => {
    if (!accessToken || !data) return;

    try {
      const response = await fetch(`/api/analytics/simple-leads-insights?companyId=${companyId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch officers data');
      }

      const result = await response.json();
      console.log('Officers API Response:', result);
      
      if (result.success && result.officers) {
        // Update the company with officers data
        const updatedData = {
          ...data,
          companies: data.companies.map(company => 
            company.id === companyId 
              ? { 
                  ...company, 
                  loanOfficers: result.officers.map((officer: any) => ({
                    id: officer.id,
                    name: `${officer.firstName} ${officer.lastName}`.trim(),
                    email: officer.email,
                    totalLeads: officer.totalLeads,
                    convertedLeads: officer.convertedLeads,
                    conversionRate: officer.conversionRate,
                    lastActivity: 'Recent' // We don't have this in the API response
                  }))
                }
              : company
          )
        };
        setData(updatedData);
      }
    } catch (err) {
      console.error('Error fetching officers:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [accessToken]);

  const companyColumns = [
    {
      key: 'name',
      title: 'Company Name',
      render: (value: any, row: CompanyData) => (
        <div className="font-medium text-gray-900">{row.name}</div>
      )
    },
    {
      key: 'loanOfficers',
      title: 'Loan Officers',
      render: (value: any, row: CompanyData) => (
        <div className="text-sm text-gray-600">{row.loanOfficers.length} officers</div>
      )
    },
    {
      key: 'totalLeads',
      title: 'Total Leads',
      render: (value: any, row: CompanyData) => (
        <div className="font-medium text-blue-600">{row.totalLeads.toLocaleString()}</div>
      )
    },
    {
      key: 'totalConverted',
      title: 'Converted',
      render: (value: any, row: CompanyData) => (
        <div className="font-medium text-green-600">{row.totalConverted.toLocaleString()}</div>
      )
    },
    {
      key: 'conversionRate',
      title: 'Conversion Rate',
      render: (value: any, row: CompanyData) => (
        <div className="font-medium text-purple-600">{row.conversionRate.toFixed(1)}%</div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: CompanyData) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            // Toggle loan officers visibility and fetch data if needed
            const company = data?.companies.find(c => c.id === row.id);
            if (company && company.loanOfficers.length === 0) {
              // Fetch officers data if not already loaded
              fetchOfficersForCompany(row.id);
            }
            
            const updatedData = data ? {
              ...data,
              companies: data.companies.map(company => 
                company.id === row.id 
                  ? { ...company, showOfficers: !company.showOfficers }
                  : company
              )
            } : null;
            setData(updatedData);
          }}
        >
          View Officers
        </Button>
      )
    }
  ];

  const officerColumns = [
    {
      key: 'name',
      title: 'Officer Name',
      render: (value: any, row: LoanOfficerData) => (
        <div className="font-medium text-gray-900">{row.name}</div>
      )
    },
    {
      key: 'email',
      title: 'Email',
      render: (value: any, row: LoanOfficerData) => (
        <div className="text-sm text-gray-600">{row.email}</div>
      )
    },
    {
      key: 'totalLeads',
      title: 'Total Leads',
      render: (value: any, row: LoanOfficerData) => (
        <div className="font-medium text-blue-600">{row.totalLeads.toLocaleString()}</div>
      )
    },
    {
      key: 'convertedLeads',
      title: 'Converted',
      render: (value: any, row: LoanOfficerData) => (
        <div className="font-medium text-green-600">{row.convertedLeads.toLocaleString()}</div>
      )
    },
    {
      key: 'conversionRate',
      title: 'Conversion Rate',
      render: (value: any, row: LoanOfficerData) => (
        <div className="font-medium text-purple-600">{row.conversionRate.toFixed(1)}%</div>
      )
    },
    {
      key: 'lastActivity',
      title: 'Last Activity',
      render: (value: any, row: LoanOfficerData) => (
        <div className="text-sm text-gray-500">{row.lastActivity}</div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: LoanOfficerData) => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            // Create slug from officer name - join all parts with hyphens
            const officerSlug = row.name.toLowerCase().replace(/\s+/g, '-');
            
            if (isSuperAdmin) {
              // For super admin, navigate to super admin officer leads page
              router.push(`/super-admin/officers/${officerSlug}/leads`);
            } else {
              // For company admin, navigate to admin insights officer leads page
              router.push(`/admin/insights/loanofficers/${officerSlug}/leads`);
            }
          }}
        >
          View Leads
        </Button>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchData} variant="secondary">
          Retry
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isSuperAdmin ? (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-sm font-medium text-gray-500">Total Companies</div>
              <div className="text-2xl font-bold text-blue-600">{data.totalCompanies}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-sm font-medium text-gray-500">Total Loan Officers</div>
              <div className="text-2xl font-bold text-green-600">{data.totalLoanOfficers}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-sm font-medium text-gray-500">Total Leads</div>
              <div className="text-2xl font-bold text-purple-600">{data.totalLeads.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-sm font-medium text-gray-500">Overall Conversion Rate</div>
              <div className="text-2xl font-bold text-orange-600">{data.overallConversionRate.toFixed(1)}%</div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-sm font-medium text-gray-500">Company</div>
              <div className="text-2xl font-bold text-blue-600">{data.companies[0]?.name || 'N/A'}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-sm font-medium text-gray-500">Loan Officers</div>
              <div className="text-2xl font-bold text-green-600">{data.totalLoanOfficers}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-sm font-medium text-gray-500">Total Leads</div>
              <div className="text-2xl font-bold text-purple-600">{data.totalLeads.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-sm font-medium text-gray-500">Conversion Rate</div>
              <div className="text-2xl font-bold text-orange-600">{data.overallConversionRate.toFixed(1)}%</div>
            </div>
          </>
        )}
      </div>

      {/* Companies Table - Only for Super Admin */}
      {isSuperAdmin && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              All Companies & Loan Officers
            </h3>
          </div>
          <div className="p-6">
            <DataTable
              data={data.companies}
              columns={companyColumns}
              emptyMessage="No companies found"
            />
            
            {/* Show loan officers for expanded companies */}
            {data.companies.map(company => (
              company.showOfficers && (
                <div key={company.id} className="mt-6 border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    Loan Officers - {company.name}
                  </h4>
                  <DataTable
                    data={company.loanOfficers}
                    columns={officerColumns}
                    emptyMessage="No loan officers found"
                  />
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Direct Loan Officers Table - For Company Admin */}
      {!isSuperAdmin && data.companies.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Loan Officers - {data.companies[0].name}
            </h3>
          </div>
          <div className="p-6">
            <DataTable
              data={data.companies[0].loanOfficers}
              columns={officerColumns}
              emptyMessage="No loan officers found"
            />
          </div>
        </div>
      )}
    </div>
  );
}
