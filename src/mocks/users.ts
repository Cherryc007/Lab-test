import { User, UserRole } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user-jp-tremblay',
    organizationId: 'org-guardon-canada',
    email: 'jp.tremblay@guardon.ca',
    role: UserRole.Guard,
    name: 'Jean-Pierre Tremblay',
    guardId: 'guard-jp-tremblay',
    phone: '+16135550192',
    createdAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 'user-sarah-jenkins',
    organizationId: 'org-guardon-canada',
    email: 'sjenkins@guardon.ca',
    role: UserRole.Guard,
    name: 'Sarah Jenkins',
    guardId: 'guard-sarah-jenkins',
    phone: '+16045550183',
    createdAt: '2026-02-14T08:30:00Z'
  },
  {
    id: 'user-david-johnston',
    organizationId: 'org-guardon-canada',
    email: 'djohnston@guardon.ca',
    role: UserRole.Guard,
    name: 'David Johnston',
    guardId: 'guard-david-johnston',
    phone: '+14035550148',
    createdAt: '2026-03-22T09:00:00Z'
  },
  {
    id: 'user-marcus-wong',
    organizationId: 'org-guardon-canada',
    email: 'mwong@guardon.ca',
    role: UserRole.Guard,
    name: 'Marcus Wong',
    guardId: 'guard-marcus-wong',
    phone: '+14165550124',
    createdAt: '2026-04-18T10:15:00Z'
  },
  {
    id: 'user-amira-mansour',
    organizationId: 'org-guardon-canada',
    email: 'amansour@guardon.ca',
    role: UserRole.Guard,
    name: 'Amira Mansour',
    guardId: 'guard-amira-mansour',
    phone: '+16135550111',
    createdAt: '2026-05-05T11:00:00Z'
  },
  {
    id: 'user-dispatcher',
    organizationId: 'org-guardon-canada',
    email: 'dispatch@guardon.ca',
    role: UserRole.Dispatcher,
    name: 'Diane Bourque',
    phone: '+14165550100',
    createdAt: '2026-01-01T08:00:00Z'
  },
  {
    id: 'user-supervisor',
    organizationId: 'org-guardon-canada',
    email: 'supervisor@guardon.ca',
    role: UserRole.Supervisor,
    name: 'Pierre Trudeau',
    phone: '+16135550200',
    supervisorSiteIds: ['site-eaton-centre', 'site-terminal-ottawa'],
    createdAt: '2026-01-05T09:00:00Z'
  },
  {
    id: 'user-ops-mgr',
    organizationId: 'org-guardon-canada',
    email: 'opsmanager@guardon.ca',
    role: UserRole.OperationsManager,
    name: 'Clara Hughes',
    phone: '+14165550300',
    createdAt: '2026-01-01T08:00:00Z'
  },
  {
    id: 'user-client-contact',
    organizationId: 'org-guardon-canada',
    email: 'robert.vance@cadillacfairview.ca',
    role: UserRole.ClientContact,
    name: 'Robert Vance',
    clientContactSiteIds: ['site-eaton-centre'],
    phone: '+14165550400',
    createdAt: '2026-02-01T10:00:00Z'
  },
  {
    id: 'user-sys-admin',
    organizationId: 'org-guardon-canada',
    email: 'admin@guardon.ca',
    role: UserRole.SystemAdmin,
    name: 'Terry Fox',
    phone: '+16045550999',
    createdAt: '2026-01-01T08:00:00Z'
  }
];
