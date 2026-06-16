import { create } from 'zustand';
import { AsyncState, Shift, ShiftAssignment, ShiftAssignmentEvent, ShiftStatus, Guard, Site, ShiftAssignmentAction } from '../types';
import { SchedulingService, OpenShiftService } from '../services';
import { generateId } from '../lib/utils';
import { useAuditStore } from './useAuditStore';
import { useNotificationStore } from './useNotificationStore';
import { useGuardStore } from './useGuardStore';
import { useClientStore } from './useClientStore';
import { useSessionStore } from './useSessionStore';

export interface SchedulingState {
  shifts: AsyncState<Shift[]>;
  assignments: AsyncState<ShiftAssignment[]>;
  assignmentHistory: ShiftAssignmentEvent[];
}

export interface SchedulingActions {
  fetchShifts: (filters?: { siteId?: string; guardId?: string; status?: ShiftStatus[] }) => Promise<void>;
  createShift: (shiftData: Omit<Shift, 'id'>) => Promise<void>;
  assignShift: (shiftId: string, guardId: string) => Promise<void>;
  acceptShift: (shiftId: string) => Promise<void>;
  rejectShift: (shiftId: string, reason?: string) => Promise<void>;
  claimOpenShift: (shiftId: string) => Promise<void>;
  transitionShiftStatus: (shiftId: string, newStatus: ShiftStatus) => Promise<void>;
  clearError: () => void;
}

export type SchedulingStore = SchedulingState & SchedulingActions;

export const useSchedulingStore = create<SchedulingStore>((set, get) => ({
  shifts: {
    data: [],
    isLoading: false,
    error: null,
    operationLoading: {}
  },
  assignments: {
    data: [],
    isLoading: false,
    error: null,
    operationLoading: {}
  },
  assignmentHistory: [],

  fetchShifts: async (filters) => {
    set((state) => ({ shifts: { ...state.shifts, isLoading: true, error: null } }));
    try {
      // In mock env, we load from current shifts state or fixtures.
      // Filter logic is applied locally.
      let data = get().shifts.data;
      if (filters) {
        if (filters.siteId) data = data.filter((s) => s.siteId === filters.siteId);
        if (filters.guardId) data = data.filter((s) => s.guardId === filters.guardId);
        if (filters.status && filters.status.length > 0) {
          data = data.filter((s) => filters.status!.includes(s.status));
        }
      }
      set((state) => ({ shifts: { ...state.shifts, isLoading: false, data } }));
    } catch (err: any) {
      set((state) => ({ shifts: { ...state.shifts, isLoading: false, error: err.message } }));
    }
  },

  createShift: async (shiftData) => {
    set((state) => ({ shifts: { ...state.shifts, isLoading: true, error: null } }));
    try {
      SchedulingService.transitionShift; // Ensure service exists
      const newShift: Shift = {
        ...shiftData,
        id: `shift-${generateId()}`,
        status: ShiftStatus.Draft,
        version: 1
      };

      set((state) => ({
        shifts: {
          ...state.shifts,
          isLoading: false,
          data: [...state.shifts.data, newShift]
        }
      }));
    } catch (err: any) {
      set((state) => ({ shifts: { ...state.shifts, isLoading: false, error: err.message } }));
      throw err;
    }
  },

  assignShift: async (shiftId, guardId) => {
    set((state) => ({ shifts: { ...state.shifts, isLoading: true, error: null } }));
    try {
      const shift = get().shifts.data.find((s) => s.id === shiftId);
      if (!shift) throw new Error('Shift not found.');

      // Load guard and site context from sibling stores
      const guard = useGuardStore.getState().guards.data.find((g) => g.id === guardId);
      if (!guard) throw new Error('Guard not found.');

      const site = useClientStore.getState().sites.data.find((s) => s.id === shift.siteId);
      if (!site) throw new Error('Site not found.');

      const actor = useSessionStore.getState().currentUser;
      if (!actor) throw new Error('Unauthenticated user.');

      const result = SchedulingService.transitionShift(shift, ShiftStatus.Assigned, {
        guard,
        site,
        actorId: actor.id
      });

      // Update state
      set((state) => ({
        shifts: {
          ...state.shifts,
          isLoading: false,
          data: state.shifts.data.map((s) => (s.id === shiftId ? result.shift : s))
        },
        assignmentHistory: result.event ? [...state.assignmentHistory, result.event] : state.assignmentHistory
      }));

      // Log audit
      await useAuditStore.getState().recordEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: 'ShiftAssigned' as any,
        entityType: 'Shift' as any,
        entityId: shiftId,
        siteId: shift.siteId,
        metadata: { guardId }
      });

      // Notify guard
      if (guard.userId) {
        await useNotificationStore.getState().pushNotification({
          userId: guard.userId,
          type: 'ShiftAssigned' as any,
          priority: 'Normal' as any,
          title: 'Shift Assigned',
          message: `You have been assigned a shift at ${site.name}.`
        });
      }
    } catch (err: any) {
      set((state) => ({ shifts: { ...state.shifts, isLoading: false, error: err.message } }));
      throw err;
    }
  },

  acceptShift: async (shiftId) => {
    set((state) => ({ shifts: { ...state.shifts, isLoading: true, error: null } }));
    try {
      const shift = get().shifts.data.find((s) => s.id === shiftId);
      if (!shift) throw new Error('Shift not found.');

      const actor = useSessionStore.getState().currentUser;
      if (!actor) throw new Error('Unauthenticated user.');

      const result = SchedulingService.transitionShift(shift, ShiftStatus.Accepted, {
        actorId: actor.id
      });

      set((state) => ({
        shifts: {
          ...state.shifts,
          isLoading: false,
          data: state.shifts.data.map((s) => (s.id === shiftId ? result.shift : s))
        },
        assignmentHistory: result.event ? [...state.assignmentHistory, result.event] : state.assignmentHistory
      }));

      await useAuditStore.getState().recordEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: 'ShiftAccepted' as any,
        entityType: 'Shift' as any,
        entityId: shiftId,
        siteId: shift.siteId
      });
    } catch (err: any) {
      set((state) => ({ shifts: { ...state.shifts, isLoading: false, error: err.message } }));
      throw err;
    }
  },

  rejectShift: async (shiftId, reason) => {
    set((state) => ({ shifts: { ...state.shifts, isLoading: true, error: null } }));
    try {
      const shift = get().shifts.data.find((s) => s.id === shiftId);
      if (!shift) throw new Error('Shift not found.');

      const actor = useSessionStore.getState().currentUser;
      if (!actor) throw new Error('Unauthenticated user.');

      // First transition Assigned -> Rejected
      const rejectResult = SchedulingService.transitionShift(shift, ShiftStatus.Rejected, {
        actorId: actor.id,
        reason
      });

      // Next auto-transition Rejected -> Open to put it back in marketplace
      const openResult = SchedulingService.transitionShift(rejectResult.shift, ShiftStatus.Open, {
        actorId: actor.id
      });

      set((state) => ({
        shifts: {
          ...state.shifts,
          isLoading: false,
          data: state.shifts.data.map((s) => (s.id === shiftId ? openResult.shift : s))
        },
        assignmentHistory: rejectResult.event ? [...state.assignmentHistory, rejectResult.event] : state.assignmentHistory
      }));

      await useAuditStore.getState().recordEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: 'ShiftRejected' as any,
        entityType: 'Shift' as any,
        entityId: shiftId,
        siteId: shift.siteId,
        metadata: { reason }
      });
    } catch (err: any) {
      set((state) => ({ shifts: { ...state.shifts, isLoading: false, error: err.message } }));
      throw err;
    }
  },

  claimOpenShift: async (shiftId) => {
    set((state) => ({ shifts: { ...state.shifts, isLoading: true, error: null } }));
    try {
      const shift = get().shifts.data.find((s) => s.id === shiftId);
      if (!shift) throw new Error('Shift not found.');

      const actor = useSessionStore.getState().currentUser;
      if (!actor) throw new Error('Unauthenticated user.');
      if (!actor.guardId) throw new Error('Only guards can claim open shifts.');

      const guard = useGuardStore.getState().guards.data.find((g) => g.id === actor.guardId);
      if (!guard) throw new Error('Guard profile not found.');

      const site = useClientStore.getState().sites.data.find((s) => s.id === shift.siteId);
      if (!site) throw new Error('Site not found.');

      // Check conflicts locally
      const existingShifts = get().shifts.data.filter((s) => s.guardId === guard.id);

      // 1. Validate Open Shift claim
      OpenShiftService.validateClaim(shift, guard, site, existingShifts);

      // 2. Perform transition Open -> Claimed
      const claimResult = SchedulingService.transitionShift(shift, ShiftStatus.Claimed, {
        guard,
        site,
        actorId: actor.id
      });

      // 3. Perform transition Claimed -> Assigned (binds it to guard's schedule as accepted/assigned)
      // Since it's claimed directly, we can auto-transition it to Accepted so it's fully Confirmed for work.
      const acceptResult = SchedulingService.transitionShift(claimResult.shift, ShiftStatus.Accepted, {
        actorId: actor.id
      });

      set((state) => ({
        shifts: {
          ...state.shifts,
          isLoading: false,
          data: state.shifts.data.map((s) => (s.id === shiftId ? acceptResult.shift : s))
        },
        assignmentHistory: claimResult.event ? [...state.assignmentHistory, claimResult.event] : state.assignmentHistory
      }));

      await useAuditStore.getState().recordEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: 'ShiftClaimed' as any,
        entityType: 'Shift' as any,
        entityId: shiftId,
        siteId: shift.siteId
      });
    } catch (err: any) {
      set((state) => ({ shifts: { ...state.shifts, isLoading: false, error: err.message } }));
      throw err;
    }
  },

  transitionShiftStatus: async (shiftId, newStatus) => {
    try {
      const shift = get().shifts.data.find((s) => s.id === shiftId);
      if (!shift) throw new Error('Shift not found.');

      const actor = useSessionStore.getState().currentUser;
      const actorId = actor ? actor.id : 'system';

      const result = SchedulingService.transitionShift(shift, newStatus, {
        actorId
      });

      set((state) => ({
        shifts: {
          ...state.shifts,
          data: state.shifts.data.map((s) => (s.id === shiftId ? result.shift : s))
        },
        assignmentHistory: result.event ? [...state.assignmentHistory, result.event] : state.assignmentHistory
      }));
    } catch (err: any) {
      throw err;
    }
  },

  clearError: () => {
    set((state) => ({
      shifts: { ...state.shifts, error: null },
      assignments: { ...state.assignments, error: null }
    }));
  }
}));
