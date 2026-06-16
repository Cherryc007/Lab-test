import { LoneWorkerCheckIn, LoneWorkerAlert, CheckInStatus, Shift } from '../types';
import { generateId } from '../lib/utils';

/**
 * Lone Worker Service (Business Logic Only)
 */
export class LoneWorkerService {
  /**
   * Generates periodic check-in schedules for a lone worker shift.
   */
  public static generateSchedules(shift: Shift): LoneWorkerCheckIn[] {
    if (!shift.isLoneWorker || !shift.checkInIntervalMinutes) {
      return [];
    }

    const checkIns: LoneWorkerCheckIn[] = [];
    const start = new Date(shift.startTime).getTime();
    const end = new Date(shift.endTime).getTime();
    const intervalMs = shift.checkInIntervalMinutes * 60 * 1000;

    let nextTime = start + intervalMs;
    let index = 1;

    while (nextTime <= end) {
      checkIns.push({
        id: `checkin-${shift.id}-${index++}`,
        shiftId: shift.id,
        guardId: shift.guardId || '',
        scheduledTime: new Date(nextTime).toISOString(),
        status: CheckInStatus.Pending
      });
      nextTime += intervalMs;
    }

    return checkIns;
  }

  /**
   * Evaluates the status of a check-in based on a reference time and grace period.
   * Transition flow:
   * Pending -> Missed (if reference time > scheduled time + grace period)
   */
  public static evaluateCheckIn(
    checkIn: LoneWorkerCheckIn,
    referenceTime: string,
    gracePeriodMinutes: number
  ): CheckInStatus {
    if (checkIn.status === CheckInStatus.Completed || checkIn.status === CheckInStatus.Escalated) {
      return checkIn.status;
    }

    const scheduled = new Date(checkIn.scheduledTime).getTime();
    const reference = new Date(referenceTime).getTime();
    const graceMs = gracePeriodMinutes * 60 * 1000;

    if (reference > scheduled + graceMs) {
      return CheckInStatus.Missed;
    }

    return CheckInStatus.Pending;
  }

  /**
   * Completes a check-in with GPS and optional selfie verification.
   */
  public static completeCheckIn(
    checkIn: LoneWorkerCheckIn,
    latitude: number,
    longitude: number,
    selfieUrl?: string,
    statusNote?: string
  ): LoneWorkerCheckIn {
    if (checkIn.status === CheckInStatus.Completed) {
      throw new Error('Check-in has already been completed.');
    }

    return {
      ...checkIn,
      status: CheckInStatus.Completed,
      completedTime: new Date().toISOString(),
      latitude,
      longitude,
      selfieUrl: selfieUrl || null,
      statusNote: statusNote || null
    };
  }

  /**
   * Escalates a missed check-in to an active alert.
   * Failure path: Check-In Due -> Missed -> Escalated
   */
  public static escalateCheckIn(
    checkIn: LoneWorkerCheckIn,
    referenceTime: string,
    alertGracePeriodMinutes: number
  ): { checkIn: LoneWorkerCheckIn; alert?: LoneWorkerAlert } {
    if (checkIn.status !== CheckInStatus.Missed) {
      return { checkIn };
    }

    const scheduled = new Date(checkIn.scheduledTime).getTime();
    const reference = new Date(referenceTime).getTime();
    const escalationThresholdMs = alertGracePeriodMinutes * 60 * 1000;

    // Escalate if the missed check-in has exceeded the escalation grace period
    if (reference > scheduled + escalationThresholdMs) {
      const updatedCheckIn: LoneWorkerCheckIn = {
        ...checkIn,
        status: CheckInStatus.Escalated
      };

      const alert: LoneWorkerAlert = {
        id: `alert-${generateId()}`,
        checkInId: checkIn.id,
        shiftId: checkIn.shiftId,
        guardId: checkIn.guardId,
        createdAt: new Date().toISOString(),
        isAcknowledged: false
      };

      return { checkIn: updatedCheckIn, alert };
    }

    return { checkIn };
  }

  /**
   * Acknowledges and resolves an alert.
   */
  public static resolveAlert(
    alert: LoneWorkerAlert,
    acknowledgedBy: string,
    resolutionNotes: string
  ): LoneWorkerAlert {
    if (alert.isAcknowledged) {
      throw new Error('Alert has already been resolved.');
    }
    if (!resolutionNotes || resolutionNotes.trim() === '') {
      throw new Error('Resolution notes must be provided to close the alert.');
    }

    return {
      ...alert,
      isAcknowledged: true,
      acknowledgedBy,
      acknowledgedAt: new Date().toISOString(),
      resolutionNotes
    };
  }
}
