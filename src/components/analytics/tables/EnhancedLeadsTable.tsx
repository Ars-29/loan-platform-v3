'use client';

import React, { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { format } from 'date-fns';
import { borderRadius } from '@/theme/theme';

interface EnhancedLead {
  id: string;
  companyId: string;
  officerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  conversionStage: 'lead' | 'application' | 'approval' | 'closing';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  creditScore?: number;
  loanAmount?: number;
  loanAmountClosed?: number;
  commissionEarned?: number;
  responseTimeHours?: number;
  leadQualityScore?: number;
  geographicLocation?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastContactDate?: string;
  contactCount: number;
}

interface EnhancedLeadsTableProps {
  leads: EnhancedLead[];
  loading: boolean;
  onStatusUpdate: (leadId: string, newStatus: EnhancedLead['status']) => void;
  onConversionStageUpdate: (leadId: string, newStage: EnhancedLead['conversionStage']) => void;
  onPriorityUpdate: (leadId: string, newPriority: EnhancedLead['priority']) => void;
  onQualityScoreUpdate: (leadId: string, newScore: number) => void;
  onNotesUpdate: (leadId: string, newNotes: string) => void;
  onViewDetails?: (lead: EnhancedLead) => void;
  allowEditing?: boolean; // New prop to control editing permissions
}

const EnhancedLeadsTable: React.FC<EnhancedLeadsTableProps> = ({
  leads,
  loading,
  onStatusUpdate,
  onConversionStageUpdate,
  onPriorityUpdate,
  onQualityScoreUpdate,
  onNotesUpdate,
  onViewDetails,
  allowEditing = true // Default to true for backward compatibility
}) => {
  const [editingLead, setEditingLead] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const handleEditStart = (leadId: string, field: string, currentValue: any) => {
    setEditingLead(leadId);
    setEditingField(field);
    setTempValue(String(currentValue || ''));
  };

  const handleEditSave = () => {
    if (!editingLead || !editingField) return;

    switch (editingField) {
      case 'status':
        onStatusUpdate(editingLead, tempValue as EnhancedLead['status']);
        break;
      case 'conversionStage':
        onConversionStageUpdate(editingLead, tempValue as EnhancedLead['conversionStage']);
        break;
      case 'priority':
        onPriorityUpdate(editingLead, tempValue as EnhancedLead['priority']);
        break;
      case 'leadQualityScore':
        onQualityScoreUpdate(editingLead, parseInt(tempValue));
        break;
      case 'notes':
        onNotesUpdate(editingLead, tempValue);
        break;
    }

    setEditingLead(null);
    setEditingField(null);
    setTempValue('');
  };

  const handleEditCancel = () => {
    setEditingLead(null);
    setEditingField(null);
    setTempValue('');
  };

  const getStatusColor = (status: EnhancedLead['status']) => {
    switch (status) {
      case 'new': return 'blue';
      case 'contacted': return 'yellow';
      case 'qualified': return 'green';
      case 'converted': return 'purple';
      case 'lost': return 'red';
      default: return 'gray';
    }
  };

  const getStatusBadgeStatus = (status: EnhancedLead['status']) => {
    switch (status) {
      case 'new': return 'new' as const;
      case 'contacted': return 'contacted' as const;
      case 'qualified': return 'qualified' as const;
      case 'converted': return 'converted' as const;
      case 'lost': return 'closed' as const; // Map 'lost' to 'closed'
      default: return 'pending' as const;
    }
  };

  const getConversionStageColor = (stage: EnhancedLead['conversionStage']) => {
    switch (stage) {
      case 'lead': return 'blue';
      case 'application': return 'yellow';
      case 'approval': return 'green';
      case 'closing': return 'purple';
      default: return 'gray';
    }
  };

  const getConversionStageBadgeStatus = (stage: EnhancedLead['conversionStage']) => {
    switch (stage) {
      case 'lead': return 'new' as const;
      case 'application': return 'sent' as const;
      case 'approval': return 'accepted' as const;
      case 'closing': return 'converted' as const;
      default: return 'pending' as const;
    }
  };

  const getPriorityColor = (priority: EnhancedLead['priority']) => {
    switch (priority) {
      case 'low': return 'gray';
      case 'medium': return 'blue';
      case 'high': return 'yellow'; // Changed from 'orange' to 'yellow'
      case 'urgent': return 'red';
      default: return 'gray';
    }
  };

  const getPriorityBadgeStatus = (priority: EnhancedLead['priority']) => {
    switch (priority) {
      case 'low': return 'inactive' as const;
      case 'medium': return 'pending' as const;
      case 'high': return 'sent' as const;
      case 'urgent': return 'expired' as const;
      default: return 'pending' as const;
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const columns = [
    {
      key: 'name',
      title: 'Name',
      render: (value: any, lead: EnhancedLead, index: number) => {
        if (!lead) {
          return <div className="text-gray-400">No data</div>;
        }
        return (
          <div>
            <div className="font-medium text-gray-900">
              {lead.firstName || 'Unknown'} {lead.lastName || 'User'}
            </div>
            <div className="text-sm text-gray-500">{lead.email || 'No email'}</div>
            {lead.phone && <div className="text-sm text-gray-500">{lead.phone}</div>}
          </div>
        );
      },
    },
    {
      key: 'source',
      title: 'Source',
      render: (value: any, lead: EnhancedLead, index: number) => {
        if (!lead) return <div className="text-gray-400">No data</div>;
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#01bcc6]/10 text-[#01bcc6]">
            {lead.source?.replace('_', ' ').toUpperCase() || 'Unknown'}
          </span>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: any, lead: EnhancedLead, index: number) => {
        if (!lead) return <div className="text-gray-400">No data</div>;
        if (editingLead === lead.id && editingField === 'status') {
          return (
            <select
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
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
          );
        }
        return (
          <div
            className={allowEditing ? "cursor-pointer" : "cursor-default"}
            onClick={allowEditing ? () => handleEditStart(lead.id, 'status', lead.status) : undefined}
          >
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              lead.status === 'new' ? 'bg-[#01bcc6]/10 text-[#01bcc6]' :
              lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
              lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
              lead.status === 'converted' ? 'bg-purple-100 text-purple-800' :
              lead.status === 'lost' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
            </span>
          </div>
        );
      },
    },
    {
      key: 'conversionStage',
      title: 'Stage',
      render: (value: any, lead: EnhancedLead, index: number) => {
        if (!lead) return <div className="text-gray-400">No data</div>;
        if (editingLead === lead.id && editingField === 'conversionStage') {
          return (
            <select
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
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
          );
        }
        return (
          <div
            className={allowEditing ? "cursor-pointer" : "cursor-default"}
            onClick={allowEditing ? () => handleEditStart(lead.id, 'conversionStage', lead.conversionStage) : undefined}
          >
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              lead.conversionStage === 'lead' ? 'bg-[#01bcc6]/10 text-[#01bcc6]' :
              lead.conversionStage === 'application' ? 'bg-yellow-100 text-yellow-800' :
              lead.conversionStage === 'approval' ? 'bg-green-100 text-green-800' :
              lead.conversionStage === 'closing' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {lead.conversionStage.charAt(0).toUpperCase() + lead.conversionStage.slice(1)}
            </span>
          </div>
        );
      },
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (value: any, lead: EnhancedLead, index: number) => {
        if (!lead) return <div className="text-gray-400">No data</div>;
        if (editingLead === lead.id && editingField === 'priority') {
          return (
            <select
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
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
          );
        }
        return (
          <div
            className={allowEditing ? "cursor-pointer" : "cursor-default"}
            onClick={allowEditing ? () => handleEditStart(lead.id, 'priority', lead.priority) : undefined}
          >
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              lead.priority === 'low' ? 'bg-gray-100 text-gray-800' :
              lead.priority === 'medium' ? 'bg-[#01bcc6]/10 text-[#01bcc6]' :
              lead.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
              lead.priority === 'urgent' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
            </span>
          </div>
        );
      },
    },
    ...(onViewDetails ? [{
      key: 'actions',
      title: 'Actions',
      render: (value: any, lead: EnhancedLead, index: number) => {
        if (!lead) return <div className="text-gray-400">No data</div>;
        return (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onViewDetails(lead)}
            className="border-0"
          >
            View Details
          </Button>
        );
      },
    }] : []),
  ];

  // Filter out any null/undefined leads
  const validLeads = leads.filter(lead => lead != null);

  return (
    <div 
      className="bg-white shadow-sm border border-gray-200 overflow-hidden"
      style={{ borderRadius: borderRadius.lg }}
    >
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Enhanced Leads Management</h3>
        <p className="text-sm text-gray-600 mt-1">
          {allowEditing 
            ? "Click on any field to edit. Track conversion stages, quality scores, and response times."
            : "View lead information. Only Loan Officers can edit lead details."
          }
        </p>
      </div>
      <DataTable
        data={validLeads}
        columns={columns}
        loading={loading}
        emptyMessage="No leads found. Leads will appear here when borrowers submit information through your landing page."
      />
    </div>
  );
};

export default EnhancedLeadsTable;
