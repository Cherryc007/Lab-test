import { Shift, ShiftStatus, Guard, GuardStatus, Site } from '../types';

/**
 * Open Shift Marketplace Service (Business Logic Only)
 */
export class OpenShiftService {
  /**
   * Validates if a guard can claim an open shift.
   */
  public static validateClaim(
    shift: Shift,
    guard: Guard,
    site: Site,
    existingShifts: Shift[]
  ): void {
    // 1. Validate shift status is Open
    if (shift.status !== ShiftStatus.Open) {
      throw new Error(`Shift ${shift.id} is not Open. Current status: ${shift.status}.`);
    }

    // 2. Validate guard is Active
    if (guard.status !== GuardStatus.Active) {
      throw new Error(`Guard is not Active. Current status: ${guard.status}.`);
    }

    // 3. Validate guard is eligible for this site
    if (!guard.eligibleSiteIds.includes(site.id)) {
      throw new Error(`Guard is not eligible to work at site ${site.name}.`);
    }

    // 4. Validate shift is in the future
    if (new Date(shift.startTime) < new Date()) {
      throw new Error('Cannot claim a shift that has already started.');
    }

    // 5. Check for scheduling conflicts (overlapping active shifts)
    const newStart = new Date(shift.startTime).getTime();
    const newEnd = new Date(shift.endTime).getTime();

    for (const existing of existingShifts) {
      // Ignore cancelled, draft, or open shifts
      if (
        existing.status === ShiftStatus.Cancelled ||
        existing.status === ShiftStatus.Draft ||
        existing.status === ShiftStatus.Open
      ) {
        continue;
      }

      const existingStart = new Date(existing.startTime).getTime();
      const existingEnd = new Date(existing.endTime).getTime();

      // Check overlap
      const hasOverlap = newStart < existingEnd && existingStart < newEnd;
      if (hasOverlap) {
        throw new Error(
          `Scheduling conflict: Overlaps with an existing shift (${existing.id}) from ${new Date(
            existing.startTime
          ).toLocaleTimeString()} to ${new Date(existing.endTime).toLocaleTimeString()}.`
        );
      }
    }
  }
}
