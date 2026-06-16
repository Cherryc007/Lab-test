import { useMemo } from 'react';
import { useSchedulingStore } from '../../../store/useSchedulingStore';
import { useClientStore } from '../../../store/useClientStore';
import { useSessionStore } from '../../../store/useSessionStore';
import { ShiftStatus, Shift, UserRole } from '../../../types';
import { StatusBadge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';

interface OpenShiftQueueProps {
  onAssign: (shift: Shift) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function getDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const mins = Math.round((ms % (1000 * 60 * 60)) / (1000 * 60));
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function OpenShiftQueue({ onAssign }: OpenShiftQueueProps) {
  const allShifts = useSchedulingStore((s) => s.shifts.data);
  const claimOpenShift = useSchedulingStore((s) => s.claimOpenShift);
  const sites = useClientStore((s) => s.sites.data);
  const currentUser = useSessionStore((s) => s.currentUser);

  const siteLookup = useMemo(() => new Map(sites.map((s) => [s.id, s])), [sites]);
  const isGuard = currentUser?.role === UserRole.Guard;
  const isManager = currentUser?.role === UserRole.OperationsManager ||
                    currentUser?.role === UserRole.Dispatcher ||
                    currentUser?.role === UserRole.Supervisor;

  const openShifts = useMemo(() => {
    return allShifts
      .filter((s) => s.status === ShiftStatus.Open)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [allShifts]);

  const handleClaim = async (shiftId: string) => {
    try {
      await claimOpenShift(shiftId);
    } catch (e: any) {
      alert(e.message || 'Failed to claim shift.');
    }
  };

  if (openShifts.length === 0) {
    return (
      <div className="card" style={{ marginTop: '16px' }}>
        <EmptyState
          icon="✅"
          title="No Open Shifts"
          description="All shifts are assigned. Open shifts will appear here when guards reject assignments or new shifts are published."
        />
      </div>
    );
  }

  return (
    <div className="card open-shift-queue" style={{ marginTop: '16px' }}>
      <div className="card__header">
        <h3 className="card__title">Open Shifts ({openShifts.length})</h3>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Site</th>
              <th>Date</th>
              <th>Time</th>
              <th>Duration</th>
              <th>Lone Worker</th>
              <th>Notes</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {openShifts.map((shift) => {
              const site = siteLookup.get(shift.siteId);
              return (
                <tr key={shift.id}>
                  <td className="table__site-name">{site?.name ?? 'Unknown'}</td>
                  <td>{formatDate(shift.startTime)}</td>
                  <td>{formatTime(shift.startTime)} – {formatTime(shift.endTime)}</td>
                  <td>{getDuration(shift.startTime, shift.endTime)}</td>
                  <td>{shift.isLoneWorker ? '🛡️ Yes' : '—'}</td>
                  <td className="table__notes">{shift.notes || '—'}</td>
                  <td><StatusBadge status={shift.status} /></td>
                  <td className="table__actions">
                    {isGuard && (
                      <Button variant="success" size="xs" onClick={() => handleClaim(shift.id)}>
                        Claim
                      </Button>
                    )}
                    {isManager && (
                      <Button variant="primary" size="xs" onClick={() => onAssign(shift)}>
                        Assign
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
