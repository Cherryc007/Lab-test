import { Shift, ShiftStatus } from '../types';

export const mockShifts: Shift[] = [
  {
    id: 'shift-completed-eaton',
    siteId: 'site-eaton-centre',
    status: ShiftStatus.Completed,
    startTime: '2026-06-16T08:00:00Z',
    endTime: '2026-06-16T16:00:00Z',
    isLoneWorker: false,
    guardId: 'guard-jp-tremblay',
    notes: 'Morning lobby patrol shift completed.',
    version: 1
  },
  {
    id: 'shift-active-glass',
    siteId: 'site-glass-factory',
    status: ShiftStatus.Active,
    startTime: '2026-06-17T00:00:00Z', // Started earlier relative to current local time (June 17 02:35)
    endTime: '2026-06-17T08:00:00Z',
    isLoneWorker: true,
    guardId: 'guard-sarah-jenkins',
    checkInIntervalMinutes: 60,
    notes: 'Overnight lock-up and lone patrol.',
    version: 2
  },
  {
    id: 'shift-open-calgary',
    siteId: 'site-loblaws-calgary',
    status: ShiftStatus.Open,
    startTime: '2026-06-17T12:00:00Z',
    endTime: '2026-06-17T20:00:00Z',
    isLoneWorker: false,
    guardId: null,
    notes: 'Supermarket customer control coverage.',
    version: 1
  },
  {
    id: 'shift-assigned-ottawa',
    siteId: 'site-terminal-ottawa',
    status: ShiftStatus.Assigned,
    startTime: '2026-06-17T09:00:00Z',
    endTime: '2026-06-17T17:00:00Z',
    isLoneWorker: false,
    guardId: 'guard-jp-tremblay',
    notes: 'Main gate access control duty.',
    version: 1
  },
  {
    id: 'shift-rejected-ottawa',
    siteId: 'site-terminal-ottawa',
    status: ShiftStatus.Open, // A rejected shift moves to Open in the marketplace
    startTime: '2026-06-18T09:00:00Z',
    endTime: '2026-06-18T17:00:00Z',
    isLoneWorker: false,
    guardId: null,
    notes: 'Access control support desk. Previously rejected by JP Tremblay.',
    version: 2
  },
  {
    id: 'shift-draft-eaton',
    siteId: 'site-eaton-centre',
    status: ShiftStatus.Draft,
    startTime: '2026-06-18T16:00:00Z',
    endTime: '2026-06-19T00:00:00Z',
    isLoneWorker: false,
    guardId: null,
    notes: 'Late afternoon coverage draft schedule.',
    version: 1
  }
];
