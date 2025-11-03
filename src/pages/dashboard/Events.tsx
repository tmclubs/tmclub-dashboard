import React, { useState, useMemo } from 'react';
import { Calendar, Plus, Camera, Search, X } from 'lucide-react';
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
import { useMyEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/lib/hooks/useEvents';

export const EventsPage: React.FC = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'draft' | 'this-month'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventType | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);

  // API hooks
  const { data: events = [], isLoading, error } = useMyEvents();
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 Events Debug - Raw API response:', events);
    console.log('🔍 Events Debug - Number of events:', events?.length);
    console.log('🔍 Events Debug - Event titles:', events?.map(e => e.title));
  }, [events]);

  // Enhanced filtering with search functionality
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const isPast = new Date(event.date) < new Date();
      const now = new Date();
      const eventDate = new Date(event.date);
      const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

      // Apply date filter
      let passesDateFilter = true;
      switch (filter) {
        case 'upcoming':
          passesDateFilter = !isPast;
          break;
        case 'past':
          passesDateFilter = isPast;
          break;
        case 'draft':
          passesDateFilter = event.is_registration_close;
          break;
        case 'this-month':
          passesDateFilter = !isPast && eventDate <= thirtyDaysFromNow;
          break;
        default:
          passesDateFilter = true;
      }

      // Apply search filter
      const passesSearchFilter = searchQuery.trim() === '' ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase());

      return passesDateFilter && passesSearchFilter;
    });
  }, [events, filter, searchQuery]);

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

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Enhanced Event data with additional computed properties
  const enhanceEventForCard = (event: EventType) => ({
    ...event,
    // Add any missing fields that EventCard might expect
    isPast: new Date(event.date) < new Date(),
  });

  // Convert Event to EventRegistration format
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
    isPast: new Date(event.date) < new Date(),
  });

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
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Events</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? `No events found matching "${searchQuery}"`
                : 'Unable to load events. Please try again.'
              }
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={clearSearch}>
                Clear Search
              </Button>
            )}
          </div>
        </div>
      );
    }

    if (filteredEvents.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            {searchQuery ? (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Found</h3>
                <p className="text-gray-600 mb-4">
                  No events match your search for "{searchQuery}"
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={clearSearch}>
                    Clear Search
                  </Button>
                  <Button onClick={handleCreateEvent}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </div>
              </>
            ) : (
              <EmptyState
                type="events"
                action={{
                  text: 'Create Event',
                  onClick: handleCreateEvent,
                  icon: <Plus className="h-4 w-4" />,
                }}
              />
            )}
          </div>
        </div>
      );
    }

    if (view === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredEvents.map((event) => (
            <div key={event.pk} className="animate-fadeIn">
              <EventCard
                event={enhanceEventForCard(event)}
                variant="grid"
                showActions={true}
                onView={() => setSelectedEvent(event)}
                onRegister={() => handleRegister(event)}
                onEdit={() => handleEditEvent(event)}
                onDelete={() => handleDeleteEvent(event)}
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4 sm:space-y-6">
        {filteredEvents.map((event, index) => (
          <div key={event.pk} className="animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
            <EventCard
              event={enhanceEventForCard(event)}
              variant="featured"
              showActions={true}
              showOrganizer={true}
              onView={() => setSelectedEvent(event)}
              onRegister={() => handleRegister(event)}
              onEdit={() => handleEditEvent(event)}
              onDelete={() => handleDeleteEvent(event)}
            />
          </div>
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
      {/* Header with Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-600">Manage and organize community events</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowQRScanner(true)}
              className="hidden sm:flex"
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

        {/* Search Bar */}
        <div className="relative">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events by title, description, or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600">
              Found {filteredEvents.length} result{filteredEvents.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
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

      {/* Enhanced Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">Filter:</span>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="text-xs sm:text-sm"
          >
            All ({events.length})
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('upcoming')}
            className="text-xs sm:text-sm"
          >
            Upcoming ({upcomingCount})
          </Button>
          <Button
            variant={filter === 'this-month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('this-month')}
            className="text-xs sm:text-sm"
          >
            This Month
          </Button>
          <Button
            variant={filter === 'past' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('past')}
            className="text-xs sm:text-sm"
          >
            Past ({pastCount})
          </Button>
          <Button
            variant={filter === 'draft' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('draft')}
            className="text-xs sm:text-sm"
          >
            Draft ({draftCount})
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-600">
            {filteredEvents.length} of {events.length} events
          </span>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={view === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('grid')}
              className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
            >
              <div className="w-4 h-4 space-y-1">
                <div className="bg-current rounded-sm h-0.5"></div>
                <div className="bg-current rounded-sm h-0.5"></div>
                <div className="bg-current rounded-sm h-0.5"></div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile QR Scanner Button */}
      <div className="fixed bottom-20 right-4 z-[35] sm:hidden">
        <Button
          variant="default"
          size="lg"
          onClick={() => setShowQRScanner(true)}
          className="rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700"
        >
          <Camera className="h-6 w-6" />
        </Button>
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
            event={convertEventForRegistration(selectedEvent)}
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