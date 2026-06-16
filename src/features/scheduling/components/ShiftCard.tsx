import { Shift, Site, Guard } from '../../../types';
import { ShiftStatus } from '../../../types';
import { StatusBadge, LoneWorkerBadge } from '../../../components/ui/Badge';

interface ShiftCardProps {
  shift: Shift;
  site?: Site;
  guard?: Guard;
  guardName?: string;
  compact?: boolean;
  onClick?: () => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false });
}

const statusClassMap: Record<ShiftStatus, string> = {
  [ShiftStatus.Draft]: 'shift-card--draft',
  [ShiftStatus.Unassigned]: 'shift-card--unassigned',
  [ShiftStatus.Assigned]: 'shift-card--assigned',
  [ShiftStatus.Accepted]: 'shift-card--accepted',
  [ShiftStatus.Confirmed]: 'shift-card--confirmed',
  [ShiftStatus.Open]: 'shift-card--open',
  [ShiftStatus.Rejected]: 'shift-card--rejected',
  [ShiftStatus.Claimed]: 'shift-card--claimed',
  [ShiftStatus.Active]: 'shift-card--active',
  [ShiftStatus.Completed]: 'shift-card--completed',
  [ShiftStatus.Cancelled]: 'shift-card--cancelled',
};

export function ShiftCard({ shift, site, guardName, compact = false, onClick }: ShiftCardProps) {
  const statusClass = statusClassMap[shift.status] || '';

  return (
    <div
      className={`shift-card ${statusClass}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="shift-card__time">
        {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
      </div>
      {!compact && site && (
        <div className="shift-card__site">{site.name}</div>
      )}
      <div className="shift-card__guard">
        {guardName || (shift.guardId ? '...' : 'Unassigned')}
      </div>
      <div className="shift-card__meta">
        <StatusBadge status={shift.status} />
        {shift.isLoneWorker && <LoneWorkerBadge />}
      </div>
    </div>
  );
}
