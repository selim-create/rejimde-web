import type { Payment } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/format-utils';

interface PaymentCardProps {
  payment: Payment;
  onMarkPaid?: (payment: Payment) => void;
  onEdit?: (payment: Payment) => void;
  onDelete?: (payment: Payment) => void;
}

const statusLabels: Record<Payment['status'], string> = {
  pending: 'Bekliyor',
  paid: 'Ödendi',
  partial: 'Kısmi',
  overdue: 'Gecikmiş',
  cancelled: 'İptal',
  refunded: 'İade'
};

const methodLabels: Record<Payment['payment_method'], string> = {
  cash: 'Nakit',
  bank_transfer: 'Havale',
  credit_card: 'Kredi Kartı',
  online: 'Online',
  other: 'Diğer'
};

export default function PaymentCard({ payment, onMarkPaid, onEdit, onDelete }: PaymentCardProps) {
  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'overdue':
        return 'bg-red-500/20 text-red-400';
      case 'partial':
        return 'bg-blue-500/20 text-blue-400';
      case 'cancelled':
        return 'bg-slate-500/20 text-slate-400';
      case 'refunded':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 hover:border-slate-600 transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src={payment.client.avatar} 
            alt={payment.client.name}
            className="w-12 h-12 rounded-xl object-cover" 
          />
          <div>
            <h3 className="font-bold text-white">{payment.client.name}</h3>
            <p className="text-sm text-slate-400">
              {payment.description || payment.service?.name || 'Ödeme'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-white">{formatCurrency(payment.amount)}</p>
          <span className={`text-xs px-2 py-1 rounded-full font-bold ${getStatusColor(payment.status)}`}>
            {statusLabels[payment.status]}
          </span>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between border-t border-slate-700 pt-4">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>
            <i className="fa-solid fa-calendar mr-1"></i>
            {formatDate(payment.payment_date)}
          </span>
          <span>
            <i className="fa-solid fa-credit-card mr-1"></i>
            {methodLabels[payment.payment_method]}
          </span>
        </div>
        <div className="flex gap-2">
          {payment.status !== 'paid' && onMarkPaid && (
            <button 
              onClick={() => onMarkPaid(payment)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
            >
              <i className="fa-solid fa-check mr-1"></i>Tahsil Et
            </button>
          )}
          {onEdit && (
            <button 
              onClick={() => onEdit(payment)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
            >
              <i className="fa-solid fa-pen"></i>
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(payment)}
              className="bg-slate-700 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
            >
              <i className="fa-solid fa-trash"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
