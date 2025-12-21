"use client";

import Link from "next/link";
import Image from "next/image";

export default function ProDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
      
      {/* Özel Header (Sadece Pro İçin) */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-20 z-40 px-6 py-4 flex justify-between items-center shadow-md">
         <div className="flex items-center gap-2">
            <span className="bg-rejimde-blue/20 text-rejimde-blue px-3 py-1 rounded-lg text-xs font-black uppercase border border-rejimde-blue/50">PRO PANEL</span>
            <h1 className="font-extrabold text-white">Dyt. Selin Yılmaz</h1>
         </div>
         <div className="flex gap-4">
            <Link href="/dashboard/pro/planner" className="bg-rejimde-purple text-white px-4 py-2 rounded-xl font-bold text-xs shadow-btn shadow-rejimde-purpleDark btn-game flex items-center gap-2 hover:bg-purple-400 transition">
                <i className="fa-solid fa-wand-magic-sparkles"></i> AI Plan Oluştur
            </Link>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* SIDEBAR NAV */}
        <div className="hidden lg:block lg:col-span-2 space-y-2">
            <Link href="/dashboard/pro" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rejimde-blue text-white font-extrabold shadow-btn shadow-rejimde-blueDark btn-game mb-4">
                <i className="fa-solid fa-gauge-high"></i> Panel
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition">
                <i className="fa-solid fa-users"></i> Danışanlar
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition">
                <i className="fa-solid fa-calendar-check"></i> Takvim
            </Link>
            <Link href="/dashboard/pro/planner" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition">
                <i className="fa-solid fa-wand-magic-sparkles text-rejimde-purple"></i> AI Araçları
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition">
                <i className="fa-solid fa-wallet"></i> Gelirler
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition">
                <i className="fa-solid fa-gear"></i> Ayarlar
            </Link>
        </div>

        {/* MAIN CONTENT */}
        <div className="lg:col-span-10 space-y-8">

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Aktif Danışan</p>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-white">42</span>
                        <span className="text-xs font-bold text-rejimde-green bg-green-900/30 px-2 py-1 rounded border border-green-900/50">+3 bu hafta</span>
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Bekleyen Randevu</p>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-rejimde-blue">8</span>
                        <span className="text-xs font-bold text-slate-400">Bugün</span>
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Bekleyen Revize</p>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-rejimde-yellow">5</span>
                        <span className="text-xs font-bold text-red-400 bg-red-900/30 px-2 py-1 rounded border border-red-900/50">Acil</span>
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Aylık Gelir</p>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-white">₺24k</span>
                        <i className="fa-solid fa-chart-line text-rejimde-green text-xl"></i>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* CLIENT MANAGEMENT */}
                <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-card">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-extrabold text-white">Danışan Durumları</h2>
                        <button className="text-rejimde-blue font-bold text-sm hover:underline">Tümünü Gör</button>
                    </div>

                    <div className="space-y-4">
                        {/* Client Row (Risk) */}
                        <div className="flex items-center gap-4 p-3 rounded-2xl bg-red-900/10 border border-red-900/30 group cursor-pointer hover:bg-red-900/20 transition">
                            <img src="https://i.pravatar.cc/150?img=11" className="w-10 h-10 rounded-xl bg-slate-700" alt="Client" />
                            <div className="flex-1">
                                <h4 className="font-extrabold text-white text-sm">Burak Yılmaz</h4>
                                <p className="text-xs font-bold text-red-400">⚠ 3 gündür log girmiyor</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-black text-slate-500 block">Skor</span>
                                <span className="text-lg font-black text-rejimde-red">420</span>
                            </div>
                            <button className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-white hover:bg-green-600 transition shadow-sm" title="WhatsApp">
                                <i className="fa-brands fa-whatsapp"></i>
                            </button>
                        </div>

                        {/* Client Row (Need Action) */}
                        <div className="flex items-center gap-4 p-3 rounded-2xl bg-yellow-900/10 border border-yellow-900/30 group cursor-pointer hover:bg-yellow-900/20 transition">
                            <img src="https://i.pravatar.cc/150?img=5" className="w-10 h-10 rounded-xl bg-slate-700" alt="Client" />
                            <div className="flex-1">
                                <h4 className="font-extrabold text-white text-sm">Ayşe K.</h4>
                                <p className="text-xs font-bold text-rejimde-yellow">📝 Yeni liste talep etti</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-black text-slate-500 block">Skor</span>
                                <span className="text-lg font-black text-rejimde-yellow">750</span>
                            </div>
                            <button className="px-3 py-1 bg-rejimde-yellow text-slate-900 text-xs font-bold rounded-lg shadow-sm btn-game">
                                Planla
                            </button>
                        </div>

                        {/* Client Row (Good) */}
                        <div className="flex items-center gap-4 p-3 rounded-2xl border border-slate-700 group cursor-pointer hover:border-rejimde-green transition">
                            <img src="https://i.pravatar.cc/150?img=32" className="w-10 h-10 rounded-xl bg-slate-700" alt="Client" />
                            <div className="flex-1">
                                <h4 className="font-extrabold text-white text-sm">Mehmet T.</h4>
                                <p className="text-xs font-bold text-rejimde-green">✅ Hedefe ulaştı</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-black text-slate-500 block">Skor</span>
                                <span className="text-lg font-black text-rejimde-green">910</span>
                            </div>
                            <button className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition">
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* AI CO-PILOT PROMO */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-rejimde-purple text-white rounded-3xl p-6 relative overflow-hidden shadow-card group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <i className="fa-solid fa-robot text-xl"></i>
                                </div>
                                <h3 className="font-extrabold text-lg">AI Co-Pilot</h3>
                            </div>
                            <p className="text-purple-100 text-xs font-bold mb-4">
                                &quot;Ayşe için 1500 kalorilik, glutensiz bir liste taslağı hazırla.&quot;
                            </p>
                            <Link href="/dashboard/pro/planner" className="block w-full bg-white text-rejimde-purple py-3 rounded-xl font-extrabold text-center text-sm shadow-btn shadow-purple-900/30 btn-game uppercase hover:bg-purple-50 transition">
                                Taslak Oluştur
                            </Link>
                        </div>
                    </div>

                    {/* Upcoming Appointments */}
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-card">
                        <h3 className="font-extrabold text-slate-400 text-sm uppercase mb-4">Bugünkü Randevular</h3>
                        <div className="space-y-3">
                            <div className="flex gap-3 border-l-4 border-rejimde-blue pl-3 py-1">
                                <div className="text-xs font-black text-slate-500">14:00</div>
                                <div>
                                    <p className="text-sm font-bold text-white">Ali Veli (İlk Görüşme)</p>
                                    <a href="#" className="text-[10px] font-bold text-rejimde-blue hover:underline">Google Meet Linki</a>
                                </div>
                            </div>
                            <div className="flex gap-3 border-l-4 border-rejimde-green pl-3 py-1">
                                <div className="text-xs font-black text-slate-500">16:30</div>
                                <div>
                                    <p className="text-sm font-bold text-white">Zeynep K. (Kontrol)</p>
                                    <a href="#" className="text-[10px] font-bold text-rejimde-blue hover:underline">Google Meet Linki</a>
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