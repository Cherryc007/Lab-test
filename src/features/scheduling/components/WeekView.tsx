import { Shift, Site, Guard } from '../../../types';
import { ShiftCard } from './ShiftCard';

interface WeekViewProps {
  weekStart: Date;
  shifts: Shift[];
  sites: Site[];
  guards: Guard[];
  guardNames: Map<string, string>;
  onShiftClick: (shift: Shift) => void;
  onDayClick: (date: Date) => void;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const VISIBLE_HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

function formatHour(h: number): string {
  return `${h.toString().padStart(2, '0')}:00`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function getShiftsForDay(shifts: Shift[], date: Date): Shift[] {
  return shifts.filter((s) => {
    const start = new Date(s.startTime);
    return isSameDay(start, date);
  });
}

export function WeekView({ weekStart, shifts, sites, guardNames, onShiftClick, onDayClick }: WeekViewProps) {
  const days = getWeekDays(weekStart);
  const today = new Date();
  const siteLookup = new Map(sites.map((s) => [s.id, s]));

  return (
    <div className="week-view animate-fade-in">
      {/* Header */}
      <div className="week-view__header">
        <div className="week-view__header-spacer" />
        {days.map((day, i) => {
          const isToday = isSameDay(day, today);
          return (
            <div
              key={i}
              className={`week-view__header-day ${isToday ? 'week-view__header-day--today' : ''}`}
              onClick={() => onDayClick(day)}
              style={{ cursor: 'pointer' }}
            >
              <div className="week-view__header-day-name">{DAY_NAMES[i]}</div>
              <div className="week-view__header-day-num">{day.getDate()}</div>
            </div>
          );
        })}
      </div>

      {/* Body */}
      <div className="week-view__body">
        {/* Time column */}
        <div className="week-view__time-col">
          {VISIBLE_HOURS.map((h) => (
            <div key={h} className="week-view__time-slot">{formatHour(h)}</div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day, dayIdx) => {
          const dayShifts = getShiftsForDay(shifts, day);
          // Group shifts by start hour
          const shiftsByHour = new Map<number, Shift[]>();
          dayShifts.forEach((s) => {
            const hour = new Date(s.startTime).getHours();
            if (!shiftsByHour.has(hour)) shiftsByHour.set(hour, []);
            shiftsByHour.get(hour)!.push(s);
          });

          return (
            <div key={dayIdx} className="week-view__day-col">
              {VISIBLE_HOURS.map((h) => (
                <div key={h} className="week-view__day-slot">
                  {(shiftsByHour.get(h) || []).map((shift) => (
                    <ShiftCard
                      key={shift.id}
                      shift={shift}
                      site={siteLookup.get(shift.siteId)}
                      guardName={shift.guardId ? guardNames.get(shift.guardId) : undefined}
                      compact
                      onClick={() => onShiftClick(shift)}
                    />
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
