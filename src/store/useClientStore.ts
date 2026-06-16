import { create } from 'zustand';
import { AsyncState, Client, Site } from '../types';

export interface ClientState {
  clients: AsyncState<Client[]>;
  sites: AsyncState<Site[]>;
}

export interface ClientActions {
  fetchClients: () => Promise<void>;
  createClient: (client: Omit<Client, 'id'>) => Promise<void>;
  updateClient: (clientId: string, client: Partial<Client>) => Promise<void>;
  fetchSites: (clientId?: string) => Promise<void>;
  createSite: (site: Omit<Site, 'id'>) => Promise<void>;
  updateSite: (siteId: string, site: Partial<Site>) => Promise<void>;
  updateGeofence: (siteId: string, latitude: number, longitude: number, radiusMeters: number) => Promise<void>;
  clearError: () => void;
}

export type ClientStore = ClientState & ClientActions;

export const useClientStore = create<ClientStore>((set, get) => ({
  clients: {
    data: [],
    isLoading: false,
    error: null,
    operationLoading: {}
  },
  sites: {
    data: [],
    isLoading: false,
    error: null,
    operationLoading: {}
  },

  fetchClients: async () => {
    // Stub implementation to satisfy contract
  },
  createClient: async (client) => {
    // Stub implementation to satisfy contract
  },
  updateClient: async (clientId, client) => {
    // Stub implementation to satisfy contract
  },
  fetchSites: async (clientId) => {
    // Stub implementation to satisfy contract
  },
  createSite: async (site) => {
    // Stub implementation to satisfy contract
  },
  updateSite: async (siteId, site) => {
    // Stub implementation to satisfy contract
  },
  updateGeofence: async (siteId, latitude, longitude, radiusMeters) => {
    // Stub implementation to satisfy contract
  },
  clearError: () => {
    set((state) => ({
      clients: { ...state.clients, error: null },
      sites: { ...state.sites, error: null }
    }));
  }
}));
