'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  getProClients, 
  addProClient, 
  createClientInvite, 
  getServices,
  updateClientStatus,
  type ClientListItem,
  type Service 
} from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

export default function ProClientsPage() {
  const { showToast } = useToast();
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const DEFAULT_META = { total: 0, active: 0, pending: 0, archived: 0 };
  const [meta, setMeta] = useState(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'archived'>('active');
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const isInitialMount = useRef(true);

  // Form states for adding client
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    package_name: '',
    package_type: 'session' as 'session' | 'duration' | 'unlimited',
    total_sessions: 10,
    start_date: '',
    price: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  // Invite link state
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Fetch clients
  const fetchClients = async () => {
    setLoading(true);
    try {
      const result = await getProClients({
        status: activeTab,
        search: searchTerm || undefined
      });
      
      // Defensive: ensure we have valid data
      setClients(Array.isArray(result.clients) ? result.clients : []);
      setMeta(result.meta || DEFAULT_META);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
      setMeta(DEFAULT_META);
    } finally {
      setLoading(false);
    }
  };

  // Fetch services for package selection
  const fetchServices = async () => {
    try {
      const data = await getServices();
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchServices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Search with debounce - refetch clients when search term changes (including when cleared)
  useEffect(() => {
    // Skip the debounced call on initial mount (already fetched by the effect above)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    const timer = setTimeout(() => {
      fetchClients();
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleAddClient = async () => {
    if (!formData.client_name || !formData.client_email || !formData.package_name || !formData.start_date) {
      showToast({
        type: 'warning',
        title: 'Eksik Bilgi',
        message: 'Lütfen tüm alanları doldurun.'
      });
      return;
    }

    setSubmitting(true);
    const result = await addProClient(formData);
    
    if (result.success) {
      showToast({
        type: 'success',
        title: 'Danışan Eklendi',
        message: result.data?.reactivated 
          ? 'Danışan yeniden aktifleştirildi.' 
          : 'Yeni danışan başarıyla eklendi.'
      });
      setShowAddModal(false);
      setFormData({
        client_name: '',
        client_email: '',
        package_name: '',
        package_type: 'session',
        total_sessions: 10,
        start_date: '',
        price: 0,
      });
      fetchClients();
    } else {
      showToast({
        type: 'error',
        title: 'Hata',
        message: result.message || 'Danışan eklenemedi.'
      });
    }
    setSubmitting(false);
  };

  const handleCreateInvite = async () => {
    if (!formData.package_name) {
      showToast({
        type: 'warning',
        title: 'Eksik Bilgi',
        message: 'Lütfen bir paket seçin.'
      });
      return;
    }

    setInviteLoading(true);
    setInviteError(null);
    const result = await createClientInvite({
      package_name: formData.package_name,
      package_type: formData.package_type,
      total_sessions: formData.total_sessions,
      price: formData.price,
    });
    
    if (result.success && result.invite_url) {
      setInviteUrl(result.invite_url);
      await navigator.clipboard.writeText(result.invite_url);
      showToast({
        type: 'success',
        title: 'Link Kopyalandı!',
        message: 'Davet linki panoya kopyalandı. Danışana gönderebilirsiniz.'
      });
    } else {
      const errorMsg = result.message || 'Davet linki oluşturulamadı.';
      setInviteError(errorMsg);
      showToast({
        type: 'error',
        title: 'Hata',
        message: errorMsg
      });
    }
    setInviteLoading(false);
  };

  const handleStatusChange = async (clientId: number, relationshipId: number, newStatus: 'active' | 'paused' | 'archived') => {
    const statusLabels = {
      active: 'Aktife',
      paused: 'Pasife',
      archived: 'Arşive'
    };
    
    if (!confirm(`Bu danışanı ${statusLabels[newStatus]} almak istediğinize emin misiniz?`)) {
      return;
    }

    const result = await updateClientStatus(relationshipId, newStatus);
    
    if (result.success) {
      showToast({
        type: 'success',
        title: 'Durum Güncellendi',
        message: `Danışan ${statusLabels[newStatus]} alındı.`
      });
      fetchClients(); // Refresh the list
      setOpenDropdownId(null);
    } else {
      showToast({
        type: 'error',
        title: 'Hata',
        message: result.message || 'Durum güncellenemedi.'
      });
    }
  };

  const handleWhatsAppShare = (inviteUrl: string) => {
    const message = encodeURIComponent(`Rejimde platformuna katılman için davet linkin: ${inviteUrl}`);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
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
                    Aktif ({meta.active})
                </button>
                <button 
                    onClick={() => setActiveTab('pending')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'pending' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Bekleyen ({meta.pending})
                </button>
                <button 
                    onClick={() => setActiveTab('archived')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'archived' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Arşiv ({meta.archived})
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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && clients.length === 0 && (
          <div className="text-center py-20 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-3xl">
            <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-users text-3xl text-slate-500"></i>
            </div>
            <h3 className="text-white font-extrabold text-xl mb-2">Henüz Danışanın Yok</h3>
            <p className="text-slate-500 text-sm font-bold mb-8 max-w-sm mx-auto">
              Yeni danışan ekleyerek veya davet linki göndererek başlayabilirsin.
            </p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-extrabold shadow-btn shadow-blue-900/50 btn-game hover:bg-blue-500 transition"
            >
              <i className="fa-solid fa-user-plus mr-2"></i> İlk Danışanını Ekle
            </button>
          </div>
        )}

        {/* Client Grid */}
        {!loading && clients.length > 0 && (
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

            {/* Clients */}
            {clients.map((client) => (
                <div key={client.id} className="bg-slate-800 border border-slate-700 rounded-3xl p-6 hover:border-slate-600 transition group relative overflow-hidden flex flex-col">
                    {/* Status Strip */}
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${
                        client.risk_status === 'danger' ? 'bg-red-500' :
                        client.risk_status === 'warning' ? 'bg-yellow-500' :
                        'bg-green-500'
                    }`}></div>

                    <div className="flex items-start justify-between mb-6 pl-2">
                        <div className="flex items-center gap-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={client.client.avatar} className="w-14 h-14 rounded-2xl bg-slate-700 object-cover border-2 border-slate-600" alt={client.client.name} />
                            <div>
                                <h3 className="font-extrabold text-white text-lg leading-tight">{client.client.name}</h3>
                                <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded mt-1 ${
                                    client.risk_status === 'danger' ? 'bg-red-500/10 text-red-400' :
                                    client.risk_status === 'warning' ? 'bg-yellow-500/10 text-yellow-400' :
                                    'bg-green-500/10 text-green-400'
                                }`}>
                                    <i className={`fa-solid ${
                                        client.risk_status === 'danger' ? 'fa-triangle-exclamation' :
                                        client.risk_status === 'warning' ? 'fa-bell' :
                                        'fa-check-circle'
                                    }`}></i>
                                    {client.risk_reason || 'Normal'}
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <button 
                                onClick={() => setOpenDropdownId(openDropdownId === client.id ? null : client.id)}
                                className="text-slate-400 hover:text-white transition"
                            >
                                <i className="fa-solid fa-ellipsis-vertical text-xl"></i>
                            </button>
                            
                            {/* Dropdown Menu */}
                            {openDropdownId === client.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-10 overflow-hidden">
                                    <Link 
                                        href={`/dashboard/pro/inbox/${client.relationship_id}`}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition text-slate-300 hover:text-white"
                                        onClick={() => setOpenDropdownId(null)}
                                    >
                                        <i className="fa-solid fa-message w-4"></i>
                                        <span className="text-sm font-bold">Mesaj Gönder</span>
                                    </Link>
                                    {client.status === 'active' && (
                                        <button 
                                            onClick={() => handleStatusChange(client.id, client.relationship_id, 'paused')}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition text-slate-300 hover:text-white"
                                        >
                                            <i className="fa-solid fa-pause w-4"></i>
                                            <span className="text-sm font-bold">Pasife Al</span>
                                        </button>
                                    )}
                                    {client.status === 'paused' && (
                                        <button 
                                            onClick={() => handleStatusChange(client.id, client.relationship_id, 'active')}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition text-slate-300 hover:text-white"
                                        >
                                            <i className="fa-solid fa-play w-4"></i>
                                            <span className="text-sm font-bold">Aktife Al</span>
                                        </button>
                                    )}
                                    {client.status !== 'archived' && (
                                        <button 
                                            onClick={() => handleStatusChange(client.id, client.relationship_id, 'archived')}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition text-orange-400 hover:text-orange-300"
                                        >
                                            <i className="fa-solid fa-box-archive w-4"></i>
                                            <span className="text-sm font-bold">Arşivle</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar (Package Tracking) */}
                    {client.package && (
                        <div className="mb-6 pl-2">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase">{client.package.name}</span>
                                <span className="text-xs font-bold text-white">
                                    <span className="text-blue-400">{client.package.used}</span> / {client.package.total} Ders
                                </span>
                            </div>
                            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        client.package.progress_percent >= 100 ? 'bg-green-500' : 'bg-blue-500'
                                    }`} 
                                    style={{ width: `${Math.min(client.package.progress_percent, 100)}%` }}
                                ></div>
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
                                <span className="font-black text-white">{client.package?.remaining || 0}</span>
                             </div>
                        </div>

                        <div className="flex gap-2">
                            <Link href={`/dashboard/pro/clients/${client.relationship_id}`} className="flex-1 bg-white text-slate-900 py-2.5 rounded-xl font-extrabold text-xs uppercase text-center hover:bg-slate-200 transition shadow-sm">
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
        )}
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
                              <input 
                                type="text" 
                                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold" 
                                placeholder="Ahmet Yılmaz"
                                value={formData.client_name}
                                onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">E-posta</label>
                              <input 
                                type="email" 
                                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold" 
                                placeholder="ornek@email.com"
                                value={formData.client_email}
                                onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                              />
                          </div>
                      </div>

                      <div className="h-px bg-slate-700 my-2"></div>
                      <p className="text-xs font-black text-blue-400 uppercase">Anlaşma Detayları</p>

                      <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Paket / Hizmet Seç</label>
                          <select 
                            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold appearance-none"
                            value={formData.package_name}
                            onChange={(e) => {
                              const service = services.find(s => s.name === e.target.value);
                              setFormData({
                                ...formData, 
                                package_name: e.target.value,
                                price: service?.price || 0
                              });
                            }}
                          >
                              <option value="">Paket Seçiniz</option>
                              {services.map(s => (
                                  <option key={s.id} value={s.name}>{s.name} - {s.price} TL</option>
                              ))}
                          </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Başlangıç Tarihi</label>
                              <input 
                                type="date" 
                                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold"
                                value={formData.start_date}
                                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Toplam Seans</label>
                              <input 
                                type="number" 
                                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-bold"
                                placeholder="10"
                                value={formData.total_sessions}
                                onChange={(e) => setFormData({...formData, total_sessions: parseInt(e.target.value) || 0})}
                              />
                          </div>
                      </div>
                      
                      <div className="pt-2 flex gap-3">
                          <button 
                            onClick={handleCreateInvite}
                            disabled={inviteLoading}
                            className="flex-1 bg-slate-700 text-white py-3 rounded-xl font-bold hover:bg-slate-600 transition disabled:opacity-50"
                          >
                            {inviteLoading ? 'Oluşturuluyor...' : 'Davet Linki Kopyala'}
                          </button>
                          <button 
                            onClick={handleAddClient}
                            disabled={submitting}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-extrabold shadow-btn btn-game hover:bg-blue-500 transition disabled:opacity-50"
                          >
                            {submitting ? 'Ekleniyor...' : 'Danışanı Ekle'}
                          </button>
                      </div>

                      {inviteUrl && (
                        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                          <p className="text-xs font-bold text-green-400 mb-2">Davet linki oluşturuldu ve kopyalandı!</p>
                          <input 
                            type="text" 
                            value={inviteUrl} 
                            readOnly 
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white font-mono mb-3"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigator.clipboard.writeText(inviteUrl)}
                              className="flex-1 bg-slate-700 text-white py-2 rounded-lg font-bold text-xs hover:bg-slate-600 transition flex items-center justify-center gap-2"
                            >
                              <i className="fa-solid fa-copy"></i> Tekrar Kopyala
                            </button>
                            <button
                              onClick={() => handleWhatsAppShare(inviteUrl)}
                              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-xs hover:bg-green-500 transition flex items-center justify-center gap-2"
                            >
                              <i className="fa-brands fa-whatsapp"></i> WhatsApp ile Gönder
                            </button>
                          </div>
                        </div>
                      )}

                      {inviteError && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                          <p className="text-xs font-bold text-red-400">
                            <i className="fa-solid fa-circle-exclamation mr-1"></i>
                            {inviteError}
                          </p>
                        </div>
                      )}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}