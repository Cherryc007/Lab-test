import { create } from 'zustand';
import { AsyncState, Guard, GuardStatus } from '../types';

export interface GuardState {
  guards: AsyncState<Guard[]>;
}

export interface GuardActions {
  fetchGuards: () => Promise<void>;
  createGuard: (guard: Omit<Guard, 'id' | 'userId'> & { userId: string }) => Promise<void>;
  updateGuard: (guardId: string, guard: Partial<Guard>) => Promise<void>;
  setStatus: (guardId: string, status: GuardStatus) => Promise<void>;
  updateEligibility: (guardId: string, siteIds: string[]) => Promise<void>;
  clearError: () => void;
}

export type GuardStore = GuardState & GuardActions;

export const useGuardStore = create<GuardStore>((set, get) => ({
  guards: {
    data: [],
    isLoading: false,
    error: null,
    operationLoading: {}
  },

  fetchGuards: async () => {
    // Stub implementation to satisfy contract
  },
  createGuard: async (guard) => {
    // Stub implementation to satisfy contract
  },
  updateGuard: async (guardId, guard) => {
    // Stub implementation to satisfy contract
  },
  setStatus: async (guardId, status) => {
    // Stub implementation to satisfy contract
  },
  updateEligibility: async (guardId, siteIds) => {
    // Stub implementation to satisfy contract
  },
  clearError: () => {
    set((state) => ({
      guards: { ...state.guards, error: null }
    }));
  }
}));
