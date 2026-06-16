import { Shift, Site, ShiftStatus } from '../../../types';

interface MonthViewProps {
  year: number;
  month: number; // 0-indexed
  shifts: Shift[];
  sites: Site[];
  guardNames: Map<string, string>;
  onShiftClick: (shift: Shift) => void;
  onDayClick: (date: Date) => void;
}

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_VISIBLE_SHIFTS = 3;

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Adjust so Monday = 0
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const totalCells = Math.ceil((startDow + lastDay.getDate()) / 7) * 7;
  const cells: (Date | null)[] = [];

  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startDow + 1;
    if (dayNum < 1 || dayNum > lastDay.getDate()) {
      // Fill adjacent month days
      const d = new Date(year, month, dayNum);
      cells.push(d);
    } else {
      cells.push(new Date(year, month, dayNum));
    }
  }

  // Chunk into weeks
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function getShiftPillClass(status: ShiftStatus): string {
  const map: Record<string, string> = {
    Draft: 'shift-card--draft',
    Assigned: 'shift-card--assigned',
    Accepted: 'shift-card--accepted',
    Open: 'shift-card--open',
    Active: 'shift-card--active',
    Completed: 'shift-card--completed',
    Cancelled: 'shift-card--cancelled',
    Rejected: 'shift-card--rejected',
    Claimed: 'shift-card--claimed',
  };
  return map[status] || '';
}

function formatShortTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function MonthView({ year, month, shifts, sites, guardNames, onShiftClick, onDayClick }: MonthViewProps) {
  const weeks = getMonthGrid(year, month);
  const today = new Date();
  const siteLookup = new Map(sites.map((s) => [s.id, s]));

  return (
    <div className="month-view animate-fade-in">
      <div className="month-view__header">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="month-view__header-day">{d}</div>
        ))}
      </div>
      <div className="month-view__grid">
        {weeks.flat().map((cellDate, idx) => {
          if (!cellDate) return <div key={idx} className="month-view__cell month-view__cell--outside" />;
          const isCurrentMonth = cellDate.getMonth() === month;
          const isToday = isSameDay(cellDate, today);

          const dayShifts = shifts.filter((s) => isSameDay(new Date(s.startTime), cellDate));
          const visibleShifts = dayShifts.slice(0, MAX_VISIBLE_SHIFTS);
          const overflow = dayShifts.length - MAX_VISIBLE_SHIFTS;

          return (
            <div
              key={idx}
              className={`month-view__cell ${!isCurrentMonth ? 'month-view__cell--outside' : ''} ${isToday ? 'month-view__cell--today' : ''}`}
              onClick={() => onDayClick(cellDate)}
            >
              <div className="month-view__cell-day">{cellDate.getDate()}</div>
              <div className="month-view__cell-shifts">
                {visibleShifts.map((shift) => {
                  const site = siteLookup.get(shift.siteId);
                  return (
                    <div
                      key={shift.id}
                      className={`month-view__shift-pill ${getShiftPillClass(shift.status)}`}
                      onClick={(e) => { e.stopPropagation(); onShiftClick(shift); }}
                      title={`${formatShortTime(shift.startTime)} - ${site?.name ?? 'Unknown'} (${shift.status})`}
                    >
                      {formatShortTime(shift.startTime)} {site?.name?.split(' ').slice(-1)[0] ?? ''}
                    </div>
                  );
                })}
                {overflow > 0 && (
                  <div className="month-view__more-link">+{overflow} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
