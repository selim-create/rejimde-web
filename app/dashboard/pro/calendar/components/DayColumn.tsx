import type { Appointment } from '@/lib/api';
import AppointmentCard from './AppointmentCard';
import { getDayHours, getTimePosition, getAppointmentHeight } from '@/lib/calendar-utils';

interface DayColumnProps {
  date: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  startHour?: number;
  endHour?: number;
  hourHeight?: number;
}

export default function DayColumn({
  date,
  dayName,
  dayNumber,
  isToday,
  appointments,
  onAppointmentClick,
  startHour = 8,
  endHour = 20,
  hourHeight = 64
}: DayColumnProps) {
  const hours = getDayHours(startHour, endHour);

  return (
    <div className="bg-slate-800 min-w-[120px]">
      {/* Header */}
      <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-2 text-center z-10">
        <div className="text-xs text-slate-500 uppercase font-bold">{dayName}</div>
        <div className={`text-lg font-bold ${isToday ? 'text-blue-400' : 'text-white'}`}>
          {dayNumber}
        </div>
        {isToday && (
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mx-auto mt-1"></div>
        )}
      </div>

      {/* Time slots */}
      <div className="relative">
        {hours.map((hour, index) => (
          <div
            key={hour}
            className={`h-16 border-b border-slate-700/50 ${index === hours.length - 1 ? 'border-b-0' : ''}`}
          />
        ))}

        {/* Appointments */}
        {appointments
          .filter(apt => apt.date === date)
          .map(appointment => {
            const top = getTimePosition(appointment.start_time, startHour, hourHeight);
            const height = getAppointmentHeight(appointment.start_time, appointment.end_time, hourHeight);
            
            return (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                style={{ top: `${top}px`, height: `${height}px` }}
                onClick={() => onAppointmentClick(appointment)}
              />
            );
          })}
      </div>
    </div>
  );
}
