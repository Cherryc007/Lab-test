import { create } from 'zustand';
import { AsyncState, AttendanceRecord, ShiftStatus } from '../types';
import { AttendanceService } from '../services';
import { useSchedulingStore } from './useSchedulingStore';
import { useClientStore } from './useClientStore';
import { useAuditStore } from './useAuditStore';
import { useSessionStore } from './useSessionStore';

export interface AttendanceState {
  records: AsyncState<AttendanceRecord[]>;
}

export interface AttendanceActions {
  clockIn: (shiftId: string, latitude: number, longitude: number, selfieUrl: string) => Promise<void>;
  clockOut: (shiftId: string, latitude: number, longitude: number) => Promise<void>;
  overrideRecord: (recordId: string, overrideNote: string, reviewerId: string) => Promise<void>;
  clearError: () => void;
}

export type AttendanceStore = AttendanceState & AttendanceActions;

export const useAttendanceStore = create<AttendanceStore>((set, get) => ({
  records: {
    data: [],
    isLoading: false,
    error: null,
    operationLoading: {}
  },

  clockIn: async (shiftId, latitude, longitude, selfieUrl) => {
    set((state) => ({ records: { ...state.records, isLoading: true, error: null } }));
    try {
      // 1. Retrieve shift from Scheduling Store
      const shift = useSchedulingStore.getState().shifts.data.find((s) => s.id === shiftId);
      if (!shift) throw new Error('Shift not found.');

      // 2. Retrieve site from Client Store
      const site = useClientStore.getState().sites.data.find((s) => s.id === shift.siteId);
      if (!site) throw new Error('Site not found for shift.');

      const actor = useSessionStore.getState().currentUser;
      if (!actor) throw new Error('Unauthenticated user.');

      // 3. Initialize attendance record
      let record = AttendanceService.initializeRecord(shiftId, shift.guardId || '');

      // 4. Run through attendance validation steps in order
      record = AttendanceService.verifyGps(
        record,
        latitude,
        longitude,
        site.geofenceLatitude,
        site.geofenceLongitude,
        site.geofenceRadiusMeters
      );

      record = AttendanceService.verifySelfie(record, selfieUrl);

      // Default clock-in grace period from settings or constants (15 minutes)
      record = AttendanceService.clockIn(record, shift.startTime, 15);

      // 5. Save updated record
      set((state) => ({
        records: {
          ...state.records,
          isLoading: false,
          data: [...state.records.data, record]
        }
      }));

      // 6. Transition shift status to Active
      await useSchedulingStore.getState().transitionShiftStatus(shiftId, ShiftStatus.Active);

      // 7. Log audit event
      await useAuditStore.getState().recordEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: 'ClockIn' as any,
        entityType: 'AttendanceRecord' as any,
        entityId: record.id,
        siteId: shift.siteId,
        metadata: { latitude, longitude }
      });
    } catch (err: any) {
      set((state) => ({ records: { ...state.records, isLoading: false, error: err.message } }));
      throw err;
    }
  },

  clockOut: async (shiftId, latitude, longitude) => {
    set((state) => ({ records: { ...state.records, isLoading: true, error: null } }));
    try {
      // 1. Find the active clock-in record
      const record = get().records.data.find((r) => r.shiftId === shiftId && !r.clockOutTime);
      if (!record) throw new Error('No active clock-in record found for this shift.');

      const shift = useSchedulingStore.getState().shifts.data.find((s) => s.id === shiftId);
      if (!shift) throw new Error('Shift not found.');

      const site = useClientStore.getState().sites.data.find((s) => s.id === shift.siteId);
      if (!site) throw new Error('Site not found for shift.');

      const actor = useSessionStore.getState().currentUser;
      if (!actor) throw new Error('Unauthenticated user.');

      // 2. Perform clock out validation
      const updatedRecord = AttendanceService.clockOut(
        record,
        latitude,
        longitude,
        site.geofenceLatitude,
        site.geofenceLongitude,
        site.geofenceRadiusMeters,
        shift.endTime
      );

      // 3. Save updated record
      set((state) => ({
        records: {
          ...state.records,
          isLoading: false,
          data: state.records.data.map((r) => (r.id === record.id ? updatedRecord : r))
        }
      }));

      // 4. Transition shift status to Completed
      await useSchedulingStore.getState().transitionShiftStatus(shiftId, ShiftStatus.Completed);

      // 5. Log audit event
      await useAuditStore.getState().recordEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: 'ClockOut' as any,
        entityType: 'AttendanceRecord' as any,
        entityId: record.id,
        siteId: shift.siteId,
        metadata: { latitude, longitude }
      });
    } catch (err: any) {
      set((state) => ({ records: { ...state.records, isLoading: false, error: err.message } }));
      throw err;
    }
  },

  overrideRecord: async (recordId, overrideNote, reviewerId) => {
    set((state) => ({ records: { ...state.records, isLoading: true, error: null } }));
    try {
      const record = get().records.data.find((r) => r.id === recordId);
      if (!record) throw new Error('Attendance record not found.');

      const actor = useSessionStore.getState().currentUser;
      if (!actor) throw new Error('Unauthenticated user.');

      const updatedRecord: AttendanceRecord = {
        ...record,
        overrideNote,
        overriddenBy: reviewerId,
        overriddenAt: new Date().toISOString()
      };

      set((state) => ({
        records: {
          ...state.records,
          isLoading: false,
          data: state.records.data.map((r) => (r.id === recordId ? updatedRecord : r))
        }
      }));

      await useAuditStore.getState().recordEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: 'RoleChanged' as any, // fallback or custom action for override
        entityType: 'AttendanceRecord' as any,
        entityId: recordId,
        metadata: { overrideNote }
      });
    } catch (err: any) {
      set((state) => ({ records: { ...state.records, isLoading: false, error: err.message } }));
      throw err;
    }
  },

  clearError: () => {
    set((state) => ({
      records: { ...state.records, error: null }
    }));
  }
}));
