import { create } from 'zustand';
import { AsyncState, ActivityLog, ActivityLogReviewStatus } from '../types';
import { ActivityLogService } from '../services';
import { useSchedulingStore } from './useSchedulingStore';
import { useAuditStore } from './useAuditStore';
import { useSessionStore } from './useSessionStore';

export interface ActivityLogState {
  logs: AsyncState<ActivityLog[]>;
}

export interface ActivityLogActions {
  fetchLogs: (filters?: { siteId?: string; guardId?: string; reviewStatus?: ActivityLogReviewStatus }) => Promise<void>;
  submitLog: (logData: Omit<ActivityLog, 'id' | 'createdAt' | 'reviewStatus'>) => Promise<void>;
  reviewLog: (logId: string, reviewedBy: string, status: ActivityLogReviewStatus) => Promise<void>;
  clearError: () => void;
}

export type ActivityLogStore = ActivityLogState & ActivityLogActions;

export const useActivityLogStore = create<ActivityLogStore>((set, get) => ({
  logs: {
    data: [],
    isLoading: false,
    error: null,
    operationLoading: {}
  },

  fetchLogs: async (filters) => {
    set((state) => ({ logs: { ...state.logs, isLoading: true, error: null } }));
    try {
      let data = get().logs.data;
      if (filters) {
        if (filters.siteId) data = data.filter((l) => l.siteId === filters.siteId);
        if (filters.guardId) data = data.filter((l) => l.guardId === filters.guardId);
        if (filters.reviewStatus) data = data.filter((l) => l.reviewStatus === filters.reviewStatus);
      }
      set((state) => ({ logs: { ...state.logs, isLoading: false, data } }));
    } catch (err: any) {
      set((state) => ({ logs: { ...state.logs, isLoading: false, error: err.message } }));
    }
  },

  submitLog: async (logData) => {
    set((state) => ({ logs: { ...state.logs, isLoading: true, error: null } }));
    try {
      // Get shift from scheduling store
      const shift = useSchedulingStore.getState().shifts.data.find((s) => s.id === logData.shiftId);
      if (!shift) throw new Error('Shift not found.');

      const actor = useSessionStore.getState().currentUser;
      if (!actor) throw new Error('Unauthenticated user.');

      // Create new activity log via service
      const log = ActivityLogService.createLog(
        shift,
        logData.content,
        logData.category,
        logData.latitude,
        logData.longitude
      );

      set((state) => ({
        logs: {
          ...state.logs,
          isLoading: false,
          data: [...state.logs.data, log]
        }
      }));

      await useAuditStore.getState().recordEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: 'ActivityLogSubmitted' as any,
        entityType: 'ActivityLog' as any,
        entityId: log.id,
        siteId: shift.siteId
      });
    } catch (err: any) {
      set((state) => ({ logs: { ...state.logs, isLoading: false, error: err.message } }));
      throw err;
    }
  },

  reviewLog: async (logId, reviewedBy, status) => {
    set((state) => ({ logs: { ...state.logs, isLoading: true, error: null } }));
    try {
      const log = get().logs.data.find((l) => l.id === logId);
      if (!log) throw new Error('Activity log not found.');

      const actor = useSessionStore.getState().currentUser;
      if (!actor) throw new Error('Unauthenticated user.');

      // Perform review update
      const updatedLog = ActivityLogService.reviewLog(log, reviewedBy);

      set((state) => ({
        logs: {
          ...state.logs,
          isLoading: false,
          data: state.logs.data.map((l) => (l.id === logId ? updatedLog : l))
        }
      }));

      await useAuditStore.getState().recordEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: 'ActivityLogReviewed' as any,
        entityType: 'ActivityLog' as any,
        entityId: logId,
        siteId: log.siteId
      });
    } catch (err: any) {
      set((state) => ({ logs: { ...state.logs, isLoading: false, error: err.message } }));
      throw err;
    }
  },

  clearError: () => {
    set((state) => ({
      logs: { ...state.logs, error: null }
    }));
  }
}));
