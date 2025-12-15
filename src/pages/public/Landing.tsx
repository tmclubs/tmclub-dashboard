import React from 'react';
import Hero from '@/components/landing/Hero';
import PublicNavbar from '@/components/landing/PublicNavbar';
import PublicFooter from '@/components/landing/PublicFooter';
import BlogPreview from '@/components/landing/BlogPreview';
import EventsPreview from '@/components/landing/EventsPreview';

const Landing: React.FC = () => {
  return (
    <main className="bg-white">
      <PublicNavbar />
      <Hero />
      <BlogPreview />
      <EventsPreview />
      <PublicFooter />
    </main>
  );
};

export default Landing;