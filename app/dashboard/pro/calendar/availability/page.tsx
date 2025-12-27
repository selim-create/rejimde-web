'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getAvailabilitySettings, updateAvailabilitySettings } from '@/lib/api';

const WEEK_DAYS = [
  { value: 1, name: 'Pazartesi' },
  { value: 2, name: 'Salı' },
  { value: 3, name: 'Çarşamba' },
  { value: 4, name: 'Perşembe' },
  { value: 5, name: 'Cuma' },
  { value: 6, name: 'Cumartesi' },
  { value: 0, name: 'Pazar' }
];

interface DaySchedule {
  day: number;
  isActive: boolean;
  slots: { start: string; end: string }[];
}

export default function AvailabilityPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slotDuration, setSlotDuration] = useState(60);
  const [bufferTime, setBufferTime] = useState(0);
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    WEEK_DAYS.map(day => ({
      day: day.value,
      isActive: false,
      slots: [{ start: '09:00', end: '17:00' }]
    }))
  );

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const settings = await getAvailabilitySettings();
    
    if (settings) {
      setSlotDuration(settings.slot_duration);
      setBufferTime(settings.buffer_time);
      
      // Convert API schedule to local format
      const newSchedule = WEEK_DAYS.map(weekDay => {
        const daySchedule = settings.schedule.find(s => s.day === weekDay.value);
        return {
          day: weekDay.value,
          isActive: !!daySchedule && daySchedule.slots.length > 0,
          slots: daySchedule?.slots.length ? daySchedule.slots : [{ start: '09:00', end: '17:00' }]
        };
      });
      
      setSchedule(newSchedule);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const toggleDay = (day: number) => {
    setSchedule(schedule.map(s => 
      s.day === day ? { ...s, isActive: !s.isActive } : s
    ));
  };

  const addSlot = (day: number) => {
    setSchedule(schedule.map(s => 
      s.day === day 
        ? { ...s, slots: [...s.slots, { start: '09:00', end: '17:00' }] }
        : s
    ));
  };

  const removeSlot = (day: number, slotIndex: number) => {
    setSchedule(schedule.map(s => 
      s.day === day 
        ? { ...s, slots: s.slots.filter((_, i) => i !== slotIndex) }
        : s
    ));
  };

  const updateSlot = (day: number, slotIndex: number, field: 'start' | 'end', value: string) => {
    setSchedule(schedule.map(s => 
      s.day === day 
        ? {
            ...s,
            slots: s.slots.map((slot, i) => 
              i === slotIndex ? { ...slot, [field]: value } : slot
            )
          }
        : s
    ));
  };

  const handleSave = async () => {
    // Validate
    const activeSchedule = schedule.filter(s => s.isActive);
    if (activeSchedule.length === 0) {
      alert('En az bir gün için çalışma saatleri belirlemelisiniz.');
      return;
    }

    // Check for valid time ranges
    for (const day of activeSchedule) {
      for (const slot of day.slots) {
        if (slot.start >= slot.end) {
          alert('Başlangıç saati bitiş saatinden önce olmalıdır.');
          return;
        }
      }
    }

    setSaving(true);

    // Convert to API format
    const apiSchedule = activeSchedule.flatMap(day => 
      day.slots.map(slot => ({
        day: day.day,
        start_time: slot.start,
        end_time: slot.end
      }))
    );

    const result = await updateAvailabilitySettings({
      slot_duration: slotDuration,
      buffer_time: bufferTime,
      schedule: apiSchedule
    });

    setSaving(false);

    if (result.success) {
      alert('Müsaitlik ayarları kaydedildi!');
    } else {
      alert(result.message || 'Ayarlar kaydedilemedi.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 px-6 py-4 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard/pro/calendar" 
                className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </Link>
              <div>
                <h1 className="font-extrabold text-white text-xl tracking-tight">Müsaitlik Ayarları</h1>
                <p className="text-xs font-bold text-slate-500">Çalışma saatlerinizi belirleyin</p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-btn shadow-blue-800 btn-game hover:bg-blue-500 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-save mr-2"></i>
                  Kaydet
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <i className="fa-solid fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
              <p className="text-slate-400">Ayarlar yükleniyor...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Settings */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h3 className="font-bold text-white text-lg mb-4">Genel Ayarlar</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
                    Slot Süresi
                  </label>
                  <select
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold"
                  >
                    <option value={15}>15 dakika</option>
                    <option value={30}>30 dakika</option>
                    <option value={45}>45 dakika</option>
                    <option value={60}>60 dakika</option>
                    <option value={90}>90 dakika</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Randevu aralığı</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
                    Ara Süre (Buffer)
                  </label>
                  <select
                    value={bufferTime}
                    onChange={(e) => setBufferTime(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold"
                  >
                    <option value={0}>Yok</option>
                    <option value={5}>5 dakika</option>
                    <option value={10}>10 dakika</option>
                    <option value={15}>15 dakika</option>
                    <option value={30}>30 dakika</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Randevular arası boşluk</p>
                </div>
              </div>
            </div>

            {/* Weekly Schedule */}
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Haftalık Program</h3>
              
              <div className="space-y-4">
                {schedule.map((daySchedule, index) => {
                  const dayInfo = WEEK_DAYS[index];
                  
                  return (
                    <div key={daySchedule.day} className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={daySchedule.isActive}
                            onChange={() => toggleDay(daySchedule.day)}
                            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-600"
                          />
                          <span className="font-bold text-white">{dayInfo.name}</span>
                        </div>
                        {daySchedule.isActive && (
                          <button
                            onClick={() => addSlot(daySchedule.day)}
                            className="text-blue-400 text-sm font-bold hover:text-blue-300 transition"
                          >
                            <i className="fa-solid fa-plus mr-1"></i>
                            Slot Ekle
                          </button>
                        )}
                      </div>

                      {daySchedule.isActive ? (
                        <div className="space-y-2">
                          {daySchedule.slots.map((slot, slotIndex) => (
                            <div key={slotIndex} className="flex items-center gap-3">
                              <input
                                type="time"
                                value={slot.start}
                                onChange={(e) => updateSlot(daySchedule.day, slotIndex, 'start', e.target.value)}
                                className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none font-bold"
                              />
                              <span className="text-slate-500">-</span>
                              <input
                                type="time"
                                value={slot.end}
                                onChange={(e) => updateSlot(daySchedule.day, slotIndex, 'end', e.target.value)}
                                className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none font-bold"
                              />
                              {daySchedule.slots.length > 1 && (
                                <button
                                  onClick={() => removeSlot(daySchedule.day, slotIndex)}
                                  className="text-red-400 hover:text-red-300 transition p-2"
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 pl-8">Kapalı</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-info-circle text-blue-400 text-lg mt-0.5"></i>
                <div className="text-sm text-blue-300">
                  <p className="font-bold mb-1">Müsaitlik Ayarları Hakkında</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-200">
                    <li>Çalışma günlerinizi ve saatlerinizi belirleyin</li>
                    <li>Her gün için birden fazla zaman dilimi ekleyebilirsiniz</li>
                    <li>Slot süresi randevu rezervasyon aralığını belirler</li>
                    <li>Buffer time randevular arası dinlenme süresidir</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
