import {
  Shift,
  ShiftStatus,
  ShiftAssignmentEvent,
  ShiftAssignmentAction,
  Guard,
  GuardStatus,
  Site
} from '../types';
import { generateId } from '../lib/utils';

/**
 * Validates a transition in the Shift Lifecycle state machine.
 * Allowed transitions:
 * - Draft -> Assigned
 * - Assigned -> Accepted
 * - Assigned -> Rejected
 * - Accepted -> Active
 * - Active -> Completed
 * - Rejected -> Open
 * - Open -> Claimed
 * - Claimed -> Assigned
 */
export function validateShiftTransition(current: ShiftStatus, next: ShiftStatus): void {
  const allowed: Record<ShiftStatus, ShiftStatus[]> = {
    [ShiftStatus.Draft]: [ShiftStatus.Assigned],
    [ShiftStatus.Assigned]: [ShiftStatus.Accepted, ShiftStatus.Rejected],
    [ShiftStatus.Accepted]: [ShiftStatus.Active],
    [ShiftStatus.Rejected]: [ShiftStatus.Open],
    [ShiftStatus.Open]: [ShiftStatus.Claimed],
    [ShiftStatus.Claimed]: [ShiftStatus.Assigned],
    [ShiftStatus.Active]: [ShiftStatus.Completed],
    
    // Non-transition states for these strict rules
    [ShiftStatus.Unassigned]: [],
    [ShiftStatus.Confirmed]: [],
    [ShiftStatus.Completed]: [],
    [ShiftStatus.Cancelled]: []
  };

  const nextList = allowed[current] || [];
  if (!nextList.includes(next)) {
    throw new Error(`Illegal shift status transition: Cannot transition from ${current} to ${next}.`);
  }
}

/**
 * Validates guard eligibility for a given site.
 */
export function validateGuardEligibility(guard: Guard, site: Site): void {
  if (guard.status !== GuardStatus.Active) {
    throw new Error(`Guard ${guard.id} is not Active. Current status: ${guard.status}.`);
  }
  if (!guard.eligibleSiteIds.includes(site.id)) {
    throw new Error(`Guard ${guard.id} is not eligible to work at site ${site.name} (${site.id}).`);
  }
}

/**
 * Validates shift timing constraints.
 */
export function validateShiftTimings(startTime: string, endTime: string): void {
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid shift date/time format.');
  }
  if (end <= start) {
    throw new Error('Shift end time must be strictly after the start time.');
  }
}

/**
 * Creates a ShiftAssignmentEvent.
 */
export function createAssignmentEvent(
  shiftId: string,
  guardId: string,
  action: ShiftAssignmentAction,
  actorId: string,
  reason?: string
): ShiftAssignmentEvent {
  return {
    id: `event-${generateId()}`,
    shiftId,
    guardId,
    action,
    actorId,
    timestamp: new Date().toISOString(),
    reason: reason || null
  };
}

/**
 * Scheduling Service (Business Logic Only)
 */
export class SchedulingService {
  /**
   * Transition shift status with state machine and eligibility checks.
   */
  public static transitionShift(
    shift: Shift,
    newStatus: ShiftStatus,
    context: {
      guard?: Guard;
      site?: Site;
      actorId: string;
      reason?: string;
    }
  ): { shift: Shift; event?: ShiftAssignmentEvent } {
    // 1. Validate state machine transition
    validateShiftTransition(shift.status, newStatus);

    // 2. Perform validations specific to target state
    let event: ShiftAssignmentEvent | undefined;

    if (newStatus === ShiftStatus.Assigned) {
      if (!context.guard) {
        throw new Error('A guard must be provided to assign a shift.');
      }
      if (!context.site) {
        throw new Error('Site context must be provided to validate guard eligibility.');
      }
      validateGuardEligibility(context.guard, context.site);
      
      // Update shift fields
      shift = {
        ...shift,
        status: newStatus,
        guardId: context.guard.id,
        version: (shift.version || 0) + 1
      };

      // Create history event
      event = createAssignmentEvent(
        shift.id,
        context.guard.id,
        ShiftAssignmentAction.Assigned,
        context.actorId,
        context.reason
      );
    } else if (newStatus === ShiftStatus.Accepted) {
      if (!shift.guardId) {
        throw new Error('Shift must have an assigned guard to be accepted.');
      }
      shift = {
        ...shift,
        status: newStatus,
        version: (shift.version || 0) + 1
      };
      event = createAssignmentEvent(
        shift.id,
        shift.guardId!,
        ShiftAssignmentAction.Accepted,
        context.actorId
      );

    } else if (newStatus === ShiftStatus.Rejected) {
      if (!shift.guardId) {
        throw new Error('Shift must have an assigned guard to be rejected.');
      }
      const rejectedGuardId = shift.guardId;
      shift = {
        ...shift,
        status: newStatus,
        guardId: null,
        version: (shift.version || 0) + 1
      };
      event = createAssignmentEvent(
        shift.id,
        rejectedGuardId,
        ShiftAssignmentAction.Rejected,
        context.actorId,
        context.reason
      );
    } else if (newStatus === ShiftStatus.Open) {
      shift = {
        ...shift,
        status: newStatus,
        guardId: null,
        version: (shift.version || 0) + 1
      };
      // Moving a rejected shift to Open in marketplace doesn't create an offered assignment event,
      // but status transitions automatically.
    } else if (newStatus === ShiftStatus.Claimed) {
      if (!context.guard) {
        throw new Error('A guard must be provided to claim an open shift.');
      }
      if (!context.site) {
        throw new Error('Site context must be provided to validate guard eligibility.');
      }
      validateGuardEligibility(context.guard, context.site);

      shift = {
        ...shift,
        status: newStatus,
        guardId: context.guard.id,
        version: (shift.version || 0) + 1
      };

      event = createAssignmentEvent(
        shift.id,
        context.guard.id,
        ShiftAssignmentAction.Claimed,
        context.actorId
      );
    } else {
      // General transition (e.g. Active, Completed)
      shift = {
        ...shift,
        status: newStatus,
        version: (shift.version || 0) + 1
      };
    }

    return { shift, event };
  }
}
