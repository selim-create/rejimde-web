'use client';

import { useState, useEffect } from 'react';
import { createPayment, getProClients, getServices, type ClientListItem, type Service } from '@/lib/api';

interface NewPaymentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewPaymentModal({ onClose, onSuccess }: NewPaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    client_id: '',
    service_id: '',
    amount: '',
    payment_method: 'cash' as const,
    payment_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'pending' as const,
    description: '',
    notes: ''
  });

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      const [clientsResult, servicesData] = await Promise.all([
        getProClients(),
        getServices()
      ]);
      setClients(clientsResult.clients || []);
      setServices(servicesData || []);
      setLoadingData(false);
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_id || !formData.amount) {
      alert('Lütfen danışan ve tutarı girin.');
      return;
    }

    setIsProcessing(true);
    const result = await createPayment({
      client_id: parseInt(formData.client_id),
      service_id: formData.service_id ? parseInt(formData.service_id) : undefined,
      amount: parseFloat(formData.amount),
      payment_method: formData.payment_method,
      payment_date: formData.payment_date,
      due_date: formData.due_date || undefined,
      status: formData.status,
      description: formData.description || undefined,
      notes: formData.notes || undefined
    });
    setIsProcessing(false);

    if (result.success) {
      alert('Ödeme başarıyla oluşturuldu!');
      onSuccess();
      onClose();
    } else {
      alert(result.message || 'Ödeme oluşturulamadı.');
    }
  };

  const handleServiceChange = (serviceId: string) => {
    setFormData(prev => ({ ...prev, service_id: serviceId }));
    if (serviceId) {
      const service = services.find(s => s.id.toString() === serviceId);
      if (service && !formData.amount) {
        setFormData(prev => ({ ...prev, amount: service.price.toString() }));
      }
    }
  };

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
          <h2 className="text-2xl font-black text-white">Yeni Ödeme</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Danışan Seçimi */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Danışan *
            </label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              required
              disabled={loadingData}
            >
              <option value="">Danışan Seçin</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Hizmet Seçimi */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Hizmet (Opsiyonel)
            </label>
            <select
              value={formData.service_id}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              disabled={loadingData}
            >
              <option value="">Hizmet Seçin</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.price} ₺
                </option>
              ))}
            </select>
          </div>

          {/* Tutar */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Tutar *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="0.00"
              required
            />
          </div>

          {/* Ödeme Yöntemi */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Ödeme Yöntemi
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as Payment['payment_method'] })}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="cash">Nakit</option>
              <option value="bank_transfer">Havale</option>
              <option value="credit_card">Kredi Kartı</option>
              <option value="online">Online</option>
              <option value="other">Diğer</option>
            </select>
          </div>

          {/* Durum */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Durum
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Payment['status'] })}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="pending">Bekliyor</option>
              <option value="paid">Ödendi</option>
              <option value="overdue">Gecikmiş</option>
            </select>
          </div>

          {/* Tarihler */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Ödeme Tarihi
              </label>
              <input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Vade Tarihi (Opsiyonel)
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Açıklama
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="Ödeme açıklaması"
            />
          </div>

          {/* Notlar */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Notlar
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              rows={3}
              placeholder="İç notlar..."
            />
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
              {isProcessing ? 'Oluşturuluyor...' : 'Ödeme Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
