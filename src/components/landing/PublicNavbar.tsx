import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Button, Avatar } from '@/components/ui';
import { LazyImage } from '@/components/ui/LazyImage';
import { Menu, X, ChevronDown, User as UserIcon, LayoutDashboard, LogOut, Calendar } from 'lucide-react';
import { useAuth, useLogout } from '@/lib/hooks/useAuth';
import { usePermissions } from '../../lib/hooks/usePermissions';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
  }`;

const PublicNavbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const logout = useLogout();
  const { isAdmin } = usePermissions();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const getGoogleProfilePicture = () => {
    return localStorage.getItem('google_profile_picture');
  };

  const getGoogleProfileName = () => {
    return localStorage.getItem('google_profile_name');
  };

  const getGoogleProfileGivenName = () => {
    return localStorage.getItem('google_profile_given_name');
  };

  const getGoogleProfileFamilyName = () => {
    return localStorage.getItem('google_profile_family_name');
  };

  const hasGoogleProfilePicture = () => {
    return !!getGoogleProfilePicture();
  };

  const hasGoogleProfileName = () => {
    return !!getGoogleProfileName();
  };

  const getDisplayName = () => {
    if (!user) return 'User';

    // Prioritaskan nama dari backend (first_name)
    if (user.first_name) return user.first_name;

    // Jika tidak ada first_name, gunakan username
    if (user.username) return user.username;

    // Fallback ke Google profile hanya jika data backend tidak tersedia
    if (hasGoogleProfileName()) return getGoogleProfileName() || 'User';

    return 'User';
  };

  const getUserInitials = (firstName?: string, lastName?: string) => {
    // Prioritaskan nama dari backend
    if (firstName) {
      const firstInitial = firstName.charAt(0).toUpperCase();
      const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
      return firstInitial + lastInitial;
    }

    // Jika tidak ada first_name dari backend, coba dari username
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }

    // Fallback ke Google profile hanya jika data backend tidak tersedia
    if (hasGoogleProfileName()) {
      const givenName = getGoogleProfileGivenName();
      const familyName = getGoogleProfileFamilyName();
      if (givenName && familyName) return givenName.charAt(0).toUpperCase() + familyName.charAt(0).toUpperCase();
      if (givenName) return givenName.charAt(0).toUpperCase();
    }

    return 'U';
  };

  const getRoleDisplay = () => {
    if (!user?.role) return 'Member';

    switch (user.role.toLowerCase()) {
      case 'admin':
        return 'Administrator';
      case 'pic':
        return 'Person In Charge';
      case 'member':
        return 'Member';
      default:
        return user.role;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center">
              <LazyImage
                src="/Logo.png"
                alt="TMClub"
                className="h-8 w-auto"
                showSkeleton={false}
              />
            </Link>
            <nav className="hidden md:flex items-center gap-1 ml-4">
              <NavLink to="/" className={navLinkClass}>Beranda</NavLink>
              <NavLink to="/events" className={navLinkClass}>Event</NavLink>
              <NavLink to="/companies" className={navLinkClass}>Members</NavLink>
              <NavLink to="/members" className={navLinkClass}>Users</NavLink>
              <NavLink to="/blog" className={navLinkClass}>Blog</NavLink>
              <NavLink to="/about" className={navLinkClass}>About</NavLink>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  className="inline-flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100"
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-label="Profile menu"
                >
                  <Avatar
                    size="sm"
                    name={getUserInitials(user?.first_name, user?.last_name)}
                    src={hasGoogleProfilePicture() ? getGoogleProfilePicture() || undefined : undefined}
                    className="h-8 w-8"
                  />
                  <div className="text-left">
                    <span className="text-sm font-medium text-gray-900 block">
                      {getDisplayName()}
                    </span>
                    <span className="text-xs text-gray-500 block">
                      {getRoleDisplay()}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <Avatar
                          size="sm"
                          name={getUserInitials(user?.first_name, user?.last_name)}
                          src={hasGoogleProfilePicture() ? getGoogleProfilePicture() || undefined : undefined}
                          className="h-10 w-10"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getDisplayName()}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {getRoleDisplay()}
                          </p>
                          {user?.email && (
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <NavLink
                      to="/member/profile"
                      className={({ isActive }) => `flex items-center px-4 py-2 text-sm ${isActive ? 'text-orange-600' : 'text-gray-700'} hover:bg-gray-100`}
                      onClick={() => setProfileOpen(false)}
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      Profil
                    </NavLink>
                    <NavLink
                      to="/member/events"
                      className={({ isActive }) => `flex items-center px-4 py-2 text-sm ${isActive ? 'text-orange-600' : 'text-gray-700'} hover:bg-gray-100`}
                      onClick={() => setProfileOpen(false)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Event Saya
                    </NavLink>
                    {isAdmin() && (
                      <NavLink
                        to="/dashboard"
                        className={({ isActive }) => `flex items-center px-4 py-2 text-sm ${isActive ? 'text-orange-600' : 'text-gray-700'} hover:bg-gray-100`}
                        onClick={() => setProfileOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </NavLink>
                    )}
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={() => { setProfileOpen(false); logout(); }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="inline-flex">
                  <Button variant="outline" size="sm">Masuk</Button>
                </Link>
                <Link to="/register" className="inline-flex">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Daftar Sekarang</Button>
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
            <NavLink to="/companies" className={navLinkClass} onClick={() => setOpen(false)}>Members</NavLink>
            <NavLink to="/members" className={navLinkClass} onClick={() => setOpen(false)}>Users</NavLink>
            <NavLink to="/blog" className={navLinkClass} onClick={() => setOpen(false)}>Blog</NavLink>
            <NavLink to="/about" className={navLinkClass} onClick={() => setOpen(false)}>About</NavLink>
            <div className="pt-2 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="space-y-3">
                  {/* User Info in Mobile */}
                  <div className="flex items-center space-x-3 px-2 py-2 bg-gray-50 rounded-md">
                    <Avatar
                      size="sm"
                      name={getUserInitials(user?.first_name, user?.last_name)}
                      src={hasGoogleProfilePicture() ? getGoogleProfilePicture() || undefined : undefined}
                      className="h-10 w-10"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getDisplayName()}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {getRoleDisplay()}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2">
                    <Link to="/member/profile" className="inline-flex" onClick={() => setOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">Profil</Button>
                    </Link>
                    <Link to="/member/events" className="inline-flex" onClick={() => setOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">Event Saya</Button>
                    </Link>
                    {isAdmin() && (
                      <Link to="/dashboard" className="inline-flex" onClick={() => setOpen(false)}>
                        <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700">Dashboard</Button>
                      </Link>
                    )}
                    <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200" onClick={() => { setOpen(false); logout(); }}>Logout</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link to="/login" className="inline-flex" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Masuk</Button>
                  </Link>
                  <Link to="/register" className="inline-flex" onClick={() => setOpen(false)}>
                    <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700">Daftar Sekarang</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close profile dropdown */}
      {profileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
      )}
    </header>
  );
};

export default PublicNavbar;
