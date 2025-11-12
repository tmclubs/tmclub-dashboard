import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
  }`;

const PublicNavbar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center font-bold text-orange-600">
              TMClub
            </Link>
            <nav className="hidden md:flex items-center gap-1 ml-4">
              <NavLink to="/" className={navLinkClass}>Beranda</NavLink>
              <NavLink to="/events" className={navLinkClass}>Event</NavLink>
              <NavLink to="/blog" className={navLinkClass}>Blog</NavLink>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <Link to="/dashboard" className="inline-flex">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="inline-flex">
                  <Button variant="outline" size="sm">Masuk</Button>
                </Link>
                <Link to="/register" className="inline-flex">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Daftar Gratis</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Toggle navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-3 space-y-2">
            <NavLink to="/" className={navLinkClass} onClick={() => setOpen(false)}>Beranda</NavLink>
            <NavLink to="/events" className={navLinkClass} onClick={() => setOpen(false)}>Event</NavLink>
            <NavLink to="/blog" className={navLinkClass} onClick={() => setOpen(false)}>Blog</NavLink>
            <div className="pt-2 flex items-center gap-2">
              {isAuthenticated ? (
                <Link to="/dashboard" className="inline-flex w-full" onClick={() => setOpen(false)}>
                  <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="inline-flex w-1/2" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Masuk</Button>
                  </Link>
                  <Link to="/register" className="inline-flex w-1/2" onClick={() => setOpen(false)}>
                    <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700">Daftar Gratis</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;