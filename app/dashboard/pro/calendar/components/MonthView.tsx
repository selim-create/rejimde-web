import type { Appointment } from '@/lib/api';

interface MonthViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
}

export default function MonthView({
  currentDate,
  appointments,
  onAppointmentClick
}: MonthViewProps) {
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
      <div className="text-center">
        <i className="fa-solid fa-calendar text-4xl text-slate-600 mb-4"></i>
        <h3 className="text-xl font-bold text-white mb-2">Aylık Görünüm</h3>
        <p className="text-slate-400">Bu özellik yakında eklenecek</p>
        <p className="text-sm text-slate-500 mt-2">
          Şimdilik haftalık görünümü kullanabilirsiniz
        </p>
      </div>
    </div>
  );
}
