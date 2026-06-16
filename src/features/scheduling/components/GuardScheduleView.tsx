import { useState, useMemo } from 'react';
import { useSchedulingStore } from '../../../store/useSchedulingStore';
import { useGuardStore } from '../../../store/useGuardStore';
import { useClientStore } from '../../../store/useClientStore';
import { ShiftStatus } from '../../../types';
import { StatusBadge, LoneWorkerBadge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function GuardScheduleView() {
  const guards = useGuardStore((s) => s.guards.data);
  const allShifts = useSchedulingStore((s) => s.shifts.data);
  const sites = useClientStore((s) => s.sites.data);
  const acceptShift = useSchedulingStore((s) => s.acceptShift);
  const rejectShift = useSchedulingStore((s) => s.rejectShift);

  const [selectedGuardId, setSelectedGuardId] = useState(guards[0]?.id ?? '');

  const siteLookup = useMemo(() => new Map(sites.map((s) => [s.id, s])), [sites]);

  // Guard name helper
  const guardNameMap = useMemo(() => {
    const map = new Map<string, string>();
    guards.forEach((g) => {
      const parts = g.id.replace('guard-', '').split('-');
      map.set(g.id, parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' '));
    });
    return map;
  }, [guards]);

  const guardShifts = useMemo(() => {
    if (!selectedGuardId) return [];
    return allShifts
      .filter((s) => s.guardId === selectedGuardId)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [allShifts, selectedGuardId]);

  const handleAccept = async (shiftId: string) => {
    try { await acceptShift(shiftId); } catch (e: any) { alert(e.message); }
  };

  const handleReject = async (shiftId: string) => {
    const reason = prompt('Reason for rejection (optional):');
    try { await rejectShift(shiftId, reason || undefined); } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="card guard-schedule-view" style={{ marginTop: '16px' }}>
      <div className="card__header">
        <h3 className="card__title">Guard Schedule</h3>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '200px' }}
          value={selectedGuardId}
          onChange={(e) => setSelectedGuardId(e.target.value)}
        >
          <option value="">Select Guard</option>
          {guards.map((g) => (
            <option key={g.id} value={g.id}>{guardNameMap.get(g.id) || g.id}</option>
          ))}
        </select>
      </div>

      {!selectedGuardId ? (
        <EmptyState icon="👤" title="Select a guard" description="Choose a guard above to see their schedule." />
      ) : guardShifts.length === 0 ? (
        <EmptyState icon="📭" title="No shifts" description="This guard has no assigned shifts." />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Site</th>
                <th>Status</th>
                <th>Lone Worker</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {guardShifts.map((shift) => {
                const site = siteLookup.get(shift.siteId);
                const canRespond = shift.status === ShiftStatus.Assigned;
                return (
                  <tr key={shift.id}>
                    <td>{formatDate(shift.startTime)}</td>
                    <td>{formatTime(shift.startTime)} – {formatTime(shift.endTime)}</td>
                    <td>{site?.name ?? 'Unknown'}</td>
                    <td><StatusBadge status={shift.status} /></td>
                    <td>{shift.isLoneWorker ? <LoneWorkerBadge /> : '—'}</td>
                    <td className="table__actions">
                      {canRespond && (
                        <>
                          <Button variant="success" size="xs" onClick={() => handleAccept(shift.id)}>Accept</Button>
                          <Button variant="danger" size="xs" onClick={() => handleReject(shift.id)}>Reject</Button>
                        </>
                      )}
                      {!canRespond && <span style={{ color: 'var(--color-slate-400)', fontSize: 'var(--font-size-xs)' }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
