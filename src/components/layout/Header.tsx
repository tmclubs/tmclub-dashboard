import React, { useState } from 'react';
import { Bell, Menu, ChevronDown, LogOut, Settings, UserIcon } from 'lucide-react';
import { Button, Badge, Avatar } from '@/components/ui';
import { useAuth, useLogout } from '@/lib/hooks/useAuth';
import { useUnreadNotificationCount } from '@/lib/hooks/useNotifications';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Get real user data from auth hook
  const { user, isAuthenticated } = useAuth();
  
  // Get real notification count from backend
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  
  // Get logout function
  const logout = useLogout();

  // Generate user initials for avatar fallback
  const getUserInitials = (firstName?: string, lastName?: string) => {
    if (!firstName) return 'U';
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  // Get user display name
  const getDisplayName = () => {
    if (!user) return 'Guest';
    return user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}`
      : user.first_name || user.username || 'User';
  };

  // Get user role display
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

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
      {/* Left side - Menu button */}
      <div className="flex items-center min-w-0 flex-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden mr-2 sm:mr-3 flex-shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
          Dashboard
        </h1>
      </div>

      {/* Right side - Notifications and Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        {/* Notifications */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative p-2 min-w-[2.5rem] h-10"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="error"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs min-w-[20px]"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Profile Section */}
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-1 sm:space-x-2 h-auto p-2 min-w-[2.5rem]"
            aria-label="Profile menu"
          >
            <Avatar
              size="sm"
              name={isAuthenticated && user ? getUserInitials(user.first_name, user.last_name) : undefined}
              className="h-8 w-8 flex-shrink-0"
            />
            <div className="hidden sm:block text-left min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                {getDisplayName()}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[120px]">
                {getRoleDisplay()}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
          </Button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 sm:w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
              <div className="py-1">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex flex-col space-y-1">
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

                {/* Menu Items */}
                <button
                  className="flex items-center w-full px-4 py-3 sm:py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <UserIcon className="h-4 w-4 mr-3 flex-shrink-0" />
                  <span>Profile</span>
                </button>
                
                <button
                  className="flex items-center w-full px-4 py-3 sm:py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Settings className="h-4 w-4 mr-3 flex-shrink-0" />
                  <span>Settings</span>
                </button>
                
                <div className="border-t border-gray-100">
                  <button
                    className="flex items-center w-full px-4 py-3 sm:py-2 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 touch-manipulation"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </header>
  );
};