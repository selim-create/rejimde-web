'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMonthlyReport, type MonthlyReport } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/format-utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ReportsPage() {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await getMonthlyReport(selectedYear, selectedMonth);
      setReport(data);
    } catch (error) {
      console.error('Failed to load report:', error);
      // Mock data for development
      setReport({
        period: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`,
        summary: {
          total_revenue: 45000,
          total_sessions: 52,
          unique_clients: 18,
          average_per_client: 2500
        },
        by_week: [
          { week: 1, revenue: 8000, sessions: 10 },
          { week: 2, revenue: 12000, sessions: 15 },
          { week: 3, revenue: 15000, sessions: 18 },
          { week: 4, revenue: 10000, sessions: 9 }
        ],
        by_service: [
          { service_id: 1, name: 'Online PT', revenue: 20000, count: 25 },
          { service_id: 2, name: 'Beslenme Danışmanlığı', revenue: 15000, count: 15 },
          { service_id: 3, name: 'Paket Program', revenue: 10000, count: 12 }
        ],
        by_payment_method: [
          { method: 'Havale', amount: 25000, count: 20 },
          { method: 'Nakit', amount: 12000, count: 15 },
          { method: 'Kredi Kartı', amount: 8000, count: 10 }
        ],
        top_clients: [
          { client_id: 1, name: 'Ahmet Yılmaz', avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=Ahmet', total: 8500 },
          { client_id: 2, name: 'Ayşe Kaya', avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=Ayse', total: 6000 },
          { client_id: 3, name: 'Mehmet Demir', avatar: 'https://api.dicebear.com/9.x/personas/svg?seed=Mehmet', total: 5500 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth]);

  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

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
              href="/dashboard/pro/finance" 
              className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white">Finansal Raporlar</h1>
              <p className="text-sm text-slate-400">Detaylı gelir analizi</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {report && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <p className="text-xs text-slate-500 uppercase font-bold">Toplam Gelir</p>
              <p className="text-2xl font-black text-white mt-1">{formatCurrency(report.summary.total_revenue)}</p>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <p className="text-xs text-slate-500 uppercase font-bold">Toplam Seans</p>
              <p className="text-2xl font-black text-white mt-1">{formatNumber(report.summary.total_sessions)}</p>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <p className="text-xs text-slate-500 uppercase font-bold">Benzersiz Danışan</p>
              <p className="text-2xl font-black text-white mt-1">{formatNumber(report.summary.unique_clients)}</p>
            </div>
            
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <p className="text-xs text-slate-500 uppercase font-bold">Ort. Danışan Başı</p>
              <p className="text-2xl font-black text-white mt-1">{formatCurrency(report.summary.average_per_client)}</p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Weekly Revenue */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Haftalık Gelir</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report.by_week}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="week" 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(week) => `Hafta ${week}`}
                  />
                  <YAxis 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`${formatCurrency(value)}`, 'Gelir']}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Payment Methods */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Ödeme Yöntemleri</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={report.by_payment_method}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {report.by_payment_method.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Service Revenue */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Hizmetlere Göre Gelir</h3>
              <div className="space-y-3">
                {report.by_service.map((service, index) => (
                  <div key={service.service_id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <div>
                        <p className="font-bold text-white">{service.name}</p>
                        <p className="text-xs text-slate-400">{service.count} kez</p>
                      </div>
                    </div>
                    <p className="text-lg font-black text-white">{formatCurrency(service.revenue)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Clients */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">En Çok Harcayan Danışanlar</h3>
              <div className="space-y-3">
                {report.top_clients.map((client, index) => (
                  <div key={client.client_id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={client.avatar} 
                          alt={client.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="absolute -top-1 -left-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <p className="font-bold text-white">{client.name}</p>
                    </div>
                    <p className="text-lg font-black text-white">{formatCurrency(client.total)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
