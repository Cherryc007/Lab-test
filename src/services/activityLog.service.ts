import { ActivityLog, ActivityLogCategory, ActivityLogReviewStatus, Shift, ShiftStatus } from '../types';
import { ACTIVITY_LOG_MAX_LENGTH } from '../lib/constants';
import { generateId } from '../lib/utils';

/**
 * Activity Log Service (Business Logic Only)
 */
export class ActivityLogService {
  /**
   * Validates and creates a new guard activity log.
   */
  public static createLog(
    shift: Shift,
    content: string,
    category: ActivityLogCategory,
    latitude?: number | null,
    longitude?: number | null
  ): ActivityLog {
    // 1. Validate shift is Active
    if (shift.status !== ShiftStatus.Active) {
      throw new Error(`Cannot submit activity log: Shift must be Active. Current status: ${shift.status}.`);
    }

    // 2. Validate content
    if (!content || content.trim() === '') {
      throw new Error('Activity log content cannot be empty.');
    }
    if (content.length > ACTIVITY_LOG_MAX_LENGTH) {
      throw new Error(`Activity log content exceeds maximum length of ${ACTIVITY_LOG_MAX_LENGTH} characters.`);
    }

    return {
      id: `log-${generateId()}`,
      shiftId: shift.id,
      siteId: shift.siteId,
      guardId: shift.guardId || '',
      content: content.trim(),
      category,
      reviewStatus: ActivityLogReviewStatus.Pending,
      createdAt: new Date().toISOString(),
      latitude: latitude || null,
      longitude: longitude || null
    };
  }

  /**
   * Reviews and signs off on an activity log.
   */
  public static reviewLog(
    log: ActivityLog,
    reviewedBy: string
  ): ActivityLog {
    if (log.reviewStatus === ActivityLogReviewStatus.Reviewed) {
      throw new Error('Activity log has already been reviewed.');
    }

    return {
      ...log,
      reviewStatus: ActivityLogReviewStatus.Reviewed,
      reviewedBy,
      reviewedAt: new Date().toISOString()
    };
  }
}
