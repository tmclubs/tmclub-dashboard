import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui';

export const SurveysPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
          <p className="text-gray-600 mt-1">Fitur survei sedang dalam pengembangan.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>Kembali ke Dashboard</Button>
      </div>

      <EmptyState
        type="surveys"
        title="Coming Soon"
        description="Fitur survei akan segera hadir. Nantikan pembaruan berikutnya."
        action={{
          text: 'Lihat Blog',
          onClick: () => navigate('/blog')
        }}
      />
    </div>
  );
};