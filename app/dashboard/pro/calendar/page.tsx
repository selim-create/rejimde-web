'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCalendarAppointments } from '@/lib/api';
import type { Appointment, BlockedTime } from '@/lib/api';
import { getWeekStart, getWeekEnd, getMonthStart, getMonthEnd, toISODateString, formatDateRange } from '@/lib/calendar-utils';
import { addDays, subDays, addMonths, subMonths } from 'date-fns';
import DailyView from './components/DailyView';
import WeekView from './components/WeekView';
import MonthView from './components/MonthView';
import AppointmentModal from './components/AppointmentModal';
import NewAppointmentModal from './components/NewAppointmentModal';

export default function ProCalendarPage() {
  const [viewType, setViewType] = useState<'day' | 'week' | 'month'>('day'); // Default: day view
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate, viewType]);

  const loadCalendarData = async () => {
    setLoading(true);
    
    // Get date range based on view type
    const startDate = viewType === 'week' 
      ? toISODateString(getWeekStart(currentDate))
      : toISODateString(getMonthStart(currentDate));
    const endDate = viewType === 'week'
      ? toISODateString(getWeekEnd(currentDate))
      : toISODateString(getMonthEnd(currentDate));
    
    const data = await getCalendarAppointments(startDate, endDate);
    setAppointments(data.appointments);
    setBlockedTimes(data.blocked_times);
    
    setLoading(false);
  };

  const handlePreviousPeriod = () => {
    if (viewType === 'day') {
      setCurrentDate(subDays(currentDate, 1));
    } else if (viewType === 'week') {
      setCurrentDate(subDays(currentDate, 7));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNextPeriod = () => {
    if (viewType === 'day') {
      setCurrentDate(addDays(currentDate, 1));
    } else if (viewType === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleAppointmentUpdate = () => {
    loadCalendarData();
  };

  const handleNewAppointmentSuccess = (appointment: Appointment) => {
    loadCalendarData();
  };

  const handleDayClick = (date: Date) => {
    // When clicking a day in month view, switch to week view for that day
    setCurrentDate(date);
    setViewType('week');
  };

  // Get display text for current period
  const getPeriodText = () => {
    if (viewType === 'day') {
      return currentDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
    } else if (viewType === 'week') {
      return formatDateRange(getWeekStart(currentDate), getWeekEnd(currentDate));
    } else {
      return currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
      
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/pro" className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition">
                <i className="fa-solid fa-arrow-left"></i>
              </Link>
              <div>
                <h1 className="font-extrabold text-white text-xl tracking-tight">Takvim</h1>
                <p className="text-xs font-bold text-slate-500">Randevularınızı yönetin</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* View Toggle */}
              <div className="flex items-center bg-slate-700 rounded-xl p-1">
                <button
                  onClick={() => setViewType('day')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
                    viewType === 'day'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-calendar-day mr-1"></i>
                  Gün
                </button>
                <button
                  onClick={() => setViewType('week')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
                    viewType === 'week'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-calendar-week mr-1"></i>
                  Hafta
                </button>
                <button
                  onClick={() => setViewType('month')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
                    viewType === 'month'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-calendar mr-1"></i>
                  Ay
                </button>
              </div>

              {/* Quick Links */}
              <Link
                href="/dashboard/pro/calendar/requests"
                className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 transition font-bold text-xs flex items-center gap-2"
              >
                <i className="fa-solid fa-inbox"></i>
                <span className="hidden sm:inline">Talepler</span>
              </Link>

              <Link
                href="/dashboard/pro/calendar/availability"
                className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 transition font-bold text-xs flex items-center gap-2"
              >
                <i className="fa-solid fa-clock"></i>
                <span className="hidden sm:inline">Müsaitlik</span>
              </Link>

              <button 
                onClick={() => setShowNewModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-btn shadow-blue-800 btn-game flex items-center gap-2 hover:bg-blue-500 transition"
              >
                <i className="fa-solid fa-plus"></i>
                <span className="hidden sm:inline">Yeni Randevu</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreviousPeriod}
              className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm hover:bg-slate-700 transition"
            >
              Bugün
            </button>
            <button
              onClick={handleNextPeriod}
              className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          <div className="text-lg font-bold text-white">
            {getPeriodText()}
          </div>

          <div className="text-sm text-slate-500">
            {appointments.length} randevu
          </div>
        </div>

        {/* Calendar View */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <i className="fa-solid fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i>
              <p className="text-slate-400">Takvim yükleniyor...</p>
            </div>
          </div>
        ) : viewType === 'day' ? (
          <DailyView
            currentDate={currentDate}
            appointments={appointments}
            onAppointmentClick={handleAppointmentClick}
            onNewAppointment={() => setShowNewModal(true)}
          />
        ) : viewType === 'week' ? (
          <WeekView
            currentDate={currentDate}
            appointments={appointments}
            onAppointmentClick={handleAppointmentClick}
          />
        ) : (
          <MonthView
            currentDate={currentDate}
            appointments={appointments}
            onAppointmentClick={handleAppointmentClick}
            onDayClick={handleDayClick}
          />
        )}

        {/* Empty State */}
        {!loading && appointments.length === 0 && (
          <div className="text-center py-12 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-3xl mt-6">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-regular fa-calendar-xmark text-2xl text-slate-500"></i>
            </div>
            <h3 className="font-bold text-slate-300 text-lg">Henüz Randevu Yok</h3>
            <p className="text-slate-500 text-sm mt-1">Bu hafta için planlanmış randevu bulunmuyor.</p>
            <button 
              onClick={() => setShowNewModal(true)}
              className="mt-4 text-blue-400 font-bold text-sm hover:underline"
            >
              + Randevu Ekle
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onUpdate={handleAppointmentUpdate}
        />
      )}

      {showNewModal && (
        <NewAppointmentModal
          onClose={() => setShowNewModal(false)}
          onSuccess={handleNewAppointmentSuccess}
          defaultDate={toISODateString(currentDate)}
        />
      )}
    </div>
  );
}