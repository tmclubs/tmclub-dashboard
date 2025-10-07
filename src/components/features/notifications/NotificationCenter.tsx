import React, { useState } from 'react';
import {
  Bell,
  Check,
  X,
  Calendar,
  Users,
  MessageSquare,
  AlertCircle,
  Info,
  CheckCircle,
  Settings,
  Trash2
} from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'event' | 'message' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  action?: {
    text: string;
    onClick: () => void;
  };
}

export interface NotificationCenterProps {
  notifications: Notification[];
  loading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  loading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'read':
        return notification.read;
      default:
        return true;
    }
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <X className="w-5 h-5 text-red-500" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      case 'system':
        return <Settings className="w-5 h-5 text-gray-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'event':
        return 'bg-blue-50 border-blue-200';
      case 'message':
        return 'bg-purple-50 border-purple-200';
      case 'system':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const timeSince = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="default" size="sm">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && onMarkAllAsRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAllAsRead}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && onClearAll && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'read', label: 'Read', count: notifications.length - unreadCount },
            ].map((f) => (
              <Button
                key={f.key}
                variant={filter === f.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f.key as any)}
                className="flex-1"
              >
                {f.label} ({f.count})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
              </h4>
              <p className="text-sm text-gray-600">
                {filter === 'all'
                  ? 'You\'re all caught up! New notifications will appear here.'
                  : `No ${filter} notifications to show.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md ${
                !notification.read ? 'border-l-4 border-l-orange-500' : ''
              } ${getBackgroundColor(notification.type)}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className={`text-sm font-medium text-gray-900 ${
                        !notification.read ? 'font-semibold' : ''
                      }`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-xs text-gray-500">
                          {timeSince(notification.timestamp)}
                        </span>
                        {!notification.read && onMarkAsRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onMarkAsRead(notification.id)}
                            className="h-6 w-6"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(notification.id)}
                            className="h-6 w-6 text-red-500 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      {notification.description}
                    </p>

                    {notification.action && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={notification.action.onClick}
                        className="mt-2"
                      >
                        {notification.action.text}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
        </div>
      )}
    </div>
  );
};