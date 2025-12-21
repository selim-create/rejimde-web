"use client";

import Link from "next/link";
import Image from "next/image";

export default function AIPlannerPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 font-sans text-rejimde-text">
        
        {/* Planner Header */}
        <header className="bg-rejimde-dark text-white h-16 flex items-center justify-between px-6 shrink-0 z-50 shadow-md">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/pro" className="text-slate-400 hover:text-white transition flex items-center gap-2 text-sm font-bold">
                    <i className="fa-solid fa-arrow-left"></i> Panele Dön
                </Link>
                <div className="h-6 w-px bg-slate-600"></div>
                <div className="flex items-center gap-2">
                    <i className="fa-solid fa-wand-magic-sparkles text-rejimde-purple"></i>
                    <span className="font-extrabold tracking-tight">AI Co-Pilot</span>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase hidden md:block">Aktif Danışan:</span>
                <div className="flex items-center gap-2 bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-600 transition">
                    <img src="https://i.pravatar.cc/150?img=5" className="w-6 h-6 rounded-full" alt="Client" />
                    <span className="font-bold text-sm">Ayşe K.</span>
                    <i className="fa-solid fa-chevron-down text-xs ml-1 text-slate-400"></i>
                </div>
                <button className="bg-rejimde-green text-white px-6 py-2 rounded-xl font-extrabold text-sm shadow-btn shadow-rejimde-greenDark btn-game ml-4 flex items-center gap-2 hover:bg-green-500">
                    <i className="fa-solid fa-paper-plane"></i> <span className="hidden md:inline">Planı Gönder</span>
                </button>
            </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
            
            {/* LEFT: Chat Interface */}
            <div className="w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col shadow-lg z-10">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-extrabold text-gray-700 text-sm uppercase">Asistan İle Konuş</h3>
                    <span className="bg-purple-100 text-rejimde-purpleDark px-2 py-1 rounded text-[10px] font-black uppercase border border-purple-200">GPT-4 Turbo</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {/* System Msg */}
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rejimde-purple flex items-center justify-center text-white shrink-0 mt-1">
                            <i className="fa-solid fa-robot text-xs"></i>
                        </div>
                        <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none text-xs font-bold text-gray-600 shadow-sm">
                            Merhaba Hocam! Ayşe Hanım için bugün ne planlıyoruz? Profilinde &quot;Gluten hassasiyeti&quot; var, buna dikkat edeceğim.
                        </div>
                    </div>

                    {/* User Msg */}
                    <div className="flex gap-3 flex-row-reverse">
                        <img src="https://i.pravatar.cc/150?img=44" className="w-8 h-8 rounded-lg border border-gray-200 shrink-0 mt-1" alt="Me" />
                        <div className="bg-blue-100 text-blue-900 p-3 rounded-2xl rounded-tr-none text-xs font-bold shadow-sm">
                            Bana 3 günlük, 1400 kalorilik, glutensiz bir detoks listesi hazırla. Kahvaltılar pratik olsun.
                        </div>
                    </div>

                    {/* AI Thinking */}
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rejimde-purple flex items-center justify-center text-white shrink-0 mt-1">
                            <i className="fa-solid fa-robot text-xs"></i>
                        </div>
                        <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none text-xs font-bold text-gray-400 shadow-sm flex gap-1 items-center">
                            <span>Düşünüyor</span>
                            <span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span>
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="relative">
                        <textarea placeholder="Talimat verin (Örn: Ara öğüne badem ekle)..." className="w-full bg-gray-100 border-2 border-transparent focus:border-rejimde-purple rounded-xl text-sm font-bold pl-4 pr-12 py-3 outline-none resize-none h-24 transition"></textarea>
                        <button className="absolute right-2 bottom-2 text-white bg-rejimde-purple w-8 h-8 rounded-lg flex items-center justify-center hover:bg-purple-600 transition shadow-sm btn-game">
                            <i className="fa-solid fa-arrow-up"></i>
                        </button>
                    </div>
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
                        <button className="whitespace-nowrap px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500 hover:bg-gray-200 border border-gray-200 transition">
                            + Porsiyonları Artır
                        </button>
                        <button className="whitespace-nowrap px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500 hover:bg-gray-200 border border-gray-200 transition">
                            + Alternatif Üret
                        </button>
                        <button className="whitespace-nowrap px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500 hover:bg-gray-200 border border-gray-200 transition">
                            + Tatlı Ekle (Fit)
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT: Result Preview */}
            <div className="flex-1 bg-slate-100 flex flex-col h-full overflow-hidden relative">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>

                {/* Toolbar */}
                <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-20">
                    <div className="flex items-center gap-4">
                        <h2 className="font-extrabold text-gray-700">Taslak Plan #2</h2>
                        <span className="bg-green-100 text-rejimde-greenDark px-2 py-0.5 rounded text-xs font-black uppercase">1400 kcal</span>
                        <span className="bg-blue-100 text-rejimde-blueDark px-2 py-0.5 rounded text-xs font-black uppercase">Glutensiz</span>
                    </div>
                    <div className="flex gap-2">
                        <button className="text-gray-400 hover:text-gray-600 p-2 transition"><i className="fa-solid fa-print"></i></button>
                        <button className="text-gray-400 hover:text-gray-600 p-2 transition"><i className="fa-solid fa-download"></i></button>
                    </div>
                </div>

                {/* Plan Content */}
                <div className="flex-1 overflow-y-auto p-8 relative z-10">
                    <div className="max-w-3xl mx-auto space-y-6">
                        
                        {/* Day 1 */}
                        <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm overflow-hidden group hover:border-rejimde-blue transition">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center cursor-move">
                                <div className="flex items-center gap-3">
                                    <span className="bg-rejimde-blue text-white px-3 py-1 rounded-lg text-xs font-black uppercase">1. Gün</span>
                                    <h3 className="font-extrabold text-gray-700">Detoks Başlangıcı</h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold text-gray-400">🔥 1350 kcal</span>
                                    <i className="fa-solid fa-grip-lines text-gray-300"></i>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {/* Breakfast */}
                                <div className="p-4 flex items-start gap-4 hover:bg-blue-50/50 transition group/meal relative">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 text-xl shrink-0">
                                        <i className="fa-solid fa-mug-hot"></i>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h4 className="font-extrabold text-gray-800 text-sm">Kahvaltı</h4>
                                            <span className="text-xs font-bold text-gray-400">300 kcal</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-500 mt-1">
                                            Glutensiz yulaf lapası, badem sütü, yarım muz ve tarçın.
                                        </p>
                                    </div>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden group-hover/meal:flex gap-2">
                                        <button className="w-8 h-8 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-rejimde-blue hover:border-rejimde-blue shadow-sm transition"><i className="fa-solid fa-pen"></i></button>
                                        <button className="w-8 h-8 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-rejimde-green hover:border-rejimde-green shadow-sm transition"><i className="fa-solid fa-arrows-rotate"></i></button>
                                    </div>
                                </div>

                                {/* Lunch */}
                                <div className="p-4 flex items-start gap-4 hover:bg-blue-50/50 transition group/meal relative">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-rejimde-green text-xl shrink-0">
                                        <i className="fa-solid fa-bowl-food"></i>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h4 className="font-extrabold text-gray-800 text-sm">Öğle</h4>
                                            <span className="text-xs font-bold text-gray-400">450 kcal</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-500 mt-1">
                                            Izgara tavuk göğsü, kinoa salatası ve bol yeşillik.
                                        </p>
                                    </div>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden group-hover/meal:flex gap-2">
                                        <button className="w-8 h-8 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-rejimde-blue hover:border-rejimde-blue shadow-sm transition"><i className="fa-solid fa-pen"></i></button>
                                        <button className="w-8 h-8 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-rejimde-green hover:border-rejimde-green shadow-sm transition"><i className="fa-solid fa-arrows-rotate"></i></button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 p-2 text-center border-t border-gray-100 hover:bg-gray-100 transition cursor-pointer">
                                <button className="text-xs font-bold text-rejimde-blue hover:underline uppercase">+ Ara Öğün Ekle</button>
                            </div>
                        </div>

                        {/* Day 2 (Collapsed) */}
                        <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm overflow-hidden opacity-60 hover:opacity-100 transition cursor-pointer">
                            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-lg text-xs font-black uppercase">2. Gün</span>
                                    <h3 className="font-extrabold text-gray-500">Sebze Ağırlıklı</h3>
                                </div>
                                <i className="fa-solid fa-chevron-down text-gray-400"></i>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}