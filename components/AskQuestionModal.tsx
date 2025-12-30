'use client';

import { useState } from 'react';
import { createMyInboxThread } from '@/lib/api';

interface AskQuestionModalProps {
  expertId: number;
  expertName: string;
  expertAvatar?: string;
  onClose: () => void;
  onSuccess: (threadId: number) => void;
}

export default function AskQuestionModal({ 
  expertId, 
  expertName, 
  expertAvatar,
  onClose, 
  onSuccess 
}: AskQuestionModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setError('Lütfen konu ve mesaj alanlarını doldurun.');
      return;
    }

    setSending(true);
    setError('');

    const result = await createMyInboxThread(expertId, subject, message);

    if (result. success && result.thread_id) {
      onSuccess(result.thread_id);
    } else {
      setError('Mesaj gönderilemedi. Lütfen giriş yaptığınızdan emin olun.');
    }

    setSending(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl p-6 relative" 
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
        
        <h2 className="text-xl font-extrabold text-gray-800 mb-2 flex items-center gap-2">
          <i className="fa-regular fa-message text-rejimde-blue"></i> Soru Sor
        </h2>
        <p className="text-sm text-gray-500 font-bold mb-6">
          <span className="text-rejimde-blue">{expertName}</span>&apos;a sorunuzu iletin
        </p>

        {/* Expert Preview */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={expertAvatar || `https://api.dicebear.com/9.x/personas/svg?seed=${expertName}`} 
            className="w-12 h-12 rounded-xl bg-gray-200" 
            alt={expertName} 
          />
          <div>
            <p className="font-extrabold text-gray-800">{expertName}</p>
            <p className="text-xs text-gray-500 font-bold">Uzman</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold mb-4">
            <i className="fa-solid fa-circle-exclamation mr-2"></i>
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2 ml-1">
              Konu
            </label>
            <input 
              type="text" 
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-bold focus:border-rejimde-blue focus:outline-none transition"
              placeholder="Örn: Diyet programı hakkında"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={sending}
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase mb-2 ml-1">
              Mesajınız
            </label>
            <textarea 
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-gray-800 font-bold focus:border-rejimde-blue focus:outline-none min-h-[120px] resize-none transition"
              placeholder="Sorunuzu detaylı bir şekilde yazın..."
              value={message}
              onChange={(e) => setMessage(e.target. value)}
              disabled={sending}
            ></textarea>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-extrabold text-sm hover:bg-gray-200 transition"
              disabled={sending}
            >
              İptal
            </button>
            <button 
              onClick={handleSubmit}
              disabled={sending || ! subject.trim() || !message.trim()}
              className="flex-1 bg-rejimde-blue text-white py-3 rounded-xl font-extrabold text-sm shadow-btn shadow-blue-300 btn-game hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i>
                  Gönder
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 font-bold text-center mt-4">
          Mesajınız uzmanın gelen kutusuna düşecektir.  Yanıt süresi uzmana göre değişebilir.
        </p>
      </div>
    </div>
  );
}