import { ActivityLog, ActivityLogCategory, ActivityLogReviewStatus } from '../types';

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'log-eaton-routine',
    shiftId: 'shift-completed-eaton',
    siteId: 'site-eaton-centre',
    guardId: 'guard-jp-tremblay',
    content: 'Completed morning foot patrol. Checked CF Toronto Eaton Centre doors. All secure.',
    category: ActivityLogCategory.Routine,
    reviewStatus: ActivityLogReviewStatus.Reviewed,
    createdAt: '2026-06-16T10:00:00Z',
    latitude: 43.6539,
    longitude: -79.3803,
    reviewedBy: 'user-ops-mgr',
    reviewedAt: '2026-06-16T12:00:00Z'
  },
  {
    id: 'log-glass-incident',
    shiftId: 'shift-active-glass',
    siteId: 'site-glass-factory',
    guardId: 'guard-sarah-jenkins',
    content: 'Graffiti tagging observed on north perimeter fence. Took photos. Incident logged.',
    category: ActivityLogCategory.Incident,
    reviewStatus: ActivityLogReviewStatus.Pending,
    createdAt: '2026-06-17T02:00:00Z',
    latitude: 49.2662,
    longitude: -123.1078
  }
];
