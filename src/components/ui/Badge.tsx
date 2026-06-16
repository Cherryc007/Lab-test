import { ShiftStatus } from '../../types';

interface BadgeProps {
  status: ShiftStatus;
  className?: string;
}

const statusClassMap: Record<ShiftStatus, string> = {
  [ShiftStatus.Draft]: 'badge--draft',
  [ShiftStatus.Unassigned]: 'badge--unassigned',
  [ShiftStatus.Assigned]: 'badge--assigned',
  [ShiftStatus.Accepted]: 'badge--accepted',
  [ShiftStatus.Confirmed]: 'badge--confirmed',
  [ShiftStatus.Open]: 'badge--open',
  [ShiftStatus.Rejected]: 'badge--rejected',
  [ShiftStatus.Claimed]: 'badge--claimed',
  [ShiftStatus.Active]: 'badge--active',
  [ShiftStatus.Completed]: 'badge--completed',
  [ShiftStatus.Cancelled]: 'badge--cancelled',
};

export function StatusBadge({ status, className = '' }: BadgeProps) {
  return (
    <span className={`badge ${statusClassMap[status] || ''} ${className}`}>
      {status}
    </span>
  );
}

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const label = role.replace(/([A-Z])/g, ' $1').trim();
  return <span className="badge badge--role">{label}</span>;
}

export function LoneWorkerBadge() {
  return <span className="badge badge--lone-worker">🛡️ Lone Worker</span>;
}
