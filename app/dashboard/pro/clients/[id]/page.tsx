'use client';

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { getProClient, addClientNote, deleteClientNote, getClientPlans, ClientDetail } from "@/lib/api";

export default function ClientManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const clientId = parseInt(id);
  
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'requests' | 'notes'>('overview');
  const [plans, setPlans] = useState<unknown[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);

  // Notes state
  const [newNote, setNewNote] = useState({ 
    type: 'general' as 'general' | 'health' | 'progress' | 'reminder', 
    content: '', 
    is_pinned: false 
  });
  const [savingNote, setSavingNote] = useState(false);

  const fetchClient = async () => {
    setLoading(true);
    setError(null);
    
    const data = await getProClient(clientId);
    
    if (data) {
      setClient(data);
    } else {
      setError('Danışan bulunamadı.');
    }
    setLoading(false);
  };

  const fetchPlans = async () => {
    setPlansLoading(true);
    const data = await getClientPlans(clientId);
    setPlans(data);
    setPlansLoading(false);
  };

  // Fetch client data
  useEffect(() => {
    fetchClient();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  // Fetch plans when tab is active
  useEffect(() => {
    if (activeTab === 'plans' && client) {
      fetchPlans();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, client]);

  const handleAddNote = async () => {
    if (!newNote.content.trim()) {
      alert('Lütfen not içeriği girin.');
      return;
    }
    
    setSavingNote(true);
    const result = await addClientNote(clientId, newNote);
    
    if (result.success && result.data) {
      setClient(prev => prev ? {
        ...prev,
        notes: [...prev.notes, result.data!]
      } : null);
      setNewNote({ type: 'general', content: '', is_pinned: false });
      alert('Not başarıyla eklendi!');
    } else {
      alert(result.message || 'Not eklenemedi.');
    }
    setSavingNote(false);
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Bu notu silmek istediğinize emin misiniz?')) {
      return;
    }

    const result = await deleteClientNote(clientId, noteId);
    
    if (result.success) {
      setClient(prev => prev ? {
        ...prev,
        notes: prev.notes.filter(n => n.id !== noteId)
      } : null);
      alert('Not silindi.');
    } else {
      alert(result.message || 'Not silinemedi.');
    }
  };

  if (loading) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      );
  }

  if (error || !client) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
                <i className="fa-solid fa-user-xmark text-4xl text-slate-600 mb-4"></i>
                <h2 className="text-xl font-bold text-white mb-2">Danışan Bulunamadı</h2>
                <p className="text-slate-400 mb-4">{error}</p>
                <Link href="/dashboard/pro/clients" className="text-blue-400 hover:underline">Listeye Dön</Link>
            </div>
        </div>
      );
  }

  // Bekleyen talep sayısı - requests varsa göster, yoksa 0
  const pendingRequestsCount = 0; // Will be implemented in Phase 2 with inbox

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
                        <img src={client.client.avatar} className="w-12 h-12 rounded-xl bg-slate-700 border-2 border-slate-600 object-cover" alt={client.client.name} />
                        <div>
                            <h1 className="font-extrabold text-white text-xl tracking-tight leading-tight">{client.client.name}</h1>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <span className={`w-2 h-2 rounded-full animate-pulse ${client.risk_status === 'danger' ? 'bg-red-500' : client.risk_status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                                {client.package?.name || 'Paket Yok'}
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
                                <span className="text-white text-sm font-black text-right">{client.agreement?.package_name || client.package?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-700/50 pb-3 border-dashed">
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">Başlangıç</span>
                                <span className="text-white text-sm font-bold">{client.agreement?.start_date || '-'}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-700/50 pb-3 border-dashed">
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">Bitiş</span>
                                <span className="text-white text-sm font-bold">{client.agreement?.end_date || '-'}</span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">Kalan Hak</span>
                                <span className="text-green-400 text-sm font-black bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                                    {client.package?.remaining || 0} / {client.package?.total || 0}
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
                                <span className="text-3xl font-black text-white">{client.stats?.score || client.score || 0}</span>
                            </div>
                            <div className="bg-slate-900 rounded-2xl p-4 text-center border border-slate-700 transition hover:border-slate-600">
                                <span className="block text-slate-500 text-[10px] font-black uppercase mb-1 tracking-wide">Streak</span>
                                <span className="text-3xl font-black text-green-400">{client.stats?.streak || 0}</span>
                            </div>
                        </div>
                        <div className="mt-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50 flex items-start gap-3">
                            <i className="fa-solid fa-circle-info text-blue-400 mt-0.5"></i>
                            <p className="text-xs font-bold text-slate-400 leading-relaxed">
                                {client.risk_reason || 'Durum normal, herhangi bir risk görünmüyor.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. REQUESTS TAB */}
            {activeTab === 'requests' && (
                <div className="text-center py-20 bg-slate-800 rounded-3xl border-2 border-dashed border-slate-700 animate-fadeIn">
                    <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fa-solid fa-inbox text-3xl text-slate-500"></i>
                    </div>
                    <h3 className="text-white font-extrabold text-xl mb-2">Talepler (Yakında)</h3>
                    <p className="text-slate-500 text-sm font-bold mb-8 max-w-sm mx-auto">
                        Danışan talepleri Faz 2&apos;de Inbox modülü ile gelecek.
                    </p>
                </div>
            )}

            {/* 3. PLANS TAB */}
            {activeTab === 'plans' && (
                <div className="animate-fadeIn">
                    {plansLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        </div>
                    ) : plans.length > 0 ? (
                        <div className="space-y-4">
                            {plans.map((plan: any) => (
                                <div key={plan.id} className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-card hover:border-slate-600 transition">
                                    <h4 className="font-extrabold text-white text-lg mb-2">{plan.title}</h4>
                                    <p className="text-slate-400 text-sm">{plan.description}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-800 rounded-3xl border-2 border-dashed border-slate-700">
                            <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <i className="fa-solid fa-clipboard-list text-3xl text-slate-500"></i>
                            </div>
                            <h3 className="text-white font-extrabold text-xl mb-2">Henüz Plan Yok</h3>
                            <p className="text-slate-500 text-sm font-bold mb-8 max-w-sm mx-auto">
                                Bu danışana atanmış diyet veya egzersiz planı bulunmuyor.
                            </p>
                            <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-extrabold shadow-btn shadow-blue-900/50 btn-game hover:bg-blue-500 transition flex items-center gap-2 mx-auto">
                                <i className="fa-solid fa-plus"></i> Yeni Plan Ata
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* 4. NOTES TAB */}
            {activeTab === 'notes' && (
                <div className="space-y-6 animate-fadeIn">
                    {/* Add Note Form */}
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-card">
                        <h3 className="font-extrabold text-white mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-plus text-blue-500"></i> Yeni Not Ekle
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Not Tipi</label>
                                <select 
                                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold"
                                    value={newNote.type}
                                    onChange={(e) => setNewNote({...newNote, type: e.target.value as any})}
                                >
                                    <option value="general">Genel</option>
                                    <option value="health">Sağlık</option>
                                    <option value="progress">İlerleme</option>
                                    <option value="reminder">Hatırlatma</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Not İçeriği</label>
                                <textarea 
                                    className="w-full bg-slate-900 border border-slate-600 rounded-2xl p-4 text-white text-sm font-medium focus:border-blue-500 focus:outline-none min-h-[120px] leading-relaxed resize-none"
                                    placeholder="Danışanla ilgili notlarınızı buraya yazın..."
                                    value={newNote.content}
                                    onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                                ></textarea>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="pin-note"
                                    className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                                    checked={newNote.is_pinned}
                                    onChange={(e) => setNewNote({...newNote, is_pinned: e.target.checked})}
                                />
                                <label htmlFor="pin-note" className="text-sm font-bold text-slate-400">
                                    <i className="fa-solid fa-thumbtack text-yellow-500 mr-1"></i> Üste sabitle
                                </label>
                            </div>
                            <div className="text-right">
                                <button 
                                    onClick={handleAddNote}
                                    disabled={savingNote}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-500 transition shadow-btn shadow-blue-800 disabled:opacity-50"
                                >
                                    {savingNote ? 'Kaydediliyor...' : 'Notu Kaydet'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notes List */}
                    <div className="space-y-4">
                        {client.notes && client.notes.length > 0 ? (
                            client.notes.map((note) => (
                                <div key={note.id} className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-card relative">
                                    {note.is_pinned && (
                                        <div className="absolute top-4 right-4">
                                            <i className="fa-solid fa-thumbtack text-yellow-500"></i>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${
                                            note.type === 'health' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                            note.type === 'progress' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                            note.type === 'reminder' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        }`}>
                                            <i className={`fa-solid ${
                                                note.type === 'health' ? 'fa-heart-pulse' :
                                                note.type === 'progress' ? 'fa-chart-line' :
                                                note.type === 'reminder' ? 'fa-bell' :
                                                'fa-note-sticky'
                                            }`}></i>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                                                    note.type === 'health' ? 'bg-red-500/10 text-red-400' :
                                                    note.type === 'progress' ? 'bg-green-500/10 text-green-400' :
                                                    note.type === 'reminder' ? 'bg-yellow-500/10 text-yellow-400' :
                                                    'bg-blue-500/10 text-blue-400'
                                                }`}>
                                                    {note.type === 'health' ? 'Sağlık' :
                                                     note.type === 'progress' ? 'İlerleme' :
                                                     note.type === 'reminder' ? 'Hatırlatma' : 'Genel'}
                                                </span>
                                                <span className="text-xs text-slate-500 font-bold">
                                                    {new Date(note.created_at).toLocaleDateString('tr-TR')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-300 font-medium leading-relaxed">
                                                {note.content}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button 
                                            onClick={() => handleDeleteNote(note.id)}
                                            className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
                                        >
                                            <i className="fa-solid fa-trash"></i> Sil
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-slate-800 rounded-3xl border-2 border-dashed border-slate-700">
                                <i className="fa-solid fa-note-sticky text-4xl text-slate-600 mb-4"></i>
                                <p className="text-slate-500 font-bold">Henüz not eklenmemiş.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    </div>
  );
}
