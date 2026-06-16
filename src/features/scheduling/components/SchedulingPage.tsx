import { useState, useMemo, useCallback } from 'react';
import { useSchedulingStore } from '../../../store/useSchedulingStore';
import { useClientStore } from '../../../store/useClientStore';
import { useGuardStore } from '../../../store/useGuardStore';
import { Shift, ShiftStatus } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { ShiftFormModal } from './ShiftFormModal';
import { AssignGuardPanel } from './AssignGuardPanel';
import { OpenShiftQueue } from './OpenShiftQueue';
import { GuardScheduleView } from './GuardScheduleView';

type CalendarView = 'day' | 'week' | 'month';
type Tab = 'calendar' | 'open-shifts' | 'guard-schedule';

function getMonday(d: Date): Date {
  const result = new Date(d);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatDateHeader(date: Date, view: CalendarView): string {
  if (view === 'day') {
    return date.toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  if (view === 'week') {
    const end = new Date(date);
    end.setDate(end.getDate() + 6);
    const startMonth = MONTH_NAMES[date.getMonth()];
    const endMonth = MONTH_NAMES[end.getMonth()];
    if (startMonth === endMonth) {
      return `${startMonth} ${date.getDate()} – ${end.getDate()}, ${date.getFullYear()}`;
    }
    return `${startMonth} ${date.getDate()} – ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function SchedulingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('calendar');
  const [calendarView, setCalendarView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [siteFilter, setSiteFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [assigningShift, setAssigningShift] = useState<Shift | null>(null);

  // Store data
  const allShifts = useSchedulingStore((s) => s.shifts.data);
  const sites = useClientStore((s) => s.sites.data);
  const guards = useGuardStore((s) => s.guards.data);
  const { mockUsers } = useMemo(() => {
    // Build guard name lookup from available data
    return { mockUsers: [] };
  }, []);

  // Build guard name lookup: guardId -> user name
  const guardNames = useMemo(() => {
    const map = new Map<string, string>();
    // Guards don't carry names; we join via userId.
    // For mock env, use a static map from known guard IDs.
    // In production, this would come from a user service.
    guards.forEach((g) => {
      // Simple name from guard ID (fallback)
      const parts = g.id.replace('guard-', '').split('-');
      const name = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      map.set(g.id, name);
    });
    return map;
  }, [guards]);

  // Filter shifts
  const filteredShifts = useMemo(() => {
    let result = allShifts;
    if (siteFilter) {
      result = result.filter((s) => s.siteId === siteFilter);
    }
    if (statusFilter) {
      result = result.filter((s) => s.status === statusFilter);
    }
    return result;
  }, [allShifts, siteFilter, statusFilter]);

  // Week start (Monday)
  const weekStart = useMemo(() => getMonday(currentDate), [currentDate]);

  // Navigation
  const navigate = useCallback((direction: -1 | 0 | 1) => {
    if (direction === 0) {
      setCurrentDate(new Date());
      return;
    }
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (calendarView === 'day') next.setDate(next.getDate() + direction);
      else if (calendarView === 'week') next.setDate(next.getDate() + direction * 7);
      else next.setMonth(next.getMonth() + direction);
      return next;
    });
  }, [calendarView]);

  // Handlers
  const handleShiftClick = useCallback((shift: Shift) => {
    setEditingShift(shift);
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    setCurrentDate(date);
    setCalendarView('day');
  }, []);

  const handleAssignFromEdit = useCallback((shift: Shift) => {
    setEditingShift(null);
    setAssigningShift(shift);
  }, []);

  return (
    <div className="scheduling-page">
      {/* Tab Bar */}
      <div className="scheduling-tabs">
        <button
          className={`scheduling-tab ${activeTab === 'calendar' ? 'scheduling-tab--active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          📅 Calendar
        </button>
        <button
          className={`scheduling-tab ${activeTab === 'open-shifts' ? 'scheduling-tab--active' : ''}`}
          onClick={() => setActiveTab('open-shifts')}
        >
          📋 Open Shifts
        </button>
        <button
          className={`scheduling-tab ${activeTab === 'guard-schedule' ? 'scheduling-tab--active' : ''}`}
          onClick={() => setActiveTab('guard-schedule')}
        >
          👤 Guard Schedule
        </button>
      </div>

      {activeTab === 'calendar' && (
        <>
          {/* Toolbar */}
          <div className="scheduling-toolbar">
            <div className="scheduling-toolbar__left">
              {/* View Toggle */}
              <div className="view-toggle">
                {(['day', 'week', 'month'] as CalendarView[]).map((v) => (
                  <button
                    key={v}
                    className={`view-toggle__btn ${calendarView === v ? 'view-toggle__btn--active' : ''}`}
                    onClick={() => setCalendarView(v)}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>

              {/* Date Navigation */}
              <div className="date-nav">
                <button className="date-nav__btn" onClick={() => navigate(-1)} title="Previous">‹</button>
                <button className="date-nav__today" onClick={() => navigate(0)}>Today</button>
                <button className="date-nav__btn" onClick={() => navigate(1)} title="Next">›</button>
              </div>

              <div className="scheduling-toolbar__date-label">
                {formatDateHeader(calendarView === 'week' ? weekStart : currentDate, calendarView)}
              </div>
            </div>

            <div className="scheduling-toolbar__right">
              {/* Site Filter */}
              <select
                className="form-select scheduling-toolbar__filter"
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
              >
                <option value="">All Sites</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                className="form-select scheduling-toolbar__filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                {Object.values(ShiftStatus).map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>

              {/* Create Shift */}
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                + New Shift
              </Button>
            </div>
          </div>

          {/* Calendar View */}
          <div className="scheduling-calendar">
            {filteredShifts.length === 0 ? (
              <EmptyState
                icon="📅"
                title="No shifts found"
                description="Create a shift or adjust your filters to see scheduled shifts."
              />
            ) : (
              <>
                {calendarView === 'day' && (
                  <DayView
                    date={currentDate}
                    shifts={filteredShifts}
                    sites={sites}
                    guards={guards}
                    guardNames={guardNames}
                    onShiftClick={handleShiftClick}
                  />
                )}
                {calendarView === 'week' && (
                  <WeekView
                    weekStart={weekStart}
                    shifts={filteredShifts}
                    sites={sites}
                    guards={guards}
                    guardNames={guardNames}
                    onShiftClick={handleShiftClick}
                    onDayClick={handleDayClick}
                  />
                )}
                {calendarView === 'month' && (
                  <MonthView
                    year={currentDate.getFullYear()}
                    month={currentDate.getMonth()}
                    shifts={filteredShifts}
                    sites={sites}
                    guardNames={guardNames}
                    onShiftClick={handleShiftClick}
                    onDayClick={handleDayClick}
                  />
                )}
              </>
            )}
          </div>
        </>
      )}

      {activeTab === 'open-shifts' && (
        <OpenShiftQueue onAssign={(shift) => setAssigningShift(shift)} />
      )}

      {activeTab === 'guard-schedule' && (
        <GuardScheduleView />
      )}

      {/* Shift Create/Edit Modal */}
      {(showCreateModal || editingShift) && (
        <ShiftFormModal
          shift={editingShift}
          onClose={() => { setShowCreateModal(false); setEditingShift(null); }}
          onAssign={editingShift ? () => handleAssignFromEdit(editingShift) : undefined}
        />
      )}

      {/* Guard Assignment Panel (as modal overlay) */}
      {assigningShift && (
        <AssignGuardPanel
          shift={assigningShift}
          onClose={() => setAssigningShift(null)}
        />
      )}
    </div>
  );
}
