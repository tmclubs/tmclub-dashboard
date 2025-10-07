import React from 'react';
import { Button, Select } from '@/components/ui';
import { Filter, Check, Archive, Trash2 } from 'lucide-react';

export interface NotificationFiltersProps {
  filter: 'all' | 'unread' | 'read';
  typeFilter: string;
  onFilterChange: (filter: 'all' | 'unread' | 'read') => void;
  onTypeFilterChange: (type: string) => void;
  onMarkAllAsRead: () => void;
  onArchiveAll: () => void;
  onDeleteAll: () => void;
  unreadCount: number;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filter,
  typeFilter,
  onFilterChange,
  onTypeFilterChange,
  onMarkAllAsRead,
  onArchiveAll,
  onDeleteAll,
  unreadCount,
}) => {
  const filterOptions = [
    { value: 'all', label: 'All Notifications' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'event', label: 'Events' },
    { value: 'system', label: 'System' },
    { value: 'message', label: 'Messages' },
    { value: 'reminder', label: 'Reminders' },
    { value: 'security', label: 'Security' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onFilterChange(option.value as any)}
              className="h-8"
            >
              {option.label}
              {option.value === 'unread' && unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Type:</span>
          <Select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="w-32"
            options={typeOptions}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Check className="w-4 h-4" />}
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All Read
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Archive className="w-4 h-4" />}
            onClick={onArchiveAll}
          >
            Archive All
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={onDeleteAll}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Delete All
          </Button>
        </div>
      </div>
    </div>
  );
};