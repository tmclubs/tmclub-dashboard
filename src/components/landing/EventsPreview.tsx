import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Button, LoadingSkeleton } from '@/components/ui';
import { usePublicEvents } from '@/lib/hooks';
import type { Event } from '@/types/api';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const EventsPreview: React.FC = () => {
  const { data, isLoading, isError } = usePublicEvents();

  // Ambil 6 event terdekat dari array hasil hook; fallback ke kosong
  const list: Event[] = Array.isArray(data) ? data : [];
  const events = list
    .slice()
    .sort((a: Event, b: Event) => {
      const da = a.date ? new Date(a.date).getTime() : Number.MAX_SAFE_INTEGER;
      const db = b.date ? new Date(b.date).getTime() : Number.MAX_SAFE_INTEGER;
      return da - db;
    })
    .slice(0, 6);

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Event Terdekat</h2>
            <p className="mt-2 text-gray-600">Ikuti kegiatan komunitas dan perusahaan.</p>
          </div>
          <Link to="/events">
            <Button variant="outline">Lihat Semua</Button>
          </Link>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <LoadingSkeleton height="1rem" width="66%" />
                  <LoadingSkeleton height="1rem" width="50%" className="mt-2" />
                  <LoadingSkeleton variant="rectangular" height="6rem" className="w-full mt-3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isError && (
          <div className="text-sm text-red-600">Gagal memuat event.</div>
        )}

        {!isLoading && events && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev: Event) => (
              <Card key={ev.pk} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{ev.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(ev.date)}{ev.venue ? ` • ${ev.venue}` : ''}
                  </p>
                  {ev.description && (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">{ev.description}</p>
                  )}
                  <div className="mt-4">
                    <Link
                      to={`/events/${ev.pk}`}
                      className="text-sm text-orange-700 hover:text-orange-800"
                    >
                      Lihat Detail →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && (!events || events.length === 0) && (
          <div className="text-sm text-gray-600">Belum ada event yang tersedia.</div>
        )}
      </div>
    </section>
  );
};

export default EventsPreview;