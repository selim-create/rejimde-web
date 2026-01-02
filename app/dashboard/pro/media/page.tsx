'use client';

import { useState, useEffect } from "react";
import { getMe as getRealMe, getMediaLibrary, addMediaItem, deleteMediaItem, MediaItem } from "@/lib/api";
// import Link from "next/link"; 

// --- MOCK API & DATA (Bağımsız çalışması için) ---
const getMe = async () => {
    // Try real API first
    const realUser = await getRealMe();
    if (realUser) return realUser;
    
    // Fallback to mock
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: 99,
                name: "Dr. Selim",
                title: "Baş Diyetisyen",
                avatar_url: "https://api.dicebear.com/9.x/personas/svg?seed=Selim",
            });
        }, 500);
    });
};

// Helper function to map platform to icon/color
const getPlatformStyle = (platform: string) => {
  switch(platform) {
      case 'youtube': return { icon: "fa-youtube", color: "text-red-500", bg: "bg-red-500/10" };
      case 'instagram': return { icon: "fa-instagram", color: "text-pink-500", bg: "bg-pink-500/10" };
      case 'tiktok': return { icon: "fa-tiktok", color: "text-teal-400", bg: "bg-teal-500/10" };
      case 'spotify': return { icon: "fa-spotify", color: "text-green-500", bg: "bg-green-500/10" };
      case 'vimeo': return { icon: "fa-vimeo", color: "text-blue-500", bg: "bg-blue-500/10" };
      default: return { icon: "fa-link", color: "text-slate-400", bg: "bg-slate-700/50" };
  }
};

// Helper function to format relative date
const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Bugün";
  if (diffDays === 1) return "Dün";
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
  return `${Math.floor(diffDays / 30)} ay önce`;
};

export default function ProMediaPage() {
  const [pro, setPro] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'youtube' | 'instagram' | 'tiktok' | 'spotify'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [newLink, setNewLink] = useState({
      title: "",
      platform: "youtube",
      url: ""
  });

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getMe();
        setPro(user);
        
        // Load media items from API
        const result = await getMediaLibrary();
        const items = result.items.map((item: MediaItem) => ({
          id: item.id,
          title: item.title,
          platform: item.type,
          url: item.url,
          date: formatRelativeDate(item.created_at),
          ...getPlatformStyle(item.type)
        }));
        setMediaList(items);
      } catch (error) {
        console.error("Medya yüklenirken hata oluştu:", error);
        // Still set empty list instead of crashing
        setMediaList([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddLink = async () => {
      if (!newLink.url || !newLink.title) {
        alert("Lütfen tüm alanları doldurun.");
        return;
      }

      setSubmitting(true);
      
      // Call API to add media item
      const result = await addMediaItem({
        title: newLink.title,
        type: newLink.platform as 'youtube' | 'instagram' | 'spotify' | 'vimeo' | 'custom_link',
        url: newLink.url
      });
      
      setSubmitting(false);
      
      if (result.success && result.item) {
        // Add to local state
        const newItem = {
          id: result.item.id,
          title: result.item.title,
          platform: result.item.type,
          url: result.item.url,
          date: "Şimdi",
          ...getPlatformStyle(result.item.type)
        };
        
        setMediaList([newItem, ...mediaList]);
        setShowAddModal(false);
        setNewLink({ title: "", platform: "youtube", url: "" });
        alert("İçerik başarıyla eklendi!");
      } else {
        alert(result.message || "İçerik eklenirken bir hata oluştu.");
      }
  };

  const handleDelete = async (id: number) => {
      if (!confirm("Bu içeriği kütüphaneden kaldırmak istediğinize emin misiniz?")) {
        return;
      }
      
      const result = await deleteMediaItem(id);
      
      if (result.success) {
        setMediaList(mediaList.filter(m => m.id !== id));
        alert("İçerik başarıyla silindi.");
      } else {
        alert(result.message || "İçerik silinirken bir hata oluştu.");
      }
  };

  const filteredMedia = mediaList.filter(m => filter === 'all' || m.platform === filter);

  // İstatistikler
  const stats = {
      total: mediaList.length,
      youtube: mediaList.filter(m => m.platform === 'youtube').length,
      social: mediaList.filter(m => ['instagram', 'tiktok'].includes(m.platform)).length
  };

  if (loading) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-rejimde-blue"></div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-slate-200">
      
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-md">
         <div className="flex items-center gap-3">
            <a href="/dashboard/pro" className="block lg:hidden">
                <i className="fa-solid fa-arrow-left text-slate-400 hover:text-white transition"></i>
            </a>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-blue-500/20 tracking-wider">
                    PRO PANEL
                </span>
                <h1 className="font-extrabold text-white text-lg">Medya Galeri</h1>
            </div>
         </div>
         <div className="flex gap-4">
            <button 
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-btn shadow-indigo-900/50 btn-game flex items-center gap-2 hover:bg-indigo-500 transition"
            >
                <i className="fa-solid fa-plus"></i> <span className="hidden sm:inline">İçerik Ekle</span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-slate-700 overflow-hidden border-2 border-slate-600">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pro?.avatar_url} className="w-full h-full object-cover" alt="Profile" />
            </div>
         </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* SIDEBAR NAV */}
        <div className="hidden lg:block lg:col-span-2 space-y-2 sticky top-24 h-fit">
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
            <a href="/dashboard/pro/inbox" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-envelope w-6 text-center group-hover:text-pink-400"></i> Gelen Kutusu
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
            <a href="/dashboard/pro/finance/services" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-list w-6 text-center group-hover:text-teal-400"></i> Paketlerim
            </a>
            <a href="/dashboard/pro/reviews" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-star w-6 text-center group-hover:text-yellow-400"></i> Değerlendirmeler
            </a>
            
            <p className="text-[10px] font-bold text-slate-500 uppercase px-4 pt-2">İçerik & Araçlar</p>
            <a href="/dashboard/pro/media" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600/20 text-indigo-400 font-bold border border-indigo-500/30 transition-transform hover:scale-105">
                <i className="fa-solid fa-photo-film w-6 text-center"></i> Medya Kütüphanesi
            </a>
            <a href="/dashboard/pro/faq" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-circle-question w-6 text-center group-hover:text-cyan-400"></i> SSS Yönetimi
            </a>
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

        {/* CONTENT */}
        <div className="lg:col-span-10">
            
            {/* Stats Card */}
            <div className="bg-gradient-to-r from-indigo-900/50 to-slate-900 border border-indigo-700/30 rounded-3xl p-6 mb-8 shadow-card relative overflow-hidden flex items-center justify-between">
                <div className="relative z-10">
                    <h2 className="text-xl font-extrabold text-white mb-1 flex items-center gap-2">
                        <i className="fa-solid fa-photo-film text-indigo-400"></i> Medya Kütüphanesi
                    </h2>
                    <p className="text-slate-400 text-sm font-medium">
                        YouTube, Instagram veya TikTok içeriklerinizi buraya ekleyerek danışanlarınızla paylaşabilirsiniz.
                    </p>
                </div>
                <div className="hidden sm:flex gap-6 text-center relative z-10 pr-4">
                    <div>
                        <span className="block text-2xl font-black text-white">{stats.total}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Toplam İçerik</span>
                    </div>
                    <div>
                        <span className="block text-2xl font-black text-red-500">{stats.youtube}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Video</span>
                    </div>
                    <div>
                        <span className="block text-2xl font-black text-pink-500">{stats.social}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Sosyal</span>
                    </div>
                </div>
                {/* Decorative BG */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-10 -mt-10"></div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${filter === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                    Tümü ({mediaList.length})
                </button>
                <button onClick={() => setFilter('youtube')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${filter === 'youtube' ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                    <i className="fa-brands fa-youtube"></i> YouTube
                </button>
                <button onClick={() => setFilter('instagram')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${filter === 'instagram' ? 'bg-pink-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                    <i className="fa-brands fa-instagram"></i> Instagram
                </button>
                <button onClick={() => setFilter('tiktok')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${filter === 'tiktok' ? 'bg-teal-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                    <i className="fa-brands fa-tiktok"></i> TikTok
                </button>
                <button onClick={() => setFilter('spotify')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${filter === 'spotify' ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                    <i className="fa-brands fa-spotify"></i> Spotify
                </button>
            </div>

            {/* Media Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
                {/* Add Button Card */}
                <div 
                    onClick={() => setShowAddModal(true)}
                    className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 hover:border-indigo-500/50 transition group h-full min-h-[240px]"
                >
                    <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition group-hover:bg-indigo-600/20 group-hover:text-indigo-400">
                        <i className="fa-solid fa-plus text-xl text-slate-400 group-hover:text-indigo-400"></i>
                    </div>
                    <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300">Yeni Link Ekle</span>
                </div>

                {/* Content Cards */}
                {filteredMedia.map((file) => (
                    <div key={file.id} className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden flex flex-col hover:border-slate-600 transition shadow-sm hover:shadow-md group h-full">
                        <div className={`aspect-video ${file.bg} flex items-center justify-center relative shrink-0`}>
                            <i className={`fa-brands ${file.icon} text-5xl ${file.color} opacity-80 group-hover:opacity-100 group-hover:scale-110 transition duration-300`}></i>
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition backdrop-blur-[2px]">
                                <a href={file.url} target="_blank" className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 hover:bg-indigo-500 hover:text-white transition shadow-lg" title="Görüntüle">
                                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                                </a>
                                <button 
                                    onClick={() => handleDelete(file.id)}
                                    className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition shadow-lg" title="Kaldır"
                                >
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                            <h4 className="text-sm font-bold text-white mb-2 line-clamp-2 leading-tight">{file.title}</h4>
                            <div className="mt-auto flex items-center justify-between text-[10px] font-bold text-slate-500">
                                <span className="uppercase flex items-center gap-1">
                                    <i className={`fa-brands ${file.icon}`}></i> {file.platform}
                                </span>
                                <span>{file.date}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>

      </div>

      {/* ADD LINK MODAL */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowAddModal(false)}>
              <div className="bg-slate-800 rounded-3xl w-full max-w-md border border-slate-700 shadow-2xl p-8 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><i className="fa-solid fa-xmark text-xl"></i></button>
                  
                  <h2 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
                      <i className="fa-solid fa-link text-indigo-400"></i> İçerik Ekle
                  </h2>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Başlık</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none font-bold" 
                            placeholder="Örn: Sabah Yoga Rutini"
                            value={newLink.title}
                            onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Platform</label>
                          <div className="grid grid-cols-2 gap-2">
                              {['youtube', 'instagram', 'tiktok', 'spotify'].map(p => (
                                  <button 
                                    key={p}
                                    onClick={() => setNewLink({...newLink, platform: p})}
                                    className={`py-2 rounded-xl text-xs font-bold capitalize border transition flex items-center justify-center gap-2 ${
                                        newLink.platform === p 
                                            ? 'bg-indigo-600 text-white border-indigo-600' 
                                            : 'bg-slate-900 text-slate-400 border-slate-600 hover:border-slate-500'
                                    }`}
                                  >
                                      <i className={`fa-brands fa-${p}`}></i> {p}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Bağlantı (URL)</label>
                          <input 
                            type="url" 
                            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:outline-none font-bold text-sm" 
                            placeholder="https://..."
                            value={newLink.url}
                            onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                          />
                      </div>

                      <button 
                          onClick={handleAddLink}
                          disabled={submitting}
                          className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-extrabold shadow-btn btn-game hover:bg-indigo-500 transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {submitting ? 'Ekleniyor...' : 'Listeye Ekle'}
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}