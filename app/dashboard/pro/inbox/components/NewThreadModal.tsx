'use client';

import { useState } from 'react';

interface Client {
  id: number;
  name: string;
  avatar: string;
}

interface NewThreadModalProps {
  clients: Client[];
  onSubmit: (clientId: number, subject: string, message: string) => Promise<void>;
  onClose: () => void;
}

export default function NewThreadModal({ clients, onSubmit, onClose }: NewThreadModalProps) {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClientId || !message.trim()) return;
    
    setSubmitting(true);
    await onSubmit(selectedClientId, subject, message);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center">
          <h3 className="font-bold text-white text-lg">Yeni Mesaj Başlat</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-700 text-slate-400 hover:text-white transition flex items-center justify-center"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Client Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
              Danışan Seç
            </label>
            <select
              value={selectedClientId || ''}
              onChange={(e) => setSelectedClientId(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white text-sm font-medium focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="">Danışan seçin...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
              Konu (Opsiyonel)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white text-sm font-medium focus:border-blue-500 focus:outline-none"
              placeholder="Mesaj konusu..."
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
              Mesaj
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white text-sm font-medium focus:border-blue-500 focus:outline-none min-h-[120px] resize-none"
              placeholder="Mesajınızı yazın..."
              required
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-700 text-slate-300 font-bold hover:bg-slate-600 transition"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={!selectedClientId || !message.trim() || submitting}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane mr-2"></i>
                  Gönder
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
