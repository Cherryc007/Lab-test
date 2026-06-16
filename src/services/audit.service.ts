import { AuditEvent, UserRole, AuditAction, AuditEntityType } from '../types';
import { generateId } from '../lib/utils';

/**
 * Audit Service (Business Logic Only)
 */
export class AuditService {
  /**
   * Generates a frozen, immutable audit event record.
   */
  public static createEvent(
    organizationId: string,
    actorId: string,
    actorRole: UserRole,
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: string,
    siteId?: string | null,
    metadata?: Record<string, any> | null
  ): Readonly<AuditEvent> {
    const event: AuditEvent = {
      id: `audit-${generateId()}`,
      organizationId,
      timestamp: new Date().toISOString(),
      actorId,
      actorRole,
      action,
      entityType,
      entityId,
      siteId: siteId || null,
      metadata: metadata || null
    };

    // Runtime enforcement of immutability
    return Object.freeze(event);
  }
}
