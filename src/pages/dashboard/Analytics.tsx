
import React from 'react';
import { ComingSoon } from '@/components/ui';
import { BarChart3 } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  return (
    <ComingSoon
      title="Analytics Dashboard"
      description="Dapatkan wawasan mendalam tentang performa komunitas, engagement member, dan tren aktivitas dengan dashboard analytics yang komprehensif."
      icon={<BarChart3 className="w-16 h-16 text-blue-500" />}
      estimatedDate="Q2 2024"
      features={[
        "Real-time member analytics",
        "Event performance metrics", 
        "Engagement tracking",
        "Custom reports & exports",
        "Data visualization charts"
      ]}
    />
  );
};

export default AnalyticsPage;