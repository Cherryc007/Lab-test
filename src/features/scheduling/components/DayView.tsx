import { Shift, Site, Guard } from '../../../types';
import { ShiftCard } from './ShiftCard';

interface DayViewProps {
  date: Date;
  shifts: Shift[];
  sites: Site[];
  guards: Guard[];
  guardNames: Map<string, string>;
  onShiftClick: (shift: Shift) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(h: number): string {
  return `${h.toString().padStart(2, '0')}:00`;
}

function getShiftHourStart(shift: Shift): number {
  return new Date(shift.startTime).getHours();
}

function getShiftsForHour(shifts: Shift[], hour: number): Shift[] {
  return shifts.filter((s) => {
    const start = new Date(s.startTime);
    const end = new Date(s.endTime);
    const hourStart = new Date(start);
    hourStart.setHours(hour, 0, 0, 0);
    const hourEnd = new Date(start);
    hourEnd.setHours(hour + 1, 0, 0, 0);
    // Shift overlaps with this hour slot
    return start < hourEnd && end > hourStart;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function DayView({ date, shifts, sites, guards, guardNames, onShiftClick }: DayViewProps) {
  // Filter shifts that fall on this date
  const dayShifts = shifts.filter((s) => {
    const start = new Date(s.startTime);
    const end = new Date(s.endTime);
    return isSameDay(start, date) || isSameDay(end, date) || (start < date && end > date);
  });

  // Track which shifts have already been rendered (render only at start hour)
  const renderedShiftIds = new Set<string>();

  const now = new Date();
  const isToday = isSameDay(now, date);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowPercent = (nowMinutes / (24 * 60)) * 100;

  const siteLookup = new Map(sites.map((s) => [s.id, s]));

  return (
    <div className="day-view animate-fade-in">
      <div className="day-view__grid" style={{ position: 'relative' }}>
        {isToday && (
          <div
            className="day-view__now-line"
            style={{ top: `${nowPercent}%` }}
          />
        )}
        {HOURS.map((hour) => {
          const hourShifts = getShiftsForHour(dayShifts, hour);
          // Only render shift cards at their start hour
          const newShifts = hourShifts.filter((s) => {
            if (renderedShiftIds.has(s.id)) return false;
            const startHour = getShiftHourStart(s);
            if (startHour === hour) {
              renderedShiftIds.add(s.id);
              return true;
            }
            return false;
          });

          return (
            <div className="day-view__hour-row" key={hour}>
              <div className="day-view__hour-label">{formatHour(hour)}</div>
              <div className="day-view__hour-content">
                {newShifts.map((shift) => (
                  <ShiftCard
                    key={shift.id}
                    shift={shift}
                    site={siteLookup.get(shift.siteId)}
                    guardName={shift.guardId ? guardNames.get(shift.guardId) : undefined}
                    onClick={() => onShiftClick(shift)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
