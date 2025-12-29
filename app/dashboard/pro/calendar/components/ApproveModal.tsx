import { useState } from 'react';
import { approveAppointmentRequest, getAvailabilitySettings } from '@/lib/api';
import type { AppointmentRequest } from '@/lib/api';
import { generateTimeSlots } from '@/lib/calendar-utils';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useEffect } from 'react';

interface ApproveModalProps {
  request: AppointmentRequest;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApproveModal({ request, onClose, onSuccess }: ApproveModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [availabilityHours, setAvailabilityHours] = useState({ start: 0, end: 24 });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [formData, setFormData] = useState({
    date: request.preferred_date,
    start_time: request.preferred_time,
    type: 'online' as 'online' | 'in_person' | 'phone',
    meeting_link: ''
  });

  useEffect(() => {
    async function loadAvailability() {
      const settings = await getAvailabilitySettings();
      if (settings && settings.schedule.length > 0) {
        let minHour = 24;
        let maxHour = 0;
        
        settings.schedule.forEach(day => {
          day.slots.forEach(slot => {
            const startHour = parseInt(slot.start.split(':')[0]);
            const endHour = parseInt(slot.end.split(':')[0]);
            minHour = Math.min(minHour, startHour);
            maxHour = Math.max(maxHour, endHour);
          });
        });
        
        setAvailabilityHours({ start: minHour, end: maxHour + 1 });
      }
    }
    loadAvailability();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.type === 'online' && !formData.meeting_link.trim()) {
      setConfirmModal({
        isOpen: true,
        type: 'warning',
        title: 'Eksik Bilgi',
        message: 'Online randevu için toplantı linki gereklidir.'
      });
      return;
    }

    setIsProcessing(true);
    const result = await approveAppointmentRequest(request.id, {
      date: formData.date,
      start_time: formData.start_time,
      type: formData.type,
      meeting_link: formData.meeting_link || undefined
    });
    setIsProcessing(false);

    if (result.success) {
      setConfirmModal({
        isOpen: true,
        type: 'success',
        title: 'Başarılı!',
        message: 'Randevu talebi onaylandı!'
      });
      onSuccess();
      setTimeout(onClose, 1500);
    } else {
      setConfirmModal({
        isOpen: true,
        type: 'error',
        title: 'Hata',
        message: result.message || 'Talep onaylanamadı.'
      });
    }
  };

  const timeSlots = generateTimeSlots(availabilityHours.start, availabilityHours.end, 30);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-3xl w-full max-w-lg border border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-green-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold">Randevu Talebi Onayla</h2>
              <p className="text-white/80 text-sm mt-1">{request.requester.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition"
            >
              <i className="fa-solid fa-xmark text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
              Tarih *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-green-500 focus:outline-none font-bold"
              required
            />
            {request.alternative_date && (
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, date: request.preferred_date })}
                  className="text-xs bg-slate-700 text-white px-3 py-1.5 rounded-lg hover:bg-slate-600 transition"
                >
                  Tercih: {request.preferred_date}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, date: request.alternative_date! })}
                  className="text-xs bg-slate-700 text-white px-3 py-1.5 rounded-lg hover:bg-slate-600 transition"
                >
                  Alternatif: {request.alternative_date}
                </button>
              </div>
            )}
          </div>

          {/* Time */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
              Saat *
            </label>
            <select
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-green-500 focus:outline-none font-bold"
              required
            >
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            {request.alternative_time && (
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, start_time: request.preferred_time })}
                  className="text-xs bg-slate-700 text-white px-3 py-1.5 rounded-lg hover:bg-slate-600 transition"
                >
                  Tercih: {request.preferred_time}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, start_time: request.alternative_time! })}
                  className="text-xs bg-slate-700 text-white px-3 py-1.5 rounded-lg hover:bg-slate-600 transition"
                >
                  Alternatif: {request.alternative_time}
                </button>
              </div>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
              Randevu Türü *
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'online' })}
                className={`py-3 rounded-xl font-bold border-2 transition ${
                  formData.type === 'online'
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                <i className="fa-solid fa-video mr-2"></i>
                Online
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'in_person' })}
                className={`py-3 rounded-xl font-bold border-2 transition ${
                  formData.type === 'in_person'
                    ? 'bg-orange-600 border-orange-500 text-white'
                    : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                <i className="fa-solid fa-handshake mr-2"></i>
                Yüz Yüze
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'phone' })}
                className={`py-3 rounded-xl font-bold border-2 transition ${
                  formData.type === 'phone'
                    ? 'bg-teal-600 border-teal-500 text-white'
                    : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                <i className="fa-solid fa-phone mr-2"></i>
                Telefon
              </button>
            </div>
          </div>

          {/* Meeting Link (for online) */}
          {formData.type === 'online' && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
                Toplantı Linki *
              </label>
              <input
                type="url"
                value={formData.meeting_link}
                onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                placeholder="https://zoom.us/j/..."
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-green-500 focus:outline-none font-bold"
                required={formData.type === 'online'}
              />
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-green-600 text-white py-4 rounded-xl font-extrabold hover:bg-green-500 transition disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Onaylanıyor...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check mr-2"></i>
                  Onayla ve Oluştur
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-slate-700 text-white py-4 rounded-xl font-bold hover:bg-slate-600 transition"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
      
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
}
