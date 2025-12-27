"use client";

import { useState, useEffect } from "react";

interface DatePickerRejimdeProps {
  value: string; // ISO date format YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  maxDate?: Date;
  minDate?: Date;
}

const TURKISH_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

export default function DatePickerRejimde({ value, onChange, label, maxDate, minDate }: DatePickerRejimdeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMonth, setViewMonth] = useState<number>(new Date().getMonth());
  const [viewYear, setViewYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setViewMonth(date.getMonth());
      setViewYear(date.getFullYear());
    }
  }, [value]);

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewYear, viewMonth, day);
    
    // Check date constraints
    if (maxDate && newDate > maxDate) return;
    if (minDate && newDate < minDate) return;

    setSelectedDate(newDate);
    const isoDate = newDate.toISOString().split('T')[0];
    onChange(isoDate);
    setIsOpen(false);
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6, Monday to 0
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewMonth, viewYear);
    const firstDay = getFirstDayOfMonth(viewMonth, viewYear);
    const days: React.ReactElement[] = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(viewYear, viewMonth, day);
      const isSelected = selectedDate && 
        currentDate.getDate() === selectedDate.getDate() &&
        currentDate.getMonth() === selectedDate.getMonth() &&
        currentDate.getFullYear() === selectedDate.getFullYear();
      
      const isDisabled = (maxDate && currentDate > maxDate) || (minDate && currentDate < minDate);
      const isToday = new Date().toDateString() === currentDate.toDateString();

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isDisabled && handleDateClick(day)}
          disabled={isDisabled}
          className={`p-2 rounded-lg text-sm font-bold transition ${
            isSelected
              ? 'bg-rejimde-blue text-white'
              : isToday
              ? 'bg-slate-700 text-white'
              : isDisabled
              ? 'text-slate-600 cursor-not-allowed'
              : 'text-slate-200 hover:bg-slate-700'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const changeMonth = (delta: number) => {
    let newMonth = viewMonth + delta;
    let newYear = viewYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }

    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const formatDisplayDate = () => {
    if (!selectedDate) return "Tarih Seçiniz";
    return `${selectedDate.getDate()} ${TURKISH_MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  };

  return (
    <div className="relative">
      {label && <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-4 font-bold text-white outline-none focus:border-rejimde-blue hover:border-slate-500 transition text-left flex items-center justify-between"
      >
        <span className={selectedDate ? 'text-white' : 'text-slate-500'}>{formatDisplayDate()}</span>
        <i className={`fa-solid fa-calendar text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border-2 border-slate-700 rounded-2xl p-4 shadow-2xl z-50">
            {/* Month/Year Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              
              <div className="flex gap-2">
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(parseInt(e.target.value))}
                  className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1 text-sm font-bold text-white cursor-pointer"
                >
                  {TURKISH_MONTHS.map((month, idx) => (
                    <option key={idx} value={idx}>{month}</option>
                  ))}
                </select>
                
                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(parseInt(e.target.value))}
                  className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1 text-sm font-bold text-white cursor-pointer"
                >
                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                <div key={day} className="text-center text-xs font-bold text-slate-400 p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
