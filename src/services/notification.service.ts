import { Notification, NotificationType, NotificationPriority } from '../types';
import { generateId } from '../lib/utils';

/**
 * Notification Service (Business Logic Only)
 */
export class NotificationService {
  /**
   * Constructs a notification record.
   */
  public static createNotification(
    userId: string,
    type: NotificationType,
    priority: NotificationPriority,
    title: string,
    message: string,
    linkTo?: string | null
  ): Notification {
    if (!userId || userId.trim() === '') {
      throw new Error('Notification recipient userId is required.');
    }
    if (!title || title.trim() === '') {
      throw new Error('Notification title is required.');
    }
    if (!message || message.trim() === '') {
      throw new Error('Notification message is required.');
    }

    return {
      id: `notif-${generateId()}`,
      userId,
      type,
      priority,
      title: title.trim(),
      message: message.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
      linkTo: linkTo || null
    };
  }
}
