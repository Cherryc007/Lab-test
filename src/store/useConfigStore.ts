import { create } from 'zustand';
import { AsyncState, OrganizationSettings } from '../types';

export interface ConfigState {
  settings: AsyncState<OrganizationSettings | null>;
}

export interface ConfigActions {
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<OrganizationSettings>) => Promise<void>;
  clearError: () => void;
}

export type ConfigStore = ConfigState & ConfigActions;

export const useConfigStore = create<ConfigStore>((set, get) => ({
  settings: {
    data: null,
    isLoading: false,
    error: null,
    operationLoading: {}
  },

  fetchSettings: async () => {
    // Stub implementation to satisfy contract
  },
  updateSettings: async (settings) => {
    // Stub implementation to satisfy contract
  },
  clearError: () => {
    set((state) => ({
      settings: { ...state.settings, error: null }
    }));
  }
}));
