import { create } from 'zustand';
import { AsyncState, Notification } from '../types';
import { NotificationService } from '../services';

export interface NotificationState {
  notifications: AsyncState<Notification[]>;
}

export interface NotificationActions {
  fetchNotifications: () => Promise<void>;
  pushNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
  markRead: (notificationId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  clearError: () => void;
}

export type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: {
    data: [],
    isLoading: false,
    error: null,
    operationLoading: {}
  },

  fetchNotifications: async () => {
    set((state) => ({ notifications: { ...state.notifications, isLoading: true, error: null } }));
    try {
      const data = get().notifications.data;
      set((state) => ({ notifications: { ...state.notifications, isLoading: false, data } }));
    } catch (err: any) {
      set((state) => ({ notifications: { ...state.notifications, isLoading: false, error: err.message } }));
    }
  },

  pushNotification: async (notificationData) => {
    set((state) => ({ notifications: { ...state.notifications, isLoading: true, error: null } }));
    try {
      const notif = NotificationService.createNotification(
        notificationData.userId,
        notificationData.type,
        notificationData.priority,
        notificationData.title,
        notificationData.message,
        notificationData.linkTo
      );

      set((state) => ({
        notifications: {
          ...state.notifications,
          isLoading: false,
          data: [...state.notifications.data, notif]
        }
      }));
    } catch (err: any) {
      set((state) => ({ notifications: { ...state.notifications, isLoading: false, error: err.message } }));
      throw err;
    }
  },

  markRead: async (notificationId) => {
    set((state) => ({ notifications: { ...state.notifications, isLoading: true, error: null } }));
    try {
      set((state) => ({
        notifications: {
          ...state.notifications,
          isLoading: false,
          data: state.notifications.data.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        }
      }));
    } catch (err: any) {
      set((state) => ({ notifications: { ...state.notifications, isLoading: false, error: err.message } }));
      throw err;
    }
  },

  markAllRead: async () => {
    set((state) => ({ notifications: { ...state.notifications, isLoading: true, error: null } }));
    try {
      set((state) => ({
        notifications: {
          ...state.notifications,
          isLoading: false,
          data: state.notifications.data.map((n) => ({ ...n, isRead: true }))
        }
      }));
    } catch (err: any) {
      set((state) => ({ notifications: { ...state.notifications, isLoading: false, error: err.message } }));
      throw err;
    }
  },

  clearError: () => {
    set((state) => ({
      notifications: { ...state.notifications, error: null }
    }));
  }
}));
