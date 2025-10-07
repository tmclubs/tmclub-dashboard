import React, { useState } from 'react';
import { Search, Plus, Building2, Users, MapPin, MoreHorizontal, Download, Filter } from 'lucide-react';
import { Table, Badge, Button, Input } from '@/components/ui';
import { Column } from '@/components/ui/Table';

import { Company } from './CompanyCard';


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
  onCreate,
  onExport,
  pagination,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleSelectionChange = (selectedRowKeys: any[]) => {
    setSelectedRows(selectedRowKeys.map((key: any) => key.toString()));
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  
  const columns: any[] = [
    {
      key: 'name',
      title: 'Company Name',
      sortable: true,
      render: (_, company) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <Building2 className="w-5 h-5 text-gray-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="font-medium text-gray-900">{company.name}</div>
              {company.verified && (
                <Badge variant="success" size="sm">✓</Badge>
              )}
            </div>
            <div className="text-sm text-gray-500">{company.industry}</div>
          </div>
        </div>
      ),
      width: '300px',
    },
    {
      key: 'location',
      title: 'Location',
      render: (value) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{value}</span>
        </div>
      ),
      sortable: true,
      width: '200px',
    },
    {
      key: 'contactPerson',
      title: 'Contact Person',
      render: (_, company) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{company.contactPerson.name}</div>
          <div className="text-xs text-gray-500">{company.contactPerson.email}</div>
        </div>
      ),
      width: '200px',
    },
    {
      key: 'memberCount',
      title: 'Members',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{value}</span>
        </div>
      ),
      sortable: true,
      width: '100px',
    },
    {
      key: 'eventCount',
      title: 'Events',
      render: (value) => (
        <span className="text-sm text-gray-900">{value}</span>
      ),
      sortable: true,
      width: '80px',
    },
    {
      key: 'status',
      title: 'Status',
      render: (_, company) => (
        <Badge variant={getStatusColor(company.status)} size="sm">
          {company.status}
        </Badge>
      ),
      sortable: true,
      width: '100px',
    },
    {
      key: 'joinDate',
      title: 'Joined',
      render: (value) => (
        <span className="text-sm text-gray-900">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
      sortable: true,
      width: '120px',
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, company) => (
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

  const stats = [
    {
      label: 'Total Companies',
      value: companies.length,
      color: 'text-orange-600',
    },
    {
      label: 'Active Companies',
      value: companies.filter(c => c.status === 'active').length,
      color: 'text-green-600',
    },
    {
      label: 'Pending Approval',
      value: companies.filter(c => c.status === 'pending').length,
      color: 'text-yellow-600',
    },
    {
      label: 'Total Members',
      value: companies.reduce((sum, c) => sum + c.memberCount, 0).toLocaleString(),
      color: 'text-blue-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Management</h1>
          <p className="text-gray-600 mt-1">Manage companies and their members</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={handleExport}>
            Export
          </Button>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={onCreate}>
            Add Company
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-600">{stat.label}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search companies..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
          Filter
        </Button>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Table
          data={filteredCompanies}
          columns={columns}
          loading={loading}
          pagination={pagination}
          actions={{
            search: {
              placeholder: 'Search companies...',
              onSearch: handleSearch,
            },
            export: {
              onExport: handleExport,
            },
          }}
          selectable
          selection={{
            selectedRowKeys: selectedRows,
            onChange: handleSelectionChange,
          }}
        />
      </div>

      {/* Selected Actions */}
      {selectedRows.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedRows.length} companies selected
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