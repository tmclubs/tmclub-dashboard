import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { useAbout } from '@/lib/hooks/useAbout';
import { Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPreview: React.FC = () => {
  const { data: about, isLoading } = useAbout();

  if (isLoading || !about?.md) {
    return null;
  }

  // Helper to strip markdown for preview
  const getPreviewContent = () => {
    if (about.description && about.description.trim().length > 0) {
      return about.description;
    }

    const text = "Di sini, kolaborasi bukan sekadar wacana. Kami mempertemukan para inovator, pemikir, dan pemimpin industri untuk menciptakan solusi nyata bagi tantangan masa depan.";

    return text;
  };

  const content = getPreviewContent();
  const truncatedContent = content.length > 200 
    ? content.slice(0, 200) + '...' 
    : content;

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
            <p className="text-gray-600 mb-6 leading-relaxed">
              {truncatedContent}
            </p>
            
            <Link to="/about">
              <Button variant="outline" className="gap-2">
                Selengkapnya
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AboutPreview;