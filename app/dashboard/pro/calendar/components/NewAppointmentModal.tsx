import { useState, useEffect, useCallback } from 'react';
import { createAppointment, getProClients, getExpertAddresses, getAvailabilitySettings, getExpertSettings } from '@/lib/api';
import type { Appointment, ClientListItem, ExpertAddress, ExpertSettings } from '@/lib/api';
import { generateTimeSlots, toISODateString } from '@/lib/calendar-utils';
import ConfirmModal from '@/components/ui/ConfirmModal';

// Error message translation function
function translateError(message: string): string {
  const translations: Record<string, string> = {
    'Time slot is not available': 'Bu saat dilimi müsait değil. Lütfen başka bir saat seçin.',
    'Missing required fields': 'Lütfen zorunlu alanları doldurun.',
    'Appointment created': 'Randevu oluşturuldu',
    'Failed to create appointment': 'Randevu oluşturulamadı.',
    'Client not found': 'Danışan bulunamadı.',
    'Invalid date or time': 'Geçersiz tarih veya saat.',
    'Appointment overlaps with existing': 'Bu saat diliminde zaten bir randevunuz var.',
  };
  return translations[message] || message;
}

interface NewAppointmentModalProps {
  onClose: () => void;
  onSuccess: (appointment: Appointment) => void;
  defaultDate?: string;
}

export default function NewAppointmentModal({ onClose, onSuccess, defaultDate }: NewAppointmentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [addresses, setAddresses] = useState<ExpertAddress[]>([]);
  const [settings, setSettings] = useState<ExpertSettings | null>(null);
  const [isPersonal, setIsPersonal] = useState(false);
  const [showCustomAddress, setShowCustomAddress] = useState(false);
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
    client_id: '',
    service_id: '',
    title: '',
    date: defaultDate || toISODateString(new Date()),
    start_time: '10:00',
    duration: 60,
    type: 'online' as 'online' | 'in_person' | 'phone',
    location: '',
    meeting_link: '',
    notes: '',
    selected_address_id: ''
  });

  const loadClients = useCallback(async () => {
    setLoadingClients(true);
    const result = await getProClients();
    setClients(result.clients || []);
    setLoadingClients(false);
  }, []);

  const loadAddresses = useCallback(async () => {
    const result = await getExpertAddresses();
    setAddresses(result);
  }, []);

  const loadSettings = useCallback(async () => {
    const data = await getExpertSettings();
    if (data) {
      setSettings(data);
      // Pre-fill default meeting link for online appointments
      if (data.default_meeting_link && formData.type === 'online') {
        setFormData(prev => ({
          ...prev,
          meeting_link: data.default_meeting_link || ''
        }));
      }
    }
  }, []);

  const loadAvailability = useCallback(async () => {
    const settings = await getAvailabilitySettings();
    if (settings && settings.schedule.length > 0) {
      // Find min and max hours from schedule
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
  }, []);

  useEffect(() => {
    loadClients();
    loadAddresses();
    loadSettings();
    loadAvailability();
  }, [loadClients, loadAddresses, loadSettings, loadAvailability]);

  // When type changes to 'online', set the default meeting link
  useEffect(() => {
    if (formData.type === 'online' && settings?.default_meeting_link && !formData.meeting_link) {
      setFormData(prev => ({
        ...prev,
        meeting_link: settings.default_meeting_link || ''
      }));
    }
  }, [formData.type, settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPersonal && !formData.client_id) {
      setConfirmModal({
        isOpen: true,
        type: 'warning',
        title: 'Danışan Gerekli',
        message: 'Lütfen bir danışan seçin veya kişisel randevu olarak işaretleyin.'
      });
      return;
    }

    setIsProcessing(true);
    const result = await createAppointment({
      client_id: isPersonal ? 0 : parseInt(formData.client_id) || 0,
      service_id: formData.service_id ? parseInt(formData.service_id) : undefined,
      title: formData.title || (isPersonal ? 'Kişisel Randevu' : 'Randevu'),
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
      // FIRST show success modal
      setConfirmModal({
        isOpen: true,
        type: 'success',
        title: 'Başarılı',
        message: 'Randevu başarıyla oluşturuldu!'
      });
      
      // THEN call onSuccess to refresh data
      onSuccess(result.appointment);
      
      // Close modal after delay to allow success message to be seen
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      // Show ERROR modal only on actual errors
      setConfirmModal({
        isOpen: true,
        type: 'error',
        title: 'Hata',
        message: translateError(result.message || 'Randevu oluşturulamadı.')
      });
    }
  };

  const handleAddressSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, selected_address_id: value });
    
    if (value === 'custom') {
      setShowCustomAddress(true);
      setFormData({ ...formData, location: '', selected_address_id: value });
    } else if (value) {
      const address = addresses.find(a => a.id === parseInt(value));
      if (address) {
        const locationText = `${address.title} - ${address.address}${address.city ? ', ' + address.city : ''}${address.district ? '/' + address.district : ''}`;
        setFormData({ ...formData, location: locationText, selected_address_id: value });
        setShowCustomAddress(false);
      }
    } else {
      setFormData({ ...formData, location: '', selected_address_id: '' });
      setShowCustomAddress(false);
    }
  };

  const timeSlots = generateTimeSlots(availabilityHours.start, availabilityHours.end, 30);

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
          {/* Personal Appointment Toggle */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPersonal}
                onChange={(e) => {
                  setIsPersonal(e.target.checked);
                  if (e.target.checked) {
                    setFormData({ ...formData, client_id: '' });
                  }
                }}
                className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-900"
              />
              <div className="flex-1">
                <span className="font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-user-clock text-purple-400"></i>
                  Kişisel Randevu
                </span>
                <p className="text-xs text-slate-400 mt-1">Danışan olmadan kişisel bir zaman bloğu oluştur</p>
              </div>
            </label>
          </div>

          {/* Client Selection - Hidden if personal */}
          {!isPersonal && (
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
                  required={!isPersonal}
                >
                  <option value="">Danışan Seçin</option>
                  {clients.map((clientItem) => (
                    <option key={clientItem.client.id} value={clientItem.client.id}>
                      {clientItem.client.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
              Randevu Başlığı {!isPersonal && '(Opsiyonel)'}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={isPersonal ? 'Örn: Araştırma Zamanı' : 'Örn: Haftalık Kontrol'}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold"
            />
            {isPersonal && (
              <p className="text-xs text-slate-500 mt-1">
                <i className="fa-solid fa-lightbulb mr-1"></i>
                Kişisel randevular takviminizde farklı renkte görünür
              </p>
            )}
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
              {settings?.default_meeting_link && formData.meeting_link === settings.default_meeting_link && (
                <p className="text-xs text-slate-500 mt-1">
                  <i className="fa-solid fa-check text-green-400 mr-1"></i>
                  Varsayılan toplantı linkiniz kullanılıyor
                </p>
              )}
            </div>
          )}

          {/* Location (for in-person) */}
          {formData.type === 'in_person' && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
                Lokasyon
              </label>
              
              {/* Address Selection Dropdown - Always show */}
              <select
                value={formData.selected_address_id}
                onChange={handleAddressSelect}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold mb-2"
              >
                <option value="">Kayıtlı Adreslerden Seç</option>
                {addresses.length > 0 ? (
                  <>
                    {addresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.title} - {addr.address}
                        {addr.is_default && ' (Varsayılan)'}
                      </option>
                    ))}
                    <option value="custom">+ Özel Adres Gir</option>
                  </>
                ) : (
                  <option value="" disabled>Kayıtlı adres bulunamadı</option>
                )}
              </select>
              
              {/* Manual Location Input */}
              {(showCustomAddress || addresses.length === 0) && (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Manuel adres girin..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold"
                />
              )}
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
