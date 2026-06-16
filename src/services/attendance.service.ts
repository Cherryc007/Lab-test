import { AttendanceRecord, GpsValidationResult, AttendanceFlag } from '../types';
import { validateGeofence } from '../lib/geofence';
import { generateId } from '../lib/utils';

/**
 * Attendance Service (Business Logic Only)
 */
export class AttendanceService {
  /**
   * Initializes a blank attendance record for a guard starting their check-in process.
   */
  public static initializeRecord(shiftId: string, guardId: string): AttendanceRecord {
    return {
      id: `att-${generateId()}`,
      shiftId,
      guardId,
      clockInTime: '',
      clockInLatitude: 0,
      clockInLongitude: 0,
      clockInSelfieUrl: '',
      clockInGpsResult: GpsValidationResult.Unavailable,
      flags: []
    };
  }

  /**
   * Step 1: Verify GPS Location
   */
  public static verifyGps(
    record: AttendanceRecord,
    guardLat: number,
    guardLng: number,
    siteLat: number,
    siteLng: number,
    siteRadiusMeters: number
  ): AttendanceRecord {
    const gpsResult = validateGeofence(guardLat, guardLng, siteLat, siteLng, siteRadiusMeters);
    
    const flags = [...record.flags];
    if (gpsResult === GpsValidationResult.OutOfGeofence) {
      if (!flags.includes(AttendanceFlag.OutOfGeofence)) {
        flags.push(AttendanceFlag.OutOfGeofence);
      }
    }

    return {
      ...record,
      clockInLatitude: guardLat,
      clockInLongitude: guardLng,
      clockInGpsResult: gpsResult,
      flags
    };
  }

  /**
   * Step 2: Verify Selfie
   */
  public static verifySelfie(record: AttendanceRecord, selfieUrl: string): AttendanceRecord {
    // Validation: Cannot selfie before GPS is captured
    if (record.clockInLatitude === 0 && record.clockInLongitude === 0) {
      throw new Error('Cannot verify selfie: GPS location check must be completed first.');
    }
    if (!selfieUrl || selfieUrl.trim() === '') {
      throw new Error('Selfie URL is required for verification.');
    }

    return {
      ...record,
      clockInSelfieUrl: selfieUrl
    };
  }

  /**
   * Step 3: Clock In
   */
  public static clockIn(record: AttendanceRecord, scheduledStartTime: string, gracePeriodMinutes: number): AttendanceRecord {
    // Validation: Cannot clock in before selfie is verified
    if (!record.clockInSelfieUrl || record.clockInSelfieUrl.trim() === '') {
      throw new Error('Cannot clock in: Selfie verification is required.');
    }

    const clockInTime = new Date().toISOString();
    const flags = [...record.flags];

    // Check if clock-in is late
    const scheduled = new Date(scheduledStartTime);
    const actual = new Date(clockInTime);
    const diffMs = actual.getTime() - scheduled.getTime();
    const diffMins = diffMs / (1000 * 60);

    if (diffMins > gracePeriodMinutes) {
      if (!flags.includes(AttendanceFlag.Late)) {
        flags.push(AttendanceFlag.Late);
      }
    } else {
      if (!flags.includes(AttendanceFlag.OnTime)) {
        flags.push(AttendanceFlag.OnTime);
      }
    }

    return {
      ...record,
      clockInTime,
      flags
    };
  }

  /**
   * Step 4: Clock Out
   */
  public static clockOut(
    record: AttendanceRecord,
    guardLat: number,
    guardLng: number,
    siteLat: number,
    siteLng: number,
    siteRadiusMeters: number,
    scheduledEndTime: string
  ): AttendanceRecord {
    // Validation: Cannot clock out before clock in
    if (!record.clockInTime || record.clockInTime.trim() === '') {
      throw new Error('Cannot clock out: Guard has not clocked in yet.');
    }

    const clockOutTime = new Date().toISOString();
    const gpsResult = validateGeofence(guardLat, guardLng, siteLat, siteLng, siteRadiusMeters);
    const flags = [...record.flags];

    // Check for early clock-out
    const scheduledEnd = new Date(scheduledEndTime);
    const actualOut = new Date(clockOutTime);
    if (actualOut < scheduledEnd) {
      // Early clock out by more than 5 minutes grace
      const diffMins = (scheduledEnd.getTime() - actualOut.getTime()) / (1000 * 60);
      if (diffMins > 5) {
        if (!flags.includes(AttendanceFlag.EarlyClockOut)) {
          flags.push(AttendanceFlag.EarlyClockOut);
        }
      }
    }

    return {
      ...record,
      clockOutTime,
      clockOutLatitude: guardLat,
      clockOutLongitude: guardLng,
      clockOutGpsResult: gpsResult,
      flags
    };
  }
}
