'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPayments, type Payment } from '@/lib/api';
import PaymentCard from '../components/PaymentCard';
import NewPaymentModal from '../components/NewPaymentModal';
import MarkPaidModal from '../components/MarkPaidModal';
import { formatCurrency } from '@/lib/format-utils';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [meta, setMeta] = useState({ total: 0, total_amount: 0, paid_amount: 0, pending_amount: 0 });
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPaymentModal, setShowNewPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const options: {
        status?: string;
        client_id?: number;
        start_date?: string;
        end_date?: string;
        limit?: number;
        offset?: number;
      } = {};
      if (statusFilter !== 'all') {
        options.status = statusFilter;
      }
      
      const data = await getPayments(options);
      setPayments(data?.payments || []);
      setMeta(data?.meta || { total: 0, total_amount: 0, paid_amount: 0, pending_amount: 0 });
    } catch (error) {
      console.error('Failed to load payments:', error);
      // Mock data for development
      setPayments([]);
      setMeta({ total: 0, total_amount: 0, paid_amount: 0, pending_amount: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filteredPayments = (payments || []).filter(payment => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        payment.client.name.toLowerCase().includes(search) ||
        payment.description?.toLowerCase().includes(search) ||
        payment.service?.name.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const handleMarkPaid = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowMarkPaidModal(true);
  };

  const handleDelete = async (payment: Payment) => {
    if (confirm(`${payment.client.name} adlı danışanın ödemesini silmek istediğinize emin misiniz?`)) {
      // TODO: Implement delete
      console.log('Delete payment:', payment.id);
      loadPayments();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 px-6 py-4 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/pro/finance" 
              className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white">Ödemeler</h1>
              <p className="text-sm text-slate-400">Tüm ödeme kayıtları</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowNewPaymentModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition"
          >
            <i className="fa-solid fa-plus mr-2"></i>Yeni Ödeme
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${
                statusFilter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Tümü ({meta.total})
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${
                statusFilter === 'paid' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Ödendi
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${
                statusFilter === 'pending' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Bekliyor
            </button>
            <button
              onClick={() => setStatusFilter('overdue')}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${
                statusFilter === 'overdue' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Gecikmiş
            </button>
          </div>

          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Danışan veya açıklama ara..."
                className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-11 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Toplam</p>
            <p className="text-lg font-black text-white">{formatCurrency(meta.total_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Ödendi</p>
            <p className="text-lg font-black text-green-400">{formatCurrency(meta.paid_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Bekleyen</p>
            <p className="text-lg font-black text-yellow-400">{formatCurrency(meta.pending_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Kayıt</p>
            <p className="text-lg font-black text-blue-400">{meta.total}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Yükleniyor...</p>
          </div>
        ) : filteredPayments.length > 0 ? (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onMarkPaid={handleMarkPaid}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <i className="fa-solid fa-inbox text-4xl mb-4"></i>
            <p className="mb-2">
              {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz ödeme kaydı yok'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowNewPaymentModal(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold transition"
              >
                İlk Ödemeyi Ekle
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewPaymentModal && (
        <NewPaymentModal
          onClose={() => setShowNewPaymentModal(false)}
          onSuccess={() => {
            loadPayments();
          }}
        />
      )}

      {showMarkPaidModal && selectedPayment && (
        <MarkPaidModal
          payment={selectedPayment}
          onClose={() => {
            setShowMarkPaidModal(false);
            setSelectedPayment(null);
          }}
          onSuccess={() => {
            loadPayments();
          }}
        />
      )}
    </div>
  );
}
