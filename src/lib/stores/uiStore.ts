import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface UIState {
  // Sidebar
  sidebarOpen: boolean;

  // Theme
  theme: 'light' | 'dark';

  // Notifications
  notifications: Notification[];
  unreadNotificationCount: number;

  // Loading states
  globalLoading: boolean;
  pageLoading: boolean;

  // Modal states
  activeModal: string | null;
  modalData: any;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  setTheme: (theme: 'light' | 'dark') => void;

  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  setGlobalLoading: (loading: boolean) => void;
  setPageLoading: (loading: boolean) => void;

  openModal: (modalType: string, data?: any) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar state
      sidebarOpen: false,

      // Theme state
      theme: 'light',

      // Notifications state
      notifications: [],
      unreadNotificationCount: 0,

      // Loading states
      globalLoading: false,
      pageLoading: false,

      // Modal states
      activeModal: null,
      modalData: null,

      // Sidebar actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

      // Theme actions
      setTheme: (theme) => set({ theme }),

      // Notification actions
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          read: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadNotificationCount: state.unreadNotificationCount + 1,
        }));
      },

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1),
        })),

      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1),
        })),

      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadNotificationCount: 0,
        })),

      clearNotifications: () =>
        set({
          notifications: [],
          unreadNotificationCount: 0,
        }),

      // Loading actions
      setGlobalLoading: (globalLoading) => set({ globalLoading }),
      setPageLoading: (pageLoading) => set({ pageLoading }),

      // Modal actions
      openModal: (modalType, modalData = null) =>
        set({
          activeModal: modalType,
          modalData,
        }),

      closeModal: () =>
        set({
          activeModal: null,
          modalData: null,
        }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);