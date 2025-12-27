'use client';

import { useState, useEffect } from "react";
import { getMyAppointments, cancelMyAppointment, MyAppointment } from "@/lib/api";

export default function UserCalendarPage() {
  const [appointments, setAppointments] = useState<MyAppointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getMyAppointments();
        setAppointments(data);
      } catch (error) {
        console.error("Randevular yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm('Randevuyu iptal etmek istediğinize emin misiniz?')) return;
    
    const result = await cancelMyAppointment(appointmentId, 'Kullanıcı tarafından iptal edildi');
    if (result.success) {
      // Reload appointments
      const data = await getMyAppointments();
      setAppointments(data);
      alert('Randevu iptal edildi.');
    } else {
      alert(result.message || 'Randevu iptal edilemedi.');
    }
  };

  // Basit bir sonraki 7 günü oluşturma fonksiyonu
  const generateDays = () => {
    const days = [];
    const start = new Date(); 
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({
        fullDate: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
        dayNumber: d.getDate(),
        isToday: i === 0
      });
    }
    return days;
  };

  const days = generateDays();
  const dailyAppointments = appointments.filter(apt => apt.date === selectedDate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'scheduled':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-400';
      case 'cancelled':
        return 'bg-red-500';
      case 'no_show':
        return 'bg-orange-500';
      default:
        return 'bg-yellow-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 font-sans text-gray-800">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
              <a href="/dashboard" className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition">
                  <i className="fa-solid fa-arrow-left"></i>
              </a>
              <div>
                  <h1 className="font-extrabold text-gray-800 text-xl tracking-tight">Takvimim</h1>
                  <p className="text-xs font-bold text-gray-500">Randevularını takip et</p>
              </div>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 font-sans text-gray-800">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
         <div className="flex items-center gap-4">
            <a href="/dashboard" className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition">
                <i className="fa-solid fa-arrow-left"></i>
            </a>
            <div>
                <h1 className="font-extrabold text-gray-800 text-xl tracking-tight">Takvimim</h1>
                <p className="text-xs font-bold text-gray-500">Randevularını takip et</p>
            </div>
         </div>
         <a href="/experts" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-btn btn-game flex items-center gap-2 hover:bg-blue-500 transition">
            <i className="fa-solid fa-plus"></i> <span className="hidden sm:inline">Randevu Al</span>
         </a>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Date Strip */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {days.map((day) => (
                <button 
                    key={day.fullDate}
                    onClick={() => setSelectedDate(day.fullDate)}
                    className={`flex flex-col items-center justify-center min-w-[70px] h-[80px] rounded-2xl border-2 transition-all ${
                        selectedDate === day.fullDate 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg scale-105' 
                            : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    <span className="text-xs font-bold uppercase">{day.dayName}</span>
                    <span className="text-2xl font-black">{day.dayNumber}</span>
                    {day.isToday && <span className={`w-1.5 h-1.5 rounded-full mt-1 ${selectedDate === day.fullDate ? 'bg-white' : 'bg-blue-500'}`}></span>}
                </button>
            ))}
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
            <h3 className="font-extrabold text-gray-400 text-sm uppercase tracking-wide mb-2 pl-2">
                {new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </h3>

            {dailyAppointments.length > 0 ? (
                dailyAppointments.map((apt) => (
                    <div key={apt.id} className="bg-white border-2 border-gray-100 rounded-3xl p-5 hover:border-blue-200 transition group flex flex-col sm:flex-row gap-5 items-start sm:items-center relative overflow-hidden shadow-sm">
                        {/* Status Line */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getStatusColor(apt.status)}`}></div>

                        {/* Time Column */}
                        <div className="flex flex-row sm:flex-col items-center sm:items-start gap-2 sm:gap-0 min-w-[80px] pl-3">
                            <span className="text-xl font-black text-gray-800">{apt.start_time}</span>
                            <span className="text-xs font-bold text-gray-400">{apt.duration} dk</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide border ${
                                    apt.type === 'online' 
                                        ? 'bg-purple-50 text-purple-600 border-purple-100' 
                                        : 'bg-orange-50 text-orange-600 border-orange-100'
                                }`}>
                                    {apt.type === 'online' ? 'Online Görüşme' : 'Yüzyüze'}
                                </span>
                                {apt.status === 'completed' && (
                                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                        <i className="fa-solid fa-check-circle"></i> Tamamlandı
                                    </span>
                                )}
                                {apt.status === 'cancelled' && (
                                    <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                                        <i className="fa-solid fa-times-circle"></i> İptal Edildi
                                    </span>
                                )}
                            </div>
                            
                            <h4 className="font-extrabold text-gray-800 text-lg leading-tight mb-2">{apt.title}</h4>
                            
                            <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={apt.expert.avatar} className="w-8 h-8 rounded-full border border-gray-100" alt={apt.expert.name} />
                                <div>
                                    <p className="text-xs font-bold text-gray-700">{apt.expert.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold">{apt.expert.title}</p>
                                </div>
                            </div>
                            
                            {apt.description && (
                                <p className="text-xs text-gray-500 mt-2">{apt.description}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            {(apt.status === 'confirmed' || apt.status === 'scheduled') && (
                                <>
                                    {apt.type === 'online' && apt.meeting_link ? (
                                        <a href={apt.meeting_link} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-extrabold text-xs shadow-btn btn-game flex items-center justify-center gap-2 transition">
                                            <i className="fa-solid fa-video"></i> Katıl
                                        </a>
                                    ) : apt.type === 'offline' && apt.location ? (
                                        <div className="flex-1 sm:flex-none bg-gray-50 border border-gray-200 text-gray-500 px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                                            <i className="fa-solid fa-location-dot"></i> {apt.location}
                                        </div>
                                    ) : null}
                                    
                                    {apt.can_cancel && (
                                        <button 
                                            onClick={() => handleCancelAppointment(apt.id)}
                                            className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-xl font-bold text-xs transition border border-red-100"
                                        >
                                            <i className="fa-solid fa-times"></i>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gray-100">
                        <i className="fa-regular fa-calendar-xmark text-2xl text-gray-400"></i>
                    </div>
                    <h3 className="font-bold text-gray-700 text-lg">Boş Gün</h3>
                    <p className="text-gray-500 text-xs mt-1">Bu tarih için planlanmış bir randevun yok.</p>
                    <a href="/experts" className="inline-block mt-4 text-blue-600 font-bold text-sm hover:underline">
                        + Randevu Al
                    </a>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
                    className={`flex flex-col items-center justify-center min-w-[70px] h-[80px] rounded-2xl border-2 transition-all ${
                        selectedDate === day.fullDate 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg scale-105' 
                            : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    <span className="text-xs font-bold uppercase">{day.dayName}</span>
                    <span className="text-2xl font-black">{day.dayNumber}</span>
                    {day.isToday && <span className={`w-1.5 h-1.5 rounded-full mt-1 ${selectedDate === day.fullDate ? 'bg-white' : 'bg-blue-500'}`}></span>}
                </button>
            ))}
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
            <h3 className="font-extrabold text-gray-400 text-sm uppercase tracking-wide mb-2 pl-2">
                {new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </h3>

            {dailyAppointments.length > 0 ? (
                dailyAppointments.map((apt) => (
                    <div key={apt.id} className="bg-white border-2 border-gray-100 rounded-3xl p-5 hover:border-blue-200 transition group flex flex-col sm:flex-row gap-5 items-start sm:items-center relative overflow-hidden shadow-sm">
                        {/* Status Line */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                            apt.status === 'confirmed' ? 'bg-green-500' : 
                            apt.status === 'completed' ? 'bg-gray-400' : 'bg-yellow-500'
                        }`}></div>

                        {/* Time Column */}
                        <div className="flex flex-row sm:flex-col items-center sm:items-start gap-2 sm:gap-0 min-w-[80px] pl-3">
                            <span className="text-xl font-black text-gray-800">{apt.time}</span>
                            <span className="text-xs font-bold text-gray-400">{apt.duration} dk</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide border ${
                                    apt.type === 'online' 
                                        ? 'bg-purple-50 text-purple-600 border-purple-100' 
                                        : 'bg-orange-50 text-orange-600 border-orange-100'
                                }`}>
                                    {apt.type === 'online' ? 'Online Görüşme' : 'Yüzyüze'}
                                </span>
                                {apt.status === 'completed' && (
                                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                        <i className="fa-solid fa-check-circle"></i> Tamamlandı
                                    </span>
                                )}
                            </div>
                            
                            <h4 className="font-extrabold text-gray-800 text-lg leading-tight mb-2">{apt.title}</h4>
                            
                            <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={apt.expertAvatar} className="w-8 h-8 rounded-full border border-gray-100" alt={apt.expertName} />
                                <div>
                                    <p className="text-xs font-bold text-gray-700">{apt.expertName}</p>
                                    <p className="text-[10px] text-gray-400 font-bold">{apt.expertTitle}</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            {apt.status === 'confirmed' && (
                                <>
                                    {apt.type === 'online' ? (
                                        <a href={apt.link} target="_blank" className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-extrabold text-xs shadow-btn btn-game flex items-center justify-center gap-2 transition">
                                            <i className="fa-solid fa-video"></i> Katıl
                                        </a>
                                    ) : (
                                        <div className="flex-1 sm:flex-none bg-gray-50 border border-gray-200 text-gray-500 px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                                            <i className="fa-solid fa-location-dot"></i> {apt.location}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gray-100">
                        <i className="fa-regular fa-calendar-xmark text-2xl text-gray-400"></i>
                    </div>
                    <h3 className="font-bold text-gray-700 text-lg">Boş Gün</h3>
                    <p className="text-gray-500 text-xs mt-1">Bugün için planlanmış bir randevun yok.</p>
                    <a href="/experts" className="inline-block mt-4 text-blue-600 font-bold text-sm hover:underline">
                        + Randevu Al
                    </a>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}