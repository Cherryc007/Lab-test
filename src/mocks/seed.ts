import { useSchedulingStore } from '../store/useSchedulingStore';
import { useAttendanceStore } from '../store/useAttendanceStore';
import { useGuardStore } from '../store/useGuardStore';
import { useClientStore } from '../store/useClientStore';
import { useActivityLogStore } from '../store/useActivityLogStore';
import { useAuditStore } from '../store/useAuditStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useSessionStore } from '../store/useSessionStore';

import {
  mockGuards,
  mockClients,
  mockSites,
  mockShifts,
  mockAttendanceRecords,
  mockActivityLogs,
  mockAuditEvents,
  mockNotifications,
  mockUsers
} from './index';

/**
 * Seeds the Zustand in-memory stores with realistic Canadian mock data.
 */
export function seedMockDatabase(): void {
  // 1. Roster & Profiles
  useGuardStore.setState({
    guards: { data: mockGuards, isLoading: false, error: null, operationLoading: {} }
  });

  useClientStore.setState({
    clients: { data: mockClients, isLoading: false, error: null, operationLoading: {} },
    sites: { data: mockSites, isLoading: false, error: null, operationLoading: {} }
  });

  // 2. Schedule & Assignments
  useSchedulingStore.setState({
    shifts: { data: mockShifts, isLoading: false, error: null, operationLoading: {} },
    assignments: { data: [], isLoading: false, error: null, operationLoading: {} },
    assignmentHistory: []
  });

  // 3. Attendance Records
  useAttendanceStore.setState({
    records: { data: mockAttendanceRecords, isLoading: false, error: null, operationLoading: {} }
  });

  // 4. Guard Logs
  useActivityLogStore.setState({
    logs: { data: mockActivityLogs, isLoading: false, error: null, operationLoading: {} }
  });

  // 5. System Notifications
  useNotificationStore.setState({
    notifications: { data: mockNotifications, isLoading: false, error: null, operationLoading: {} }
  });

  // 6. Security Audit Log
  useAuditStore.setState({
    entries: mockAuditEvents
  });

  // 7. Active Session
  const defaultUser = mockUsers.find((u) => u.id === 'user-ops-mgr') || null;
  useSessionStore.setState({
    currentUser: defaultUser,
    isAuthenticated: !!defaultUser
  });
}
