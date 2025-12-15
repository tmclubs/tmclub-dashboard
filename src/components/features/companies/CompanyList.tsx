import React, { useState } from 'react';
import { Building2, MapPin, MoreHorizontal } from 'lucide-react';
import { Table, Button } from '@/components/ui';
import { Company } from '@/types/api';

export interface CompanyListProps {
  companies: Company[];
  loading?: boolean;
  onView?: (company: Company) => void;
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
  onCreate?: () => void;
  onExport?: () => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

export const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  loading = false,
  onView,
  onEdit,
  onDelete,
  pagination,
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleSelectionChange = (selectedRowKeys: any[]) => {
    setSelectedRows(selectedRowKeys.map((key: any) => key.toString()));
  };

  const columns: any[] = [
    {
      key: 'display_name',
      title: 'Member Name',
      sortable: true,
      render: (_: any, company: Company) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            {company.main_image ? (
              <img
                src={company.main_image}
                alt={company.display_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <Building2 className="w-5 h-5 text-gray-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="font-medium text-gray-900">{company.display_name}</div>
            </div>
            <div className="text-sm text-gray-500 line-clamp-1">{company.description}</div>
          </div>
        </div>
      ),
      width: '300px',
    },
    {
      key: 'city',
      title: 'Location',
      render: (value: any) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{value || '-'}</span>
        </div>
      ),
      sortable: true,
      width: '200px',
    },
    {
      key: 'contact',
      title: 'Contact',
      render: (_: any, company: Company) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{company.contact || '-'}</div>
          <div className="text-xs text-gray-500">{company.email || '-'}</div>
        </div>
      ),
      width: '200px',
    },
    {
      key: 'address',
      title: 'Address',
      render: (value: any) => (
        <span className="text-sm text-gray-900 line-clamp-2">{value || '-'}</span>
      ),
      sortable: true,
      width: '200px',
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, company: Company) => (
        <div className="flex items-center gap-2">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(company)}
            >
              View
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(company)}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(company)}
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          )}
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      ),
      width: '200px',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Companies Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table
          data={companies.map(company => ({ ...company, id: company.pk }))}
          columns={columns}
          loading={loading}
          pagination={pagination}
          selection={{
            selectedRowKeys: selectedRows,
            onChange: handleSelectionChange,
          }}
        />
      </div>

      {/* Selected Actions */}
      {selectedRows.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm sticky bottom-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedRows.length} members selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Send Notification
              </Button>
              <Button variant="outline" size="sm">
                Export Selected
              </Button>
              <Button variant="destructive" size="sm">
                Delete Selected
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
