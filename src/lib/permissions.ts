import {
  UserRole,
  Capability,
  PermissionAction,
  PermissionScope,
  PermissionGrant,
  User
} from '../types';

export const ROLE_PERMISSIONS: Record<UserRole, Record<Capability, PermissionGrant>> = {
  [UserRole.Guard]: {
    [Capability.ViewOwnShifts]: { actions: [PermissionAction.Read], scope: PermissionScope.Self },
    [Capability.ViewFullSchedule]: { actions: [], scope: PermissionScope.None },
    [Capability.AssignShifts]: { actions: [], scope: PermissionScope.None },
    [Capability.AcceptRejectShift]: { actions: [PermissionAction.Update], scope: PermissionScope.Self },
    [Capability.ClaimOpenShift]: { actions: [PermissionAction.Update], scope: PermissionScope.Self },
    [Capability.ClockInOut]: { actions: [PermissionAction.Create, PermissionAction.Update], scope: PermissionScope.Self },
    [Capability.ViewLiveAttendance]: { actions: [], scope: PermissionScope.None },
    [Capability.LoneWorkerCheckIn]: { actions: [PermissionAction.Create], scope: PermissionScope.Self },
    [Capability.ViewLoneWorkerAlerts]: { actions: [], scope: PermissionScope.None },
    [Capability.SubmitActivityLog]: { actions: [PermissionAction.Create], scope: PermissionScope.Self },
    [Capability.ReviewActivityLogs]: { actions: [], scope: PermissionScope.None },
    [Capability.ManageGuardRoster]: { actions: [], scope: PermissionScope.None },
    [Capability.ManageClientSiteRoster]: { actions: [], scope: PermissionScope.None },
    [Capability.ViewDashboards]: { actions: [PermissionAction.Read], scope: PermissionScope.Self },
    [Capability.ManageRoles]: { actions: [], scope: PermissionScope.None },
    [Capability.ManageSystemConfig]: { actions: [], scope: PermissionScope.None }
  },
  [UserRole.Dispatcher]: {
    [Capability.ViewOwnShifts]: { actions: [], scope: PermissionScope.None },
    [Capability.ViewFullSchedule]: { actions: [PermissionAction.Create, PermissionAction.Read, PermissionAction.Update, PermissionAction.Delete], scope: PermissionScope.All },
    [Capability.AssignShifts]: { actions: [PermissionAction.Update], scope: PermissionScope.All },
    [Capability.AcceptRejectShift]: { actions: [], scope: PermissionScope.None },
    [Capability.ClaimOpenShift]: { actions: [], scope: PermissionScope.None },
    [Capability.ClockInOut]: { actions: [], scope: PermissionScope.None },
    [Capability.ViewLiveAttendance]: { actions: [PermissionAction.Read], scope: PermissionScope.All },
    [Capability.LoneWorkerCheckIn]: { actions: [], scope: PermissionScope.None },
    [Capability.ViewLoneWorkerAlerts]: { actions: [PermissionAction.Read, PermissionAction.Update], scope: PermissionScope.All },
    [Capability.SubmitActivityLog]: { actions: [], scope: PermissionScope.None },
    [Capability.ReviewActivityLogs]: { actions: [PermissionAction.Update], scope: PermissionScope.All },
    [Capability.ManageGuardRoster]: { actions: [PermissionAction.Read], scope: PermissionScope.All },
    [Capability.ManageClientSiteRoster]: { actions: [PermissionAction.Read], scope: PermissionScope.All },
    [Capability.ViewDashboards]: { actions: [PermissionAction.Read], scope: PermissionScope.All },
    [Capability.ManageRoles]: { actions: [], scope: PermissionScope.None },
    [Capability.ManageSystemConfig]: { actions: [], scope: PermissionScope.None }
  },
  [UserRole.Supervisor]: {
    [Capability.ViewOwnShifts]: { actions: [], scope: PermissionScope.None },
    [Capability.ViewFullSchedule]: { actions: [PermissionAction.Read], scope: PermissionScope.AssignedSites },
    [Capability.AssignShifts]: { actions: [PermissionAction.Update], scope: PermissionScope.AssignedSites },
    [Capability.AcceptRejectShift]: { actions: [], scope: PermissionScope.None },
    [Capability.ClaimOpenShift]: { actions: [], scope: PermissionScope.None },
    [Capability.ClockInOut]: { actions: [], scope: PermissionScope.None },
    [Capability.ViewLiveAttendance]: { actions: [PermissionAction.Read], scope: PermissionScope.AssignedSites },
    [Capability.LoneWorkerCheckIn]: { actions: [], scope: PermissionScope.None },
    [Capability.ViewLoneWorkerAlerts]: { actions: [PermissionAction.Read, PermissionAction.Update], scope: PermissionScope.AssignedSites },
    [Capability.SubmitActivityLog]: { actions: [], scope: PermissionScope.None },
    [Capability.ReviewActivityLogs]: { actions: [PermissionAction.Update], scope: PermissionScope.AssignedSites },
    [Capability.ManageGuardRoster]: { actions: [PermissionAction.Read], scope: PermissionScope.All },
    [Capability.ManageClientSiteRoster]: { actions: [PermissionAction.Read], scope: PermissionScope.All },
    [Capability.ViewDashboards]: { actions: [PermissionAction.Read], scope: PermissionScope.AssignedSites },
    [Capability.ManageRoles]: { actions: [], scope: PermissionScope.None },
    [Capability.ManageSystemConfig]: { actions: [], scope: PermissionScope.None }
  },
  [UserRole.OperationsManager]: {
    [Capability.ViewOwnShifts]: { actions: [], scope: PermissionScope.None },
    [Capability.ViewFullSchedule]: { actions: [PermissionAction.Create, PermissionAction.Read, PermissionAction.Update, PermissionAction.Delete], scope: PermissionScope.All },
    [Capability.AssignShifts]: { actions: [PermissionAction.Update], scope: PermissionScope.All },
    [Capability.AcceptRejectShift]: { actions: [], scope: PermissionScope.None },
    [Capability.ClaimOpenShift]: { actions: [], scope: PermissionScope.None },
    [Capability.ClockInOut]: { actions: [], scope: PermissionScope.None },
    [Capability.ViewLiveAttendance]: { actions: [PermissionAction.Read], scope: PermissionScope.All },
    [Capability.LoneWorkerCheckIn]: { actions: [], scope: PermissionScope.None },
    [Capability.ViewLoneWorkerAlerts]: { actions: [PermissionAction.Read, PermissionAction.Update], scope: PermissionScope.All },
    [Capability.SubmitActivityLog]: { actions: [], scope: PermissionScope.None },
    [Capability.ReviewActivityLogs]: { actions: [PermissionAction.Update], scope: PermissionScope.All },
    [Capability.ManageGuardRoster]: { actions: [PermissionAction.Create, PermissionAction.Read, PermissionAction.Update, PermissionAction.Delete], scope: PermissionScope.All },
    [Capability.ManageClientSiteRoster]: { actions: [PermissionAction.Create, PermissionAction.Read, PermissionAction.Update, PermissionAction.Delete], scope: PermissionScope.All },
    [Capability.ViewDashboards]: { actions: [PermissionAction.Read], scope: PermissionScope.All },
    [Capability.ManageRoles]: { actions: [PermissionAction.Read], scope: PermissionScope.All },
    [Capability.ManageSystemConfig]: { actions: [], scope: PermissionScope.None }
  },
  [UserRole.ClientContact]: {
    [Capability.ViewOwnShifts]: { actions: [], scope: PermissionScope.None },
    [Capability.ViewFullSchedule]: { actions: [PermissionAction.Read], scope: PermissionScope.AssignedSites },
    [Capability.AssignShifts]: { actions: [], scope: PermissionScope.None },
    [Capability.AcceptRejectShift]: { actions: [], scope: PermissionScope.None },
    [Capability.ClaimOpenShift]: { actions: [], scope: PermissionScope.None },
    [Capability.ClockInOut]: { actions: [], scope: PermissionScope.None },
    [Capability.ViewLiveAttendance]: { actions: [PermissionAction.Read], scope: PermissionScope.AssignedSites },
    [Capability.LoneWorkerCheckIn]: { actions: [], scope: PermissionScope.None },
    [Capability.ViewLoneWorkerAlerts]: { actions: [], scope: PermissionScope.None },
    [Capability.SubmitActivityLog]: { actions: [], scope: PermissionScope.None },
    [Capability.ReviewActivityLogs]: { actions: [PermissionAction.Read], scope: PermissionScope.AssignedSites },
    [Capability.ManageGuardRoster]: { actions: [], scope: PermissionScope.None },
    [Capability.ManageClientSiteRoster]: { actions: [], scope: PermissionScope.None },
    [Capability.ViewDashboards]: { actions: [PermissionAction.Read], scope: PermissionScope.AssignedSites },
    [Capability.ManageRoles]: { actions: [], scope: PermissionScope.None },
    [Capability.ManageSystemConfig]: { actions: [], scope: PermissionScope.None }
  },
  [UserRole.SystemAdmin]: {
    [Capability.ViewOwnShifts]: { actions: [], scope: PermissionScope.None },
    [Capability.ViewFullSchedule]: { actions: [PermissionAction.Create, PermissionAction.Read, PermissionAction.Update, PermissionAction.Delete], scope: PermissionScope.All },
    [Capability.AssignShifts]: { actions: [PermissionAction.Update], scope: PermissionScope.All },
    [Capability.AcceptRejectShift]: { actions: [], scope: PermissionScope.None },
    [Capability.ClaimOpenShift]: { actions: [], scope: PermissionScope.None },
    [Capability.ClockInOut]: { actions: [], scope: PermissionScope.None },
    [Capability.ViewLiveAttendance]: { actions: [PermissionAction.Read], scope: PermissionScope.All },
    [Capability.LoneWorkerCheckIn]: { actions: [], scope: PermissionScope.None },
    [Capability.ViewLoneWorkerAlerts]: { actions: [PermissionAction.Read, PermissionAction.Update], scope: PermissionScope.All },
    [Capability.SubmitActivityLog]: { actions: [], scope: PermissionScope.None },
    [Capability.ReviewActivityLogs]: { actions: [PermissionAction.Update], scope: PermissionScope.All },
    [Capability.ManageGuardRoster]: { actions: [PermissionAction.Create, PermissionAction.Read, PermissionAction.Update, PermissionAction.Delete], scope: PermissionScope.All },
    [Capability.ManageClientSiteRoster]: { actions: [PermissionAction.Create, PermissionAction.Read, PermissionAction.Update, PermissionAction.Delete], scope: PermissionScope.All },
    [Capability.ViewDashboards]: { actions: [PermissionAction.Read], scope: PermissionScope.All },
    [Capability.ManageRoles]: { actions: [PermissionAction.Create, PermissionAction.Read, PermissionAction.Update, PermissionAction.Delete], scope: PermissionScope.All },
    [Capability.ManageSystemConfig]: { actions: [PermissionAction.Create, PermissionAction.Read, PermissionAction.Update, PermissionAction.Delete], scope: PermissionScope.All }
  }
};

export function canAccess(role: UserRole, capability: Capability): PermissionGrant {
  return ROLE_PERMISSIONS[role][capability] || { actions: [], scope: PermissionScope.None };
}

export function applyScopeFilter<T>(
  data: T[],
  grant: PermissionGrant,
  currentUser: User,
  getSiteId: (item: T) => string | null,
  getGuardId?: (item: T) => string | null
): T[] {
  if (grant.scope === PermissionScope.None || grant.actions.length === 0) return [];
  if (grant.scope === PermissionScope.All) return data;

  if (grant.scope === PermissionScope.AssignedSites) {
    const allowedSites = new Set([
      ...(currentUser.supervisorSiteIds || []),
      ...(currentUser.clientContactSiteIds || [])
    ]);
    return data.filter((item) => {
      const siteId = getSiteId(item);
      return siteId && allowedSites.has(siteId);
    });
  }

  if (grant.scope === PermissionScope.Self) {
    return data.filter((item) => {
      const guardId = getGuardId ? getGuardId(item) : null;
      return guardId && guardId === currentUser.guardId;
    });
  }

  return [];
}
