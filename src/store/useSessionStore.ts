import { create } from 'zustand';
import { User, UserRole, SessionState } from '../types';

export interface SessionActions {
  login: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
}


export type SessionStore = SessionState & SessionActions;

export const useSessionStore = create<SessionStore>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,

  login: async (userId) => {
    // Stub implementation to satisfy contract
  },
  logout: async () => {
    // Stub implementation to satisfy contract
  },
  switchRole: async (role) => {
    // Stub implementation to satisfy contract
  }
}));
