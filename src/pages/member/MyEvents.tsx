import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from '@/components/features/events/EventCard';
import { Button, LoadingSpinner, EmptyState } from '@/components/ui';
import { useMyRegisteredEvents } from '@/lib/hooks/useEvents';

export const MemberMyEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: events, isLoading, error, refetch } = useMyRegisteredEvents();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2">
          <LoadingSpinner />
          <span className="text-sm text-gray-600">Memuat event saya...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          type="error"
          title="Gagal memuat event"
          description={String(error)}
          action={{ text: "Coba lagi", onClick: () => refetch() }}
        />
      </div>
    );
  }

  const handleView = (event: any) => {
    navigate(`/events/${event.event_id ?? event.pk ?? event.id}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Event Saya</h1>
        <Button variant="outline" onClick={() => navigate('/events')}>Lihat Semua Event</Button>
      </div>

      {!events || events.length === 0 ? (
        <EmptyState
          title="Belum ada event terdaftar"
          description="Anda belum terdaftar pada event manapun. Lihat daftar event publik dan daftar sekarang."
          action={{ text: "Jelajahi Event", onClick: () => navigate('/events') }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((e: any) => (
            <EventCard
              key={e.event_id ?? e.pk ?? e.id}
              event={{
                pk: e.event_id ?? e.pk ?? e.id,
                title: e.title,
                date: e.event_date,
                venue: e.venue,
                description: e.description ?? '',
                is_free: e.is_free ?? true,
                is_registration_close: false,
                is_list_attendees: true,
                main_image_url: e.main_image_url ?? undefined,
              } as any}
              variant="grid"
              onView={() => handleView(e)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberMyEventsPage;
