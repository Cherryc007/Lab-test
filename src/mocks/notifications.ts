import { Notification, NotificationType, NotificationPriority } from '../types';

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-jp-tremblay',
    type: NotificationType.ShiftAssigned,
    priority: NotificationPriority.Normal,
    title: 'New Shift Assigned',
    message: 'You have been assigned a new shift at Allied Terminal Ottawa on June 17, 2026.',
    isRead: false,
    createdAt: '2026-06-17T02:00:00Z',
    linkTo: '/schedule'
  },
  {
    id: 'notif-2',
    userId: 'user-ops-mgr',
    type: NotificationType.General,
    priority: NotificationPriority.Normal,
    title: 'New Activity Log Submitted',
    message: 'Guard Sarah Jenkins submitted a new Incident activity log for Allied Glass-Factory Site.',
    isRead: false,
    createdAt: '2026-06-17T02:05:00Z',
    linkTo: '/activity-logs'
  }
];
