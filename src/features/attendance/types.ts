import { AttendanceRecord, GpsValidationResult } from '../../types';

export interface ClockInInput {
  shiftId: string;
  latitude: number;
  longitude: number;
  selfieUrl: string;
}

export interface ClockOutInput {
  shiftId: string;
  latitude: number;
  longitude: number;
}

export interface GpsCheckResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  validation: GpsValidationResult;
}
