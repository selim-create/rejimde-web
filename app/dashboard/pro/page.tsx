'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import LayoutWrapper from '@/components/LayoutWrapper';
import { getMe } from "@/lib/api";

export default function ProDashboardPage() {
  const [pro, setPro] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock İstatistikler (Backend'de endpoint eklendiğinde oradan çekilecek)
  const stats = {
      activeClients: 42,
      pendingAppointments: 8,
      pendingRevisions: 5,
      monthlyIncome: "₺24k",
      weeklyGrowth: "+3"
  };

  useEffect(() => {
    async function loadData() {
        try {
            // Layout zaten rol kontrolü yapıyor, burada sadece veriyi çek
            const user = await getMe();
            
            if (user) {
                setPro(user);
            } else {
                // API başarısız - localStorage'dan temel bilgileri al
                const name = localStorage.getItem('user_name') || 'Uzman';
                const avatar = localStorage.getItem('user_avatar') || 'https://api.dicebear.com/9.x/personas/svg?seed=pro';
                setPro({ name, avatar_url: avatar, title: '' });
            }
        } catch (error) {
            console.error("Pro veri hatası", error);
            // Hata durumunda da localStorage'dan bilgi al
            const name = localStorage.getItem('user_name') || 'Uzman';
            const avatar = localStorage.getItem('user_avatar') || 'https://api.dicebear.com/9.x/personas/svg?seed=pro';
            setPro({ name, avatar_url: avatar, title: '' });
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, []);

  if (loading) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-rejimde-blue"></div>
        </div>
      );
  }

  // pro null olsa bile sayfayı göster (layout zaten koruma sağlıyor)
  if (!pro) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 font-bold">Profil yüklenemedi.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
      
      {/* Özel Header (Sadece Pro İçin) */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-md">
         <div className="flex items-center gap-3">
            <Link href="/" className="block lg:hidden">
                <i className="fa-solid fa-arrow-left text-slate-400 hover:text-white transition"></i>
            </Link>
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
            <Link href="/dashboard/pro/planner" className="hidden sm:flex bg-purple-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-btn shadow-purple-800 btn-game items-center gap-2 hover:bg-purple-500 transition">
                <i className="fa-solid fa-wand-magic-sparkles"></i> AI Plan Oluştur
            </Link>
            <div className="w-10 h-10 rounded-xl bg-slate-700 overflow-hidden border-2 border-slate-600">
                <img src={pro.avatar_url} className="w-full h-full object-cover" alt="Profile" />
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* SIDEBAR NAV */}
        <div className="hidden lg:block lg:col-span-2 space-y-2 sticky top-24 h-fit">
            <Link href="/dashboard/pro" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white font-extrabold shadow-btn shadow-blue-800 btn-game mb-4 transition-transform hover:scale-105">
                <i className="fa-solid fa-gauge-high w-6 text-center"></i> Panel
            </Link>
            
            <p className="text-[10px] font-bold text-slate-500 uppercase px-4 pt-2">Yönetim</p>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-users w-6 text-center group-hover:text-blue-400"></i> Danışanlar
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-calendar-check w-6 text-center group-hover:text-green-400"></i> Takvim
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-wallet w-6 text-center group-hover:text-yellow-400"></i> Gelirler
            </Link>
            
            <p className="text-[10px] font-bold text-slate-500 uppercase px-4 pt-2">İçerik & Araçlar</p>
            <Link href="/dashboard/pro/diets/create" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-utensils w-6 text-center group-hover:text-orange-400"></i> Diyet Yaz
            </Link>
            <Link href="/dashboard/pro/exercises/create" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-dumbbell w-6 text-center group-hover:text-red-400"></i> Egzersiz Yaz
            </Link>
            <Link href="/dashboard/pro/blog/create" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-pen-nib w-6 text-center group-hover:text-pink-400"></i> Blog Yazısı
            </Link>
            
            <div className="h-px bg-slate-800 my-2"></div>
            
            <Link href="/dashboard/pro/planner" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-wand-magic-sparkles w-6 text-center text-purple-500"></i> AI Asistan
            </Link>
            <Link href="/dashboard/pro/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition hover:text-white group">
                <i className="fa-solid fa-gear w-6 text-center group-hover:text-gray-300"></i> Ayarlar
            </Link>
        </div>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-10 space-y-8">

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-sm hover:border-slate-600 transition">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-wide">Aktif Danışan</p>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-white">{stats.activeClients}</span>
                        <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">{stats.weeklyGrowth} bu hafta</span>
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-sm hover:border-slate-600 transition">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-wide">Bekleyen Randevu</p>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-blue-400">{stats.pendingAppointments}</span>
                        <span className="text-[10px] font-bold text-slate-400">Bugün</span>
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-sm hover:border-slate-600 transition">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-wide">Bekleyen Revize</p>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-yellow-400">{stats.pendingRevisions}</span>
                        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">Acil</span>
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-sm hover:border-slate-600 transition relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-16 h-16 bg-green-500/10 rounded-bl-full -mr-2 -mt-2 transition group-hover:scale-110"></div>
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-wide">Aylık Gelir</p>
                    <div className="flex items-end justify-between relative z-10">
                        <span className="text-3xl font-black text-white">{stats.monthlyIncome}</span>
                        <i className="fa-solid fa-chart-line text-green-500 text-xl"></i>
                    </div>
                </div>
            </div>

            {/* Quick Actions (Mobile Only - or prominent desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:hidden">
                <Link href="/dashboard/pro/diets/create" className="bg-slate-800 p-4 rounded-2xl text-center border border-slate-700 active:bg-slate-700">
                    <i className="fa-solid fa-utensils text-2xl text-orange-400 mb-2"></i>
                    <p className="text-xs font-bold">Diyet Yaz</p>
                </Link>
                <Link href="/dashboard/pro/exercises/create" className="bg-slate-800 p-4 rounded-2xl text-center border border-slate-700 active:bg-slate-700">
                    <i className="fa-solid fa-dumbbell text-2xl text-red-400 mb-2"></i>
                    <p className="text-xs font-bold">Egzersiz</p>
                </Link>
                <Link href="/dashboard/pro/blog/create" className="bg-slate-800 p-4 rounded-2xl text-center border border-slate-700 active:bg-slate-700">
                    <i className="fa-solid fa-pen-nib text-2xl text-pink-400 mb-2"></i>
                    <p className="text-xs font-bold">Blog</p>
                </Link>
                <Link href="/dashboard/pro/planner" className="bg-slate-800 p-4 rounded-2xl text-center border border-slate-700 active:bg-slate-700">
                    <i className="fa-solid fa-wand-magic-sparkles text-2xl text-purple-500 mb-2"></i>
                    <p className="text-xs font-bold">AI Plan</p>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* CLIENT MANAGEMENT */}
                <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-card">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                            <i className="fa-solid fa-users-viewfinder text-slate-400"></i> Danışan Durumları
                        </h2>
                        <button className="text-blue-400 font-bold text-xs hover:text-blue-300 uppercase tracking-wide">Tümünü Gör</button>
                    </div>

                    <div className="space-y-3">
                        {/* Client Row (Risk) */}
                        <div className="flex items-center gap-4 p-3 rounded-2xl bg-red-500/5 border border-red-500/20 group cursor-pointer hover:bg-red-500/10 transition">
                            <img src="https://api.dicebear.com/9.x/personas/svg?seed=Burak" className="w-10 h-10 rounded-xl bg-slate-700" alt="Client" />
                            <div className="flex-1">
                                <h4 className="font-extrabold text-white text-sm">Burak Yılmaz</h4>
                                <p className="text-xs font-bold text-red-400 flex items-center gap-1">
                                    <i className="fa-solid fa-triangle-exclamation"></i> 3 gündür log girmiyor
                                </p>
                            </div>
                            <div className="text-right hidden sm:block">
                                <span className="text-[10px] font-black text-slate-500 block uppercase">Skor</span>
                                <span className="text-lg font-black text-red-400">420</span>
                            </div>
                            <button className="w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center text-white hover:bg-green-600 transition shadow-sm" title="WhatsApp">
                                <i className="fa-brands fa-whatsapp"></i>
                            </button>
                        </div>

                        {/* Client Row (Need Action) */}
                        <div className="flex items-center gap-4 p-3 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 group cursor-pointer hover:bg-yellow-500/10 transition">
                            <img src="https://api.dicebear.com/9.x/personas/svg?seed=Ayse" className="w-10 h-10 rounded-xl bg-slate-700" alt="Client" />
                            <div className="flex-1">
                                <h4 className="font-extrabold text-white text-sm">Ayşe K.</h4>
                                <p className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                                    <i className="fa-solid fa-file-signature"></i> Yeni liste talep etti
                                </p>
                            </div>
                            <div className="text-right hidden sm:block">
                                <span className="text-[10px] font-black text-slate-500 block uppercase">Skor</span>
                                <span className="text-lg font-black text-yellow-400">750</span>
                            </div>
                            <button className="px-4 py-2 bg-yellow-500 text-slate-900 text-xs font-black rounded-lg shadow-sm btn-game hover:bg-yellow-400 transition">
                                Planla
                            </button>
                        </div>

                        {/* Client Row (Good) */}
                        <div className="flex items-center gap-4 p-3 rounded-2xl border border-slate-700 group cursor-pointer hover:border-green-500/50 transition bg-slate-800/50">
                            <img src="https://api.dicebear.com/9.x/personas/svg?seed=Mehmet" className="w-10 h-10 rounded-xl bg-slate-700" alt="Client" />
                            <div className="flex-1">
                                <h4 className="font-extrabold text-white text-sm">Mehmet T.</h4>
                                <p className="text-xs font-bold text-green-400 flex items-center gap-1">
                                    <i className="fa-solid fa-check-circle"></i> Hedefe ulaştı
                                </p>
                            </div>
                            <div className="text-right hidden sm:block">
                                <span className="text-[10px] font-black text-slate-500 block uppercase">Skor</span>
                                <span className="text-lg font-black text-green-400">910</span>
                            </div>
                            <button className="w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition group-hover:bg-slate-600">
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* AI CO-PILOT PROMO */}
                    <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-card group border border-purple-700/50">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 opacity-20 rounded-full -mr-10 -mt-10 blur-xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                                    <i className="fa-solid fa-robot text-xl text-purple-200"></i>
                                </div>
                                <h3 className="font-extrabold text-lg">AI Co-Pilot</h3>
                            </div>
                            <p className="text-purple-200 text-xs font-bold mb-4 leading-relaxed">
                                &quot;Ayşe için 1500 kalorilik, glutensiz bir liste taslağı hazırla.&quot;
                            </p>
                            <Link href="/dashboard/pro/planner" className="block w-full bg-white text-purple-900 py-3 rounded-xl font-extrabold text-center text-sm shadow-btn shadow-purple-950/50 btn-game uppercase hover:bg-purple-50 transition">
                                Taslak Oluştur
                            </Link>
                        </div>
                    </div>

                    {/* Upcoming Appointments */}
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-card">
                        <h3 className="font-extrabold text-slate-400 text-xs uppercase mb-4 tracking-wide flex items-center gap-2">
                             <i className="fa-regular fa-clock"></i> Bugünkü Randevular
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-start relative pl-4 border-l-2 border-blue-500/30">
                                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-blue-500"></div>
                                <div className="text-xs font-black text-blue-400 pt-0.5">14:00</div>
                                <div>
                                    <p className="text-sm font-bold text-white leading-tight">Ali Veli</p>
                                    <p className="text-[10px] text-slate-500 font-bold mb-1">İlk Görüşme</p>
                                    <a href="#" className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded hover:bg-blue-500/20 transition">
                                        <i className="fa-solid fa-video"></i> Meet Linki
                                    </a>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start relative pl-4 border-l-2 border-green-500/30">
                                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-green-500"></div>
                                <div className="text-xs font-black text-green-400 pt-0.5">16:30</div>
                                <div>
                                    <p className="text-sm font-bold text-white leading-tight">Zeynep K.</p>
                                    <p className="text-[10px] text-slate-500 font-bold mb-1">Haftalık Kontrol</p>
                                    <a href="#" className="inline-flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded hover:bg-green-500/20 transition">
                                        <i className="fa-solid fa-video"></i> Meet Linki
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>

      </div>
    </div>
  );
}