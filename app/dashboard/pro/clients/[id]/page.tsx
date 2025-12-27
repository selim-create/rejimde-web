'use client';

import { useState, use } from "react";
import Link from "next/link";
// Alias kullanımı en temiz yöntemdir. Eğer derleme hatası alıyorsanız tsconfig.json paths ayarınızı kontrol etmelisiniz.
// Ancak burada garanti çözüm için mock datayı doğrudan import ediyoruz.
import { MOCK_CLIENTS } from "@/lib/mock-data-pro";

export default function ClientManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // id string olarak gelir, parseInt ile number'a çevirip eşleştiriyoruz.
  const clientId = parseInt(id);
  const client = MOCK_CLIENTS.find(c => c.id === clientId);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'requests' | 'notes'>('overview');

  if (!client) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
                <i className="fa-solid fa-user-xmark text-4xl text-slate-600 mb-4"></i>
                <h2 className="text-xl font-bold text-white">Danışan Bulunamadı</h2>
                <Link href="/dashboard/pro/clients" className="text-blue-400 mt-2 block hover:underline">Listeye Dön</Link>
            </div>
        </div>
      );
  }

  // Bekleyen talep sayısı
  const pendingRequestsCount = client.requests ? client.requests.filter(r => r.status === 'pending').length : 0;

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
        
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 px-6 py-4 shadow-md">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/pro/clients" className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition group">
                        <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                    </Link>
                    <div className="flex items-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={client.avatar} className="w-12 h-12 rounded-xl bg-slate-700 border-2 border-slate-600 object-cover" alt={client.name} />
                        <div>
                            <h1 className="font-extrabold text-white text-xl tracking-tight leading-tight">{client.name}</h1>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <span className={`w-2 h-2 rounded-full animate-pulse ${client.status === 'danger' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                {client.packageInfo?.name || 'Paket Yok'}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="bg-slate-700 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-600 transition shadow-sm" title="Mesaj Gönder">
                        <i className="fa-solid fa-message"></i>
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-btn shadow-blue-800 btn-game hidden sm:flex items-center gap-2 hover:bg-blue-500 transition">
                        <i className="fa-solid fa-wand-magic-sparkles"></i> Plan Oluştur
                    </button>
                </div>
            </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
            
            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-800 p-1.5 rounded-2xl mb-8 border border-slate-700 overflow-x-auto shadow-sm">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'overview' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                >
                    <i className="fa-solid fa-chart-pie"></i> Genel Bakış
                </button>
                <button 
                    onClick={() => setActiveTab('requests')}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'requests' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                >
                    <i className="fa-solid fa-inbox"></i> Talepler
                    {pendingRequestsCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-md min-w-[18px] text-center shadow-sm">{pendingRequestsCount}</span>
                    )}
                </button>
                <button 
                    onClick={() => setActiveTab('plans')}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'plans' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                >
                    <i className="fa-solid fa-file-contract"></i> Planlar
                </button>
                <button 
                    onClick={() => setActiveTab('notes')}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'notes' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                >
                    <i className="fa-solid fa-note-sticky"></i> Notlar
                </button>
            </div>

            {/* TAB CONTENT */}
            
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                    {/* Agreement Card */}
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 relative overflow-hidden shadow-card group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-500"></div>
                        <h3 className="font-extrabold text-white text-lg mb-6 flex items-center gap-2 relative z-10">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <i className="fa-solid fa-file-contract"></i>
                            </div>
                            Anlaşma Detayları
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between border-b border-slate-700/50 pb-3 border-dashed">
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">Paket</span>
                                <span className="text-white text-sm font-black text-right">{client.agreement?.type || client.packageInfo?.name}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-700/50 pb-3 border-dashed">
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">Başlangıç</span>
                                <span className="text-white text-sm font-bold">{client.agreement?.startDate || '-'}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-700/50 pb-3 border-dashed">
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">Bitiş</span>
                                <span className="text-white text-sm font-bold">{client.agreement?.endDate || '-'}</span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">Kalan Hak</span>
                                <span className="text-green-400 text-sm font-black bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                                    {client.packageInfo?.remaining} / {client.packageInfo?.total}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-card">
                        <h3 className="font-extrabold text-white text-lg mb-6 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <i className="fa-solid fa-chart-line"></i>
                            </div>
                            İlerleme Özeti
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900 rounded-2xl p-4 text-center border border-slate-700 transition hover:border-slate-600">
                                <span className="block text-slate-500 text-[10px] font-black uppercase mb-1 tracking-wide">Toplam Skor</span>
                                <span className="text-3xl font-black text-white">{client.score}</span>
                            </div>
                            <div className="bg-slate-900 rounded-2xl p-4 text-center border border-slate-700 transition hover:border-slate-600">
                                <span className="block text-slate-500 text-[10px] font-black uppercase mb-1 tracking-wide">Devamlılık</span>
                                <span className="text-3xl font-black text-green-400">%85</span>
                            </div>
                        </div>
                        <div className="mt-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50 flex items-start gap-3">
                            <i className="fa-solid fa-circle-info text-blue-400 mt-0.5"></i>
                            <p className="text-xs font-bold text-slate-400 leading-relaxed">
                                {client.statusText || 'Durum normal, herhangi bir risk görünmüyor.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. REQUESTS TAB */}
            {activeTab === 'requests' && (
                <div className="space-y-4 animate-fadeIn">
                    {client.requests && client.requests.length > 0 ? (
                        client.requests.map((req) => (
                            <div key={req.id} className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-card hover:border-slate-600 transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${
                                            req.type === 'diet' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                                            req.type === 'new_plan' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                            'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                        }`}>
                                            <i className={`fa-solid ${
                                                req.type === 'diet' ? 'fa-utensils' : 
                                                req.type === 'new_plan' ? 'fa-file-medical' :
                                                'fa-video'
                                            }`}></i>
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-white text-lg">{req.title}</h4>
                                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                                <i className="fa-regular fa-clock"></i> {req.date}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${
                                        req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                                        'bg-green-500/10 text-green-400 border border-green-500/20'
                                    }`}>
                                        {req.status === 'pending' ? 'Bekliyor' : 'Tamamlandı'}
                                    </span>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 mb-6 relative">
                                    <i className="fa-solid fa-quote-left absolute top-3 left-3 text-slate-700 text-2xl opacity-50"></i>
                                    <p className="text-sm text-slate-300 font-medium leading-relaxed pl-6 relative z-10">
                                        {req.desc}
                                    </p>
                                </div>
                                {req.status === 'pending' && (
                                    <div className="flex gap-3">
                                        <button className="flex-1 bg-green-600 text-white py-3 rounded-xl font-extrabold text-xs shadow-btn shadow-green-900/20 btn-game hover:bg-green-500 transition flex items-center justify-center gap-2">
                                            <i className="fa-solid fa-check"></i> İsteği Onayla
                                        </button>
                                        <button className="flex-1 bg-slate-700 text-white py-3 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-600 transition flex items-center justify-center gap-2">
                                            <i className="fa-solid fa-reply"></i> Cevap Yaz
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-slate-800 rounded-3xl border-2 border-dashed border-slate-700">
                            <i className="fa-solid fa-inbox text-4xl text-slate-600 mb-4"></i>
                            <p className="text-slate-500 font-bold">Henüz bekleyen bir talep yok.</p>
                        </div>
                    )}
                </div>
            )}

            {/* 3. PLANS TAB (Placeholder) */}
            {activeTab === 'plans' && (
                <div className="text-center py-20 bg-slate-800 rounded-3xl border-2 border-dashed border-slate-700 animate-fadeIn">
                    <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fa-solid fa-clipboard-list text-3xl text-slate-500"></i>
                    </div>
                    <h3 className="text-white font-extrabold text-xl mb-2">Aktif Planlar</h3>
                    <p className="text-slate-500 text-sm font-bold mb-8 max-w-sm mx-auto">Bu danışana atanmış diyet veya egzersiz planlarını buradan yönetebilirsin.</p>
                    <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-extrabold shadow-btn shadow-blue-900/50 btn-game hover:bg-blue-500 transition flex items-center gap-2 mx-auto">
                        <i className="fa-solid fa-plus"></i> Yeni Plan Ata
                    </button>
                </div>
            )}

            {/* 4. NOTES TAB (Placeholder) */}
            {activeTab === 'notes' && (
                <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 animate-fadeIn shadow-card">
                    <h3 className="font-extrabold text-white mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-lock text-yellow-500"></i> Özel Notlar (Sadece sen görürsün)
                    </h3>
                    <textarea 
                        className="w-full bg-slate-900 border border-slate-600 rounded-2xl p-5 text-white text-sm font-medium focus:border-blue-500 focus:outline-none min-h-[200px] leading-relaxed resize-none"
                        placeholder="Danışanla ilgili gelişim notları, sakatlık durumu veya hatırlatmalar..."
                        defaultValue={client.agreement?.notes}
                    ></textarea>
                    <div className="mt-4 text-right">
                        <button className="bg-slate-700 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-slate-600 transition shadow-sm">
                            <i className="fa-solid fa-save mr-2"></i> Kaydet
                        </button>
                    </div>
                </div>
            )}

        </div>
    </div>
  );
}