import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  QRScanner
} from '@/components/features/events';
import { Event as EventType } from '@/types/api';
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/lib/hooks/useEvents';
import { usePermissions, PERMISSION_LEVELS } from '@/lib/hooks/usePermissions';
import { useAuthStore } from '@/lib/stores/authStore';

export const EventsPage: React.FC = () => {
  // Navigation
  const navigate = useNavigate();
  
  // Authentication and permissions
  useAuthStore();
  const { hasPermission } = usePermissions();

  // Permission checks
  const canCreateEvent = hasPermission({ resource: 'events', action: PERMISSION_LEVELS.WRITE });
  const canEditEvent = hasPermission({ resource: 'events', action: PERMISSION_LEVELS.WRITE });
  const canDeleteEvent = hasPermission({ resource: 'events', action: PERMISSION_LEVELS.DELETE });
  const canManageEvents = hasPermission({ resource: 'events', action: PERMISSION_LEVELS.ADMIN });

  // State
  const [currentView, setCurrentView] = useState<'grid' | 'featured'>('grid');
  const [filterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'draft'>('all');

  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventType | null>(null);

  // API hooks
  const { data: events, isLoading, error } = useEvents();
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();



  const filteredEvents = events?.filter(event => {
    const isPast = new Date(event.date) < new Date();

    switch (filterStatus) {
      case 'published':
        return !isPast && event.published_at;
      case 'draft':
        return !event.published_at;
      default:
        return true;
    }
  }) || [];

  const handleCreateEvent = () => {
    if (!canCreateEvent) {
      console.warn('User does not have permission to create events');
      return;
    }
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: EventType) => {
    if (!canEditEvent) {
      console.warn('User does not have permission to edit events');
      return;
    }
    setSelectedEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = (event: EventType) => {
    if (!canDeleteEvent) {
      console.warn('User does not have permission to delete events');
      return;
    }
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

  const handleEventRegistration = (event: EventType) => {
    setSelectedEvent(event);
    setShowRegistrationModal(true);
  };



  // Convert API Event to EventRegistration props
  const convertEventForRegistration = (event: EventType) => ({
    id: event.pk.toString(),
    title: event.title,
    date: event.date,
    venue: event.venue,
    price: event.price || 0,
    isFree: event.is_free,
    maxParticipants: undefined,
    currentRegistrants: event.registrant_count,
    isRegistrationClose: event.is_registration_close,
    isPast: new Date(event.date) < new Date()
  });

  const handleEventSubmit = (data: any) => {
    if (selectedEvent) {
      // Update existing event
      updateEventMutation.mutate(
        { eventId: selectedEvent.pk, data },
        {
          onSuccess: () => {
            setShowEventForm(false);
            setSelectedEvent(null);
          }
        }
      );
    } else {
      // Create new event
      createEventMutation.mutate(data, {
        onSuccess: () => {
          setShowEventForm(false);
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

    if (currentView === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.pk}
              event={event}
              variant="grid"
              showActions={true}
              onView={() => navigate(`/events/${event.pk}`)}
              onRegister={() => handleEventRegistration(event)}
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
            onView={() => navigate(`/events/${event.pk}`)}
            onRegister={() => handleEventRegistration(event)}
            onEdit={() => handleEditEvent(event)}
            onDelete={() => handleDeleteEvent(event)}
          />
        ))}
      </div>
    );
  };

  const upcomingCount = events?.filter(e => new Date(e.date) >= new Date()).length || 0;
  const pastCount = events?.filter(e => new Date(e.date) < new Date()).length || 0;
  const draftCount = events?.filter(e => e.is_registration_close).length || 0;
  const totalParticipants = events?.reduce((sum, event) => sum + (event.registrant_count || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-600">Manage and organize events</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {canCreateEvent && (
            <Button onClick={handleCreateEvent} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          )}
          {canManageEvents && (
            <Button
              variant="outline"
              onClick={() => setShowQRScanner(true)}
              className="flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              QR Scanner
            </Button>
          )}
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
                <p className="text-2xl font-bold text-gray-900">{events?.length || 0}</p>
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
            All Events ({events?.length || 0})
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
            variant={currentView === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('grid')}
          >
            Grid
          </Button>
          <Button
            variant={currentView === 'featured' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('featured')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Events List/Grid */}
      {renderEvents()}

      {/* Create/Edit Event Modal */}
      <Modal
        open={showEventForm}
        onClose={() => setShowEventForm(false)}
        title={selectedEvent ? 'Edit Event' : 'Create New Event'}
        size="xl"
        preventClose={createEventMutation.isPending || updateEventMutation.isPending}
      >
        <EventForm
          event={selectedEvent || undefined}
          onSubmit={handleEventSubmit}
          onCancel={() => setShowEventForm(false)}
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
        open={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        title="Event Registration"
        size="xl"
      >
        {selectedEvent && (
          <EventRegistration
            event={convertEventForRegistration(selectedEvent)}
            onSuccess={() => {
              setShowRegistrationModal(false);
              setSelectedEvent(null);
            }}
            onCancel={() => setShowRegistrationModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};