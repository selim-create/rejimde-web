import type { Appointment } from '@/lib/api';
import { 
  formatDate, 
  formatTime, 
  getStatusLabel, 
  getStatusColor, 
  getTypeLabel, 
  getTypeIcon,
  getTypeColor 
} from '@/lib/calendar-utils';
import { cancelAppointment, completeAppointment, markNoShow } from '@/lib/api';
import { useState } from 'react';

interface AppointmentModalProps {
  appointment: Appointment;
  onClose: () => void;
  onUpdate: () => void;
}

export default function AppointmentModal({ appointment, onClose, onUpdate }: AppointmentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const statusColor = getStatusColor(appointment.status);
  const typeIcon = getTypeIcon(appointment.type);
  const typeLabel = getTypeLabel(appointment.type);

  const handleComplete = async () => {
    if (!confirm('Bu randevuyu tamamlandı olarak işaretlemek istediğinize emin misiniz?')) return;
    
    setIsProcessing(true);
    const result = await completeAppointment(appointment.id);
    setIsProcessing(false);
    
    if (result.success) {
      alert('Randevu tamamlandı olarak işaretlendi.');
      onUpdate();
      onClose();
    } else {
      alert(result.message || 'Bir hata oluştu.');
    }
  };

  const handleNoShow = async () => {
    if (!confirm('Danışan randevuya gelmedi mi?')) return;
    
    setIsProcessing(true);
    const result = await markNoShow(appointment.id);
    setIsProcessing(false);
    
    if (result.success) {
      alert('Randevu "Gelmedi" olarak işaretlendi.');
      onUpdate();
      onClose();
    } else {
      alert(result.message || 'Bir hata oluştu.');
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Lütfen iptal sebebi giriniz.');
      return;
    }
    
    setIsProcessing(true);
    const result = await cancelAppointment(appointment.id, cancelReason);
    setIsProcessing(false);
    
    if (result.success) {
      alert('Randevu iptal edildi.');
      onUpdate();
      onClose();
    } else {
      alert(result.message || 'Bir hata oluştu.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-3xl w-full max-w-2xl border border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${statusColor} p-6 text-white`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <i className={`fa-solid ${typeIcon}`}></i>
                <span className="text-sm font-bold uppercase">{typeLabel}</span>
              </div>
              <h2 className="text-2xl font-extrabold mb-1">{appointment.title}</h2>
              <p className="text-white/80">
                {formatDate(appointment.date)} • {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition"
            >
              <i className="fa-solid fa-xmark text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Client Info */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Danışan Bilgileri</h3>
            <div className="flex items-center gap-4">
              <img
                src={appointment.client.avatar}
                alt={appointment.client.name}
                className="w-14 h-14 rounded-xl"
              />
              <div>
                <h4 className="font-bold text-white text-lg">{appointment.client.name}</h4>
                {appointment.client.email && (
                  <p className="text-sm text-slate-400">{appointment.client.email}</p>
                )}
                {appointment.client.phone && (
                  <p className="text-sm text-slate-400">{appointment.client.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded-xl p-4">
              <div className="text-xs text-slate-500 uppercase font-bold mb-1">Süre</div>
              <div className="text-white font-bold">{appointment.duration} dakika</div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4">
              <div className="text-xs text-slate-500 uppercase font-bold mb-1">Durum</div>
              <div className="text-white font-bold">{getStatusLabel(appointment.status)}</div>
            </div>
            {appointment.service && (
              <div className="bg-slate-900/50 rounded-xl p-4 col-span-2">
                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Hizmet</div>
                <div className="text-white font-bold">{appointment.service.name}</div>
              </div>
            )}
          </div>

          {/* Meeting Link */}
          {appointment.meeting_link && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Toplantı Linki</h3>
              <a
                href={appointment.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl font-bold transition text-center"
              >
                <i className="fa-solid fa-video mr-2"></i>
                Toplantıya Katıl
              </a>
            </div>
          )}

          {/* Location */}
          {appointment.location && appointment.type === 'in_person' && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Lokasyon</h3>
              <p className="text-white">{appointment.location}</p>
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Notlar</h3>
              <p className="text-slate-300 text-sm italic">"{appointment.notes}"</p>
            </div>
          )}

          {/* Cancel Form */}
          {showCancelForm && appointment.status !== 'cancelled' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <h3 className="text-sm font-bold text-red-400 mb-2">İptal Sebebi</h3>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none resize-none"
                rows={3}
                placeholder="İptal sebebini yazın..."
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="flex-1 bg-red-600 text-white py-2 rounded-xl font-bold hover:bg-red-500 transition disabled:opacity-50"
                >
                  İptal Et
                </button>
                <button
                  onClick={() => setShowCancelForm(false)}
                  className="px-4 bg-slate-700 text-white py-2 rounded-xl font-bold hover:bg-slate-600 transition"
                >
                  Vazgeç
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {appointment.status !== 'cancelled' && appointment.status !== 'completed' && !showCancelForm && (
          <div className="p-6 border-t border-slate-700 flex gap-3">
            <button
              onClick={handleComplete}
              disabled={isProcessing}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-500 transition disabled:opacity-50"
            >
              <i className="fa-solid fa-check mr-2"></i>
              Tamamla
            </button>
            <button
              onClick={handleNoShow}
              disabled={isProcessing}
              className="flex-1 bg-slate-600 text-white py-3 rounded-xl font-bold hover:bg-slate-500 transition disabled:opacity-50"
            >
              <i className="fa-solid fa-user-slash mr-2"></i>
              Gelmedi
            </button>
            <button
              onClick={() => setShowCancelForm(true)}
              disabled={isProcessing}
              className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-500 transition disabled:opacity-50"
            >
              <i className="fa-solid fa-times mr-2"></i>
              İptal Et
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
