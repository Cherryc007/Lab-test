import { Shift, ShiftAssignment } from '../../types';

export interface CreateShiftInput {
  siteId: string;
  startTime: string;
  endTime: string;
  isLoneWorker: boolean;
  notes?: string;
  checkInIntervalMinutes?: number;
}

export interface AssignShiftInput {
  shiftId: string;
  guardId: string;
}

export interface ShiftWithAssignment extends Shift {
  activeAssignment?: ShiftAssignment;
}
