import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { notificationsApi } from '@/lib/api/notifications';
// import { Notification } from '@/types/api';
import { isAuthenticated } from '@/lib/api/client';

// Hook for getting all notifications
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getNotifications(),
    enabled: isAuthenticated(),
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for getting single notification
export const useNotification = (notificationId: number) => {
  return useQuery({
    queryKey: ['notifications', notificationId],
    queryFn: () => notificationsApi.getNotification(notificationId),
    enabled: isAuthenticated() && !!notificationId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting notification count
export const useNotificationCount = (status?: 'unread' | 'read') => {
  return useQuery({
    queryKey: ['notification-count', status],
    queryFn: () => notificationsApi.getNotificationCount(status),
    enabled: isAuthenticated(),
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook for unread notification count
export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ['notification-count', 'unread'],
    queryFn: () => notificationsApi.getNotificationCount('unread'),
    enabled: isAuthenticated(),
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook for marking all notifications as read
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
      toast.success('Semua notifikasi ditandai sebagai sudah dibaca');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal menandai notifikasi');
    },
  });
};