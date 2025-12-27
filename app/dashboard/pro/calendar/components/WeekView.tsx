import type { Appointment } from '@/lib/api';
import DayColumn from './DayColumn';
import { getWeekDays, getDayHours } from '@/lib/calendar-utils';

interface WeekViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  startHour?: number;
  endHour?: number;
}

export default function WeekView({
  currentDate,
  appointments,
  onAppointmentClick,
  startHour = 8,
  endHour = 20
}: WeekViewProps) {
  const weekDays = getWeekDays(currentDate);
  const hours = getDayHours(startHour, endHour);
  const hourHeight = 64;

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-700">
      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 gap-px bg-slate-700 min-w-[900px]">
          {/* Time column */}
          <div className="bg-slate-800 min-w-[80px]">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-2 text-center h-[60px] z-10">
              <div className="text-xs text-slate-500 uppercase font-bold">Saat</div>
            </div>
            <div>
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b border-slate-700/50 text-xs text-slate-500 p-2 flex items-start"
                >
                  {String(hour).padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>

          {/* Day columns */}
          {weekDays.map((day) => (
            <DayColumn
              key={day.date}
              date={day.date}
              dayName={day.dayName.substring(0, 3)}
              dayNumber={day.dayNumber}
              isToday={day.isToday}
              appointments={appointments}
              onAppointmentClick={onAppointmentClick}
              startHour={startHour}
              endHour={endHour}
              hourHeight={hourHeight}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
