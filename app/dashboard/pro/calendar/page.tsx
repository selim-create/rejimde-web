'use client';

import { useState } from "react";
// import Link from "next/link";

// --- MOCK DATA ---
const MOCK_APPOINTMENTS = [
  {
    id: 1,
    clientId: 101,
    clientName: "Selin Yılmaz",
    date: "2025-12-28", // Demo için bugün varsayılıyor
    time: "10:00",
    duration: 60,
    type: "online",
    title: "Vinyasa Flow - Seviye 2",
    status: "confirmed", 
    location: "https://zoom.us/j/123456",
    isRecurring: true // Tekrarlayan randevu
  },
  {
    id: 2,
    clientId: 103,
    clientName: "Merve Boluğur",
    date: "2025-12-28",
    time: "15:30",
    duration: 45,
    type: "offline",
    title: "Haftalık Kontrol",
    status: "confirmed",
    location: "Nişantaşı Ofis"
  }
];

const MOCK_SERVICES = [
    { id: 1, title: "Online Yoga", duration: 60 },
    { id: 2, title: "Reformer", duration: 50 },
];

const MOCK_CLIENTS = [
    { id: 1, name: "Selin Yılmaz" },
    { id: 2, name: "Merve Boluğur" },
];

export default function ProCalendarPage() {
  const [selectedDate, setSelectedDate] = useState("2025-12-28");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isGoogleSynced, setIsGoogleSynced] = useState(false);

  // Basit bir sonraki 7 günü oluşturma fonksiyonu
  const generateDays = () => {
    const days = [];
    const start = new Date("2025-12-27"); 
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
  const dailyAppointments = MOCK_APPOINTMENTS.filter(apt => apt.date === selectedDate);

  const handleGoogleSync = () => {
      // Mock sync logic
      if (!isGoogleSynced) {
          alert("Google Calendar başarıyla bağlandı! Harici takvimindeki etkinlikler buraya yansıtılacak.");
          setIsGoogleSynced(true);
      } else {
          alert("Senkronizasyon yenilendi.");
      }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
      
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row justify-between items-center shadow-md gap-4">
         <div className="flex items-center gap-4 w-full md:w-auto">
            <a href="/dashboard/pro" className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition">
                <i className="fa-solid fa-arrow-left"></i>
            </a>
            <div>
                <h1 className="font-extrabold text-white text-xl tracking-tight">Takvim</h1>
                <p className="text-xs font-bold text-slate-500">Derslerini planla</p>
            </div>
         </div>
         
         <div className="flex items-center gap-3 w-full md:w-auto">
             {/* Google Calendar Sync Button */}
             <button 
                onClick={handleGoogleSync}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition border ${
                    isGoogleSynced 
                        ? 'bg-white text-slate-900 border-white hover:bg-slate-200' 
                        : 'bg-transparent text-slate-400 border-slate-600 hover:text-white hover:border-slate-500'
                }`}
             >
                <i className={`fa-brands fa-google ${isGoogleSynced ? 'text-red-500' : ''}`}></i> 
                {isGoogleSynced ? 'Takvim Eşitlendi' : 'Google ile Eşitle'}
             </button>

             <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-btn shadow-blue-800 btn-game flex items-center gap-2 hover:bg-blue-500 transition"
             >
                <i className="fa-solid fa-plus"></i> <span className="hidden sm:inline">Yeni Randevu</span>
             </button>
         </div>
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
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50 scale-105' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-750'
                    }`}
                >
                    <span className="text-xs font-bold uppercase">{day.dayName}</span>
                    <span className="text-2xl font-black">{day.dayNumber}</span>
                    {day.isToday && <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1"></span>}
                </button>
            ))}
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
            <h3 className="font-extrabold text-slate-400 text-sm uppercase tracking-wide mb-2 pl-2">
                {new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </h3>

            {dailyAppointments.length > 0 ? (
                dailyAppointments.map((apt) => (
                    <div key={apt.id} className="bg-slate-800 border border-slate-700 rounded-3xl p-5 hover:border-slate-600 transition group flex flex-col sm:flex-row gap-5 items-start sm:items-center relative overflow-hidden">
                        {/* Status Line */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                            apt.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>

                        {/* Time Column */}
                        <div className="flex flex-row sm:flex-col items-center sm:items-start gap-2 sm:gap-0 min-w-[80px] pl-3">
                            <span className="text-xl font-black text-white">{apt.time}</span>
                            <span className="text-xs font-bold text-slate-500">{apt.duration} dk</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide border ${
                                    apt.type === 'online' 
                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                }`}>
                                    {apt.type === 'online' ? 'Online Ders' : 'Yüzyüze'}
                                </span>
                                {/* Recurring Icon */}
                                {apt.isRecurring && (
                                    <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1" title="Tekrarlayan Etkinlik">
                                        <i className="fa-solid fa-repeat"></i> Haftalık
                                    </span>
                                )}
                            </div>
                            <h4 className="font-extrabold text-white text-lg leading-tight mb-1">{apt.title}</h4>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center text-[10px] text-white font-bold">
                                    {apt.clientName.charAt(0)}
                                </div>
                                <p className="text-sm font-bold text-slate-400">{apt.clientName}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            {apt.status === 'confirmed' && apt.type === 'online' && (
                                <a href={apt.location} target="_blank" className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-btn shadow-blue-900/50 btn-game flex items-center justify-center gap-2 transition">
                                    <i className="fa-solid fa-video"></i> Başlat
                                </a>
                            )}
                            <button className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-600 transition">
                                <i className="fa-solid fa-pen"></i>
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-12 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-3xl">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fa-regular fa-calendar-xmark text-2xl text-slate-500"></i>
                    </div>
                    <h3 className="font-bold text-slate-300 text-lg">Boş Gün</h3>
                    <p className="text-slate-500 text-xs mt-1">Bugün için planlanmış bir dersin yok.</p>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="mt-4 text-blue-400 font-bold text-sm hover:underline"
                    >
                        + Randevu Ekle
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* ADD APPOINTMENT MODAL */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowAddModal(false)}>
              <div className="bg-slate-800 rounded-3xl w-full max-w-md border border-slate-700 shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                      <i className="fa-solid fa-xmark text-xl"></i>
                  </button>
                  
                  <h2 className="text-xl font-extrabold text-white mb-4">Yeni Randevu Oluştur</h2>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Danışan Seç</label>
                          <select className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold appearance-none">
                              <option value="">Danışan Listesi</option>
                              {MOCK_CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                      </div>
                      
                      <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Hizmet</label>
                          <select className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold appearance-none">
                              {MOCK_SERVICES.map(s => <option key={s.id} value={s.id}>{s.title} ({s.duration} dk)</option>)}
                          </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Tarih</label>
                              <input type="date" className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold" defaultValue={selectedDate} />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Saat</label>
                              <input type="time" className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold" defaultValue="10:00" />
                          </div>
                      </div>

                      {/* Recurrence Option (YENİ) */}
                      <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Tekrar Durumu</label>
                          <select className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold appearance-none">
                              <option value="none">Tek Seferlik</option>
                              <option value="weekly">Her Hafta (Aynı saatte)</option>
                              <option value="monthly">Her Ay (Aynı günde)</option>
                          </select>
                      </div>
                      
                      <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-extrabold shadow-btn btn-game hover:bg-blue-500 transition mt-2">
                          Randevuyu Kaydet
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}