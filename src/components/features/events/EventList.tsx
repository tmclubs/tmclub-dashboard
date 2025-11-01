import React, { useState } from 'react';
import { Plus, Calendar, MapPin, Users, DollarSign, Download, Settings, Eye, Edit, Trash2 } from 'lucide-react';
import { Table, Badge, Button, StatusBadge } from '@/components/ui';
import { Column } from '@/components/ui/Table';
import { Event } from '@/types/api';
import { useExportRegistrants } from '@/lib/hooks/useEvents';

// Extended Column type to allow non-Event keys
interface ExtendedColumn<T> extends Omit<Column<T>, 'key'> {
  key: keyof T | string;
}

export interface EventListProps {
  events: Event[];
  loading?: boolean;
  onView?: (event: Event) => void;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  onRegister?: (event: Event) => void;
  onCreate?: () => void;
  onExport?: (eventId?: number) => void;
  onManageRegistrants?: (event: Event) => void;
  onViewAnalytics?: (event: Event) => void;
  onSendSurvey?: (event: Event) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  showAdvancedActions?: boolean;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  loading = false,
  onView,
  onEdit,
  onDelete,
  onCreate,
  onExport,
  onSendSurvey,
  pagination,
  showAdvancedActions = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<React.Key[]>([]);
  
  // Hooks for advanced actions
  const exportRegistrants = useExportRegistrants();

  // Transform events to include id field required by Table component
  const tableData = events.map(event => ({
    ...event,
    id: event.pk, // Map pk to id for Table component
  }));

  const columns: ExtendedColumn<typeof tableData[0]>[] = [
    {
      key: 'title',
      title: 'Event Name',
      sortable: true,
      render: (value, event) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate">{value}</div>
          <div className="text-sm text-gray-500 truncate">{event.description}</div>
        </div>
      ),
      width: '300px',
    },
    {
      key: 'date',
      title: 'Date & Time',
      sortable: true,
      render: (value) => (
        <div>
          <div className="text-sm text-gray-900">
            {new Date(value).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(value).toLocaleTimeString()}
          </div>
        </div>
      ),
      width: '150px',
    },
    {
      key: 'venue',
      title: 'Location',
      render: (value, event) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">{value}</span>
          {event.level && (
            <Badge variant="secondary" size="sm">
              {event.level}
            </Badge>
          )}
        </div>
      ),
      width: '200px',
    },
    {
      key: 'owned_by_email',
      title: 'Organizer',
      render: (_, record) => (
        <div className="text-sm text-gray-900">{record.owned_by_email}</div>
      ),
    },
    {
      key: 'price',
      title: 'Price',
      render: (_, record) => (
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm text-gray-900">
            {record.is_free ? 'Free' : `Rp ${record.price?.toLocaleString()}`}
          </span>
        </div>
      ),
    },
    {
      key: 'registrant_count',
      title: 'Participants',
      render: (_, record) => (
        <div className="flex items-center">
          <Users className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm text-gray-900">{record.registrant_count || 0}</span>
        </div>
      ),
    },
    {
      key: 'status' as keyof typeof tableData[0],
      title: 'Status',
      render: (_, record) => {
        const event = events.find(e => e.pk === record.id);
        if (!event) return null;
        
        const now = new Date();
        const eventDate = new Date(event.date);
        
        let statusType: "draft" | "upcoming" | "completed" | "cancelled" = "draft";
        
        if (event.is_registration_close) {
          statusType = "cancelled";
        } else if (eventDate < now) {
          statusType = "completed";
        } else if (eventDate.toDateString() === now.toDateString()) {
          statusType = "upcoming";
        } else if (eventDate > now) {
          statusType = "upcoming";
        } else if (!event.published_at) {
          statusType = "draft";
        }
        
        return <StatusBadge status={statusType} />;
      },
    },
    {
      key: 'actions' as keyof typeof tableData[0],
      title: 'Actions',
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              const originalEvent = events.find(e => e.pk === record.id);
              if (originalEvent) onView?.(originalEvent);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              const originalEvent = events.find(e => e.pk === record.id);
              if (originalEvent) onEdit?.(originalEvent);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {showAdvancedActions && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  exportRegistrants.mutate(record.pk);
                }}
                loading={exportRegistrants.isPending}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  const originalEvent = events.find(e => e.pk === record.id);
                  if (originalEvent) onSendSurvey?.(originalEvent);
                }}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              const originalEvent = events.find(e => e.pk === record.id);
              if (originalEvent) onDelete?.(originalEvent);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const filteredData = tableData.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.owned_by_email && event.owned_by_email.toLowerCase().includes(searchQuery.toLowerCase()))
  );



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Events</h2>
          <p className="text-gray-600">Manage your events and registrations</p>
        </div>
        {onCreate && (
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.reduce((sum, event) => sum + (event.registrant_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">
                {events.filter(event => new Date(event.date) >= new Date()).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                Rp {events.reduce((sum, event) => sum + (event.is_free ? 0 : (event.price || 0) * (event.registrant_count || 0)), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <Table
          data={filteredData}
          columns={columns as Column<typeof tableData[0]>[]}
          loading={loading}
          actions={{
            search: {
              placeholder: 'Search events...',
              onSearch: setSearchQuery,
            },
            export: {
              onExport: () => onExport?.(),
            },
          }}
          pagination={pagination}
          selection={{
            selectedRowKeys: selectedRows,
            onChange: (keys) => setSelectedRows(keys),
          }}
          onRow={(event) => ({
            onClick: () => {
              const originalEvent = events.find(e => e.pk === event.id);
              if (originalEvent) {
                onView?.(originalEvent);
              }
            },
            className: 'cursor-pointer',
          })}
      />
    </div>
  );
};