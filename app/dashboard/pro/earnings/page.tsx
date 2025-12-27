'use client';

import { useState } from "react";
import Link from "next/link";

// --- MOCK DATA (Import sorununu aşmak için buraya taşındı) ---
const MOCK_STATS = {
    activeClients: 42,
    pendingAppointments: 8,
    pendingRevisions: 5,
    monthlyIncome: "₺24.500",
    weeklyGrowth: "+3",
    totalBalance: "₺8.250", // Platform içindeki çekilebilir bakiye
    pendingPayout: "₺12.000",
    lastPayout: "₺15.000"
};

const MOCK_SERVICES = [
    { id: 1, title: "Online Yoga (Birebir)", price: 750, duration: 60 },
    { id: 2, title: "Reformer Pilates (Stüdyo)", price: 1200, duration: 50 },
    { id: 3, title: "Beslenme Danışmanlığı", price: 2000, duration: 45 },
    { id: 4, title: "PT Paketi (10 Ders)", price: 15000, duration: 60 },
];

const MOCK_CLIENTS = [
  { id: 101, name: "Burak Yılmaz" },
  { id: 102, name: "Ayşe K." },
  { id: 103, name: "Mehmet Demir" },
  { id: 104, name: "Selin Yılmaz" }
];

const INITIAL_TRANSACTIONS = [
    {
        id: "TRX-1092",
        clientName: "Burak Yılmaz",
        clientId: 101,
        avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Burak",
        date: "27 Ara, 14:30",
        amount: 8500,
        status: "completed", // completed, pending, cancelled
        type: "package",
        description: "Online PT - 24 Ders (Peşin)"
    },
    {
        id: "TRX-1090",
        clientName: "Ayşe K.",
        clientId: 102,
        avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Ayse",
        date: "25 Ara, 11:00",
        amount: 2000,
        status: "pending",
        type: "consultation",
        description: "Aylık Beslenme Danışmanlığı"
    },
    {
        id: "TRX-1089",
        clientName: "Mehmet Demir",
        clientId: 103,
        avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Mehmet",
        date: "20 Ara, 16:45",
        amount: 12000,
        status: "completed",
        type: "package",
        description: "Reformer Paket (12 Ders)"
    }
];
// -----------------------------------------------------------

export default function ProEarningsPage() {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  // Filtreleme
  const filteredTransactions = transactions.filter(trx => {
      if (filter === 'all') return true;
      return trx.status === filter;
  });

  // Statü Güncelleme (Bekleyen -> Ödendi)
  const toggleStatus = (id: string) => {
      setTransactions(prev => prev.map(trx => {
          if (trx.id === id) {
              // Basit toggle mantığı: pending -> completed -> pending
              const newStatus = trx.status === 'pending' ? 'completed' : 'pending';
              return { ...trx, status: newStatus };
          }
          return trx;
      }));
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
      
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-md">
         <div className="flex items-center gap-4">
            <Link href="/dashboard/pro" className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition">
                <i className="fa-solid fa-arrow-left"></i>
            </Link>
            <div>
                <h1 className="font-extrabold text-white text-xl tracking-tight">Gelirler</h1>
                <p className="text-xs font-bold text-slate-500">Kazançlarını ve ödemelerini takip et</p>
            </div>
         </div>
         <div className="flex gap-2">
             <button 
                onClick={() => setShowAddPaymentModal(true)}
                className="bg-slate-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-600 transition flex items-center gap-2"
             >
                <i className="fa-solid fa-plus"></i> <span className="hidden sm:inline">Ödeme Ekle</span>
             </button>
             <button 
                onClick={() => setShowPayoutModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-btn shadow-green-900/20 btn-game flex items-center gap-2 hover:bg-green-500 transition"
             >
                <i className="fa-solid fa-money-bill-transfer"></i> <span className="hidden sm:inline">Ödeme Talep Et</span>
             </button>
         </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-bl-full -mr-6 -mt-6 transition group-hover:scale-110"></div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Çekilebilir Bakiye</p>
                <div className="flex items-end gap-2">
                    <h2 className="text-3xl font-black text-white">{MOCK_STATS.totalBalance}</h2>
                    <span className="text-green-400 text-xs font-bold mb-1 bg-green-500/10 px-2 py-0.5 rounded">Hazır</span>
                </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bu Ayki Tahsilat</p>
                <div className="flex items-end gap-2">
                    <h2 className="text-3xl font-black text-white">{MOCK_STATS.monthlyIncome}</h2>
                    <span className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded text-[10px] font-bold border border-green-500/20 mb-1">{MOCK_STATS.weeklyGrowth} Artış</span>
                </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bekleyen Ödeme</p>
                <div className="flex items-end gap-2">
                    <h2 className="text-3xl font-black text-yellow-400">{MOCK_STATS.pendingPayout}</h2>
                    <span className="text-slate-500 text-[10px] font-bold mb-1">İşleniyor</span>
                </div>
            </div>
        </div>

        {/* Transactions List */}
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                    <i className="fa-solid fa-list-check text-blue-400"></i> İşlem Geçmişi
                </h3>
                
                <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-700 w-full sm:w-auto">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${filter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Tümü
                    </button>
                    <button 
                        onClick={() => setFilter('completed')}
                        className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${filter === 'completed' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Tamamlanan
                    </button>
                    <button 
                        onClick={() => setFilter('pending')}
                        className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${filter === 'pending' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Bekleyen
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {filteredTransactions.map((trx) => (
                    <div key={trx.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-700/50 hover:border-slate-600 transition group relative">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                trx.type === 'package' ? 'bg-purple-500/10 text-purple-400' :
                                trx.type === 'session' ? 'bg-blue-500/10 text-blue-400' :
                                'bg-orange-500/10 text-orange-400'
                            }`}>
                                <i className={`fa-solid ${
                                    trx.type === 'package' ? 'fa-box-open' :
                                    trx.type === 'session' ? 'fa-person-running' :
                                    'fa-comments'
                                } text-xl`}></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">{trx.description}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={trx.avatar} className="w-4 h-4 rounded-full" alt={trx.clientName} />
                                    <span className="text-xs font-bold text-slate-500">{trx.clientName}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                    <span className="text-xs font-bold text-slate-600">{trx.date}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                            <div className="text-right">
                                <span className={`block text-sm font-black ${trx.status === 'completed' ? 'text-white' : 'text-slate-400'}`}>
                                    +{trx.amount} TL
                                </span>
                                <button 
                                    onClick={() => toggleStatus(trx.id)}
                                    className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded flex items-center gap-1 ml-auto cursor-pointer transition ${
                                        trx.status === 'completed' 
                                            ? 'bg-green-500/10 text-green-400 hover:bg-red-500/10 hover:text-red-400' 
                                            : 'bg-yellow-500/10 text-yellow-400 hover:bg-green-500/10 hover:text-green-400'
                                    }`}
                                    title={trx.status === 'completed' ? 'Bekliyor olarak işaretle' : 'Ödendi olarak işaretle'}
                                >
                                    <i className={`fa-solid ${trx.status === 'completed' ? 'fa-check' : 'fa-clock'}`}></i>
                                    {trx.status === 'completed' ? 'Ödendi' : 'Bekliyor'}
                                </button>
                            </div>
                            <button className="text-slate-500 hover:text-white transition">
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* MODAL: ÖDEME EKLE (Manuel Takip İçin) */}
      {showAddPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowAddPaymentModal(false)}>
              <div className="bg-slate-800 rounded-3xl w-full max-w-md border border-slate-700 shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowAddPaymentModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                      <i className="fa-solid fa-xmark text-xl"></i>
                  </button>
                  <h2 className="text-xl font-extrabold text-white mb-1">Ödeme Kaydı Ekle</h2>
                  <p className="text-slate-400 text-xs font-bold mb-6">Danışanından elden veya havale ile aldığın ödemeyi işle.</p>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Danışan</label>
                          <select className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold appearance-none">
                              <option value="">Seçiniz...</option>
                              {MOCK_CLIENTS.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Hizmet / Anlaşma</label>
                          <select className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold appearance-none">
                              <option value="">Hizmet Seçiniz...</option>
                              {MOCK_SERVICES.map(s => (
                                  <option key={s.id} value={s.id}>{s.title} ({s.price} TL)</option>
                              ))}
                          </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Tutar (TL)</label>
                              <input type="number" className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold" placeholder="0.00" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Tarih</label>
                              <input type="date" className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold" />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Durum</label>
                          <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-600">
                              <button className="flex-1 py-2 rounded-lg bg-green-600 text-white font-bold text-sm shadow-sm">Ödendi</button>
                              <button className="flex-1 py-2 rounded-lg text-slate-400 font-bold text-sm hover:text-white">Bekliyor</button>
                          </div>
                      </div>
                      <button className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-extrabold shadow-btn btn-game hover:bg-blue-500 transition mt-2">
                          Kaydet
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL: ÖDEME TALEP ET (Platform Bakiyesi) */}
      {showPayoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowPayoutModal(false)}>
              <div className="bg-slate-800 rounded-3xl w-full max-w-sm border border-slate-700 shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowPayoutModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                      <i className="fa-solid fa-xmark text-xl"></i>
                  </button>
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                      <i className="fa-solid fa-wallet text-3xl text-green-400"></i>
                  </div>
                  <h2 className="text-xl font-extrabold text-white mb-2 text-center">Ödeme Talep Et</h2>
                  <p className="text-slate-400 text-xs font-bold mb-6 text-center">
                      Platform üzerindeki birikmiş bakiyeni banka hesabına çek (Marketplace Satışları).
                  </p>

                  <div className="bg-slate-900 rounded-xl p-4 mb-6 border border-slate-700">
                      <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-slate-500">Çekilebilir Tutar</span>
                          <span className="text-lg font-black text-white">{MOCK_STATS.totalBalance}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 w-3/4"></div>
                      </div>
                  </div>

                  <div className="space-y-3">
                      <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">IBAN</label>
                          <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:border-green-500 focus:outline-none" defaultValue="TR12 3456 7890 1234 5678 90" />
                      </div>
                      <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tutar</label>
                          <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:border-green-500 focus:outline-none" defaultValue="8250" />
                      </div>
                      <button className="w-full bg-green-600 text-white py-3.5 rounded-xl font-extrabold shadow-btn btn-game hover:bg-green-500 transition mt-2">
                          Talebi Gönder
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}