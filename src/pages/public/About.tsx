import React from 'react';
import PublicNavbar from '@/components/landing/PublicNavbar';
import { Card, CardHeader, CardTitle, CardContent, LoadingSpinner, EmptyState } from '@/components/ui';
import { useAbout } from '@/lib/hooks/useAbout';
import { MarkdownRenderer } from '@/components/features/blog/MarkdownRenderer';

export const PublicAboutPage: React.FC = () => {
  const { data: about, isLoading, error } = useAbout();

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicNavbar />
        <div className="container mx-auto px-4 py-8">
          <EmptyState
            title="Gagal memuat About"
            description="Terjadi kesalahan saat mengambil konten About. Coba lagi nanti."
          />
        </div>
      </div>
    );
  }

  if (!about || !about.md) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicNavbar />
        <div className="container mx-auto px-4 py-8">
          <EmptyState
            title="Konten About belum tersedia"
            description="Administrator belum menambahkan konten About."
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tentang TMClub</h1>
          {about.description && (
            <p className="mt-2 text-gray-600">{about.description}</p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profil dan Informasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <MarkdownRenderer content={about.md} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicAboutPage;