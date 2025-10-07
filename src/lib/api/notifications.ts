import { apiClient } from './client';
import { Notification } from '@/types/api';

export const notificationsApi = {
  // Get all notifications
  async getNotifications(): Promise<Notification[]> {
    return apiClient.get('/notification/');
  },

  // Get notification by ID
  async getNotification(notificationId: number): Promise<Notification> {
    return apiClient.get(`/notification/${notificationId}/`);
  },

  // Get notification count by status
  async getNotificationCount(status?: 'unread' | 'read'): Promise<number> {
    const params = status ? `?status=${status}` : '';
    const response = await fetch(`${import.meta.env.VITE_API_URL}/notification/count/${params}`, {
      headers: {
        Authorization: `Token ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get notification count');
    }

    const result = await response.json();
    return result.data;
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    return apiClient.post('/notification/mark-read-all/');
  },
};