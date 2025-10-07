import React, { useState } from 'react';
import { Calendar, Plus, Camera } from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Modal,
  ConfirmDialog,
  EmptyState,
  LoadingSpinner
} from '@/components/ui';
import {
  EventCard,
  EventForm,
  EventRegistration,
  QRScanner,
  type Event as EventType
} from '@/components/features/events';
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/lib/hooks/useEvents';

export const EventsPage: React.FC = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'draft'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventType | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);

  // API hooks
  const { data: events = [], isLoading, error } = useEvents();
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

  const filteredEvents = events.filter(event => {
    const isPast = new Date(event.date) < new Date();

    switch (filter) {
      case 'upcoming':
        return !isPast;
      case 'past':
        return isPast;
      case 'draft':
        return event.is_registration_close;
      default:
        return true;
    }
  });

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setShowCreateModal(true);
  };

  const handleEditEvent = (event: EventType) => {
    setSelectedEvent(event);
    setShowCreateModal(true);
  };

  const handleDeleteEvent = (event: EventType) => {
    setEventToDelete(event);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteEventMutation.mutate(eventToDelete.pk, {
        onSuccess: () => {
          setShowDeleteConfirm(false);
          setEventToDelete(null);
        }
      });
    }
  };

  const handleRegister = (event: EventType) => {
    setSelectedEvent(event);
    setShowRegistration(true);
  };

  const handleEventSubmit = (data: any) => {
    if (selectedEvent) {
      // Update existing event
      updateEventMutation.mutate(
        { eventId: selectedEvent.pk, data },
        {
          onSuccess: () => {
            setShowCreateModal(false);
            setSelectedEvent(null);
          }
        }
      );
    } else {
      // Create new event
      createEventMutation.mutate(data, {
        onSuccess: () => {
          setShowCreateModal(false);
          setSelectedEvent(null);
        }
      });
    }
  };

  const renderEvents = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load events. Please try again.</p>
        </div>
      );
    }

    if (filteredEvents.length === 0) {
      return (
        <EmptyState
          type="events"
          action={{
            text: 'Create Event',
            onClick: handleCreateEvent,
            icon: <Plus className="h-4 w-4" />,
          }}
        />
      );
    }

    if (view === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.pk}
              event={event}
              variant="grid"
              showActions={true}
              onView={() => setSelectedEvent(event)}
              onRegister={() => handleRegister(event)}
              onEdit={() => handleEditEvent(event)}
              onDelete={() => handleDeleteEvent(event)}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {filteredEvents.map((event) => (
          <EventCard
            key={event.pk}
            event={event}
            variant="featured"
            showActions={true}
            showOrganizer={true}
            showStats={true}
            onView={() => setSelectedEvent(event)}
            onRegister={() => handleRegister(event)}
            onEdit={() => handleEditEvent(event)}
            onDelete={() => handleDeleteEvent(event)}
          />
        ))}
      </div>
    );
  };

  const upcomingCount = events.filter(e => new Date(e.date) >= new Date()).length;
  const pastCount = events.filter(e => new Date(e.date) < new Date()).length;
  const draftCount = events.filter(e => e.is_registration_close).length;
  const totalParticipants = events.reduce((sum, event) => sum + (event.registrant_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Manage and organize community events</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowQRScanner(true)}
          >
            <Camera className="h-4 w-4 mr-2" />
            Check-in Scanner
          </Button>
          <Button onClick={handleCreateEvent}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900">{totalParticipants}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Past Events</p>
                <p className="text-2xl font-bold text-gray-900">{pastCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Events ({events.length})
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('upcoming')}
          >
            Upcoming ({upcomingCount})
          </Button>
          <Button
            variant={filter === 'past' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('past')}
          >
            Past ({pastCount})
          </Button>
          <Button
            variant={filter === 'draft' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('draft')}
          >
            Draft ({draftCount})
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('grid')}
          >
            Grid
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Events List/Grid */}
      {renderEvents()}

      {/* Create/Edit Event Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={selectedEvent ? 'Edit Event' : 'Create New Event'}
        size="xl"
        preventClose={createEventMutation.isPending || updateEventMutation.isPending}
      >
        <EventForm
          event={selectedEvent || undefined}
          onSubmit={handleEventSubmit}
          loading={createEventMutation.isPending || updateEventMutation.isPending}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Event"
        description={`Are you sure you want to delete "${eventToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Event"
        variant="destructive"
        loading={deleteEventMutation.isPending}
      />

      {/* QR Scanner Modal */}
      <Modal
        open={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        title="Event Check-in Scanner"
        size="xl"
      >
        <QRScanner
          eventId="current-event"
          onScan={(attendee) => {
            console.log('Attendee checked in:', attendee);
          }}
          onError={(error) => {
            console.error('Scanner error:', error);
          }}
        />
      </Modal>

      {/* Registration Modal */}
      <Modal
        open={showRegistration}
        onClose={() => setShowRegistration(false)}
        title="Event Registration"
        size="xl"
      >
        {selectedEvent && (
          <EventRegistration
            event={selectedEvent}
            onSuccess={() => {
              setShowRegistration(false);
              setSelectedEvent(null);
            }}
            onCancel={() => setShowRegistration(false)}
          />
        )}
      </Modal>
    </div>
  );
};