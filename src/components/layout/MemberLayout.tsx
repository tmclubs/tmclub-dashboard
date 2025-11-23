import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '@/components/landing/PublicNavbar';

interface MemberLayoutProps {
  children?: React.ReactNode;
}

export const MemberLayout: React.FC<MemberLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with PublicNavbar */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <PublicNavbar />
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children || <Outlet />}
      </main>

      {/* Footer - Optional */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2023 TM Club. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MemberLayout;