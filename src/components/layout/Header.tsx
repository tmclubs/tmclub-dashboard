import React, { useState } from 'react';
import { Bell, Search, User, Menu, X } from 'lucide-react';
import { useUnreadNotificationCount } from '@/lib/hooks';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { data: unreadCount } = useUnreadNotificationCount();

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-6 py-3 sm:py-4">
        {/* Left side - Mobile Menu & Search */}
        <div className="flex items-center flex-1 min-w-0">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search - Hidden on small mobile, visible on larger screens */}
          <div className="hidden sm:block max-w-xs w-full ml-4 lg:ml-0 lg:max-w-xs flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right side - Notifications & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-4 ml-2 sm:ml-0">
          {/* Mobile Search Button */}
          <button className="sm:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500">
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <button
            onClick={handleNotificationClick}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 relative focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount && unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] text-xs font-bold text-white bg-red-500 rounded-full ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <button className="p-1.5 rounded-full bg-orange-100 hover:bg-orange-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500">
              <User className="h-5 w-5 text-orange-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (shown when search button clicked) */}
      <div className="sm:hidden border-t border-gray-200 px-4 py-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            autoFocus
          />
        </div>
      </div>
    </header>
  );
};