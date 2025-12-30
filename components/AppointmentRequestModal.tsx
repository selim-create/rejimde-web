'use client';

import { useState, useEffect } from 'react';
import { requestAppointment, getExpertAvailableSlots, getMe } from '@/lib/api';
import { format, addDays, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import ConfirmModal from './ui/ConfirmModal';

interface AppointmentRequestModalProps {
  expertId: number;
  expertName: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface UserData {
  name: string;
  email: string;
}

export default function AppointmentRequestModal({
  expertId,
  expertName,
  onClose,
  onSuccess
}: AppointmentRequestModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
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
    preferred_time: '',
    alternate_date: '',
    alternate_time: '',
    message: '',
    service_id: ''
  });

  // Generate next 14 days for date selection
  const availableDates = [];
  for (let i = 0; i < 14; i++) {
    const date = addDays(new Date(), i);
    availableDates.push({
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'd MMMM yyyy, EEEE', { locale: tr })
    });
  }

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const profile = await getMe();
        // Ensure profile has required name and email fields with non-empty values
        const hasValidName = typeof profile?.name === 'string' && profile.name.trim();
        const hasValidEmail = typeof profile?.email === 'string' && profile.email.trim();
        
        if (profile && hasValidName && hasValidEmail) {
          setUserData({
            name: profile.name.trim(),
            email: profile.email.trim()
          });
        } else {
          console.warn('User profile is missing name or email', { 
            hasProfile: Boolean(profile), 
            hasName: Boolean(profile?.name), 
            hasEmail: Boolean(profile?.email) 
          });
        }
      } catch (error) {
        console.error('User data fetch error:', error);
      }
    };
    
    fetchUserData();
  }, []);

  // Load available slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  const loadAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const result = await getExpertAvailableSlots(expertId, selectedDate);
      setAvailableSlots(result.available_slots || []);
    } catch (error) {
      console.error('Error loading slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Helper function to check if form has valid time selection
  const hasValidTimeSelection = () => {
    return formData.preferred_time || (formData.alternate_date && formData.alternate_time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is logged in
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setConfirmModal({
          isOpen: true,
          type: 'warning',
          title: 'Giriş Gerekli',
          message: 'Randevu talebi oluşturmak için giriş yapmalısınız.'
        });
        setTimeout(() => {
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        }, 2000);
        return;
      }
    }

    // Validate that either preferred time OR alternate date/time is provided
    if (!selectedDate || !hasValidTimeSelection()) {
      setConfirmModal({
        isOpen: true,
        type: 'warning',
        title: 'Eksik Bilgi',
        message: 'Lütfen tercih ettiğiniz tarih ve saat veya alternatif tarih ve saat bilgilerini giriniz.'
      });
      return;
    }

    // Validate user data is available
    if (!userData) {
      setConfirmModal({
        isOpen: true,
        type: 'error',
        title: 'Kullanıcı Bilgisi Eksik',
        message: 'Kullanıcı bilgileriniz yüklenemedi. Lütfen sayfayı yenileyin ve tekrar deneyin.'
      });
      return;
    }

    setIsProcessing(true);
    const result = await requestAppointment({
      expert_id: expertId,
      preferred_date: selectedDate,
      preferred_time: formData.preferred_time,
      alternative_date: formData.alternate_date || undefined,
      alternative_time: formData.alternate_time || undefined,
      message: formData.message || undefined,
      service_id: formData.service_id ? parseInt(formData.service_id) : undefined,
      name: userData.name,
      email: userData.email
    });
    setIsProcessing(false);

    if (result.success) {
      setConfirmModal({
        isOpen: true,
        type: 'success',
        title: 'Başarılı!',
        message: 'Randevu talebiniz gönderildi. Uzman en kısa sürede yanıt verecektir.'
      });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } else {
      setConfirmModal({
        isOpen: true,
        type: 'error',
        title: 'Hata',
        message: result.message || 'Randevu talebi gönderilemedi. Lütfen tekrar deneyin.'
      });
    }
  };

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
        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold">Randevu Talebi</h2>
              <p className="text-sm opacity-90 mt-1">{expertName}</p>
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
          {/* Date Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
              Tercih Ettiğiniz Tarih *
            </label>
            <select
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setFormData({ ...formData, preferred_time: '' }); // Reset time when date changes
              }}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-green-500 focus:outline-none font-bold"
              required
            >
              <option value="">Tarih Seçiniz</option>
              {availableDates.map((date) => (
                <option key={date.value} value={date.value}>
                  {date.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
                Tercih Ettiğiniz Saat *
              </label>
              {loadingSlots ? (
                <div className="text-slate-500 text-sm py-3">
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Müsait saatler yükleniyor...
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setFormData({ ...formData, preferred_time: time })}
                      className={`py-2 rounded-lg font-bold border-2 transition ${
                        formData.preferred_time === time
                          ? 'bg-green-600 border-green-500 text-white'
                          : 'bg-slate-900 border-slate-600 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-yellow-400 text-sm">
                  <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                  Bu tarihte müsait saat bulunmamaktadır. Lütfen alternatif tarih belirtiniz.
                </div>
              )}
            </div>
          )}

          {/* Alternate Date/Time (Optional) */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <i className="fa-solid fa-calendar-alt text-blue-400"></i>
              Alternatif Tarih/Saat (Opsiyonel)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={formData.alternate_date}
                onChange={(e) => setFormData({ ...formData, alternate_date: e.target.value })}
                className="bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 text-white focus:border-blue-500 focus:outline-none text-sm"
                placeholder="Alternatif Tarih"
              />
              <input
                type="time"
                value={formData.alternate_time}
                onChange={(e) => setFormData({ ...formData, alternate_time: e.target.value })}
                className="bg-slate-900 border border-slate-600 rounded-xl px-4 py-2 text-white focus:border-blue-500 focus:outline-none text-sm"
                placeholder="Alternatif Saat"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
              Mesajınız (Opsiyonel)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Uzmanınıza iletmek istediğiniz bir mesaj varsa yazabilirsiniz..."
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-green-500 focus:outline-none resize-none"
              rows={3}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isProcessing || !selectedDate || !hasValidTimeSelection()}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-extrabold shadow-btn btn-game hover:bg-green-500 transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                Gönderiliyor...
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane mr-2"></i>
                Randevu Talebi Gönder
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
