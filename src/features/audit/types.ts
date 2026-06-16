import { AuditAction, AuditEntityType } from '../../types';

export interface AuditQueryFilters {
  siteId?: string;
  actorId?: string;
  entityType?: AuditEntityType;
  startDate?: string;
  endDate?: string;
}

export interface RecordAuditEventInput {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  siteId?: string;
  metadata?: Record<string, any>;
}
