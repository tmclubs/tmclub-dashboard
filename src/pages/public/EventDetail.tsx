import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventDetail } from '@/components/features/events/EventDetail';
import { usePublicEvent } from '@/lib/hooks/useEvents';
import { LoadingSpinner, EmptyState } from '@/components/ui';
import PublicNavbar from '@/components/landing/PublicNavbar';
import PublicFooter from '@/components/landing/PublicFooter';

export const PublicEventDetailPage: React.FC = () => {
  const { pk } = useParams<{ pk: string }>();
  const navigate = useNavigate();

  const eventId = pk ? parseInt(pk, 10) : null;
  const { data: event, isLoading, error } = usePublicEvent(eventId || 0);

  const handleBack = () => {
    navigate('/events');
  };

  if (!eventId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="Event tidak ditemukan"
          description="ID event tidak valid"
          action={{
            text: 'Kembali ke Events',
            onClick: handleBack,
          }}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="Event tidak ditemukan"
          description="Event yang Anda cari tidak ditemukan atau telah dihapus"
          action={{
            text: 'Kembali ke Events',
            onClick: handleBack,
          }}
        />
      </div>
    );
  }

  return (
    <>
      <PublicNavbar />
      <div className="container mx-auto px-4 py-8">
      <EventDetail
        event={event}
        onBack={handleBack}
        showActions={false}
        showQuickActions={false}
      />
      </div>
      <PublicFooter />
    </>
  );
};

export default PublicEventDetailPage;