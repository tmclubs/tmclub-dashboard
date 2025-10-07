import React, { useState } from 'react';
import { Plus, Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { Table, Badge, Button, StatusBadge } from '@/components/ui';
import { Column } from '@/components/ui/Table';

// Extended Column type to allow non-Event keys
interface ExtendedColumn<T> extends Omit<Column<T>, 'key'> {
  key: keyof T | string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  price: number;
  isFree: boolean;
  eventType: 'offline' | 'online' | 'hybrid';
  maxParticipants?: number;
  currentRegistrants?: number;
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: 'draft' | 'published' | 'cancelled';
  isRegistrationClose: boolean;
  isPast: boolean;
}

export interface EventListProps {
  events: Event[];
  loading?: boolean;
  onView?: (event: Event) => void;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  onRegister?: (event: Event) => void;
  onCreate?: () => void;
  onExport?: () => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

export const EventList: React.FC<EventListProps> = ({
  events,
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

  const columns: ExtendedColumn<Event>[] = [
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
          <Badge variant="secondary" size="sm">
            {event.eventType}
          </Badge>
        </div>
      ),
      width: '200px',
    },
    {
      key: 'organizer',
      title: 'Organizer',
      render: (value) => (
        <div className="text-sm text-gray-900">{value}</div>
      ),
      width: '150px',
    },
    {
      key: 'price',
      title: 'Price',
      sortable: true,
      render: (value, event) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span className="font-medium">
            {event.isFree ? 'Free' : `$${value}`}
          </span>
        </div>
      ),
      width: '100px',
      align: 'right',
    },
    {
      key: 'currentRegistrants',
      title: 'Participants',
      sortable: true,
      render: (value, event) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <div>
            <div className="text-sm font-medium">
              {value || 0}
            </div>
            {event.maxParticipants && (
              <div className="text-xs text-gray-500">
                of {event.maxParticipants}
              </div>
            )}
          </div>
        </div>
      ),
      width: '120px',
    },
    {
      key: 'status',
      title: 'Status',
      render: (_, event) => {
        let status: 'active' | 'inactive' | 'pending' | 'draft' | 'published' | 'archived' | 'upcoming' | 'completed' | 'cancelled';

        if (event.status === 'cancelled') status = 'cancelled';
        else if (event.status === 'draft') status = 'draft';
        else if (event.isPast) status = 'completed';
        else if (event.isRegistrationClose) status = 'inactive';
        else status = 'upcoming';

        return <StatusBadge status={status} />;
      },
      width: '100px',
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, event) => (
        <div className="flex items-center gap-2">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(event)}
            >
              View
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(event)}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(event)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
      width: '200px',
    },
  ];

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.organizer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleExport = () => {
    onExport?.();
  };

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
                {events.reduce((sum, event) => sum + (event.currentRegistrants || 0), 0)}
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
                {events.filter(event => !event.isPast).length}
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
                ${events.reduce((sum, event) => sum + (event.isFree ? 0 : event.price * (event.currentRegistrants || 0)), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <Table
        data={filteredEvents}
        columns={columns as Column<Event>[]}
        loading={loading}
        actions={{
          search: {
            placeholder: 'Search events...',
            onSearch: handleSearch,
          },
          export: onExport ? {
            onExport: handleExport,
          } : undefined,
        }}
        pagination={pagination}
        selection={{
          selectedRowKeys: selectedRows,
          onChange: (keys) => setSelectedRows(keys as string[]),
        }}
        onRow={(event) => ({
          onClick: () => onView?.(event),
          className: 'cursor-pointer',
        })}
      />
    </div>
  );
};