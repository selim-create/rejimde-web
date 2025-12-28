'use client';

import { useState } from 'react';
import { createService, type Service } from '@/lib/api';

interface NewServiceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const COLORS = [
  { name: 'Mavi', value: '#3b82f6' },
  { name: 'Yeşil', value: '#10b981' },
  { name: 'Sarı', value: '#f59e0b' },
  { name: 'Kırmızı', value: '#ef4444' },
  { name: 'Mor', value: '#8b5cf6' },
  { name: 'Pembe', value: '#ec4899' },
  { name: 'Turkuaz', value: '#14b8a6' },
  { name: 'Turuncu', value: '#f97316' }
];

export default function NewServiceModal({ onClose, onSuccess }: NewServiceModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'online' as const,
    price: '',
    duration_minutes: '60',
    session_count: '',
    validity_days: '',
    capacity: '1',
    color: '#3b82f6'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      return;
    }

    setIsProcessing(true);
    const result = await createService({
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type,
      price: parseFloat(formData.price),
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined,
      session_count: formData.session_count ? parseInt(formData.session_count) : undefined,
      validity_days: formData.validity_days ? parseInt(formData.validity_days) : undefined,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      color: formData.color
    });
    setIsProcessing(false);

    if (result.success) {
      onSuccess();
      onClose();
    }
  };

  const showCapacityField = formData.type === 'group' || formData.type === 'package';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white">Yeni Hizmet/Paket</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hizmet Adı */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Hizmet/Paket Adı *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="Örn: Online PT Paketi"
              required
            />
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              rows={3}
              placeholder="Hizmet/paket açıklaması..."
            />
          </div>

          {/* Tip ve Fiyat */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Tip
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Service['type'] })}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="online">Online</option>
                <option value="face_to_face">Yüzyüze</option>
                <option value="group">Grup Dersi</option>
                <option value="package">Ders Paketi</option>
                <option value="consultation">Danışmanlık</option>
                <option value="session">Seans</option>
                <option value="one_time">Tek Seferlik</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Fiyat (₺) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Süre ve Kontenjan/Seans */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Süre (Dakika)
              </label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                placeholder="60"
              />
            </div>
            {showCapacityField ? (
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Kontenjan
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="1"
                  min="1"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Seans Sayısı (Paket için)
                </label>
                <input
                  type="number"
                  value={formData.session_count}
                  onChange={(e) => setFormData({ ...formData, session_count: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="10"
                />
              </div>
            )}
          </div>

          {/* Geçerlilik Süresi */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Geçerlilik Süresi (Gün)
            </label>
            <input
              type="number"
              value={formData.validity_days}
              onChange={(e) => setFormData({ ...formData, validity_days: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="30"
            />
          </div>

          {/* Renk Seçimi */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Renk
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`h-12 rounded-lg border-2 transition ${
                    formData.color === color.value 
                      ? 'border-white scale-105' 
                      : 'border-slate-600 hover:border-slate-400'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {formData.color === color.value && (
                    <i className="fa-solid fa-check text-white"></i>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-bold py-3 rounded-xl transition"
            >
              {isProcessing ? 'Oluşturuluyor...' : 'Hizmet Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
