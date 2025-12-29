/**
 * Calendar Utility Functions
 * Helper functions for calendar operations, date formatting, and time calculations
 */

import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isToday } from 'date-fns';
import { tr } from 'date-fns/locale';

// ==========================================
// DATE FORMATTING
// ==========================================

/**
 * Format date to Turkish locale string
 * @param date - Date string or Date object
 * @returns Formatted date (e.g., "27 Aralık 2025")
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'd MMMM yyyy', { locale: tr });
}

/**
 * Format time to HH:MM
 * @param time - Time string (e.g., "14:30:00" or "14:30")
 * @returns Formatted time (e.g., "14:30")
 */
export function formatTime(time: string): string {
  if (!time) return '';
  const parts = time.split(':');
  return `${parts[0]}:${parts[1]}`;
}

/**
 * Format date range
 * @param start - Start date
 * @param end - End date
 * @returns Formatted range (e.g., "27 Ara - 2 Oca")
 */
export function formatDateRange(start: string | Date, end: string | Date): string {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  
  const startStr = format(startDate, 'd MMM', { locale: tr });
  const endStr = format(endDate, 'd MMM', { locale: tr });
  
  return `${startStr} - ${endStr}`;
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 * @param date - Date object
 * @returns ISO date string
 */
export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get relative time (e.g., "2 saat önce")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  
  return formatDate(d);
}

// ==========================================
// WEEK & MONTH CALCULATIONS
// ==========================================

/**
 * Get week days starting from Monday
 * @param date - Reference date
 * @returns Array of week days with metadata
 */
export function getWeekDays(date: Date): {
  date: string;
  dateObj: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  fullDate: string;
}[] {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    const currentDay = addDays(start, i);
    days.push({
      date: toISODateString(currentDay),
      dateObj: currentDay,
      dayName: format(currentDay, 'EEEE', { locale: tr }),
      dayNumber: currentDay.getDate(),
      isToday: isToday(currentDay),
      fullDate: format(currentDay, 'd MMMM yyyy', { locale: tr })
    });
  }
  
  return days;
}

/**
 * Get week start (Monday)
 * @param date - Reference date
 * @returns Start of week
 */
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

/**
 * Get week end (Sunday)
 * @param date - Reference date
 * @returns End of week
 */
export function getWeekEnd(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: 1 });
}

/**
 * Get month start
 * @param date - Reference date
 * @returns Start of month
 */
export function getMonthStart(date: Date): Date {
  return startOfMonth(date);
}

/**
 * Get month end
 * @param date - Reference date
 * @returns End of month
 */
export function getMonthEnd(date: Date): Date {
  return endOfMonth(date);
}

// ==========================================
// TIME POSITION CALCULATIONS (for grid)
// ==========================================

/**
 * Calculate top position for time slot in grid
 * @param time - Time string (HH:MM)
 * @param startHour - Start hour of grid (default: 0)
 * @param hourHeight - Height of one hour in pixels (default: 64)
 * @returns Top position in pixels
 */
export function getTimePosition(time: string, startHour: number = 0, hourHeight: number = 64): number {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = (hours - startHour) * 60 + minutes;
  return (totalMinutes / 60) * hourHeight;
}

/**
 * Calculate height for appointment based on duration
 * @param startTime - Start time (HH:MM)
 * @param endTime - End time (HH:MM)
 * @param hourHeight - Height of one hour in pixels (default: 64)
 * @returns Height in pixels
 */
export function getAppointmentHeight(startTime: string, endTime: string, hourHeight: number = 64): number {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  const durationMinutes = endTotalMinutes - startTotalMinutes;
  
  return (durationMinutes / 60) * hourHeight;
}

/**
 * Calculate duration in minutes
 * @param startTime - Start time (HH:MM)
 * @param endTime - End time (HH:MM)
 * @returns Duration in minutes
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  return endTotalMinutes - startTotalMinutes;
}

/**
 * Add minutes to time
 * @param time - Time string (HH:MM)
 * @param minutes - Minutes to add
 * @returns New time string
 */
export function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
}

// ==========================================
// STATUS & TYPE HELPERS
// ==========================================

/**
 * Get status color class
 * @param status - Appointment status
 * @returns Tailwind color class
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500',
    confirmed: 'bg-blue-600',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500',
    no_show: 'bg-slate-500',
    blocked: 'bg-slate-700'
  };
  
  return colors[status] || 'bg-slate-600';
}

/**
 * Get status text color class
 * @param status - Appointment status
 * @returns Tailwind text color class
 */
export function getStatusTextColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'text-yellow-400',
    confirmed: 'text-blue-400',
    completed: 'text-green-400',
    cancelled: 'text-red-400',
    no_show: 'text-slate-400',
    blocked: 'text-slate-500'
  };
  
  return colors[status] || 'text-slate-400';
}

/**
 * Get status label
 * @param status - Appointment status
 * @returns Turkish status label
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Beklemede',
    confirmed: 'Onaylandı',
    completed: 'Tamamlandı',
    cancelled: 'İptal Edildi',
    no_show: 'Gelmedi'
  };
  
  return labels[status] || status;
}

/**
 * Get type icon
 * @param type - Appointment type
 * @returns Font Awesome icon class
 */
export function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    online: 'fa-video',
    in_person: 'fa-handshake',
    phone: 'fa-phone'
  };
  
  return icons[type] || 'fa-calendar';
}

/**
 * Get type label
 * @param type - Appointment type
 * @returns Turkish type label
 */
export function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    online: 'Online',
    in_person: 'Yüz Yüze',
    phone: 'Telefon'
  };
  
  return labels[type] || type;
}

/**
 * Get type color class
 * @param type - Appointment type
 * @returns Tailwind color class
 */
export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    online: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    in_person: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    phone: 'bg-teal-500/10 text-teal-400 border-teal-500/20'
  };
  
  return colors[type] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
}

// ==========================================
// VALIDATION HELPERS
// ==========================================

/**
 * Check if time slot is available
 * @param time - Time to check
 * @param duration - Duration in minutes
 * @param bookedSlots - Array of booked time slots
 * @returns True if available
 */
export function isTimeSlotAvailable(
  time: string,
  duration: number,
  bookedSlots: { start_time: string; end_time: string }[]
): boolean {
  const endTime = addMinutesToTime(time, duration);
  
  for (const slot of bookedSlots) {
    // Check if there's any overlap
    if (
      (time >= slot.start_time && time < slot.end_time) ||
      (endTime > slot.start_time && endTime <= slot.end_time) ||
      (time <= slot.start_time && endTime >= slot.end_time)
    ) {
      return false;
    }
  }
  
  return true;
}

/**
 * Generate time slots for a day
 * @param startHour - Start hour (default: 0 for 00:00)
 * @param endHour - End hour (default: 24 for 23:30)
 * @param interval - Interval in minutes (default: 30)
 * @returns Array of time strings
 */
export function generateTimeSlots(startHour: number = 0, endHour: number = 24, interval: number = 30): string[] {
  const slots: string[] = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }
  }
  
  return slots;
}

/**
 * Get hours array for day view
 * @param startHour - Start hour (default: 8)
 * @param endHour - End hour (default: 20)
 * @returns Array of hour numbers
 */
export function getDayHours(startHour: number = 8, endHour: number = 20): number[] {
  const hours: number[] = [];
  for (let i = startHour; i <= endHour; i++) {
    hours.push(i);
  }
  return hours;
}
