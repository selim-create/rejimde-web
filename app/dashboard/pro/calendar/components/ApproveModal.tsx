import { useState } from 'react';
import { approveAppointmentRequest } from '@/lib/api';
import type { AppointmentRequest } from '@/lib/api';
import { generateTimeSlots, toISODateString } from '@/lib/calendar-utils';

interface ApproveModalProps {
  request: AppointmentRequest;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApproveModal({ request, onClose, onSuccess }: ApproveModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    date: request.preferred_date,
    start_time: request.preferred_time,
    type: 'online' as 'online' | 'in_person' | 'phone',
    meeting_link: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.type === 'online' && !formData.meeting_link.trim()) {
      alert('Online randevu için toplantı linki gereklidir.');
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
      alert('Randevu talebi onaylandı!');
      onSuccess();
      onClose();
    } else {
      alert(result.message || 'Talep onaylanamadı.');
    }
  };

  const timeSlots = generateTimeSlots(8, 20, 30);

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
    </div>
  );
}
