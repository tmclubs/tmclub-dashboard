import React from 'react';
import Hero from '@/components/landing/Hero';
import PublicNavbar from '@/components/landing/PublicNavbar';
import BlogPreview from '@/components/landing/BlogPreview';
import EventsPreview from '@/components/landing/EventsPreview';

const Landing: React.FC = () => {
  return (
    <main className="bg-white">
      <PublicNavbar />
      <Hero />
      <BlogPreview />
      <EventsPreview />
      <footer className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-gray-600">
          © {new Date().getFullYear()} TMClub. Semua hak dilindungi.
        </div>
      </footer>
    </main>
  );
};

export default Landing;