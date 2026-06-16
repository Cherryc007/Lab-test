import { useState, useEffect, useMemo } from 'react';
import { useSchedulingStore } from '../../../store/useSchedulingStore';
import { useClientStore } from '../../../store/useClientStore';
import { Shift, ShiftStatus } from '../../../types';
import { validateShiftTimings } from '../../../services/scheduling.service';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Toggle } from '../../../components/ui/Toggle';
import { StatusBadge } from '../../../components/ui/Badge';

interface ShiftFormModalProps {
  shift: Shift | null; // null = create mode
  onClose: () => void;
  onAssign?: () => void; // open assignment panel from edit mode
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getDefaultStartTime(): string {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return d.toISOString();
}

function getDefaultEndTime(): string {
  const d = new Date();
  d.setHours(d.getHours() + 9, 0, 0, 0);
  return d.toISOString();
}

export function ShiftFormModal({ shift, onClose, onAssign }: ShiftFormModalProps) {
  const isEdit = !!shift;
  const sites = useClientStore((s) => s.sites.data);
  const createShift = useSchedulingStore((s) => s.createShift);
  const transitionShiftStatus = useSchedulingStore((s) => s.transitionShiftStatus);

  const [siteId, setSiteId] = useState(shift?.siteId ?? '');
  const [startTime, setStartTime] = useState(shift?.startTime ? toDatetimeLocal(shift.startTime) : toDatetimeLocal(getDefaultStartTime()));
  const [endTime, setEndTime] = useState(shift?.endTime ? toDatetimeLocal(shift.endTime) : toDatetimeLocal(getDefaultEndTime()));
  const [isLoneWorker, setIsLoneWorker] = useState(shift?.isLoneWorker ?? false);
  const [checkInInterval, setCheckInInterval] = useState(String(shift?.checkInIntervalMinutes ?? 60));
  const [notes, setNotes] = useState(shift?.notes ?? '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Validation
  const validate = (): boolean => {
    if (!siteId) {
      setError('Please select a site.');
      return false;
    }
    try {
      validateShiftTimings(new Date(startTime).toISOString(), new Date(endTime).toISOString());
    } catch (e: any) {
      setError(e.message);
      return false;
    }
    if (isLoneWorker) {
      const interval = parseInt(checkInInterval, 10);
      if (isNaN(interval) || interval < 15 || interval > 240) {
        setError('Check-in interval must be between 15 and 240 minutes.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (!isEdit) {
        await createShift({
          siteId,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          isLoneWorker,
          guardId: null,
          checkInIntervalMinutes: isLoneWorker ? parseInt(checkInInterval, 10) : null,
          notes: notes || undefined,
          status: ShiftStatus.Draft,
          version: 1,
        });
      }
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to save shift.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!shift) return;
    try {
      await transitionShiftStatus(shift.id, ShiftStatus.Cancelled);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Cannot cancel this shift.');
    }
  };

  // Available status actions in edit mode
  const statusActions = useMemo(() => {
    if (!shift) return [];
    const actions: { label: string; status: ShiftStatus; variant: 'primary' | 'danger' | 'success' }[] = [];
    switch (shift.status) {
      case ShiftStatus.Draft:
        // Can assign (handled via onAssign)
        break;
      case ShiftStatus.Assigned:
        actions.push({ label: 'Accept', status: ShiftStatus.Accepted, variant: 'success' });
        actions.push({ label: 'Reject', status: ShiftStatus.Rejected, variant: 'danger' });
        break;
      case ShiftStatus.Accepted:
        actions.push({ label: 'Start Shift', status: ShiftStatus.Active, variant: 'primary' });
        break;
      case ShiftStatus.Active:
        actions.push({ label: 'Complete', status: ShiftStatus.Completed, variant: 'success' });
        break;
    }
    return actions;
  }, [shift]);

  const footer = (
    <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {isEdit && shift?.status !== ShiftStatus.Completed && shift?.status !== ShiftStatus.Cancelled && (
          <Button variant="danger" size="sm" onClick={handleCancel}>Cancel Shift</Button>
        )}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="secondary" onClick={onClose}>Close</Button>
        {!isEdit && (
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Shift'}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? 'Shift Details' : 'Create New Shift'}
      footer={footer}
      large
    >
      {/* Edit mode: status and transition actions */}
      {isEdit && shift && (
        <div className="shift-form__status-bar">
          <div className="shift-form__status-row">
            <span className="form-label">Status:</span>
            <StatusBadge status={shift.status} />
          </div>
          {(statusActions.length > 0 || (shift.status === ShiftStatus.Draft && onAssign)) && (
            <div className="shift-form__actions">
              {shift.status === ShiftStatus.Draft && onAssign && (
                <Button variant="primary" size="sm" onClick={onAssign}>Assign Guard</Button>
              )}
              {statusActions.map((a) => (
                <Button
                  key={a.status}
                  variant={a.variant}
                  size="sm"
                  onClick={async () => {
                    try {
                      await transitionShiftStatus(shift.id, a.status);
                      onClose();
                    } catch (e: any) {
                      setError(e.message);
                    }
                  }}
                >
                  {a.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <div className="form-error" style={{ marginBottom: '12px' }}>{error}</div>}

      {/* Site */}
      <div className="form-group">
        <label className="form-label" htmlFor="shift-site">Site</label>
        <select
          id="shift-site"
          className="form-select"
          value={siteId}
          onChange={(e) => setSiteId(e.target.value)}
          disabled={isEdit}
        >
          <option value="">Select a site…</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Start / End */}
      <div className="shift-form__row">
        <div className="form-group">
          <label className="form-label" htmlFor="shift-start">Start Time</label>
          <input
            id="shift-start"
            type="datetime-local"
            className="form-input"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={isEdit}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="shift-end">End Time</label>
          <input
            id="shift-end"
            type="datetime-local"
            className="form-input"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            disabled={isEdit}
          />
        </div>
      </div>

      {/* Lone Worker */}
      <div style={{ marginTop: '12px' }}>
        <Toggle
          label="Lone Worker Shift"
          checked={isLoneWorker}
          onChange={(v) => setIsLoneWorker(v)}
          id="shift-lone-worker"
        />
      </div>

      {isLoneWorker && (
        <div className="form-group" style={{ marginTop: '8px' }}>
          <label className="form-label" htmlFor="shift-checkin">Check-in Interval (minutes)</label>
          <input
            id="shift-checkin"
            type="number"
            className="form-input"
            value={checkInInterval}
            onChange={(e) => setCheckInInterval(e.target.value)}
            min={15}
            max={240}
            step={15}
            disabled={isEdit}
          />
        </div>
      )}

      {/* Notes */}
      <div className="form-group" style={{ marginTop: '12px' }}>
        <label className="form-label" htmlFor="shift-notes">Notes</label>
        <textarea
          id="shift-notes"
          className="form-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional shift notes..."
          rows={3}
          disabled={isEdit}
        />
      </div>

      {/* Edit mode: shift info */}
      {isEdit && shift?.guardId && (
        <div className="shift-form__info" style={{ marginTop: '16px' }}>
          <span className="form-label">Assigned Guard:</span>
          <span style={{ marginLeft: '8px', fontWeight: 500 }}>
            {shift.guardId.replace('guard-', '').split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')}
          </span>
        </div>
      )}
    </Modal>
  );
}
