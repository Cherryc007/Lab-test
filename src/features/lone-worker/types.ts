import { LoneWorkerCheckIn, LoneWorkerAlert } from '../../types';

export interface CheckInSubmissionInput {
  checkInId: string;
  latitude: number;
  longitude: number;
  selfieUrl?: string;
  statusNote?: string;
}

export interface AlertResolutionInput {
  alertId: string;
  resolutionNotes: string;
}

export interface ActiveLoneWorkerStatus {
  activeCheckIn: LoneWorkerCheckIn | null;
  activeAlert: LoneWorkerAlert | null;
}
