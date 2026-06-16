import { AttendanceRecord, GpsValidationResult, AttendanceFlag } from '../types';

export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: 'att-completed-eaton',
    shiftId: 'shift-completed-eaton',
    guardId: 'guard-jp-tremblay',
    clockInTime: '2026-06-16T07:55:00Z',
    clockInLatitude: 43.65395,
    clockInLongitude: -79.38032,
    clockInSelfieUrl: 'https://images.guardon.io/selfies/att-completed-eaton-in.jpg',
    clockInGpsResult: GpsValidationResult.WithinGeofence,
    flags: [AttendanceFlag.OnTime],
    clockOutTime: '2026-06-16T16:05:00Z',
    clockOutLatitude: 43.65402,
    clockOutLongitude: -79.38025,
    clockOutGpsResult: GpsValidationResult.WithinGeofence
  },
  {
    id: 'att-active-glass',
    shiftId: 'shift-active-glass',
    guardId: 'guard-sarah-jenkins',
    clockInTime: '2026-06-17T00:02:00Z',
    clockInLatitude: 49.26618,
    clockInLongitude: -123.10775,
    clockInSelfieUrl: 'https://images.guardon.io/selfies/att-active-glass-in.jpg',
    clockInGpsResult: GpsValidationResult.WithinGeofence,
    flags: [AttendanceFlag.OnTime]
  }
];
