'use client';

import { useState } from "react";
import Link from "next/link";
import { MOCK_CLIENTS, MOCK_SERVICES } from "../../../../lib/mock-data-pro";

export default function ProClientsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'archived'>('active');
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Filtreleme Mantığı
  const filteredClients = MOCK_CLIENTS.filter(client => {
      if (searchTerm && !client.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
      }
      return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
      
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-md">
         <div className="flex items-center gap-4">
            <Link href="/dashboard/pro" className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition">
                <i className="fa-solid fa-arrow-left"></i>
            </Link>
            <div>
                <h1 className="font-extrabold text-white text-xl tracking-tight">Danışanlar</h1>
                <p className="text-xs font-bold text-slate-500">Tüm danışanlarını buradan yönet</p>
            </div>
         </div>
         <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-btn shadow-blue-800 btn-game flex items-center gap-2 hover:bg-blue-500 transition"
         >
            <i className="fa-solid fa-user-plus"></i> <span className="hidden sm:inline">Danışan Ekle</span>
         </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Filters & Tabs */}
        <div className="bg-slate-800 rounded-2xl p-2 mb-8 border border-slate-700 flex flex-col sm:flex-row gap-4">
            <div className="flex p-1 bg-slate-900/50 rounded-xl">
                <button 
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'active' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Aktif ({filteredClients.length})
                </button>
                <button 
                    onClick={() => setActiveTab('pending')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'pending' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Bekleyen
                </button>
                <button 
                    onClick={() => setActiveTab('archived')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'archived' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Arşiv
                </button>
            </div>
            <div className="relative flex-1">
                <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input 
                    type="text" 
                    placeholder="İsim ile ara..." 
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-blue-500 transition"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* Client Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Invite Card */}
            <div 
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-2 border-dashed border-blue-500/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800 transition group h-full min-h-[200px]"
            >
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-900/50 group-hover:scale-110 transition">
                    <i className="fa-solid fa-plus text-2xl text-white"></i>
                </div>
                <h3 className="font-extrabold text-white text-lg">Yeni Danışan Ekle</h3>
                <p className="text-xs font-bold text-slate-400 mt-2 max-w-[200px]">
                    Davet linki oluşturarak veya direkt ekleyerek başla.
                </p>
            </div>

            {/* Mock Clients */}
            {filteredClients.map((client) => (
                <div key={client.id} className="bg-slate-800 border border-slate-700 rounded-3xl p-6 hover:border-slate-600 transition group relative overflow-hidden flex flex-col">
                    {/* Status Strip */}
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${
                        client.status === 'danger' ? 'bg-red-500' :
                        client.status === 'warning' ? 'bg-yellow-500' :
                        'bg-green-500'
                    }`}></div>

                    <div className="flex items-start justify-between mb-6 pl-2">
                        <div className="flex items-center gap-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={client.avatar} className="w-14 h-14 rounded-2xl bg-slate-700 object-cover border-2 border-slate-600" alt={client.name} />
                            <div>
                                <h3 className="font-extrabold text-white text-lg leading-tight">{client.name}</h3>
                                <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded mt-1 ${
                                    client.status === 'danger' ? 'bg-red-500/10 text-red-400' :
                                    client.status === 'warning' ? 'bg-yellow-500/10 text-yellow-400' :
                                    'bg-green-500/10 text-green-400'
                                }`}>
                                    <i className={`fa-solid ${
                                        client.status === 'danger' ? 'fa-triangle-exclamation' :
                                        client.status === 'warning' ? 'fa-bell' :
                                        'fa-check-circle'
                                    }`}></i>
                                    {client.statusText}
                                </div>
                            </div>
                        </div>
                        <button className="text-slate-400 hover:text-white transition">
                            <i className="fa-solid fa-ellipsis-vertical text-xl"></i>
                        </button>
                    </div>

                    {/* Progress Bar (Package Tracking) */}
                    {client.packageInfo && (
                        <div className="mb-6 pl-2">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase">{client.packageInfo.name}</span>
                                <span className="text-xs font-bold text-white">
                                    <span className="text-blue-400">{client.packageInfo.used}</span> / {client.packageInfo.total} Ders
                                </span>
                            </div>
                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        (client.packageInfo.used / client.packageInfo.total) >= 1 ? 'bg-green-500' : 'bg-blue-500'
                                    }`} 
                                    style={{ width: `${(client.packageInfo.used / client.packageInfo.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Bekleyen Talepler Uyarısı (Yeni) */}
                    {client.requests && client.requests.some(r => r.status === 'pending') && (
                        <div className="mb-4 pl-2">
                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-2 rounded-xl flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold text-yellow-400">
                                    {client.requests.filter(r => r.status === 'pending').length} yeni talep var
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="pl-2 mt-auto">
                        <div className="grid grid-cols-2 gap-2 mb-4">
                             <div className="bg-slate-900/50 p-2 rounded-lg text-center border border-slate-700/30">
                                <span className="block text-[10px] text-slate-500 font-bold uppercase">Skor</span>
                                <span className="font-black text-white">{client.score}</span>
                             </div>
                             <div className="bg-slate-900/50 p-2 rounded-lg text-center border border-slate-700/30">
                                <span className="block text-[10px] text-slate-500 font-bold uppercase">Kalan</span>
                                <span className="font-black text-white">{client.packageInfo?.remaining || 0}</span>
                             </div>
                        </div>

                        <div className="flex gap-2">
                            <Link href={`/dashboard/pro/clients/${client.id}`} className="flex-1 bg-white text-slate-900 py-2.5 rounded-xl font-extrabold text-xs uppercase text-center hover:bg-slate-200 transition shadow-sm">
                                Yönet
                            </Link>
                            <button className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-white hover:bg-green-600 transition shadow-sm" title="WhatsApp">
                                <i className="fa-brands fa-whatsapp text-lg"></i>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* ADD CLIENT MODAL (Updated) */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowAddModal(false)}>
              <div className="bg-slate-800 rounded-3xl w-full max-w-lg border border-slate-700 shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                      <i className="fa-solid fa-xmark text-xl"></i>
                  </button>
                  
                  <h2 className="text-xl font-extrabold text-white mb-1">Yeni Danışan Ekle</h2>
                  <p className="text-slate-400 text-xs font-bold mb-6">Anlaşma detaylarını girerek yeni bir danışan kaydı oluştur.</p>

                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Ad Soyad</label>
                              <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold" placeholder="Ahmet Yılmaz" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">E-posta</label>
                              <input type="email" className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold" placeholder="ornek@email.com" />
                          </div>
                      </div>

                      <div className="h-px bg-slate-700 my-2"></div>
                      <p className="text-xs font-black text-blue-400 uppercase">Anlaşma Detayları</p>

                      <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Paket / Hizmet Seç</label>
                          <select className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold appearance-none">
                              <option value="">Paket Seçiniz</option>
                              {MOCK_SERVICES.map(s => (
                                  <option key={s.id} value={s.id}>{s.title} - {s.price} TL</option>
                              ))}
                          </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Başlangıç Tarihi</label>
                              <input type="date" className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Süre / Bitiş</label>
                              <select className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold appearance-none">
                                  <option>1 Ay</option>
                                  <option>3 Ay</option>
                                  <option>6 Ay</option>
                                  <option>10 Ders</option>
                                  <option>20 Ders</option>
                              </select>
                          </div>
                      </div>
                      
                      <div className="pt-2 flex gap-3">
                          <button className="flex-1 bg-slate-700 text-white py-3 rounded-xl font-bold hover:bg-slate-600 transition">
                              Davet Linki Kopyala
                          </button>
                          <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-extrabold shadow-btn btn-game hover:bg-blue-500 transition">
                              Danışanı Ekle
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}