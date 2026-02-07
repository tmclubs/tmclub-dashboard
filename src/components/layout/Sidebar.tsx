import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Calendar,
  Building2,
  ClipboardList,
  FileText,
  Info,
  User,
  Settings,
  LogOut,
  Users,
  BarChart3,
  X,
} from 'lucide-react';
import { useUIStore } from '@/lib/stores';
import { useAuthStore } from '@/lib/stores/authStore';
import { LazyImage } from '@/components/common/LazyImage';
import { usePermissions } from '@/lib/hooks/usePermissions';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'PIC', 'member'] },
  { name: 'Events', href: '/dashboard/events', icon: Calendar, roles: ['admin', 'member'] },
  { name: 'Members', href: '/dashboard/companies', icon: Building2, roles: ['admin', 'PIC'] },
  { name: 'Surveys (Coming Soon)', href: '/dashboard/surveys', icon: ClipboardList, roles: ['admin'] },
  { name: 'Blog', href: '/dashboard/blog', icon: FileText, roles: ['admin'] },
  { name: 'About', href: '/dashboard/about', icon: Info, roles: ['admin'] },
  { name: 'User Management', href: '/dashboard/members', icon: Users, roles: ['admin', 'PIC'] },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, roles: ['admin'] },
];

const secondaryNavigation = [
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { sidebarOpen: storeSidebarOpen, setSidebarOpen } = useUIStore();
  const { user } = useAuthStore();
  const { getUserCompanyId } = usePermissions();
  const isSidebarOpen = isOpen !== undefined ? isOpen : storeSidebarOpen;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setSidebarOpen(false);
    }
  };

  const userRole = user?.role || '';
  const companyId = getUserCompanyId();

  const filteredNavigation = navigation
    .filter(item => {
      if (userRole === 'admin' || userRole === 'superadmin') return true;
      if (!item.roles) return true;
      return item.roles.includes(userRole);
    })
    .map(item => {
      // Update Company link and name for PIC
      if (item.name === 'Members' && userRole === 'PIC') {
        return {
          ...item,
          name: 'Company',
          href: companyId ? `/dashboard/companies/${companyId}` : '/dashboard/companies'
        };
      }
      return item;
    });

  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <LazyImage
                src="/Logo.png"
                alt="TMClub"
                className="h-10 w-auto"
                showSkeleton={false}
              />
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            <div className="space-y-1">
              {filteredNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === '/dashboard'}
                  onClick={handleClose}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-3 text-base font-medium rounded-xl transition-all ${isActive
                      ? 'bg-orange-100 text-orange-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={`mr-3 h-6 w-6 flex-shrink-0 ${isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
                          }`}
                      />
                      {item.name}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-200">
              <div className="space-y-1">
                {secondaryNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={handleClose}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-3 text-base font-medium rounded-xl transition-all ${isActive
                        ? 'bg-orange-100 text-orange-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={`mr-3 h-6 w-6 flex-shrink-0 ${isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
                            }`}
                        />
                        {item.name}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Mobile Logout */}
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  window.location.href = '/login';
                }}
                className="group flex items-center px-3 py-3 text-base font-medium rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-700 w-full transition-all"
              >
                <LogOut className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-red-500" />
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center">
              <LazyImage
                src="/Logo.png"
                alt="TMClub"
                className="h-10 w-auto"
                showSkeleton={false}
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1 px-2 space-y-1">
            <div className="space-y-1">
              {filteredNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === '/dashboard'}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${isActive
                      ? 'bg-orange-100 text-orange-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
                          }`}
                      />
                      {item.name}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="pt-6 mt-6 border-t border-gray-200">
              <div className="space-y-1">
                {secondaryNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${isActive
                        ? 'bg-orange-100 text-orange-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'
                            }`}
                        />
                        {item.name}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Logout */}
            <div className="pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  window.location.href = '/login';
                }}
                className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-700 w-full transition-all"
              >
                <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-red-500" />
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};