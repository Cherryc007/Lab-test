import { User } from './models';

export interface SessionState {
  currentUser: User | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
}
