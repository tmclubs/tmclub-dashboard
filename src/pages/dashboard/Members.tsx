import React from 'react';
import { ComingSoon } from '@/components/ui';
import { Users } from 'lucide-react';

export const MembersPage: React.FC = () => {
  return (
    <ComingSoon
      title="Member Management"
      description="Kelola member komunitas dengan mudah. Fitur lengkap untuk mengelola profil member, role, dan aktivitas dalam satu dashboard yang terintegrasi."
      icon={<Users className="w-16 h-16 text-green-500" />}
      estimatedDate="Q2 2024"
      features={[
        "Member profile management",
        "Role & permission system",
        "Activity tracking",
        "Bulk member operations",
        "Advanced search & filters"
      ]}
    />
  );
};

export default MembersPage;