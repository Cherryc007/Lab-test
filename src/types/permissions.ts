import { UserRole, Capability, PermissionAction, PermissionScope } from './enums';
import { User } from './models';

export interface PermissionGrant {
  actions: PermissionAction[];
  scope: PermissionScope;
}

export type RolePermissionMap = Record<Capability, PermissionGrant>;

export interface ScopeContext {
  siteId?: string | null;
  guardId?: string | null;
  userId?: string | null;
}

export type CanAccessFn = (role: UserRole, capability: Capability) => PermissionGrant;

export type ApplyScopeFn = <T>(
  data: T[],
  grant: PermissionGrant,
  currentUser: User,
  getSiteId: (item: T) => string | null,
  getGuardId?: (item: T) => string | null
) => T[];
