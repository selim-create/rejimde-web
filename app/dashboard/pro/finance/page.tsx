'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getFinanceDashboard, type FinanceDashboard } from '@/lib/api';
import { formatCurrency } from '@/lib/format-utils';
import SummaryCard from './components/SummaryCard';
import RevenueChart from './components/RevenueChart';
import ServiceDistribution from './components/ServiceDistribution';
import PaymentCard from './components/PaymentCard';
import NewPaymentModal from './components/NewPaymentModal';

export default function FinanceDashboardPage() {
  const [dashboard, setDashboard] = useState<FinanceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('this_month');
  const [showNewPaymentModal, setShowNewPaymentModal] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await getFinanceDashboard(period);
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      // Show mock data on error for development
      setDashboard({
        summary: {
          total_revenue: 45000,
          total_pending: 8500,
          total_overdue: 2000,
          paid_count: 35,
          pending_count: 5,
          overdue_count: 2
        },
        monthly_comparison: {
          current: 15000,
          previous: 12000,
          change_percent: 25
        },
        revenue_by_service: [
          { service_id: 1, service_name: 'Online PT', total: 20000, count: 15 },
          { service_id: 2, service_name: 'Beslenme Danışmanlığı', total: 15000, count: 10 },
          { service_id: 3, service_name: 'Paket Program', total: 10000, count: 10 }
        ],
        revenue_chart: [
          { date: '1 Ara', amount: 1200 },
          { date: '5 Ara', amount: 2500 },
          { date: '10 Ara', amount: 3200 },
          { date: '15 Ara', amount: 4100 },
          { date: '20 Ara', amount: 5500 },
          { date: '25 Ara', amount: 6800 },
          { date: '27 Ara', amount: 7500 }
        ],
        recent_payments: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 px-6 py-4 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/pro" 
              className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white">Finansal Dashboard</h1>
              <p className="text-sm text-slate-400">Gelir takibi ve finansal özet</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="this_week">Bu Hafta</option>
              <option value="this_month">Bu Ay</option>
              <option value="last_month">Geçen Ay</option>
              <option value="this_year">Bu Yıl</option>
            </select>
            
            <button
              onClick={() => setShowNewPaymentModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition"
            >
              <i className="fa-solid fa-plus mr-2"></i>Yeni Ödeme
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex gap-2">
          <Link 
            href="/dashboard/pro/finance/payments"
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-bold transition"
          >
            <i className="fa-solid fa-money-bill mr-2"></i>Ödemeler
          </Link>
          <Link 
            href="/dashboard/pro/finance/services"
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-bold transition"
          >
            <i className="fa-solid fa-layer-group mr-2"></i>Hizmetler
          </Link>
          <Link 
            href="/dashboard/pro/finance/reports"
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-bold transition"
          >
            <i className="fa-solid fa-chart-bar mr-2"></i>Raporlar
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        {dashboard && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <SummaryCard
              title="Toplam Gelir"
              value={formatCurrency(dashboard.summary.total_revenue)}
              icon="fa-turkish-lira-sign"
              iconBgColor="bg-green-500/20"
              iconColor="text-green-400"
              trend={{
                value: `+${dashboard.monthly_comparison.change_percent}% geçen aya göre`,
                isPositive: dashboard.monthly_comparison.change_percent > 0
              }}
            />
            
            <SummaryCard
              title="Bekleyen"
              value={formatCurrency(dashboard.summary.total_pending)}
              icon="fa-clock"
              iconBgColor="bg-yellow-500/20"
              iconColor="text-yellow-400"
              subtitle={`${dashboard.summary.pending_count} ödeme`}
            />
            
            <SummaryCard
              title="Gecikmiş"
              value={formatCurrency(dashboard.summary.total_overdue)}
              icon="fa-exclamation-triangle"
              iconBgColor="bg-red-500/20"
              iconColor="text-red-400"
              subtitle={`${dashboard.summary.overdue_count} ödeme`}
            />
            
            <SummaryCard
              title="Bu Ay"
              value={formatCurrency(dashboard.monthly_comparison.current)}
              icon="fa-calendar"
              iconBgColor="bg-blue-500/20"
              iconColor="text-blue-400"
              subtitle={`${dashboard.summary.paid_count} ödeme`}
            />
          </div>
        )}

        {/* Charts Row */}
        {dashboard && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RevenueChart data={dashboard.revenue_chart} />
            <ServiceDistribution data={dashboard.revenue_by_service} />
          </div>
        )}

        {/* Recent Payments */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Son Ödemeler</h3>
            <Link 
              href="/dashboard/pro/finance/payments"
              className="text-sm text-blue-400 hover:text-blue-300 font-bold"
            >
              Tümünü Gör <i className="fa-solid fa-arrow-right ml-1"></i>
            </Link>
          </div>
          
          {dashboard && dashboard.recent_payments.length > 0 ? (
            <div className="space-y-4">
              {dashboard.recent_payments.slice(0, 5).map((payment) => (
                <PaymentCard 
                  key={payment.id} 
                  payment={payment}
                  onMarkPaid={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <i className="fa-solid fa-inbox text-4xl mb-4"></i>
              <p>Henüz ödeme kaydı yok</p>
              <button
                onClick={() => setShowNewPaymentModal(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold transition"
              >
                İlk Ödemeyi Ekle
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showNewPaymentModal && (
        <NewPaymentModal
          onClose={() => setShowNewPaymentModal(false)}
          onSuccess={() => {
            loadDashboard();
          }}
        />
      )}
    </div>
  );
}
