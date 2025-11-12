import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Calendar,
  Building2,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const bottomNavItems = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Events', href: '/dashboard/events', icon: Calendar },
  { name: 'Companies', href: '/dashboard/companies', icon: Building2 },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export const BottomNavigation: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[40] bg-white border-t border-gray-200 md:hidden pb-safe">
      <div className="grid grid-cols-4 gap-0">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-3 px-2 text-xs font-medium transition-colors min-h-[44px] min-w-[44px] touch-manipulation',
                isActive
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )
            }
            aria-label={`Navigate to ${item.name}`}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'h-5 w-5 mb-1 flex-shrink-0',
                    isActive ? 'text-orange-600' : 'text-gray-400'
                  )}
                  aria-hidden="true"
                />
                <span className="truncate max-w-full text-center">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};