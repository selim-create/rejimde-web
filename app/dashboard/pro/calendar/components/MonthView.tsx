'use client';

import type { Appointment } from '@/lib/api';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isToday,
  isSameDay
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState } from 'react';
import { getStatusColor } from '@/lib/calendar-utils';

interface MonthViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onDayClick?: (date: Date) => void;
}

export default function MonthView({
  currentDate,
  appointments,
  onAppointmentClick,
  onDayClick
}: MonthViewProps) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Get all days to display in the month view (including prev/next month)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start from Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Week days header
  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  // Get appointments for a specific day
  const getAppointmentsForDay = (date: Date): Appointment[] => {
    return appointments.filter(apt => 
      isSameDay(new Date(apt.date), date)
    );
  };

  // Handle day click
  const handleDayClick = (date: Date) => {
    setSelectedDay(date);
    if (onDayClick) {
      onDayClick(date);
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-px bg-slate-700">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className="bg-slate-800 p-3 text-center text-xs font-bold text-slate-400 uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-700">
        {days.map((day, index) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);
          const isSelected = selectedDay && isSameDay(day, selectedDay);

          return (
            <div
              key={index}
              onClick={() => handleDayClick(day)}
              className={`bg-slate-800 min-h-[100px] p-2 cursor-pointer transition hover:bg-slate-750 relative ${
                !isCurrentMonth ? 'opacity-40' : ''
              } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-bold ${
                    isDayToday
                      ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                      : isCurrentMonth
                      ? 'text-white'
                      : 'text-slate-600'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {/* Appointment Count Badge */}
                {dayAppointments.length > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {dayAppointments.length}
                  </span>
                )}
              </div>

              {/* Appointments Preview (max 3) */}
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((apt, aptIndex) => (
                  <div
                    key={apt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick(apt);
                    }}
                    className={`${getStatusColor(apt.status)} text-white text-xs px-2 py-1 rounded font-bold truncate hover:opacity-80 transition`}
                    title={`${apt.title} - ${apt.client?.name || 'Kişisel'}`}
                  >
                    {apt.title || apt.client?.name}
                  </div>
                ))}

                {/* More indicator */}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-slate-400 font-bold px-2">
                    +{dayAppointments.length - 3} daha
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Details (if any) */}
      {selectedDay && (
        <div className="border-t border-slate-700 bg-slate-850 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white">
              {format(selectedDay, 'd MMMM yyyy, EEEE', { locale: tr })}
            </h3>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-slate-400 hover:text-white transition"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Appointments List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {getAppointmentsForDay(selectedDay).length > 0 ? (
              getAppointmentsForDay(selectedDay).map(apt => (
                <div
                  key={apt.id}
                  onClick={() => onAppointmentClick(apt)}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-3 cursor-pointer hover:border-blue-500 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-sm">{apt.title}</h4>
                      <p className="text-xs text-slate-400">
                        {apt.client?.name || 'Kişisel Randevu'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-blue-400">
                        {apt.start_time} - {apt.end_time}
                      </div>
                      <div className={`text-xs ${getStatusColor(apt.status).replace('bg-', 'text-')}`}>
                        {apt.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-slate-500 text-sm">
                Bu gün için randevu yok
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
