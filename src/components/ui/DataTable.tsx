import React from 'react';
import { theme, RoleType } from '@/theme/theme';
import { Button, ResendButton, DeactivateButton, DeleteButton, ReactivateButton } from './Button';
import Icon from './Icon';

export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  role?: RoleType;
  onResend?: (record: T) => void;
  onDeactivate?: (record: T) => void;
  onReactivate?: (record: T) => void;
  onDelete?: (record: T) => void;
  onViewDetails?: (record: T) => void;
  className?: string;
}

/**
 * Centralized DataTable Component
 *
 * Features:
 * - Reusable for both companies and loan officers
 * - Role-based action buttons
 * - Consistent styling and layout
 * - Loading states and empty states
 * - Customizable columns and actions
 */
export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage,
  role,
  onResend,
  onDeactivate,
  onReactivate,
  onDelete,
  onViewDetails,
  className = '',
}: DataTableProps<T>) => {
  // Get role-based empty message
  const getEmptyMessage = () => {
    if (emptyMessage) return emptyMessage;
    if (role) return theme.roleTexts[role].emptyStateMessage;
    return 'No data found.';
  };

  // Render action buttons based on record status and role
  const renderActions = (record: T) => {
    const actions: React.ReactNode[] = [];

    // Determine record status based on common fields
    const inviteStatus = record?.invite_status || record?.status;
    
    // For companies: active when invite_status is 'accepted' (same logic as status display)
    // For officers: active when isActive is true
    const isActive = inviteStatus === 'accepted' || record?.isActive === true;
    const isDeactivated = record?.deactivated === true;

    // Reactivate button for deactivated records
    if (onReactivate && isDeactivated) {
      actions.push(
        <ReactivateButton
          key="reactivate"
          role={role}
          onClick={() => onReactivate(record)}
        />
      );
    }

    // Resend button for pending/sent/expired invites (only if not deactivated and not accepted)
    if (onResend && !isDeactivated && inviteStatus !== 'accepted' && (inviteStatus === 'sent' || inviteStatus === 'expired' || inviteStatus === 'pending')) {
      actions.push(
        <ResendButton
          key="resend"
          role={role}
          onClick={() => onResend(record)}
        />
      );
    }

    // Separator if we have more actions
    if (actions.length > 0 && (onDeactivate || onDelete)) {
      actions.push(<span key="separator" className="text-gray-300">|</span>);
    }

    // Deactivate button for active records (only if not already deactivated)
    if (onDeactivate && isActive && !isDeactivated) {
      actions.push(
        <DeactivateButton
          key="deactivate"
          role={role}
          onClick={() => onDeactivate(record)}
        />
      );
    }

    // Delete button for inactive/pending/expired records (only if not deactivated)
    // Only show delete for: pending, sent, expired, or inactive records
    const shouldShowDelete = !isDeactivated && (
      inviteStatus === 'pending' ||
      inviteStatus === 'sent' ||
      inviteStatus === 'expired' ||
      !isActive
    );

    if (onDelete && shouldShowDelete) {
      actions.push(
        <DeleteButton
          key="delete"
          role={role}
          onClick={() => onDelete(record)}
        />
      );
    }

    // View Details button (always show if handler provided)
    if (onViewDetails) {
      // Add separator if we have other actions
      if (actions.length > 0) {
        actions.push(<span key="separator-details" className="text-gray-300">|</span>);
      }
      actions.push(
        <Button
          key="view-details"
          variant="secondary"
          size="sm"
          onClick={() => onViewDetails(record)}
          className="text-xs"
        >
          View Details
        </Button>
      );
    }

    return actions.length > 0 ? (
      <div className="flex space-x-2">
        {actions}
      </div>
    ) : null;
  };

  // Add actions column if any action handlers are provided
  const finalColumns: TableColumn<T>[] = [
    ...columns,
    ...(onResend || onDeactivate || onReactivate || onDelete || onViewDetails ? [{
      key: 'actions',
      title: 'Actions',
      render: (value, record, index) => renderActions(record),
      width: '120px',
      align: 'left' as const,
    } as TableColumn<T>] : []),
  ];

  if (loading) {
    return (
      <div className={`bg-white shadow rounded-lg ${className}`}>
        <div className="px-6 py-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`bg-white shadow rounded-lg ${className}`}>
        <div className="px-6 py-4">
          <div className="text-center py-8 text-gray-500">
            {getEmptyMessage()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {finalColumns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${column.align === 'center' ? 'text-center' : ''}
                    ${column.align === 'right' ? 'text-right' : ''}
                  `}
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((record, index) => (
              <tr key={`${record.id || 'unknown'}-${index}-${record.email || record.name || 'no-email'}`} className="hover:bg-gray-50">
                {finalColumns.map((column) => {
                  const value = column.dataIndex ? record[column.dataIndex] : record[column.key];
                  return (
                    <td
                      key={column.key}
                      className={`
                        px-6 py-4 whitespace-nowrap text-sm
                        ${column.align === 'center' ? 'text-center' : ''}
                        ${column.align === 'right' ? 'text-right' : ''}
                      `}
                    >
                      {column.render ? column.render(value, record, index) : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Specialized components for common use cases
export const CompanyTable: React.FC<Omit<DataTableProps, 'role' | 'columns'> & { 
  onViewDetails?: (companySlug: string) => void;
}> = (props) => {
  const { onViewDetails, ...restProps } = props;
  
  // Wrap onViewDetails to extract slug from record
  const handleViewDetails = onViewDetails ? (record: any) => {
    onViewDetails(record.slug || record.id);
  } : undefined;
  const companyColumns: TableColumn[] = [
    {
      key: 'company',
      title: 'Company',
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{record.name}</div>
          <div className="text-sm text-gray-500">{record.slug}</div>
          {record.isActive && (
            <div className="text-xs text-green-600 font-medium flex items-center">
              <Icon name="checkCircle" className="w-3 h-3 mr-1" />
              Active Company
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'admin_email',
      render: (value, record) => (
        <div className="text-sm text-gray-900">{value || record.email}</div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'invite_status',
      render: (value, record) => {
        const status = value || 'pending';
        const expiresAt = record.invite_expires_at;
        const isDeactivated = record.deactivated === true;

        // If deactivated, show deactivated status regardless of invite status
        if (isDeactivated) {
          return (
            <div>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                🚫 Deactivated
              </span>
            </div>
          );
        }

        return (
          <div>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              status === 'accepted' ? 'bg-green-100 text-green-800' :
              status === 'sent' ? 'bg-blue-100 text-blue-800' :
              status === 'expired' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
            {status === 'accepted' ? (
              <>
                <Icon name="checkCircle" className="w-3 h-3 mr-1" />
                Active
              </>
            ) : status === 'sent' ? (
              <>
                <Icon name="mail" className="w-3 h-3 mr-1" />
                Invite Sent
              </>
            ) : status === 'expired' ? (
              <>
                <Icon name="clock" className="w-3 h-3 mr-1" />
                Expired
              </>
            ) : (
              <>
                <Icon name="clock" className="w-3 h-3 mr-1" />
                Pending
              </>
            )}
            </span>
            {status === 'sent' && expiresAt && (
              <div className="text-xs text-gray-500 mt-1">
                Expires: {new Date(expiresAt).toLocaleString()}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'created',
      title: 'Created',
      dataIndex: 'created_at',
      render: (value, record) => {
        const date = value || record.createdAt;
        return (
          <div className="text-sm text-gray-900">
            {date ? new Date(date).toLocaleDateString() : 'N/A'}
          </div>
        );
      },
    },
    {
      key: 'totalOfficers',
      title: 'Total Officers',
      dataIndex: 'totalOfficers',
      render: (value) => (
        <div className="text-sm text-gray-900 font-medium">
          {value || 0}
        </div>
      ),
    },
    {
      key: 'totalLeads',
      title: 'Total Leads',
      dataIndex: 'totalLeads',
      render: (value) => (
        <div className="text-sm text-gray-900 font-medium">
          {value || 0}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      {...restProps}
      role="super_admin"
      columns={companyColumns}
      onViewDetails={handleViewDetails}
    />
  );
};

export const OfficerTable: React.FC<Omit<DataTableProps, 'role' | 'columns'> & { 
  onViewLeads?: (officerId: string) => void;
  onViewDetails?: (officerId: string) => void;
  onResend?: (officer: any) => void;
  onDeactivate?: (officer: any) => void;
  onReactivate?: (officer: any) => void;
  onDelete?: (officer: any) => void;
}> = (props) => {
  const { onViewLeads, onViewDetails, onResend, onDeactivate, onReactivate, onDelete, ...restProps } = props;
  
  const officerColumns: TableColumn[] = [
    {
      key: 'officer',
      title: 'Officer',
      render: (_, record) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {record.firstName?.charAt(0)}{record.lastName?.charAt(0)}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {record.firstName} {record.lastName}
            </div>
            {record.isActive && (
              <div className="text-xs text-green-600 font-medium flex items-center">
                <Icon name="checkCircle" className="w-3 h-3 mr-1" />
                Active Officer
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      render: (value) => (
        <div className="text-sm text-gray-900">{value}</div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'isActive',
      render: (value, record) => {
        const isDeactivated = record.deactivated === true;

        // If deactivated, show deactivated status
        if (isDeactivated) {
          return (
            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
              <Icon name="error" className="w-3 h-3 mr-1" />
              Deactivated
            </span>
          );
        }

        return (
          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {value ? (
              <>
                <Icon name="checkCircle" className="w-3 h-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <Icon name="clock" className="w-3 h-3 mr-1" />
                Inactive
              </>
            )}
          </span>
        );
      },
    },
    {
      key: 'joined',
      title: 'Joined',
      dataIndex: 'createdAt',
      render: (value) => (
        <div className="text-sm text-gray-900">{new Date(value).toLocaleDateString()}</div>
      ),
    },
    {
      key: 'totalLeads',
      title: 'Total Leads',
      dataIndex: 'totalLeads',
      render: (value) => (
        <div className="text-sm text-gray-900 font-medium">
          {value || 0}
        </div>
      ),
    },
    {
      key: 'publicLink',
      title: 'Public Link',
      dataIndex: 'hasPublicLink',
      render: (value) => (
        <div className="flex items-center">
          {value ? (
            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
              <Icon name="checkCircle" className="w-3 h-3 mr-1" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
              <Icon name="error" className="w-3 h-3 mr-1" />
              None
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'selectedTemplate',
      title: 'Template',
      dataIndex: 'selectedTemplate',
      render: (value) => (
        <div className="text-sm text-gray-900">
          {value ? (
            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {value}
            </span>
          ) : (
            <span className="text-gray-500">Not selected</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: any) => (
        <div className="flex items-center space-x-2">
          {onViewLeads && (
            <button
              onClick={() => {
                // Create slug from officer name instead of using ID
                const officerSlug = `${record.firstName.toLowerCase()}-${record.lastName.toLowerCase()}`;
                onViewLeads(officerSlug);
              }}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              View Leads
            </button>
          )}
          
          {onViewDetails && (
            <button
              onClick={() => {
                // Create slug from officer name for breadcrumb navigation
                const officerSlug = `${record.firstName.toLowerCase()}-${record.lastName.toLowerCase()}`;
                onViewDetails(officerSlug);
              }}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-600 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View Details
            </button>
          )}
          
          {onResend && !record.isActive && (
            <ResendButton
              role="company_admin"
              onClick={() => onResend(record)}
              className="text-xs px-2 py-1 h-6"
            />
          )}
          
          {onDeactivate && record.isActive && !record.deactivated && (
            <DeactivateButton
              role="company_admin"
              onClick={() => onDeactivate(record)}
              className="text-xs px-2 py-1 h-6"
            />
          )}
          
          {onReactivate && record.deactivated && (
            <ReactivateButton
              role="company_admin"
              onClick={() => onReactivate(record)}
              className="text-xs px-2 py-1 h-6"
            />
          )}
          
          {onDelete && (
            <DeleteButton
              role="company_admin"
              onClick={() => onDelete(record)}
              className="text-xs px-2 py-1 h-6"
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      {...restProps}
      role="company_admin"
      columns={officerColumns}
    />
  );
};