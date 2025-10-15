import React from 'react';
import { Input, Select, Button } from '@/components/ui';
import { Search, Download, UserPlus, Mail } from 'lucide-react';

export interface MemberFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  companyFilter: string;
  onCompanyFilterChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onAddMember: () => void;
  onInviteMember: () => void;
  onExportMembers: () => void;
  memberCount: number;
}

export const MemberFilters: React.FC<MemberFiltersProps> = ({
  searchTerm,
  onSearchChange,
  companyFilter,
  onCompanyFilterChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onAddMember,
  onInviteMember,
  onExportMembers,
  memberCount,
}) => {
  const companyOptions = [
    { value: 'all', label: 'All Companies' },
    { value: 'toyota', label: 'Toyota Motor Manufacturing Indonesia' },
    { value: 'daihatsu', label: 'PT Astra Daihatsu Motor' },
    { value: 'honda', label: 'PT Honda Prospect Motor' },
    { value: 'suzuki', label: 'PT Suzuki Indomobil Motor' },
    { value: 'mitsubishi', label: 'PT Mitsubishi Motors Krama Yudha' },
  ];

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'member', label: 'Member' },
    { value: 'guest', label: 'Guest' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'suspended', label: 'Suspended' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">{memberCount}</span>
            <span className="text-gray-600">Total Members</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={onExportMembers}
          >
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Mail className="w-4 h-4" />}
            onClick={onInviteMember}
          >
            Invite
          </Button>
          <Button
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={onAddMember}
          >
            Add Member
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            placeholder="Search members by name, email, or company..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="w-full"
          />
        </div>

        {/* Company Filter */}
        <Select
          value={companyFilter}
          onChange={(e) => onCompanyFilterChange(e.target.value)}
          options={companyOptions}
        />

        {/* Role Filter */}
        <Select
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value)}
          options={roleOptions}
        />

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          options={statusOptions}
        />
      </div>
    </div>
  );
};