import React from 'react';
import { Bell, Calendar, Users, MessageSquare, Check, X, ExternalLink } from 'lucide-react';

export interface NotificationItemProps {
  id: string;
  type: 'event' | 'system' | 'message' | 'reminder' | 'security';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  type,
  title,
  message,
  timestamp,
  isRead,
  actionUrl,
  onMarkAsRead,
  onDelete,
}) => {
  const getNotificationIcon = () => {
    switch (type) {
      case 'event':
        return <Calendar className="w-5 h-5 text-orange-500" />;
      case 'system':
        return <Bell className="w-5 h-5 text-blue-500" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'reminder':
        return <Users className="w-5 h-5 text-purple-500" />;
      case 'security':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = () => {
    switch (type) {
      case 'event':
        return 'bg-orange-50 border-orange-200';
      case 'system':
        return 'bg-blue-50 border-blue-200';
      case 'message':
        return 'bg-green-50 border-green-200';
      case 'reminder':
        return 'bg-purple-50 border-purple-200';
      case 'security':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className={`p-4 border rounded-lg transition-all duration-200 ${getNotificationColor()} ${
      !isRead ? 'shadow-sm' : ''
    }`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={`font-medium ${!isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                {title}
              </h4>
              <p className={`text-sm mt-1 ${!isRead ? 'text-gray-600' : 'text-gray-500'}`}>
                {message}
              </p>

              {actionUrl && (
                <a
                  href={actionUrl}
                  className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 mt-2"
                >
                  View details <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {!isRead && (
                <button
                  onClick={() => onMarkAsRead?.(id)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => onDelete?.(id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-500">
              {formatTimeAgo(timestamp)}
            </span>
            {!isRead && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                New
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};