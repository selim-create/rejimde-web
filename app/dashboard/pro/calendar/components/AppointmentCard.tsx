import type { Appointment } from '@/lib/api';
import { getStatusColor, getTypeIcon } from '@/lib/calendar-utils';

interface AppointmentCardProps {
  appointment: Appointment;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function AppointmentCard({ appointment, style, onClick }: AppointmentCardProps) {
  const statusColor = getStatusColor(appointment.status);
  const typeIcon = getTypeIcon(appointment.type);
  const isPersonal = !appointment.client;

  return (
    <div
      className={`absolute left-1 right-1 ${statusColor} rounded-lg p-2 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden ${isPersonal ? 'border-2 border-purple-400 border-dashed' : ''}`}
      style={style}
      onClick={onClick}
    >
      <div className="text-xs font-bold text-white truncate">
        {appointment.client?.name || 'Kişisel Randevu'}
      </div>
      <div className="text-xs text-white/80 truncate">
        {appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}
      </div>
      {appointment.service && (
        <div className="text-[10px] text-white/60 truncate mt-0.5">
          {appointment.service.name}
        </div>
      )}
      <div className="absolute top-1 right-1">
        <i className={`fa-solid ${typeIcon} text-white/60 text-[10px]`}></i>
      </div>
    </div>
  );
}
