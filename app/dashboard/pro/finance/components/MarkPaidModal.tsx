'use client';

import { useState } from 'react';
import { markPaymentAsPaid, type Payment } from '@/lib/api';
import { formatCurrency } from '@/lib/format-utils';

interface MarkPaidModalProps {
  payment: Payment;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MarkPaidModal({ payment, onClose, onSuccess }: MarkPaidModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    paid_amount: payment.amount.toString(),
    payment_method: payment.payment_method,
    payment_date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsProcessing(true);
    const result = await markPaymentAsPaid(payment.id, {
      paid_amount: parseFloat(formData.paid_amount),
      payment_method: formData.payment_method,
      payment_date: formData.payment_date
    });
    setIsProcessing(false);

    if (result.success) {
      alert('Ödeme tahsil edildi!');
      onSuccess();
      onClose();
    } else {
      alert(result.message || 'Ödeme tahsil edilemedi.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white">Ödeme Tahsil Et</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* Ödeme Bilgileri */}
        <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src={payment.client.avatar} 
              alt={payment.client.name}
              className="w-10 h-10 rounded-lg object-cover" 
            />
            <div>
              <p className="font-bold text-white">{payment.client.name}</p>
              <p className="text-xs text-slate-400">{payment.description || 'Ödeme'}</p>
            </div>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-slate-700">
            <span className="text-sm text-slate-400">Toplam Tutar</span>
            <span className="text-xl font-black text-white">{formatCurrency(payment.amount)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ödenen Tutar */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Ödenen Tutar
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.paid_amount}
              onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
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

          {/* Ödeme Tarihi */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Ödeme Tarihi
            </label>
            <input
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              required
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
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-bold py-3 rounded-xl transition"
            >
              {isProcessing ? 'İşleniyor...' : 'Tahsil Et'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
