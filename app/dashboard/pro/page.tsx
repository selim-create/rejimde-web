'use client';

import { useState, useEffect } from "react";
// import Link from "next/link"; // Hata verdiği için kaldırıldı, <a> etiketi kullanılacak.

// --- MOCK API (Bağımlılığı kaldırmak için) ---
const getMe = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: 99,
                name: "Dr. Selim",
                title: "Baş Diyetisyen",
                avatar_url: "https://api.dicebear.com/9.x/personas/svg?seed=Selim",
            });
        }, 800);
    });
};

// --- MOCK DATA ---
const MOCK_STATS = {
    activeClients: 42,
    pendingAppointments: 8,
    pendingRevisions: 5,
    monthlyIncome: "₺24.500",
    weeklyGrowth: "+3",
    totalBalance: "₺8.250",
    pendingPayout: "₺12.000",
    lastPayout: "₺15.000"
};

const MOCK_SERVICES = [
    { id: 1, title: "Online Yoga (Birebir)", price: 750, duration: 60, type: 'online', active: true },
    { id: 2, title: "Reformer Pilates (Stüdyo)", price: 1200, duration: 50, type: 'offline', active: true },
    { id: 3, title: "Beslenme Danışmanlığı", price: 2000, duration: 45, type: 'consultation', active: true },
    { id: 4, title: "PT Paketi (10 Ders)", price: 15000, duration: 60, type: 'package', active: false },
];

const MOCK_CLIENTS = [
  {
    id: 101,
    name: "Burak Yılmaz",
    avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Burak",
    status: "danger", 
    statusText: "3 gündür log girmiyor",
    score: 420,
    nextAction: "whatsapp",
    packageInfo: { name: "Online PT Paketi", total: 24, used: 18, remaining: 6 },
    agreement: { startDate: "2025-12-01", endDate: "2026-02-01", duration: "2 Ay", price: 8500, notes: "Bel fıtığı geçmişi var." },
    requests: []
  },
  {
    id: 102,
    name: "Ayşe K.",
    avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Ayse",
    status: "warning",
    statusText: "Yeni liste talep etti",
    score: 750,
    nextAction: "plan",
    packageInfo: { name: "Beslenme Danışmanlığı", total: 4, used: 1, remaining: 3 },
    agreement: { startDate: "2025-12-15", endDate: "2026-01-15", duration: "1 Ay", price: 2000, notes: "Gluten hassasiyeti." },
    requests: []
  },
  {
    id: 103,
    name: "Mehmet Demir",
    avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Mehmet",
    status: "success",
    statusText: "Hedefine ulaştı 🎉",
    score: 1200,
    nextAction: "congrats",
    packageInfo: {
        name: "Reformer Pilates",
        total: 12,
        used: 12,
        remaining: 0
    },
    agreement: { startDate: "2025-11-01", endDate: "2025-12-20", duration: "12 Ders", price: 12000, notes: "Paket tamamlandı." },
    requests: []
  }
];

const MOCK_APPOINTMENTS = [
  {
    id: 1,
    clientId: 101,
    clientName: "Selin Yılmaz",
    date: "2025-12-28", 
    time: "10:00",
    duration: 60,
    type: "online",
    title: "Vinyasa Flow - Seviye 2",
    status: "confirmed", 
    location: "https://zoom.us/j/123456"
  },
  {
    id: 2,
    clientId: 103,
    clientName: "Merve Boluğur",
    date: "2025-12-28",
    time: "15:30",
    duration: 45,
    type: "offline",
    title: "Haftalık Kontrol",
    status: "confirmed",
    location: "Nişantaşı Ofis"
  }
];

const MOCK_APPOINTMENT_REQUESTS = [
    {
        id: 501,
        clientName: "Gizem A.",
        avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Gizem",
        service: "Online Yoga (Birebir)",
        date: "29 Ara, Pzt",
        time: "14:00",
        status: "pending"
    },
    {
        id: 502,
        clientName: "Mehmet Demir",
        avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Mehmet",
        service: "Reformer Pilates (Stüdyo)",
        date: "30 Ara, Salı",
        time: "09:00",
        status: "pending"
    }
];

const MOCK_INBOX = [
    {
        id: 601,
        from: "Ayşe K.",
        avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Ayse",
        subject: "Ara öğün hakkında",
        preview: "Hocam, ara öğünde verdiğiniz badem yerine ceviz tüketsem...",
        time: "10 dk önce",
        isRead: false
    },
    {
        id: 602,
        from: "Burak Yılmaz",
        avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Burak",
        subject: "Antrenman sonrası ağrı",
        preview: "Dünkü bacak antrenmanından sonra dizimde hafif bir sızı var...",
        time: "2 saat önce",
        isRead: false
    }
];

// LEADERBOARD DATA
const MOCK_LEADERBOARD = [
    { id: 1, name: "Mehmet Demir", avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Mehmet", score: 1200, badge: "Su Şampiyonu" },
    { id: 2, name: "Selin Yılmaz", avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Selin", score: 890, badge: "İstikrar Abidesi" },
    { id: 3, name: "Ayşe K.", avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Ayse", score: 750, badge: "Yeni Başlayan" },
    { id: 4, name: "Burak Yılmaz", avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Burak", score: 420, badge: "-" },
];

const AVAILABLE_BADGES = [
    { id: 'water', icon: 'fa-droplet', label: 'Su Şampiyonu', color: 'text-blue-400 bg-blue-500/10' },
    { id: 'early', icon: 'fa-sun', label: 'Erkenci Kuş', color: 'text-yellow-400 bg-yellow-500/10' },
    { id: 'fire', icon: 'fa-fire', label: 'İstikrar Abidesi', color: 'text-red-400 bg-red-500/10' },
    { id: 'muscle', icon: 'fa-dumbbell', label: 'Güçlü Başlangıç', color: 'text-green-400 bg-green-500/10' },
];

// YENİ MOCK DATALAR (Duyuru, Medya, SSS)
const MOCK_ANNOUNCEMENTS = [
    { id: 1, title: "Ramazan Bayramı Çalışma Saatleri", date: "2 gün önce", readCount: 34, total: 42 },
    { id: 2, title: "Yeni Grup Derslerimiz Başlıyor!", date: "5 gün önce", readCount: 28, total: 42 }
];

const MOCK_STORAGE = { used: 1.2, total: 5, unit: 'GB', percentage: 24 };

const MOCK_FAQS = [
    { id: 1, q: "Ders iptali en geç ne zaman yapılabilir?", active: true },
    { id: 2, q: "Ödeme seçenekleri nelerdir?", active: true },
    { id: 3, q: "Online ders için hangi ekipmanlar gerekli?", active: false },
];

export default function ProDashboardPage() {
  const [pro, setPro] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  // Dashboard'da sadece bugünün veya yaklaşan randevuları gösterelim (son 2 kayıt)
  const upcomingAppointments = MOCK_APPOINTMENTS.slice(0, 2);

  useEffect(() => {
    async function loadData() {
        const getLocalStorageFallback = () => {
            if (typeof window === 'undefined') return null;
            const name = localStorage.getItem('user_name') || 'Uzman';
            const avatar = localStorage.getItem('user_avatar') || 'https://api.dicebear.com/9.x/personas/svg?seed=pro';
            const id = localStorage.getItem('user_id') ? parseInt(localStorage.getItem('user_id')!) : 0;
            const slug = localStorage.getItem('user_slug') || '';
            return { name, avatar_url: avatar, title: '', id, slug };
        };

        try {
            const user = await getMe();
            
            if (user) {
                setPro(user);
            } else {
                setPro(getLocalStorageFallback());
            }
        } catch (error) {
            console.error("Pro veri hatası", error);
            setPro(getLocalStorageFallback());
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, []);

  const handleGiveBadge = (badgeLabel: string) => {
      alert(`Rozet "${badgeLabel}" başarıyla verildi!`);
      setShowBadgeModal(false);
  };

  const handleSendAnnouncement = () => {
      alert("Duyuru başarıyla tüm danışanlara gönderildi!");
      setShowAnnouncementModal(false);
  }

  if (loading) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-rejimde-blue"></div>
        </div>
      );
  }

  if (!pro) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 font-bold">Profil yüklenemedi.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-500 transition"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
      
      {/* Özel Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-md">
         <div className="flex items-center gap-3">
            <a href="/" className="block lg:hidden">
                <i className="fa-solid fa-arrow-left text-slate-400 hover:text-white transition"></i>
            </a>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-blue-500/20 tracking-wider">
                    PRO PANEL
                </span>
                <h1 className="font-extrabold text-white text-lg tracking-tight truncate max-w-[200px] sm:max-w-none">
                    {pro.title || 'Uzman'} {pro.name}
                </h1>
            </div>
         </div>
         <div className="flex gap-4">
            <a href="/dashboard/pro/planner" className="hidden sm:flex bg-purple-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-btn shadow-purple-800 btn-game items-center gap-2 hover:bg-purple-500 transition">
                <i className="fa-solid fa-wand-magic-sparkles"></i> AI Plan Oluştur
            </a>
            <div className="w-10 h-10 rounded-xl bg-slate-700 overflow-hidden border-2 border-slate-600">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pro.avatar_url} className="w-full h-full object-cover" alt="Profile" />
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* SIDEBAR NAV */}
        <div className="hidden lg:block lg:col-span-2 space-y-2 sticky top-24 h-fit">
            <a href="/dashboard/pro" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white font-extrabold shadow-btn shadow-blue-800 btn-game mb-4 transition-transform hover:scale-105">
                <i className="fa-solid fa-gauge-high w-6 text-center"></i> Panel
            </a>
            
            <p className="text-[10px] font-bold text-slate-500 uppercase px-4 pt-2">Yönetim</p>
            <a href="/dashboard/pro/notifications" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-bell w-6 text-center group-hover:text-blue-400"></i> Bildirimler
            </a>
            <a href="/dashboard/pro/activity" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-chart-line w-6 text-center group-hover:text-purple-400"></i> Aktiviteler
            </a>
            {/* YENİ: Duyurular */}
            <a href="#" onClick={() => setShowAnnouncementModal(true)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-bullhorn w-6 text-center group-hover:text-orange-400"></i> Duyurular
            </a>
            <a href="/dashboard/pro/inbox" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-envelope w-6 text-center group-hover:text-pink-400"></i> Gelen Kutusu
                {MOCK_INBOX.length > 0 && <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full ml-auto">{MOCK_INBOX.length}</span>}
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
            {/* YENİ: Medya & SSS */}
            <a href="/dashboard/pro/media" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-photo-film w-6 text-center group-hover:text-indigo-400"></i> Medya Kütüphanesi
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

        {/* MAIN CONTENT */}
        <div className="lg:col-span-10 space-y-8">

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-sm hover:border-slate-600 transition">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-wide">Aktif Danışan</p>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-white">{MOCK_STATS.activeClients}</span>
                        <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">{MOCK_STATS.weeklyGrowth} bu hafta</span>
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-sm hover:border-slate-600 transition">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-wide">Bekleyen Randevu</p>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-blue-400">{MOCK_STATS.pendingAppointments}</span>
                        <span className="text-[10px] font-bold text-slate-400">Bugün</span>
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-sm hover:border-slate-600 transition">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-wide">Bekleyen Revize</p>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-yellow-400">{MOCK_STATS.pendingRevisions}</span>
                        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">Acil</span>
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-sm hover:border-slate-600 transition relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-16 h-16 bg-green-500/10 rounded-bl-full -mr-2 -mt-2 transition group-hover:scale-110"></div>
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-wide">Aylık Gelir</p>
                    <div className="flex items-end justify-between relative z-10">
                        <span className="text-3xl font-black text-white">{MOCK_STATS.monthlyIncome}</span>
                        <i className="fa-solid fa-chart-line text-green-500 text-xl"></i>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COL: Clients & Announcements */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* ANNOUNCEMENTS WIDGET (YENİ) */}
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-card">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <i className="fa-solid fa-bullhorn text-orange-400"></i> Duyurular
                            </h2>
                            <button onClick={() => setShowAnnouncementModal(true)} className="text-blue-400 font-bold text-xs hover:underline">Yeni Duyuru</button>
                        </div>
                        <div className="space-y-3">
                            {MOCK_ANNOUNCEMENTS.map((ann) => (
                                <div key={ann.id} className="p-4 bg-slate-900/50 border border-slate-700 rounded-2xl flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{ann.title}</h4>
                                        <span className="text-xs text-slate-500">{ann.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg">
                                        <i className="fa-regular fa-eye"></i> {ann.readCount}/{ann.total} Okunma
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* APPOINTMENT REQUESTS */}
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-card">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <i className="fa-solid fa-bell text-yellow-400"></i> Randevu Talepleri
                            </h2>
                            <span className="bg-yellow-500/10 text-yellow-400 text-xs font-bold px-2 py-1 rounded border border-yellow-500/20">
                                {MOCK_APPOINTMENT_REQUESTS.length} Bekleyen
                            </span>
                        </div>
                        <div className="space-y-3">
                            {MOCK_APPOINTMENT_REQUESTS.map((req) => (
                                <div key={req.id} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={req.avatar} className="w-10 h-10 rounded-xl" alt={req.clientName} />
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{req.clientName}</h4>
                                            <p className="text-xs text-slate-400 font-bold">{req.service}</p>
                                            <div className="flex items-center gap-2 mt-1 text-xs font-bold text-blue-400">
                                                <i className="fa-regular fa-calendar"></i> {req.date} - {req.time}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="w-9 h-9 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white transition flex items-center justify-center">
                                            <i className="fa-solid fa-check"></i>
                                        </button>
                                        <button className="w-9 h-9 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition flex items-center justify-center">
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CLIENTS SUMMARY */}
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-card">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <i className="fa-solid fa-users-viewfinder text-slate-400"></i> Danışan Durumları
                            </h2>
                            <a href="/dashboard/pro/clients" className="text-blue-400 font-bold text-xs hover:text-blue-300 uppercase tracking-wide">Tümünü Gör</a>
                        </div>
                        <div className="space-y-3">
                            {MOCK_CLIENTS.slice(0, 3).map((client) => (
                                <div key={client.id} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900/50 border border-slate-700 hover:border-slate-600 transition cursor-pointer">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={client.avatar} className="w-10 h-10 rounded-xl" alt={client.name} />
                                    <div className="flex-1">
                                        <h4 className="font-extrabold text-white text-sm">{client.name}</h4>
                                        <p className={`text-xs font-bold flex items-center gap-1 ${
                                            client.status === 'danger' ? 'text-red-400' : 'text-slate-400'
                                        }`}>
                                            <i className={`fa-solid ${client.status === 'danger' ? 'fa-triangle-exclamation' : 'fa-circle-info'}`}></i> {client.statusText}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-slate-500 block uppercase">Skor</span>
                                        <span className="text-lg font-black text-white">{client.score}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: Leaderboard, Inbox & Services */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* LEADERBOARD WIDGET */}
                    <div className="bg-gradient-to-r from-purple-900/40 to-slate-800 border border-slate-700 rounded-3xl p-6 shadow-card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-10 -mt-10"></div>
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <i className="fa-solid fa-trophy text-purple-400"></i> Liderlik Tablosu
                            </h2>
                            <button 
                                onClick={() => setShowBadgeModal(true)}
                                className="bg-purple-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:bg-purple-500 transition flex items-center gap-2"
                            >
                                <i className="fa-solid fa-medal"></i> Rozet Ver
                            </button>
                        </div>
                        <div className="space-y-2 relative z-10">
                            {MOCK_LEADERBOARD.map((item, idx) => (
                                <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700 hover:bg-slate-900 transition">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-yellow-500 text-slate-900' : idx === 1 ? 'bg-slate-400 text-slate-900' : idx === 2 ? 'bg-orange-700 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                        {idx + 1}
                                    </div>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={item.avatar} className="w-10 h-10 rounded-full border-2 border-slate-700" alt={item.name} />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-white">{item.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold">{item.badge || 'Rozet yok'}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-purple-400">{item.score}</span>
                                        <span className="text-[9px] block text-slate-600 font-black uppercase">Puan</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SERVICES WIDGET */}
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-card">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-extrabold text-white text-sm uppercase tracking-wide flex items-center gap-2">
                                <i className="fa-solid fa-list text-teal-400"></i> Paketlerim
                            </h3>
                            <a href="/dashboard/pro/services" className="w-6 h-6 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 hover:bg-teal-500 hover:text-white transition">
                                <i className="fa-solid fa-plus text-xs"></i>
                            </a>
                        </div>
                        <div className="space-y-2">
                            {MOCK_SERVICES.slice(0, 3).map((svc) => (
                                <div key={svc.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-700/30 transition">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-300">{svc.title}</span>
                                        <span className="text-[10px] font-bold text-slate-500">{svc.duration} dk • {svc.type}</span>
                                    </div>
                                    <span className="text-xs font-black text-white">{svc.price} TL</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MEDIA & FAQ WIDGET (YENİ) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-4 shadow-card text-center group cursor-pointer hover:border-indigo-500/50 transition">
                            <div className="w-10 h-10 mx-auto bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 mb-2 group-hover:scale-110 transition">
                                <i className="fa-solid fa-photo-film"></i>
                            </div>
                            <h4 className="text-xs font-extrabold text-white mb-1">Medya</h4>
                            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mb-1">
                                <div className="bg-indigo-500 h-full" style={{ width: `${MOCK_STORAGE.percentage}%` }}></div>
                            </div>
                            <span className="text-[9px] font-bold text-slate-500">%{MOCK_STORAGE.percentage} Dolu</span>
                        </div>
                        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-4 shadow-card text-center group cursor-pointer hover:border-cyan-500/50 transition">
                            <div className="w-10 h-10 mx-auto bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400 mb-2 group-hover:scale-110 transition">
                                <i className="fa-solid fa-circle-question"></i>
                            </div>
                            <h4 className="text-xs font-extrabold text-white mb-1">SSS</h4>
                            <p className="text-[10px] font-bold text-slate-500">{MOCK_FAQS.filter(f=>f.active).length} Aktif Soru</p>
                        </div>
                    </div>

                    {/* Upcoming Appointments */}
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-card">
                        <h3 className="font-extrabold text-slate-400 text-xs uppercase mb-4 tracking-wide flex items-center gap-2">
                             <i className="fa-regular fa-clock"></i> Bugünkü Randevular
                        </h3>
                        <div className="space-y-4">
                            {upcomingAppointments.map((apt) => (
                                <div key={apt.id} className="flex gap-4 items-start relative pl-4 border-l-2 border-blue-500/30">
                                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-blue-500"></div>
                                    <div className="text-xs font-black text-blue-400 pt-0.5">{apt.time}</div>
                                    <div>
                                        <p className="text-sm font-bold text-white leading-tight">{apt.clientName}</p>
                                        <p className="text-[10px] text-slate-500 font-bold mb-1">{apt.title}</p>
                                        <a href={apt.location} className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded hover:bg-blue-500/20 transition">
                                            <i className="fa-solid fa-video"></i> Meet Linki
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
        </div>

      </div>

      {/* ANNOUNCEMENT MODAL */}
      {showAnnouncementModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowAnnouncementModal(false)}>
              <div className="bg-slate-800 rounded-3xl w-full max-w-md border border-slate-700 shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowAnnouncementModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><i className="fa-solid fa-xmark text-xl"></i></button>
                  <h2 className="text-xl font-extrabold text-white mb-1">Yeni Duyuru</h2>
                  <p className="text-slate-400 text-xs font-bold mb-6">Tüm danışanlarına toplu mesaj veya bilgilendirme gönder.</p>
                  
                  <div className="space-y-4">
                      <input type="text" placeholder="Duyuru Başlığı" className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none font-bold" />
                      <textarea placeholder="Duyuru içeriği..." className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white focus:border-orange-500 focus:outline-none min-h-[120px] resize-none font-medium"></textarea>
                      <button onClick={handleSendAnnouncement} className="w-full bg-orange-600 text-white py-3 rounded-xl font-extrabold shadow-btn btn-game hover:bg-orange-500 transition">
                          <i className="fa-solid fa-paper-plane mr-2"></i> Duyuruyu Yayınla
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* GIVE BADGE MODAL */}
      {showBadgeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowBadgeModal(false)}>
              <div className="bg-slate-800 rounded-3xl w-full max-w-md border border-slate-700 shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowBadgeModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><i className="fa-solid fa-xmark text-xl"></i></button>
                  
                  <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-purple-400 border border-purple-500/20">
                          <i className="fa-solid fa-medal text-3xl"></i>
                      </div>
                      <h2 className="text-xl font-extrabold text-white">Danışanını Ödüllendir</h2>
                      <p className="text-xs font-bold text-slate-500">Motive edici bir rozet seçerek gönder.</p>
                  </div>

                  <div className="mb-4">
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Danışan Seç</label>
                      <select className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none font-bold appearance-none">
                          {MOCK_CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                      {AVAILABLE_BADGES.map(badge => (
                          <button 
                              key={badge.id}
                              onClick={() => handleGiveBadge(badge.label)}
                              className={`p-3 rounded-xl border border-slate-700 hover:border-slate-500 transition text-center group ${badge.color.replace('text-', 'hover:bg-').replace('bg-', 'hover:bg-opacity-20 ')}`}
                          >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${badge.color}`}>
                                  <i className={`fa-solid ${badge.icon}`}></i>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 group-hover:text-white block">{badge.label}</span>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}