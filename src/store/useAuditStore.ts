import { create } from 'zustand';
import { AuditEvent } from '../types';
import { AuditService } from '../services';

export interface AuditState {
  entries: AuditEvent[];
}

export interface AuditActions {
  recordEvent: (event: Omit<AuditEvent, 'id' | 'timestamp' | 'organizationId'>) => Promise<void>;
  fetchEntries: (filters?: { siteId?: string; actorId?: string }) => Promise<void>;
}

export type AuditStore = AuditState & AuditActions;

export const useAuditStore = create<AuditStore>((set, get) => ({
  entries: [],

  recordEvent: async (eventData) => {
    try {
      const organizationId = 'org-guardon-canada'; // default mock organization
      
      const newEvent = AuditService.createEvent(
        organizationId,
        eventData.actorId,
        eventData.actorRole,
        eventData.action,
        eventData.entityType,
        eventData.entityId,
        eventData.siteId,
        eventData.metadata
      );

      // Append frozen event to list
      set((state) => ({
        entries: [...state.entries, newEvent]
      }));
    } catch (err: any) {
      console.error('Audit recording failed:', err);
    }
  },

  fetchEntries: async (filters) => {
    // In mock/local env, filters are applied locally.
    let data = get().entries;
    if (filters) {
      if (filters.siteId) data = data.filter((e) => e.siteId === filters.siteId);
      if (filters.actorId) data = data.filter((e) => e.actorId === filters.actorId);
    }
    // Set returned entries
    set({ entries: data });
  }
}));
