import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useAbout } from '@/lib/hooks/useAbout';
import { MarkdownRenderer } from '@/components/features/blog/MarkdownRenderer';
import { Info } from 'lucide-react';

const AboutPreview: React.FC = () => {
  const { data: about, isLoading } = useAbout();

  if (isLoading || !about?.md) {
    return null;
  }

  return (
    <section className="py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Info className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-900">Tentang TMClub</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ringkas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <MarkdownRenderer content={about.md} />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AboutPreview;