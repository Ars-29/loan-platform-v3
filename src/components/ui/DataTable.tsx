import React from 'react';
import { theme, RoleType } from '@/theme/theme';
import { Button, ResendButton, DeactivateButton, DeleteButton, ReactivateButton } from './Button';

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
          className="text-green-600 hover:text-green-900 text-xs"
        />
      );
    }

    // Resend button for pending/sent/expired invites (only if not deactivated)
    if (onResend && !isDeactivated && (inviteStatus === 'sent' || inviteStatus === 'expired' || !isActive)) {
      actions.push(
        <ResendButton
          key="resend"
          role={role}
          onClick={() => onResend(record)}
          className="text-blue-600 hover:text-blue-900 text-xs"
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
          className="text-red-600 hover:text-red-900 text-xs"
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
          className="text-red-600 hover:text-red-900 text-xs"
        />
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
    ...(onResend || onDeactivate || onReactivate || onDelete ? [{
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
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
              <tr key={record.id || index} className="hover:bg-gray-50">
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
export const CompanyTable: React.FC<Omit<DataTableProps, 'role' | 'columns'>> = (props) => {
  const companyColumns: TableColumn[] = [
    {
      key: 'company',
      title: 'Company',
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{record.name}</div>
          <div className="text-sm text-gray-500">{record.slug}</div>
          {record.isActive && (
            <div className="text-xs text-green-600 font-medium">🟢 Active Company</div>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'admin_email',
      render: (value, record) => value || record.email,
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
              {status === 'accepted' ? '✅ Active' :
               status === 'sent' ? '📧 Invite Sent' :
               status === 'expired' ? '⏰ Expired' :
               '⏳ Pending'}
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
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      },
    },
  ];

  return (
    <DataTable
      {...props}
      role="super_admin"
      columns={companyColumns}
    />
  );
};

export const OfficerTable: React.FC<Omit<DataTableProps, 'role' | 'columns'>> = (props) => {
  const officerColumns: TableColumn[] = [
    {
      key: 'officer',
      title: 'Officer',
      render: (_, record) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
              <span className="text-sm font-medium text-pink-600">
                {record.firstName?.charAt(0)}{record.lastName?.charAt(0)}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {record.firstName} {record.lastName}
            </div>
            {record.isActive && (
              <div className="text-xs text-green-600 font-medium">🟢 Active Officer</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
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
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
              🚫 Deactivated
            </span>
          );
        }
        
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {value ? '✅ Active' : '⏳ Inactive'}
          </span>
        );
      },
    },
    {
      key: 'joined',
      title: 'Joined',
      dataIndex: 'createdAt',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <DataTable
      {...props}
      role="company_admin"
      columns={officerColumns}
    />
  );
};