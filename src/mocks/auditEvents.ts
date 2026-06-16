import { AuditEvent, UserRole, AuditAction, AuditEntityType } from '../types';

export const mockAuditEvents: AuditEvent[] = [
  {
    id: 'audit-1',
    organizationId: 'org-guardon-canada',
    timestamp: '2026-06-16T07:00:00Z',
    actorId: 'user-ops-mgr',
    actorRole: UserRole.OperationsManager,
    action: AuditAction.ShiftCreated,
    entityType: AuditEntityType.Shift,
    entityId: 'shift-completed-eaton',
    siteId: 'site-eaton-centre',
    metadata: { notes: 'Shift created for Cf Toronto Eaton Centre lobby duty' }
  },
  {
    id: 'audit-2',
    organizationId: 'org-guardon-canada',
    timestamp: '2026-06-16T07:55:00Z',
    actorId: 'user-jp-tremblay',
    actorRole: UserRole.Guard,
    action: AuditAction.ClockIn,
    entityType: AuditEntityType.AttendanceRecord,
    entityId: 'att-completed-eaton',
    siteId: 'site-eaton-centre',
    metadata: { latitude: 43.65395, longitude: -79.38032 }
  }
];
