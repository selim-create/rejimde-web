'use client';

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  getProClient, 
  addClientNote, 
  deleteClientNote, 
  getClientPlans, 
  updateClientPackage,
  getProServices,
  getAppointmentRequests,
  ClientDetail,
  ProService,
  AppointmentRequest
} from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

export default function ClientManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { showToast } = useToast();
  const router = useRouter();
  const { id } = use(params);
  const clientId = parseInt(id);
  
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'requests' | 'notes'>('overview');
  const [plans, setPlans] = useState<unknown[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  
  // Services state for package modal
  const [services, setServices] = useState<ProService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  
  // Requests state
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Notes state
  const [newNote, setNewNote] = useState({ 
    type: 'general' as 'general' | 'health' | 'progress' | 'reminder', 
    content: '', 
    is_pinned: false 
  });
  const [savingNote, setSavingNote] = useState(false);

  // Add package modal state
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [showServiceSelectionModal, setShowServiceSelectionModal] = useState(false);
  const [addingPackage, setAddingPackage] = useState(false);
  const [packageData, setPackageData] = useState({
    sessions_to_add: 5,
    price: 0
  });

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

  const fetchServices = async () => {
    setServicesLoading(true);
    const data = await getProServices();
    setServices(data);
    setServicesLoading(false);
  };

  const fetchRequests = async () => {
    setRequestsLoading(true);
    const result = await getAppointmentRequests('pending');
    // Filter requests for this specific client if needed
    setRequests(result.requests);
    setPendingRequestsCount(result.meta.pending);
    setRequestsLoading(false);
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
    if (activeTab === 'requests' && client) {
      fetchRequests();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, client]);

  const handleAddNote = async () => {
    if (!newNote.content.trim()) {
      showToast({
        type: 'warning',
        title: 'Uyarı',
        message: 'Not içeriği boş olamaz.'
      });
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
      showToast({
        type: 'success',
        title: 'Not Eklendi',
        message: 'Danışan notu başarıyla kaydedildi.'
      });
    } else {
      showToast({
        type: 'error',
        title: 'Hata',
        message: result.message || 'Not eklenemedi.'
      });
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
      showToast({
        type: 'success',
        title: 'Not Silindi'
      });
    } else {
      showToast({
        type: 'error',
        title: 'Hata',
        message: result.message || 'Not silinemedi.'
      });
    }
  };

  const handleAddPackage = async () => {
    if (!packageData.sessions_to_add || packageData.sessions_to_add <= 0) {
      showToast({
        type: 'warning',
        title: 'Uyarı',
        message: 'Lütfen geçerli bir seans sayısı girin.'
      });
      return;
    }

    setAddingPackage(true);
    const result = await updateClientPackage(clientId, {
      action: 'extend',
      total_sessions: packageData.sessions_to_add,
      price: packageData.price
    });

    if (result.success) {
      showToast({
        type: 'success',
        title: 'Paket Güncellendi',
        message: `${packageData.sessions_to_add} seans başarıyla eklendi.`
      });
      setShowAddPackageModal(false);
      setPackageData({ sessions_to_add: 5, price: 0 });
      fetchClient(); // Refresh client data
    } else {
      showToast({
        type: 'error',
        title: 'Hata',
        message: result.message || 'Paket güncellenemedi.'
      });
    }
    setAddingPackage(false);
  };

  const handleAssignService = async (service: ProService) => {
    setAddingPackage(true);
    const result = await updateClientPackage(clientId, {
      action: 'extend',
      package_name: service.name,
      total_sessions: service.session_count || 1,
      price: service.price
    });

    if (result.success) {
      showToast({
        type: 'success',
        title: 'Hizmet Eklendi',
        message: `${service.name} başarıyla danışana atandı.`
      });
      setShowServiceSelectionModal(false);
      fetchClient(); // Refresh client data
    } else {
      showToast({
        type: 'error',
        title: 'Hata',
        message: result.message || 'Hizmet eklenemedi.'
      });
    }
    setAddingPackage(false);
  };

  const handleCreatePlan = () => {
    router.push(`/dashboard/pro/plans/create?client_id=${clientId}`);
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
                    <button 
                        onClick={() => {
                            setShowServiceSelectionModal(true);
                            fetchServices();
                        }}
                        className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-btn shadow-purple-800 btn-game hidden sm:flex items-center gap-2 hover:bg-purple-500 transition"
                    >
                        <i className="fa-solid fa-briefcase"></i> Hizmet Ekle
                    </button>
                    <button 
                        onClick={() => setShowAddPackageModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-btn shadow-green-800 btn-game hidden sm:flex items-center gap-2 hover:bg-green-500 transition"
                    >
                        <i className="fa-solid fa-plus"></i> Seans Ekle
                    </button>
                    <button 
                        onClick={handleCreatePlan}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-btn shadow-blue-800 btn-game hidden sm:flex items-center gap-2 hover:bg-blue-500 transition"
                    >
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
                <div className="animate-fadeIn">
                    {requestsLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        </div>
                    ) : requests.length > 0 ? (
                        <div className="space-y-4">
                            {requests.map((request: AppointmentRequest) => (
                                <div key={request.id} className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-card hover:border-slate-600 transition">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 className="font-extrabold text-white text-lg mb-1">{request.service?.name || 'Randevu Talebi'}</h4>
                                            <p className="text-slate-400 text-sm">{request.message || 'Danışan bir randevu talebi gönderdi.'}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                            request.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                            request.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                                            'bg-red-500/10 text-red-400'
                                        }`}>
                                            {request.status === 'pending' ? 'Bekliyor' :
                                             request.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 font-bold">
                                        {new Date(request.created_at).toLocaleDateString('tr-TR')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-800 rounded-3xl border-2 border-dashed border-slate-700">
                            <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <i className="fa-solid fa-inbox text-3xl text-slate-500"></i>
                            </div>
                            <h3 className="text-white font-extrabold text-xl mb-2">Henüz Talep Yok</h3>
                            <p className="text-slate-500 text-sm font-bold mb-8 max-w-sm mx-auto">
                                Bu danışandan henüz randevu veya mesaj talebi gelmemiş.
                            </p>
                        </div>
                    )}
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
                            <button 
                                onClick={handleCreatePlan}
                                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-extrabold shadow-btn shadow-blue-900/50 btn-game hover:bg-blue-500 transition flex items-center gap-2 mx-auto"
                            >
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
                            client.notes.map((note, index) => (
                                <div key={note.id || `note-${index}`} className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-card relative">
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

        {/* ADD PACKAGE MODAL */}
        {showAddPackageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowAddPackageModal(false)}>
            <div className="bg-slate-800 rounded-3xl w-full max-w-md border border-slate-700 shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowAddPackageModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
              
              <h2 className="text-xl font-extrabold text-white mb-1">Seans Uzat</h2>
              <p className="text-slate-400 text-xs font-bold mb-6">Danışana ek seans hakkı tanıyın.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Eklenecek Seans Sayısı</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold" 
                    placeholder="5"
                    min="1"
                    value={packageData.sessions_to_add}
                    onChange={(e) => setPackageData({...packageData, sessions_to_add: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Ücret (TL)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold" 
                    placeholder="0"
                    min="0"
                    value={packageData.price}
                    onChange={(e) => setPackageData({...packageData, price: parseFloat(e.target.value) || 0})}
                  />
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handleAddPackage}
                    disabled={addingPackage}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-extrabold shadow-btn btn-game hover:bg-green-500 transition disabled:opacity-50"
                  >
                    {addingPackage ? 'Ekleniyor...' : 'Seansları Ekle'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SERVICE SELECTION MODAL */}
        {showServiceSelectionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowServiceSelectionModal(false)}>
            <div className="bg-slate-800 rounded-3xl w-full max-w-2xl border border-slate-700 shadow-2xl p-6 relative max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowServiceSelectionModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
              
              <h2 className="text-xl font-extrabold text-white mb-1">Hizmet Ekle</h2>
              <p className="text-slate-400 text-xs font-bold mb-6">Danışana mevcut hizmetlerinizden birini atayın.</p>

              {servicesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
              ) : services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.filter(s => s.is_active).map((service) => (
                    <div 
                      key={service.id} 
                      onClick={() => handleAssignService(service)}
                      className="bg-slate-900 border border-slate-700 rounded-2xl p-4 hover:border-blue-500 cursor-pointer transition group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-extrabold text-white text-base group-hover:text-blue-400 transition">{service.name}</h4>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${service.color}20`, color: service.color }}>
                          <i className="fa-solid fa-briefcase text-sm"></i>
                        </div>
                      </div>
                      {service.description && (
                        <p className="text-slate-400 text-xs mb-3 line-clamp-2">{service.description}</p>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                        <span className="text-xs text-slate-500 font-bold">
                          {service.session_count ? `${service.session_count} Seans` : service.type}
                        </span>
                        <span className="text-lg font-black text-green-400">
                          {service.price} {service.currency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fa-solid fa-briefcase text-3xl text-slate-500"></i>
                  </div>
                  <h3 className="text-white font-extrabold text-xl mb-2">Henüz Hizmet Yok</h3>
                  <p className="text-slate-500 text-sm font-bold mb-8 max-w-sm mx-auto">
                    Önce hizmet oluşturmalısınız.
                  </p>
                  <Link 
                    href="/dashboard/pro/services"
                    className="inline-block bg-blue-600 text-white px-8 py-4 rounded-2xl font-extrabold shadow-btn shadow-blue-900/50 btn-game hover:bg-blue-500 transition"
                  >
                    <i className="fa-solid fa-plus mr-2"></i> Hizmet Oluştur
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
