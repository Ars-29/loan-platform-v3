'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/use-auth';
import { typography, colors, spacing, borderRadius } from '@/theme/theme';
import { icons } from '@/components/ui/Icon';
import Breadcrumb, { BreadcrumbItem } from '@/components/ui/Breadcrumb';

interface Lead {
  id: string;
  companyId: string;
  officerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  conversionStage: 'lead' | 'application' | 'approval' | 'closing';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: string;
  loanAmount?: number;
  loanAmountClosed?: number;
  commissionEarned?: number;
  downPayment?: number;
  creditScore?: number;
  responseTimeHours?: number;
  leadQualityScore?: number;
  geographicLocation?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastContactDate?: string;
  contactCount: number;
  conversionDate?: string;
  applicationDate?: string;
  approvalDate?: string;
  closingDate?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  propertyDetails?: Record<string, any>;
  loanDetails?: {
    productId: string;
    lenderName: string;
    loanProgram: string;
    loanType: string;
    loanTerm: number;
    interestRate: number;
    apr: number;
    monthlyPayment: number;
    fees: number;
    points: number;
    credits: number;
    lockPeriod: number;
  };
}

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, accessToken } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Editing state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const leadId = params.leadId as string;

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Leads', href: '/officers/leads', icon: 'home' },
    { label: `Lead Details: ${lead ? `${lead.firstName} ${lead.lastName}` : 'Loading...'}` }
  ];

  useEffect(() => {
    if (accessToken && leadId) {
      fetchLeadDetails();
    }
  }, [accessToken, leadId]);

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(`/api/leads/by-slug/${leadId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch lead details');
      }

      const data = await response.json();
      setLead(data.lead);
    } catch (err) {
      console.error('Error fetching lead details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch lead details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageBadgeColor = (stage: Lead['conversionStage']) => {
    switch (stage) {
      case 'lead': return 'bg-blue-100 text-blue-800';
      case 'application': return 'bg-yellow-100 text-yellow-800';
      case 'approval': return 'bg-green-100 text-green-800';
      case 'closing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: Lead['priority']) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-yellow-100 text-yellow-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Editing functions
  const handleEditStart = (field: string, value: any) => {
    setEditingField(field);
    setTempValue(value?.toString() || '');
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setTempValue('');
  };

  const handleEditSave = async () => {
    if (!lead || !accessToken || saving) return;

    try {
      setSaving(true);
      
      const response = await fetch(`/api/leads/${lead.id}/analytics`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ [editingField!]: tempValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead');
      }

      // Update local state
      setLead(prevLead => prevLead ? { ...prevLead, [editingField!]: tempValue } : null);
      setEditingField(null);
      setTempValue('');
    } catch (err) {
      console.error('Error updating lead:', err);
      alert('Failed to update lead. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Lead Details" subtitle="Loading lead information...">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          fontSize: typography.fontSize.lg,
          color: colors.gray[600]
        }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
          Loading lead details...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Lead Details" subtitle="Error loading lead information">
        <div style={{ padding: spacing[6] }}>
          <Breadcrumb items={breadcrumbItems} />
          <div style={{
            padding: spacing[6],
            backgroundColor: colors.red[50],
            border: `1px solid ${colors.red[200]}`,
            borderRadius: borderRadius.md,
            color: colors.red[600]
          }}>
            <h3 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[2] }}>
              Error Loading Lead Details
            </h3>
            <p style={{ marginBottom: spacing[4] }}>{error}</p>
            <div className="flex gap-4">
              <Button onClick={fetchLeadDetails} variant="primary">
                Try Again
              </Button>
              <Button onClick={() => router.push('/officers/leads')} variant="secondary">
                Back to Leads
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!lead) {
    return (
      <DashboardLayout title="Lead Details" subtitle="Lead not found">
        <div style={{ padding: spacing[6] }}>
          <Breadcrumb items={breadcrumbItems} />
          <div style={{
            padding: spacing[6],
            backgroundColor: colors.gray[50],
            border: `1px solid ${colors.gray[200]}`,
            borderRadius: borderRadius.md,
            color: colors.gray[600],
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, marginBottom: spacing[2] }}>
              Lead Not Found
            </h3>
            <p style={{ marginBottom: spacing[4] }}>The lead you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => router.push('/officers/leads')} variant="primary">
              Back to Leads
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Lead: ${lead.firstName} ${lead.lastName}`} subtitle="Complete lead analysis and details">
      <div style={{ padding: spacing[6] }}>
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push('/officers/leads')}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg border-0 flex items-center transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Leads
          </button>
          
          <div className="flex gap-2">
            {/* Status */}
            {editingField === 'status' ? (
              <select
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="px-3 py-1 rounded-full text-sm font-medium border border-gray-300"
                onBlur={handleEditSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditSave();
                  if (e.key === 'Escape') handleEditCancel();
                }}
                autoFocus
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            ) : (
              <span 
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:opacity-80 ${getStatusBadgeColor(lead.status)}`}
                onClick={() => handleEditStart('status', lead.status)}
              >
                {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
              </span>
            )}

            {/* Stage */}
            {editingField === 'conversionStage' ? (
              <select
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="px-3 py-1 rounded-full text-sm font-medium border border-gray-300"
                onBlur={handleEditSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditSave();
                  if (e.key === 'Escape') handleEditCancel();
                }}
                autoFocus
              >
                <option value="lead">Lead</option>
                <option value="application">Application</option>
                <option value="approval">Approval</option>
                <option value="closing">Closing</option>
              </select>
            ) : (
              <span 
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:opacity-80 ${getStageBadgeColor(lead.conversionStage)}`}
                onClick={() => handleEditStart('conversionStage', lead.conversionStage)}
              >
                {lead.conversionStage.charAt(0).toUpperCase() + lead.conversionStage.slice(1)}
              </span>
            )}

            {/* Priority */}
            {editingField === 'priority' ? (
              <select
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="px-3 py-1 rounded-full text-sm font-medium border border-gray-300"
                onBlur={handleEditSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditSave();
                  if (e.key === 'Escape') handleEditCancel();
                }}
                autoFocus
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            ) : (
              <span 
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:opacity-80 ${getPriorityBadgeColor(lead.priority)}`}
                onClick={() => handleEditStart('priority', lead.priority)}
              >
                {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)} Priority
              </span>
            )}
          </div>
        </div>

        {/* Lead Details Grid - ALL Database Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact & Basic Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              {React.createElement(icons.user, { size: 20, className: "mr-2" })}
              Contact & Basic Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <p className="text-lg font-semibold text-gray-900">{lead.firstName} {lead.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{lead.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-gray-900">{lead.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <p className="text-gray-900">{lead.source || 'N/A'}</p>
              </div>
              {lead.geographicLocation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p className="text-gray-900">{lead.geographicLocation}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p className="text-gray-900">{formatDate(lead.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                <p className="text-gray-900">{formatDate(lead.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              {React.createElement(icons.dollarSign, { size: 20, className: "mr-2" })}
              Financial Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requested Loan Amount</label>
                <p className="text-lg font-semibold text-blue-600">{formatCurrency(lead.loanAmount)}</p>
              </div>
              {lead.loanAmountClosed && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Closed Loan Amount</label>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(lead.loanAmountClosed)}</p>
                </div>
              )}
              {lead.commissionEarned && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission Earned</label>
                  <p className="text-lg font-semibold text-purple-600">{formatCurrency(lead.commissionEarned)}</p>
                </div>
              )}
              {lead.downPayment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Down Payment</label>
                  <p className="text-gray-900">{formatCurrency(lead.downPayment)}</p>
                </div>
              )}
              {lead.creditScore && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credit Score</label>
                  <p className="text-gray-900">{lead.creditScore}</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance & Analytics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              {React.createElement(icons.trendingUp, { size: 20, className: "mr-2" })}
              Performance & Analytics
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead Quality Score</label>
                {editingField === 'leadQualityScore' ? (
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-16 text-sm border border-gray-300 rounded px-2 py-1 mr-3"
                      onBlur={handleEditSave}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditSave();
                        if (e.key === 'Escape') handleEditCancel();
                      }}
                      autoFocus
                    />
                    <span className="text-sm text-gray-500">/10</span>
                  </div>
                ) : (
                  <div 
                    className="flex items-center cursor-pointer hover:opacity-80"
                    onClick={() => handleEditStart('leadQualityScore', lead.leadQualityScore || 5)}
                  >
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${((lead.leadQualityScore || 0) / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{lead.leadQualityScore || 0}/10</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Count</label>
                <p className="text-gray-900">{lead.contactCount}</p>
              </div>
              {lead.responseTimeHours && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Response Time</label>
                  <p className="text-gray-900">{lead.responseTimeHours} hours</p>
                </div>
              )}
              {lead.lastContactDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Contact</label>
                  <p className="text-gray-900">{formatDate(lead.lastContactDate)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conversion Timeline */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            {React.createElement(icons.clock, { size: 20, className: "mr-2" })}
            Conversion Timeline
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {lead.conversionDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conversion Date</label>
                <p className="text-gray-900">{formatDate(lead.conversionDate)}</p>
              </div>
            )}
            {lead.applicationDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application Date</label>
                <p className="text-gray-900">{formatDate(lead.applicationDate)}</p>
              </div>
            )}
            {lead.approvalDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approval Date</label>
                <p className="text-gray-900">{formatDate(lead.approvalDate)}</p>
              </div>
            )}
            {lead.closingDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Closing Date</label>
                <p className="text-gray-900">{formatDate(lead.closingDate)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Data */}
        {(lead.tags || lead.customFields || lead.propertyDetails) && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              {React.createElement(icons.fileText, { size: 20, className: "mr-2" })}
              Additional Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lead.tags && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(lead.tags) ? lead.tags.map((tag: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    )) : (
                      <span className="text-gray-900">{lead.tags}</span>
                    )}
                  </div>
                </div>
              )}
              {lead.customFields && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom Fields</label>
                  <div className="text-sm text-gray-900">
                    {typeof lead.customFields === 'object' ? (
                      <pre className="whitespace-pre-wrap">{JSON.stringify(lead.customFields, null, 2)}</pre>
                    ) : (
                      <p>{lead.customFields}</p>
                    )}
                  </div>
                </div>
              )}
              {lead.propertyDetails && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Details</label>
                  <div className="text-sm text-gray-900">
                    {typeof lead.propertyDetails === 'object' ? (
                      <pre className="whitespace-pre-wrap">{JSON.stringify(lead.propertyDetails, null, 2)}</pre>
                    ) : (
                      <p>{lead.propertyDetails}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loan Details - Simplified */}
        {lead.loanDetails && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              {React.createElement(icons.fileText, { size: 20, className: "mr-2" })}
              Loan Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lender & Program</label>
                <p className="text-gray-900">{lead.loanDetails.lenderName} - {lead.loanDetails.loanProgram}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loan Type & Term</label>
                <p className="text-gray-900">{lead.loanDetails.loanType} ({lead.loanDetails.loanTerm} years)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate & APR</label>
                <p className="text-gray-900">{lead.loanDetails.interestRate}% / {lead.loanDetails.apr}% APR</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Payment</label>
                <p className="text-lg font-semibold text-blue-600">{formatCurrency(lead.loanDetails.monthlyPayment)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notes - Editable */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            {React.createElement(icons.messageSquare, { size: 20, className: "mr-2" })}
            Notes
          </h3>
          {editingField === 'notes' ? (
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded px-3 py-2"
              rows={4}
              onBlur={handleEditSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) handleEditSave();
                if (e.key === 'Escape') handleEditCancel();
              }}
              autoFocus
              placeholder="Add notes about this lead..."
            />
          ) : (
            <div 
              className="bg-gray-50 rounded-md p-4 cursor-pointer hover:bg-gray-100 min-h-[60px]"
              onClick={() => handleEditStart('notes', lead.notes || '')}
            >
              <p className="text-gray-700 whitespace-pre-wrap">{lead.notes || 'Click to add notes...'}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
