import React, { useState, useEffect } from 'react';
import { Card, Button, EmptyState } from '@/components/ui';
import { NotificationItem, NotificationFilters, type NotificationItemProps } from '@/components/features/notifications';
import { Bell, CheckCircle, Archive, Trash2, Settings } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItemProps[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock notification data
  const mockNotifications: NotificationItemProps[] = [
    {
      id: '1',
      type: 'event',
      title: 'New Event Registration',
      message: 'John Doe has registered for "Automotive Innovation Workshop 2024"',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      isRead: false,
      actionUrl: '/events/123',
    },
    {
      id: '2',
      type: 'system',
      title: 'System Maintenance Scheduled',
      message: 'Scheduled maintenance will occur on Saturday, October 15, 2024 from 2:00 AM to 4:00 AM UTC',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isRead: false,
    },
    {
      id: '3',
      type: 'message',
      title: 'New message from Sarah Johnson',
      message: 'Hi! I wanted to follow up on our discussion about the upcoming conference...',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      actionUrl: '/messages/456',
    },
    {
      id: '4',
      type: 'reminder',
      title: 'Event Reminder: Toyota Annual Meeting',
      message: 'Don\'t forget about the annual Toyota meeting scheduled for tomorrow at 10:00 AM',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      actionUrl: '/events/789',
    },
    {
      id: '5',
      type: 'security',
      title: 'Security Alert: New Login Detected',
      message: 'A new login to your account was detected from Chrome on Windows - Jakarta, Indonesia',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
    },
    {
      id: '6',
      type: 'event',
      title: 'Event Successfully Created',
      message: 'Your event "Digital Transformation Summit 2024" has been successfully created and is now live',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      actionUrl: '/events/101112',
    },
    {
      id: '7',
      type: 'system',
      title: 'Welcome to TMC Platform!',
      message: 'Thank you for joining the Toyota Manufacturers Club platform. Explore our features and get started.',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
    },
  ];

  useEffect(() => {
    // Simulate loading notifications
    const loadNotifications = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotifications(mockNotifications);
      setLoading(false);
    };

    loadNotifications();
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const handleArchiveAll = () => {
    // In a real app, this would archive notifications
    console.log('Archive all notifications');
  };

  const handleDeleteAll = () => {
    setNotifications([]);
  };

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter(notification => {
    // Read/Unread filter
    if (filter === 'unread' && notification.isRead) return false;
    if (filter === 'read' && !notification.isRead) return false;

    // Type filter
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;

    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay updated with your latest activities and alerts
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 text-sm bg-orange-100 text-orange-700 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" leftIcon={<Settings className="w-4 h-4" />}>
            Notification Settings
          </Button>
        </div>
      </div>

      {/* Notification Filters */}
      <NotificationFilters
        filter={filter}
        typeFilter={typeFilter}
        onFilterChange={setFilter}
        onTypeFilterChange={setTypeFilter}
        onMarkAllAsRead={handleMarkAllAsRead}
        onArchiveAll={handleArchiveAll}
        onDeleteAll={handleDeleteAll}
        unreadCount={unreadCount}
      />

      {/* Notifications List */}
      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-12 h-12 text-gray-400" />}
            title="No notifications found"
            description={
              filter === 'unread'
                ? "You're all caught up! No unread notifications."
                : filter === 'read'
                ? 'No read notifications found.'
                : 'No notifications found for the selected filters.'
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                {...notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      {notifications.length > 0 && (
        <Card className="p-4 bg-gray-50 border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {notifications.length} total notifications
              </span>
              <span className="text-sm text-gray-600">
                {unreadCount} unread
              </span>
              <span className="text-sm text-gray-600">
                {notifications.filter(n => n.isRead).length} read
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<CheckCircle className="w-4 h-4" />}
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark All Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Archive className="w-4 h-4" />}
                onClick={handleArchiveAll}
              >
                Archive
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={handleDeleteAll}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Delete All
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};