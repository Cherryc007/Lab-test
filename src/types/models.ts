import {
  UserRole,
  ShiftStatus,
  AttendanceFlag,
  GpsValidationResult,
  CheckInStatus,
  ActivityLogCategory,
  ActivityLogReviewStatus,
  NotificationType,
  NotificationPriority,
  AuditAction,
  AuditEntityType,
  ShiftAssignmentAction,
  AssignmentStatus,
  GuardStatus,
  SiteStatus,
  ClientStatus,
  PermissionAction,
  PermissionScope,
  Capability
} from './enums';

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

export interface OrganizationSettings {
  id: string;
  organizationId: string;
  defaultGeofenceRadiusMeters: number;
  clockInGracePeriodMinutes: number;
  loneWorkerGracePeriodMinutes: number;
  clockInOutWindowMinutes: number;
  updatedBy?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: string;
  guardId?: string | null;
  phone?: string | null;
  supervisorSiteIds?: string[] | null;
  clientContactSiteIds?: string[] | null;
}

export interface Guard {
  id: string;
  userId: string;
  status: GuardStatus;
  licenseNumber: string;
  licenseExpiryDate: string;
  eligibleSiteIds: string[];
  certifications?: string[];
  notes?: string;
}

export interface Client {
  id: string;
  organizationId: string;
  name: string;
  status: ClientStatus;
  primaryContactName: string;
  primaryContactEmail: string;
  billingAddress?: string;
  notes?: string;
}

export interface Site {
  id: string;
  clientId: string;
  name: string;
  address: string;
  status: SiteStatus;
  geofenceLatitude: number;
  geofenceLongitude: number;
  geofenceRadiusMeters: number;
  coverageNotes?: string;
}

export interface Shift {
  id: string;
  siteId: string;
  status: ShiftStatus;
  startTime: string;
  endTime: string;
  isLoneWorker: boolean;
  guardId?: string | null;
  checkInIntervalMinutes?: number | null;
  notes?: string;
  version?: number;
}

export interface ShiftAssignment {
  id: string;
  shiftId: string;
  guardId: string;
  status: AssignmentStatus;
  assignedAt: string;
  respondedAt?: string | null;
  feedback?: string | null;
}

export interface ShiftAssignmentEvent {
  id: string;
  shiftId: string;
  guardId: string;
  action: ShiftAssignmentAction;
  actorId: string;
  timestamp: string;
  reason?: string | null;
}

export interface GpsCoordinate {
  latitude: number;
  longitude: number;
  timestamp: string;
  validationResult: GpsValidationResult;
}

export interface AttendanceRecord {
  id: string;
  shiftId: string;
  guardId: string;
  clockInTime: string;
  clockInLatitude: number;
  clockInLongitude: number;
  clockInSelfieUrl: string;
  clockInGpsResult: GpsValidationResult;
  flags: AttendanceFlag[];
  clockOutTime?: string | null;
  clockOutLatitude?: number | null;
  clockOutLongitude?: number | null;
  clockOutGpsResult?: GpsValidationResult | null;
  overrideNote?: string | null;
  overriddenBy?: string | null;
  overriddenAt?: string | null;
}

export interface LoneWorkerCheckIn {
  id: string;
  shiftId: string;
  guardId: string;
  scheduledTime: string;
  status: CheckInStatus;
  completedTime?: string | null;
  selfieUrl?: string | null;
  statusNote?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface LoneWorkerAlert {
  id: string;
  checkInId: string;
  shiftId: string;
  guardId: string;
  createdAt: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string | null;
  acknowledgedAt?: string | null;
  resolutionNotes?: string | null;
}

export interface ActivityLog {
  id: string;
  shiftId: string;
  siteId: string;
  guardId: string;
  content: string;
  category: ActivityLogCategory;
  reviewStatus: ActivityLogReviewStatus;
  createdAt: string;
  latitude?: number | null;
  longitude?: number | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  linkTo?: string | null;
}

export interface AuditEvent {
  id: string;
  organizationId: string;
  timestamp: string;
  actorId: string;
  actorRole: UserRole;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  siteId?: string | null;
  metadata?: Record<string, any> | null;
}

export interface RolePermissionGrant {
  capability: Capability;
  actions: PermissionAction[];
  scope: PermissionScope;
}

