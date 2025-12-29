import { useState } from 'react';
import type { Appointment } from '@/lib/api';
import { format, addDays, subDays, isSameDay, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

interface DailyViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onNewAppointment: () => void;
}

export default function DailyView({
  currentDate,
  appointments,
  onAppointmentClick,
  onNewAppointment
}: DailyViewProps) {
  const [selectedDate, setSelectedDate] = useState(currentDate);

  // Generate date strip (7 days: 3 before, current, 3 after)
  const dateStrip = [];
  for (let i = -3; i <= 3; i++) {
    const date = addDays(currentDate, i);
    dateStrip.push(date);
  }

  // Filter appointments for selected date
  const dayAppointments = appointments.filter(apt => {
    const aptDate = parseISO(apt.date);
    return isSameDay(aptDate, selectedDate);
  });

  // Sort appointments by start time
  const sortedAppointments = [...dayAppointments].sort((a, b) => {
    return a.start_time.localeCompare(b.start_time);
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-slate-500';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Onaylandı';
      case 'pending':
        return 'Bekliyor';
      case 'cancelled':
        return 'İptal';
      case 'completed':
        return 'Tamamlandı';
      default:
        return status;
    }
  };

  // Get type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'online':
        return (
          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-bold border border-purple-500/30">
            <i className="fa-solid fa-video mr-1"></i>
            Online
          </span>
        );
      case 'in_person':
        return (
          <span className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded-lg text-xs font-bold border border-orange-500/30">
            <i className="fa-solid fa-handshake mr-1"></i>
            Yüz Yüze
          </span>
        );
      case 'phone':
        return (
          <span className="px-2 py-1 bg-teal-500/20 text-teal-300 rounded-lg text-xs font-bold border border-teal-500/30">
            <i className="fa-solid fa-phone mr-1"></i>
            Telefon
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Strip */}
      <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
          {dateStrip.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`min-w-[80px] flex flex-col items-center justify-center p-3 rounded-xl transition ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : isToday
                    ? 'bg-slate-700 text-white border-2 border-blue-500'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold uppercase mb-1">
                  {format(date, 'EEE', { locale: tr })}
                </div>
                <div className="text-2xl font-extrabold">
                  {format(date, 'd')}
                </div>
                <div className="text-xs opacity-70">
                  {format(date, 'MMM', { locale: tr })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-extrabold text-white">
          {format(selectedDate, 'd MMMM yyyy, EEEE', { locale: tr })}
          {isSameDay(selectedDate, new Date()) && (
            <span className="ml-3 text-sm text-blue-400">
              <i className="fa-solid fa-circle-dot mr-1"></i>
              Bugün
            </span>
          )}
        </h2>
        <button
          onClick={onNewAppointment}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-500 transition shadow-btn"
        >
          <i className="fa-solid fa-plus mr-2"></i>
          Yeni Randevu
        </button>
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {sortedAppointments.length > 0 ? (
          sortedAppointments.map((appointment) => {
            const endTime = new Date(`2000-01-01T${appointment.start_time}`);
            endTime.setMinutes(endTime.getMinutes() + (appointment.duration || 60));
            const endTimeStr = endTime.toTimeString().substring(0, 5);

            return (
              <div
                key={appointment.id}
                onClick={() => onAppointmentClick(appointment)}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-4 hover:border-blue-500/50 hover:bg-slate-750 transition cursor-pointer group"
              >
                {/* Status Line */}
                <div className={`h-1 w-full ${getStatusColor(appointment.status)} rounded-full mb-3`}></div>

                <div className="flex justify-between items-start gap-4">
                  {/* Left: Time & Type */}
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-extrabold text-white mb-1">
                      {appointment.start_time}
                    </div>
                    <div className="text-sm text-slate-400 mb-2">
                      {appointment.duration || 60} dk • {endTimeStr}'e kadar
                    </div>
                    {getTypeBadge(appointment.type)}
                  </div>

                  {/* Center: Client & Title */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {/* Client Avatar */}
                      {appointment.client && (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {appointment.client.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-white font-bold">
                          {appointment.client?.name || 'Kişisel Randevu'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {getStatusText(appointment.status)}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-slate-300 font-medium">
                      {appointment.title || 'Randevu'}
                    </div>

                    {appointment.is_recurring && (
                      <div className="mt-2 inline-flex items-center gap-1 text-xs text-purple-400">
                        <i className="fa-solid fa-repeat"></i>
                        <span>Tekrarlayan</span>
                      </div>
                    )}

                    {appointment.location && (
                      <div className="mt-2 text-xs text-slate-400">
                        <i className="fa-solid fa-location-dot mr-1"></i>
                        {appointment.location}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex gap-2">
                    {appointment.type === 'online' && appointment.meeting_link && appointment.status === 'confirmed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(appointment.meeting_link, '_blank');
                        }}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-500 transition"
                      >
                        <i className="fa-solid fa-video mr-1"></i>
                        Başlat
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(appointment);
                      }}
                      className="px-3 py-2 bg-slate-700 text-white rounded-lg text-sm font-bold hover:bg-slate-600 transition group-hover:bg-blue-600"
                    >
                      <i className="fa-solid fa-edit mr-1"></i>
                      Düzenle
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // Empty State
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-700 flex items-center justify-center">
              <i className="fa-solid fa-calendar-xmark text-3xl text-slate-500"></i>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Randevu Yok</h3>
            <p className="text-slate-400 mb-6">
              {format(selectedDate, 'd MMMM yyyy', { locale: tr })} tarihinde hiç randevunuz yok.
            </p>
            <button
              onClick={onNewAppointment}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition shadow-btn"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              İlk Randevuyu Oluştur
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
