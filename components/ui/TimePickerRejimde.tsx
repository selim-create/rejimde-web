"use client";

import { useState } from "react";

interface TimeRangePickerProps {
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  onChange: (start: string, end: string) => void;
  label?: string;
}

export default function TimePickerRejimde({ startTime, endTime, onChange, label }: TimeRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState(startTime || "09:00");
  const [tempEnd, setTempEnd] = useState(endTime || "18:00");

  // Generate time options in 30-minute intervals
  const generateTimeOptions = () => {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const h = hour.toString().padStart(2, '0');
        const m = minute.toString().padStart(2, '0');
        times.push(`${h}:${m}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const handleApply = () => {
    onChange(tempStart, tempEnd);
    setIsOpen(false);
  };

  const formatTimeRange = () => {
    if (!startTime && !endTime) return "Saat Seçiniz";
    return `${startTime || '00:00'} - ${endTime || '00:00'}`;
  };

  return (
    <div className="relative">
      {label && <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-teal hover:border-slate-500 transition text-left flex items-center justify-between"
      >
        <span className={(startTime || endTime) ? 'text-white' : 'text-slate-500'}>{formatTimeRange()}</span>
        <i className={`fa-solid fa-clock text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 shadow-2xl z-50">
            <h4 className="text-xs font-extrabold text-slate-300 uppercase mb-3">Çalışma Saatleri</h4>
            
            <div className="space-y-4">
              {/* Start Time */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Başlangıç</label>
                <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-800 rounded-lg">
                  {timeOptions.map(time => (
                    <button
                      key={`start-${time}`}
                      type="button"
                      onClick={() => setTempStart(time)}
                      className={`px-2 py-2 rounded-lg text-xs font-bold transition ${
                        tempStart === time
                          ? 'bg-rejimde-teal text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* End Time */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Bitiş</label>
                <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-800 rounded-lg">
                  {timeOptions.map(time => (
                    <button
                      key={`end-${time}`}
                      type="button"
                      onClick={() => setTempEnd(time)}
                      className={`px-2 py-2 rounded-lg text-xs font-bold transition ${
                        tempEnd === time
                          ? 'bg-rejimde-teal text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-slate-800 text-slate-300 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-700 transition"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 bg-rejimde-teal text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-rejimde-tealDark transition"
              >
                Uygula
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
