import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from '@/components/features/events/EventCard';
import { LoadingSpinner, EmptyState } from '@/components/ui';
import { usePublicEvents } from '@/lib/hooks';
import type { Event } from '@/types/api';
import PublicNavbar from '@/components/landing/PublicNavbar';

export const PublicEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = usePublicEvents();

  const events: Event[] = Array.isArray(data) ? data : [];

  const handleView = (ev: Event) => {
    navigate(`/events/${ev.pk}`);
  };

  const goHome = () => navigate('/');
  const goBlog = () => navigate('/blog');
  const retry = () => window.location.reload();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicNavbar />
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicNavbar />
        <div className="container mx-auto px-4 py-8">
          <EmptyState
            title="Gagal memuat event"
            description="Terjadi kesalahan saat mengambil data event. Coba lagi nanti."
            action={{ text: 'Coba Lagi', onClick: retry }}
            secondaryAction={{ text: 'Kembali ke Beranda', onClick: goHome }}
          />
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicNavbar />
        <div className="container mx-auto px-4 py-8">
          <EmptyState
            type="events"
            title="Belum ada event"
            description="Saat ini belum ada event yang tersedia."
            action={{ text: 'Kembali ke Beranda', onClick: goHome }}
            secondaryAction={{ text: 'Lihat Blog', onClick: goBlog }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Event Publik</h1>
          <p className="mt-2 text-gray-600">Jelajahi event komunitas dan perusahaan.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev) => (
            <EventCard
              key={ev.pk}
              event={ev}
              variant="grid"
              showActions={false}
              onView={handleView}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PublicEventsPage;