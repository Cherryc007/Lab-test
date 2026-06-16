import { NotificationType, NotificationPriority } from '../../types';

export interface SendNotificationInput {
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  linkTo?: string;
}
