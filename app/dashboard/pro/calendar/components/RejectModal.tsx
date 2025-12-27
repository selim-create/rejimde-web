import { useState } from 'react';
import { rejectAppointmentRequest } from '@/lib/api';
import type { AppointmentRequest } from '@/lib/api';

interface RejectModalProps {
  request: AppointmentRequest;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RejectModal({ request, onClose, onSuccess }: RejectModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      alert('Lütfen reddetme sebebi giriniz.');
      return;
    }

    setIsProcessing(true);
    const result = await rejectAppointmentRequest(request.id, reason);
    setIsProcessing(false);

    if (result.success) {
      alert('Randevu talebi reddedildi.');
      onSuccess();
      onClose();
    } else {
      alert(result.message || 'Talep reddedilemedi.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-3xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-red-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold">Randevu Talebi Reddet</h2>
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
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">
              Reddetme Sebebi *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Randevuyu neden reddettiğinizi açıklayın..."
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-red-500 focus:outline-none resize-none"
              rows={5}
              required
            />
            <p className="text-xs text-slate-500 mt-2">
              Bu mesaj talep sahibine gönderilecektir.
            </p>
          </div>

          {/* Suggestions */}
          <div className="bg-slate-900/50 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase font-bold mb-2">Önerilen Sebepler</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setReason('Maalesef o tarih için müsait değilim.')}
                className="text-xs bg-slate-700 text-white px-3 py-1.5 rounded-lg hover:bg-slate-600 transition"
              >
                Müsait değilim
              </button>
              <button
                type="button"
                onClick={() => setReason('Takvimim dolu, lütfen başka bir tarih deneyin.')}
                className="text-xs bg-slate-700 text-white px-3 py-1.5 rounded-lg hover:bg-slate-600 transition"
              >
                Takvim dolu
              </button>
              <button
                type="button"
                onClick={() => setReason('Bu tür randevular şu anda kabul edilmemektedir.')}
                className="text-xs bg-slate-700 text-white px-3 py-1.5 rounded-lg hover:bg-slate-600 transition"
              >
                Uygun değil
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-red-600 text-white py-4 rounded-xl font-extrabold hover:bg-red-500 transition disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Reddediliyor...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-times mr-2"></i>
                  Reddet
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
