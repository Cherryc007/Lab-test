import { useMemo } from 'react';
import { useSchedulingStore } from '../../../store/useSchedulingStore';
import { useGuardStore } from '../../../store/useGuardStore';
import { useClientStore } from '../../../store/useClientStore';
import { Shift, GuardStatus } from '../../../types';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/Badge';

interface AssignGuardPanelProps {
  shift: Shift;
  onClose: () => void;
}

export function AssignGuardPanel({ shift, onClose }: AssignGuardPanelProps) {
  const guards = useGuardStore((s) => s.guards.data);
  const allShifts = useSchedulingStore((s) => s.shifts.data);
  const assignShift = useSchedulingStore((s) => s.assignShift);
  const site = useClientStore((s) => s.sites.data.find((st) => st.id === shift.siteId));

  // Build guard eligibility list
  const guardList = useMemo(() => {
    return guards.map((g) => {
      const eligible = g.eligibleSiteIds.includes(shift.siteId);
      const isActive = g.status === GuardStatus.Active;
      const currentShiftCount = allShifts.filter(
        (s) => s.guardId === g.id && s.status !== 'Completed' && s.status !== 'Cancelled'
      ).length;

      // Derive name from guard ID
      const name = g.id.replace('guard-', '').split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');

      return {
        guard: g,
        name,
        eligible,
        isActive,
        currentShiftCount,
        canAssign: eligible && isActive,
        reason: !isActive ? `Status: ${g.status}` : !eligible ? 'Not eligible for this site' : ''
      };
    }).sort((a, b) => {
      // Assignable guards first
      if (a.canAssign && !b.canAssign) return -1;
      if (!a.canAssign && b.canAssign) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [guards, shift.siteId, allShifts]);

  const handleAssign = async (guardId: string) => {
    try {
      await assignShift(shift.id, guardId);
      onClose();
    } catch (e: any) {
      alert(e.message || 'Failed to assign guard.');
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Assign Guard"
      large
      footer={<Button variant="secondary" onClick={onClose}>Cancel</Button>}
    >
      <div className="assign-panel__info">
        <div><strong>Site:</strong> {site?.name ?? 'Unknown'}</div>
        <div><strong>Time:</strong> {new Date(shift.startTime).toLocaleString()} – {new Date(shift.endTime).toLocaleTimeString()}</div>
        <StatusBadge status={shift.status} />
      </div>

      <div className="assign-panel__list">
        <div className="assign-panel__header">
          <span>Guard</span>
          <span>Status</span>
          <span>Certifications</span>
          <span>Shifts</span>
          <span></span>
        </div>
        {guardList.map(({ guard, name, canAssign, isActive, currentShiftCount, reason }) => (
          <div
            key={guard.id}
            className={`assign-panel__row ${!canAssign ? 'assign-panel__row--disabled' : ''}`}
          >
            <span className="assign-panel__name">{name}</span>
            <span>
              <span className={`badge badge--${isActive ? 'active' : 'draft'}`} style={{ fontSize: '11px' }}>
                {guard.status}
              </span>
            </span>
            <span className="assign-panel__certs">
              {(guard.certifications || []).slice(0, 2).join(', ')}
              {(guard.certifications || []).length > 2 && ` +${guard.certifications!.length - 2}`}
            </span>
            <span>{currentShiftCount}</span>
            <span>
              {canAssign ? (
                <Button variant="primary" size="xs" onClick={() => handleAssign(guard.id)}>
                  Assign
                </Button>
              ) : (
                <span className="assign-panel__reason">{reason}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
