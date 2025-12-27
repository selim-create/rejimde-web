'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  getMe, 
  getInboxThreads, 
  createInboxThread, 
  InboxThread,
  getProClients,
  ClientListItem 
} from "@/lib/api";
import ThreadList from "./components/ThreadList";
import NewThreadModal from "./components/NewThreadModal";

export default function ProInboxPage() {
  const router = useRouter();
  const [pro, setPro] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Inbox State
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [meta, setMeta] = useState({ total: 0, unread_total: 0 });
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'closed' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [clients, setClients] = useState<ClientListItem[]>([]);

  // Fetch user info
  useEffect(() => {
    getMe().then((user) => {
        setPro(user);
    });
  }, []);

  // Fetch threads
  const fetchThreads = async () => {
    setLoading(true);
    const result = await getInboxThreads({
      status: activeTab === 'all' ? undefined : activeTab,
      search: searchTerm || undefined
    });
    setThreads(result.threads);
    setMeta(result.meta);
    setLoading(false);
  };

  useEffect(() => {
    fetchThreads();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        fetchThreads();
      } else if (searchTerm === '') {
        fetchThreads();
      }
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Fetch clients for new thread modal
  const fetchClients = async () => {
    const result = await getProClients({ status: 'active' });
    setClients(result.clients);
  };

  const handleNewThread = () => {
    fetchClients();
    setShowNewThreadModal(true);
  };

  const handleCreateThread = async (clientId: number, subject: string, message: string) => {
    const result = await createInboxThread({
      client_id: clientId,
      subject: subject || undefined,
      content: message
    });

    if (result.success && result.thread_id) {
      setShowNewThreadModal(false);
      // Navigate to the new thread
      router.push(`/dashboard/pro/inbox/${result.thread_id}`);
    }
  };

  const handleThreadSelect = (thread: InboxThread) => {
    router.push(`/dashboard/pro/inbox/${thread.id}`);
  };

  if (loading && !pro) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-rejimde-blue"></div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
      
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-md">
         <div className="flex items-center gap-3">
            <a href="/" className="block lg:hidden">
                <i className="fa-solid fa-arrow-left text-slate-400 hover:text-white transition"></i>
            </a>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-blue-500/20 tracking-wider">
                    PRO PANEL
                </span>
                <h1 className="font-extrabold text-white text-lg">Gelen Kutusu</h1>
            </div>
         </div>
         <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-700 overflow-hidden border-2 border-slate-600">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pro?.avatar_url} className="w-full h-full object-cover" alt="Profile" />
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-100px)]">

        {/* SIDEBAR NAV (Tam Liste) */}
        <div className="hidden lg:block lg:col-span-2 space-y-2 h-full overflow-y-auto custom-scrollbar pr-2">
            <a href="/dashboard/pro" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-gauge-high w-6 text-center group-hover:text-blue-400"></i> Panel
            </a>
            
            <p className="text-[10px] font-bold text-slate-500 uppercase px-4 pt-2">Yönetim</p>
            <a href="/dashboard/pro/notifications" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-bell w-6 text-center group-hover:text-blue-400"></i> Bildirimler
            </a>
            <a href="/dashboard/pro/activity" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-chart-line w-6 text-center group-hover:text-purple-400"></i> Aktiviteler
            </a>
            <a href="/dashboard/pro/inbox" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white font-extrabold shadow-btn shadow-blue-800 btn-game transition-transform hover:scale-105">
                <i className="fa-solid fa-envelope w-6 text-center"></i> Gelen Kutusu
            </a>
            <a href="/dashboard/pro/clients" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-users w-6 text-center group-hover:text-blue-400"></i> Danışanlar
            </a>
            <a href="/dashboard/pro/calendar" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-calendar-check w-6 text-center group-hover:text-green-400"></i> Takvim
            </a>
            <a href="/dashboard/pro/earnings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-wallet w-6 text-center group-hover:text-yellow-400"></i> Gelirler
            </a>
            <a href="/dashboard/pro/services" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-list w-6 text-center group-hover:text-teal-400"></i> Paketlerim
            </a>
            <a href="/dashboard/pro/reviews" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-star w-6 text-center group-hover:text-yellow-400"></i> Değerlendirmeler
            </a>
            
            <p className="text-[10px] font-bold text-slate-500 uppercase px-4 pt-2">İçerik & Araçlar</p>
            <a href="/dashboard/pro/diets/create" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-utensils w-6 text-center group-hover:text-orange-400"></i> Diyet Yaz
            </a>
            <a href="/dashboard/pro/exercises/create" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-dumbbell w-6 text-center group-hover:text-red-400"></i> Egzersiz Yaz
            </a>
            <a href="/dashboard/pro/blog/create" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-pen-nib w-6 text-center group-hover:text-pink-400"></i> Blog Yazısı
            </a>
            <a href="/dashboard/pro/dictionary/create" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-book-open w-6 text-center group-hover:text-teal-400"></i> Sözlük Ekle
            </a>
            
            <div className="h-px bg-slate-800 my-2"></div>
            
            <a href="/dashboard/pro/planner" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-wand-magic-sparkles w-6 text-center text-purple-500"></i> AI Asistan
            </a>
            <a href="/dashboard/pro/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-gear w-6 text-center group-hover:text-gray-300"></i> Ayarlar
            </a>
        </div>

        {/* INBOX CONTENT */}
        <div className="lg:col-span-10 bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-card flex flex-col h-full">
            
            {/* Header with filters and new thread button */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
                <div className="flex bg-slate-900 rounded-xl p-1 w-full md:w-auto">
                  <button 
                    onClick={() => setActiveTab('all')}
                    className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'all' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Tümü {meta.total > 0 && `(${meta.total})`}
                  </button>
                  <button 
                    onClick={() => setActiveTab('open')}
                    className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'open' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Açık
                  </button>
                  <button 
                    onClick={() => setActiveTab('closed')}
                    className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'closed' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Kapalı
                  </button>
                  <button 
                    onClick={() => setActiveTab('archived')}
                    className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'archived' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Arşiv
                  </button>
                </div>
                
                <button
                  onClick={handleNewThread}
                  className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-500 transition flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-plus"></i>
                  Yeni Mesaj
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Danışan adı veya mesaj ara..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-10 pr-4 py-2 text-white text-sm font-medium focus:border-blue-500 focus:outline-none placeholder-slate-500"
                />
              </div>

              {/* Unread count badge */}
              {meta.unread_total > 0 && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded-full font-bold">
                    {meta.unread_total}
                  </span>
                  <span className="text-slate-400">okunmamış mesaj</span>
                </div>
              )}
            </div>

            {/* Thread List */}
            <ThreadList
              threads={threads}
              onSelect={handleThreadSelect}
              loading={loading}
            />
        </div>

      </div>

      {/* New Thread Modal */}
      {showNewThreadModal && (
        <NewThreadModal
          clients={clients.map(c => ({ id: c.id, name: c.client_name, avatar: c.client_avatar }))}
          onSubmit={handleCreateThread}
          onClose={() => setShowNewThreadModal(false)}
        />
      )}
    </div>
  );
}