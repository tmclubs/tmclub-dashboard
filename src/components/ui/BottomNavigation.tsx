import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Calendar,
  Building2,
  User,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const bottomNavItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Profile', href: '/profile', icon: User },
];

export const BottomNavigation: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-4 gap-1">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors',
                isActive
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'h-5 w-5 mb-1',
                    isActive ? 'text-orange-600' : 'text-gray-400'
                  )}
                />
                <span className="truncate max-w-full">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Quick Action Button */}
        <button className="flex flex-col items-center justify-center py-2 px-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
          <div className="relative">
            <Plus className="h-5 w-5 mb-1 text-gray-400" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-orange-500 rounded-full"></span>
          </div>
          <span className="truncate max-w-full">More</span>
        </button>
      </div>
    </div>
  );
};