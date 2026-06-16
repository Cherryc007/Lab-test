import { create } from 'zustand';
import { AsyncState, LoneWorkerCheckIn, LoneWorkerAlert, CheckInStatus } from '../types';
import { LoneWorkerService } from '../services';
import { useAuditStore } from './useAuditStore';
import { useNotificationStore } from './useNotificationStore';
import { useSessionStore } from './useSessionStore';

export interface LoneWorkerState {
  checkIns: AsyncState<LoneWorkerCheckIn[]>;
  alerts: AsyncState<LoneWorkerAlert[]>;
}

export interface LoneWorkerActions {
  fetchCheckIns: (shiftId?: string) => Promise<void>;
  completeCheckIn: (
    checkInId: string,
    latitude: number,
    longitude: number,
    selfieUrl?: string,
    statusNote?: string
  ) => Promise<void>;
  detectMissed: () => Promise<void>;
  fetchAlerts: () => Promise<void>;
  acknowledgeAlert: (alertId: string, acknowledgedBy: string, resolutionNotes?: string) => Promise<void>;
  clearError: () => void;
}

export type LoneWorkerStore = LoneWorkerState & LoneWorkerActions;

export const useLoneWorkerStore = create<LoneWorkerStore>((set, get) => ({
  checkIns: {
    data: [],
    isLoading: false,
    error: null,
    operationLoading: {}
  },
  alerts: {
    data: [],
    isLoading: false,
    error: null,
    operationLoading: {}
  },

  fetchCheckIns: async (shiftId) => {
    set((state) => ({ checkIns: { ...state.checkIns, isLoading: true, error: null } }));
    try {
      let data = get().checkIns.data;
      if (shiftId) {
        data = data.filter((c) => c.shiftId === shiftId);
      }
      set((state) => ({ checkIns: { ...state.checkIns, isLoading: false, data } }));
    } catch (err: any) {
      set((state) => ({ checkIns: { ...state.checkIns, isLoading: false, error: err.message } }));
    }
  },

  completeCheckIn: async (checkInId, latitude, longitude, selfieUrl, statusNote) => {
    set((state) => ({ checkIns: { ...state.checkIns, isLoading: true, error: null } }));
    try {
      const checkIn = get().checkIns.data.find((c) => c.id === checkInId);
      if (!checkIn) throw new Error('Check-in not found.');

      const actor = useSessionStore.getState().currentUser;
      if (!actor) throw new Error('Unauthenticated user.');

      const updatedCheckIn = LoneWorkerService.completeCheckIn(
        checkIn,
        latitude,
        longitude,
        selfieUrl,
        statusNote
      );

      set((state) => ({
        checkIns: {
          ...state.checkIns,
          isLoading: false,
          data: state.checkIns.data.map((c) => (c.id === checkInId ? updatedCheckIn : c))
        }
      }));

      await useAuditStore.getState().recordEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: 'CheckInCompleted' as any,
        entityType: 'LoneWorkerCheckIn' as any,
        entityId: checkInId,
        metadata: { latitude, longitude }
      });
    } catch (err: any) {
      set((state) => ({ checkIns: { ...state.checkIns, isLoading: false, error: err.message } }));
      throw err;
    }
  },

  detectMissed: async () => {
    try {
      const now = new Date().toISOString();
      // Grace period for missed: 10 minutes
      const gracePeriodMinutes = 10;
      // Grace period for escalation: 15 minutes
      const escalationGracePeriodMinutes = 15;

      const currentCheckIns = get().checkIns.data;
      const updatedCheckIns: LoneWorkerCheckIn[] = [];
      const newAlerts: LoneWorkerAlert[] = [];

      for (const checkIn of currentCheckIns) {
        let updated = { ...checkIn };

        // 1. Evaluate missed status
        const evaluatedStatus = LoneWorkerService.evaluateCheckIn(checkIn, now, gracePeriodMinutes);
        if (evaluatedStatus !== checkIn.status) {
          updated.status = evaluatedStatus;
          
          if (evaluatedStatus === CheckInStatus.Missed) {
            // Log audit event for missed check-in
            await useAuditStore.getState().recordEvent({
              actorId: 'system',
              actorRole: 'SystemAdmin' as any,
              action: 'CheckInMissed' as any,
              entityType: 'LoneWorkerCheckIn' as any,
              entityId: checkIn.id
            });
          }
        }

        // 2. Evaluate escalation status
        const escalationResult = LoneWorkerService.escalateCheckIn(updated, now, escalationGracePeriodMinutes);
        updated = escalationResult.checkIn;

        if (escalationResult.alert) {
          newAlerts.push(escalationResult.alert);

          // Raise critical notification
          await useNotificationStore.getState().pushNotification({
            userId: 'user-ops-mgr', // dispatcher or supervisor
            type: 'LoneWorkerAlert' as any,
            priority: 'Critical' as any,
            title: 'Critical: Lone Worker Missed Check-In',
            message: `Guard ${checkIn.guardId} has missed a scheduled lone worker check-in.`
          });
        }

        updatedCheckIns.push(updated);
      }

      set((state) => ({
        checkIns: { ...state.checkIns, data: updatedCheckIns },
        alerts: { ...state.alerts, data: [...state.alerts.data, ...newAlerts] }
      }));
    } catch (err: any) {
      // Background checks should not throw to crush app, just log
      console.error('Lone worker background scan error:', err);
    }
  },

  fetchAlerts: async () => {
    set((state) => ({ alerts: { ...state.alerts, isLoading: true, error: null } }));
    try {
      const data = get().alerts.data;
      set((state) => ({ alerts: { ...state.alerts, isLoading: false, data } }));
    } catch (err: any) {
      set((state) => ({ alerts: { ...state.alerts, isLoading: false, error: err.message } }));
    }
  },

  acknowledgeAlert: async (alertId, acknowledgedBy, resolutionNotes) => {
    set((state) => ({ alerts: { ...state.alerts, isLoading: true, error: null } }));
    try {
      const alert = get().alerts.data.find((a) => a.id === alertId);
      if (!alert) throw new Error('Alert not found.');

      const actor = useSessionStore.getState().currentUser;
      if (!actor) throw new Error('Unauthenticated user.');

      const updatedAlert = LoneWorkerService.resolveAlert(
        alert,
        acknowledgedBy,
        resolutionNotes || 'Resolved by dispatcher contact.'
      );

      // Also mark the corresponding check-in resolved (or keep it escalated but acknowledged)
      const checkIns = get().checkIns.data.map((c) =>
        c.id === alert.checkInId ? { ...c, status: CheckInStatus.Completed } : c
      );

      set((state) => ({
        alerts: {
          ...state.alerts,
          isLoading: false,
          data: state.alerts.data.map((a) => (a.id === alertId ? updatedAlert : a))
        },
        checkIns: {
          ...state.checkIns,
          data: checkIns
        }
      }));

      await useAuditStore.getState().recordEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: 'AlertAcknowledged' as any,
        entityType: 'LoneWorkerAlert' as any,
        entityId: alertId,
        metadata: { resolutionNotes }
      });
    } catch (err: any) {
      set((state) => ({ alerts: { ...state.alerts, isLoading: false, error: err.message } }));
      throw err;
    }
  },

  clearError: () => {
    set((state) => ({
      checkIns: { ...state.checkIns, error: null },
      alerts: { ...state.alerts, error: null }
    }));
  }
}));
