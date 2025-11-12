import React from 'react';
import { Card, CardContent } from '@/components/ui';
import { Calendar, Users, FileText, BarChart3 } from 'lucide-react';

const features = [
  {
    title: 'Kelola Event Mudah',
    description: 'Buat, kelola, dan pantau event komunitas dengan cepat.',
    icon: Calendar,
  },
  {
    title: 'Bangun Komunitas',
    description: 'Jalin jaringan perusahaan dan anggota dalam satu platform.',
    icon: Users,
  },
  {
    title: 'Blog Terintegrasi',
    description: 'Bagikan artikel dan kabar terbaru dengan tampilan rapi.',
    icon: FileText,
  },
  {
    title: 'Analitik Ringkas',
    description: 'Lihat metrik penting untuk mengambil keputusan cepat.',
    icon: BarChart3,
  },
];

const Features: React.FC = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Fitur Utama</h2>
          <p className="mt-2 text-gray-600">Sederhana, modern, dan siap pakai.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <Card key={f.title} className="hover:shadow-md transition-shadow border-gray-200">
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;