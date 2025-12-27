import { useState, useEffect } from 'react';
import { createAppointment, getProClients } from '@/lib/api';
import type { Appointment } from '@/lib/api';
import { generateTimeSlots, toISODateString } from '@/lib/calendar-utils';

interface NewAppointmentModalProps {
  onClose: () => void;
  onSuccess: (appointment: Appointment) => void;
  defaultDate?: string;
}

export default function NewAppointmentModal({ onClose, onSuccess, defaultDate }: NewAppointmentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  const [formData, setFormData] = useState({
    client_id: '',
    service_id: '',
    title: '',
    date: defaultDate || toISODateString(new Date()),
    start_time: '10:00',
    duration: 60,
    type: 'online' as 'online' | 'in_person' | 'phone',
    location: '',
    meeting_link: '',
    notes: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoadingClients(true);
    const result = await getProClients();
    if (result.success && result.clients) {
      setClients(result.clients);
    }
    setLoadingClients(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_id) {
      alert('Lütfen bir danışan seçin.');
      return;
    }

    setIsProcessing(true);
    const result = await createAppointment({
      client_id: parseInt(formData.client_id),
      service_id: formData.service_id ? parseInt(formData.service_id) : undefined,
      title: formData.title,
      date: formData.date,
      start_time: formData.start_time,
      duration: formData.duration,
      type: formData.type,
      location: formData.location || undefined,
      meeting_link: formData.meeting_link || undefined,
      notes: formData.notes || undefined
    });
    setIsProcessing(false);

    if (result.success && result.appointment) {
      alert('Randevu başarıyla oluşturuldu!');
      onSuccess(result.appointment);
      onClose();
    } else {
      alert(result.message || 'Randevu oluşturulamadı.');
    }
  };

  const timeSlots = generateTimeSlots(8, 20, 30);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-3xl w-full max-w-2xl border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold">Yeni Randevu Oluştur</h2>
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
          {/* Client Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
              Danışan Seç *
            </label>
            {loadingClients ? (
              <div className="text-slate-500 text-sm">Danışanlar yükleniyor...</div>
            ) : (
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold"
                required
              >
                <option value="">Danışan Seçin</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
              Randevu Başlığı
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Örn: Haftalık Kontrol"
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
                Tarih *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
                Saat *
              </label>
              <select
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold"
                required
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
              Süre
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold"
            >
              <option value={30}>30 dakika</option>
              <option value={45}>45 dakika</option>
              <option value={60}>60 dakika</option>
              <option value={90}>90 dakika</option>
              <option value={120}>120 dakika</option>
            </select>
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
                Toplantı Linki
              </label>
              <input
                type="url"
                value={formData.meeting_link}
                onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                placeholder="https://zoom.us/j/..."
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold"
              />
            </div>
          )}

          {/* Location (for in-person) */}
          {formData.type === 'in_person' && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
                Lokasyon
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ofis adresi"
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
              Notlar
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Randevu hakkında notlar..."
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none resize-none"
              rows={3}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-extrabold shadow-btn btn-game hover:bg-blue-500 transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                Oluşturuluyor...
              </>
            ) : (
              <>
                <i className="fa-solid fa-check mr-2"></i>
                Randevuyu Oluştur
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
