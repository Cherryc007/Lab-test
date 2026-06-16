/**
 * GuardOn — Shared Enums
 */

export enum UserRole {
  Guard = 'Guard',
  Dispatcher = 'Dispatcher',
  Supervisor = 'Supervisor',
  OperationsManager = 'OperationsManager',
  ClientContact = 'ClientContact',
  SystemAdmin = 'SystemAdmin'
}

export enum ShiftStatus {
  Draft = 'Draft',
  Unassigned = 'Unassigned',
  Assigned = 'Assigned',
  Accepted = 'Accepted',
  Confirmed = 'Confirmed',
  Open = 'Open',
  Rejected = 'Rejected',
  Claimed = 'Claimed',
  Active = 'Active',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}



export enum AttendanceFlag {
  OnTime = 'OnTime',
  Late = 'Late',
  Missed = 'Missed',
  EarlyClockOut = 'EarlyClockOut',
  OutOfGeofence = 'OutOfGeofence'
}

export enum LoneWorkerStatus {
  Active = 'Active',
  Missed = 'Missed',
  Escalated = 'Escalated',
  Resolved = 'Resolved'
}

export enum NotificationType {
  ShiftAssigned = 'ShiftAssigned',
  ShiftChanged = 'ShiftChanged',
  ShiftClaimed = 'ShiftClaimed',
  LoneWorkerAlert = 'LoneWorkerAlert',
  ActivityLogReviewed = 'ActivityLogReviewed',
  General = 'General'
}

export enum NotificationPriority {
  Low = 'Low',
  Normal = 'Normal',
  High = 'High',
  Critical = 'Critical'
}

export enum GpsValidationResult {
  WithinGeofence = 'WithinGeofence',
  OutOfGeofence = 'OutOfGeofence',
  Unavailable = 'Unavailable'
}

export enum PermissionAction {
  Create = 'Create',
  Read = 'Read',
  Update = 'Update',
  Delete = 'Delete'
}

export enum PermissionScope {
  All = 'All',
  AssignedSites = 'AssignedSites',
  Self = 'Self',
  None = 'None'
}

export enum Capability {
  ViewOwnShifts = 'ViewOwnShifts',
  ViewFullSchedule = 'ViewFullSchedule',
  AssignShifts = 'AssignShifts',
  AcceptRejectShift = 'AcceptRejectShift',
  ClaimOpenShift = 'ClaimOpenShift',
  ClockInOut = 'ClockInOut',
  ViewLiveAttendance = 'ViewLiveAttendance',
  LoneWorkerCheckIn = 'LoneWorkerCheckIn',
  ViewLoneWorkerAlerts = 'ViewLoneWorkerAlerts',
  SubmitActivityLog = 'SubmitActivityLog',
  ReviewActivityLogs = 'ReviewActivityLogs',
  ManageGuardRoster = 'ManageGuardRoster',
  ManageClientSiteRoster = 'ManageClientSiteRoster',
  ViewDashboards = 'ViewDashboards',
  ManageRoles = 'ManageRoles',
  ManageSystemConfig = 'ManageSystemConfig'
}

export enum AuditAction {
  ShiftCreated = 'ShiftCreated',
  ShiftAssigned = 'ShiftAssigned',
  ShiftAccepted = 'ShiftAccepted',
  ShiftRejected = 'ShiftRejected',
  ShiftClaimed = 'ShiftClaimed',
  ShiftReassigned = 'ShiftReassigned',
  ShiftStatusTransitioned = 'ShiftStatusTransitioned',
  ClockIn = 'ClockIn',
  ClockOut = 'ClockOut',
  CheckInCompleted = 'CheckInCompleted',
  CheckInMissed = 'CheckInMissed',
  AlertAcknowledged = 'AlertAcknowledged',
  ActivityLogSubmitted = 'ActivityLogSubmitted',
  ActivityLogReviewed = 'ActivityLogReviewed',
  RoleChanged = 'RoleChanged',
  SensitiveDataAccessed = 'SensitiveDataAccessed'
}

export enum AuditEntityType {
  Shift = 'Shift',
  AttendanceRecord = 'AttendanceRecord',
  LoneWorkerCheckIn = 'LoneWorkerCheckIn',
  LoneWorkerAlert = 'LoneWorkerAlert',
  ActivityLog = 'ActivityLog',
  Guard = 'Guard',
  Client = 'Client',
  Site = 'Site',
  User = 'User'
}

export enum ShiftAssignmentAction {
  Assigned = 'Assigned',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  Claimed = 'Claimed',
  Reassigned = 'Reassigned'
}

export enum AssignmentStatus {
  Offered = 'Offered',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled'
}

export enum ActivityLogCategory {
  Incident = 'Incident',
  Observation = 'Observation',
  Routine = 'Routine'
}

export enum ActivityLogReviewStatus {
  Pending = 'Pending',
  Reviewed = 'Reviewed'
}

export enum GuardStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  OnLeave = 'OnLeave'
}

export enum SiteStatus {
  Active = 'Active',
  Inactive = 'Inactive'
}

export enum ClientStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Suspended = 'Suspended'
}

export enum CheckInStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Missed = 'Missed',
  Escalated = 'Escalated'
}

