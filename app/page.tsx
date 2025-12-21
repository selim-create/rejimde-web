"use client";

import Image from "next/image";
import Link from "next/link";
import MascotDisplay from "@/components/MascotDisplay";

export default function Home() {
  return (
    <div className="font-sans text-rejimde-text">
      
      {/* Hero Section */}
      <section className="py-12 lg:py-20 overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            
            {/* Left Content */}
            <div className="text-center lg:text-left relative z-20">
                {/* Mobile Mascot */}
                <div className="lg:hidden flex justify-center mb-8">
                    <MascotDisplay state="onboarding_welcome" size={180} showBubble={true} />
                </div>

                <h1 className="text-4xl lg:text-6xl font-extrabold text-rejimde-text leading-tight mb-6">
                    &quot;Rejimdeyim rejimde, <br />
                    <span className="text-rejimde-green">baklavalar börekler</span> <br />
                    hep benim peşimde!&quot;
                </h1>
                
                <p className="text-lg text-gray-500 font-bold mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
                    Merak etme, yalnız değilsin. Klanını seç, skorunu topla, o baklavayı beraber alt edelim.
                </p>

                {/* Hero Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                    <button className="bg-rejimde-green text-white px-8 py-4 rounded-2xl font-extrabold text-lg shadow-btn shadow-rejimde-greenDark btn-game uppercase tracking-wide flex items-center justify-center gap-2">
                        <i className="fa-solid fa-calculator"></i>
                        Rejimde Skorunu Öğren
                    </button>
                    <button className="bg-white text-rejimde-blue border-2 border-gray-200 px-8 py-4 rounded-2xl font-extrabold text-lg shadow-btn shadow-gray-200 btn-game uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-gray-50">
                        <i className="fa-solid fa-play"></i>
                        Nasıl Çalışır?
                    </button>
                </div>

                {/* Social Proof */}
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
                    <div className="flex -space-x-4">
                        <img className="w-12 h-12 rounded-2xl border-4 border-white bg-gray-200" src="https://i.pravatar.cc/100?img=1" alt="" />
                        <img className="w-12 h-12 rounded-2xl border-4 border-white bg-gray-200" src="https://i.pravatar.cc/100?img=5" alt="" />
                        <img className="w-12 h-12 rounded-2xl border-4 border-white bg-gray-200" src="https://i.pravatar.cc/100?img=8" alt="" />
                    </div>
                    <div>
                        <p className="text-sm font-extrabold text-gray-600">Bu ay <span className="text-rejimde-green">2.450 kişi</span></p>
                        <p className="text-xs font-bold text-gray-400 uppercase">Rejimde ligine katıldı</p>
                    </div>
                </div>
            </div>

            {/* Right: Mascot & Login Card */}
            <div className="flex justify-center lg:justify-end relative mt-16 lg:mt-0">
                
                {/* 1. KATMAN (En Arkada): Desktop Mascot */}
                <div className="hidden lg:block absolute -left-32 top-4 z-0 pointer-events-none">
                     <MascotDisplay 
                        state="onboarding_welcome" 
                        size={350} 
                        showBubble={false} // İç balonu kapattık
                        className="transform -rotate-6"
                     />
                </div>

                {/* 3. KATMAN (En Üstte): Manuel Konuşma Balonu */}
                <div className="hidden lg:block absolute -top-16 -left-12 z-30 w-48 animate-bounce-slow">
                    <div className="bg-white border-2 border-gray-200 p-4 rounded-3xl rounded-br-none shadow-sm relative">
                        <p className="font-bold text-rejimde-text text-sm leading-snug">
                             &quot;Hoş geldin! Hadi seni en fit haline dönüştürelim. 💪&quot;
                        </p>
                        {/* Balonun oku (Maskota doğru) */}
                        <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-b-2 border-r-2 border-gray-200 transform rotate-45"></div>
                    </div>
                </div>

                {/* 2. KATMAN (Ortada): Registration Card */}
                <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 w-full max-w-md shadow-float relative z-10">
                    <div className="absolute -top-4 -right-4 bg-rejimde-red text-white font-bold px-4 py-1 rounded-full shadow-md transform rotate-6 border-2 border-white">
                        <i className="fa-solid fa-fire mr-1"></i> ÜCRETSİZ
                    </div>

                    <h2 className="text-2xl font-extrabold text-center mb-6 text-rejimde-text">Hemen Maceraya Başla</h2>
                    
                    <div className="space-y-4">
                        <button className="w-full bg-rejimde-green text-white text-center py-4 rounded-2xl font-extrabold text-lg shadow-btn shadow-rejimde-greenDark btn-game uppercase tracking-wide">
                            YENİ HESAP AÇ
                        </button>
                        
                        <div className="flex items-center gap-4 py-2">
                            <div className="h-0.5 bg-gray-200 flex-1"></div>
                            <span className="text-gray-400 font-bold text-sm uppercase">VEYA</span>
                            <div className="h-0.5 bg-gray-200 flex-1"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-2xl font-bold shadow-btn shadow-gray-300 btn-game flex items-center justify-center gap-2 hover:bg-gray-50">
                                <i className="fa-brands fa-google text-rejimde-blue"></i> Google
                            </button>
                            <button className="bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-2xl font-bold shadow-btn shadow-gray-300 btn-game flex items-center justify-center gap-2 hover:bg-gray-50">
                                <i className="fa-brands fa-apple text-black"></i> Apple
                            </button>
                        </div>
                    </div>
                    
                    <p className="text-xs text-center text-gray-400 font-bold mt-6">
                        &quot;Su içsen yarıyorsa&quot; doğru yerdesin.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* SCORE & LEAGUE SECTION */}
      <section className="py-16 bg-white border-y-2 border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-rejimde-text mb-2 uppercase tracking-tight">Skorunu Takip Et</h2>
                <p className="text-gray-400 font-bold text-lg">Biraz egzersiz rejimde skorunu da canlandırır aslında! 😉</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Detailed Score Card */}
                <div className="bg-[#f7f7f7] border-2 border-gray-200 rounded-3xl p-8 relative overflow-hidden group hover:border-rejimde-blue transition">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="font-extrabold text-2xl text-gray-700 flex items-center gap-2">
                                <i className="fa-solid fa-chart-pie text-rejimde-blue"></i> SENİN SKORUN
                            </h3>
                            <p className="text-sm font-bold text-gray-400">Son güncelleme: 10 dk önce</p>
                        </div>
                        <div className="bg-rejimde-green text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm">
                            Mükemmel
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                        {/* Circular Progress Visual */}
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                                <circle cx="80" cy="80" r="70" stroke="#58cc02" strokeWidth="12" fill="none" strokeDasharray="440" strokeDashoffset="110" strokeLinecap="round" />
                            </svg>
                            <div className="absolute text-center">
                                <span className="block text-4xl font-extrabold text-rejimde-text">750</span>
                                <span className="block text-xs font-bold text-gray-400">/ 1000</span>
                            </div>
                        </div>
                        
                        <div className="flex-1 w-full space-y-4">
                             {/* Stat Row 1 */}
                             <div className="flex justify-between items-center text-sm font-bold text-gray-600">
                                <span>💧 Su Hedefi</span>
                                <span className="text-rejimde-blue">1.5 / 2.5 Lt</span>
                             </div>
                             <div className="w-full bg-gray-200 rounded-full h-3">
                                 <div className="bg-rejimde-blue h-3 rounded-full" style={{width: '60%'}}></div>
                             </div>

                             {/* Stat Row 2 */}
                             <div className="flex justify-between items-center text-sm font-bold text-gray-600">
                                <span>🔥 Hareket</span>
                                <span className="text-rejimde-red">350 / 500 Kcal</span>
                             </div>
                             <div className="w-full bg-gray-200 rounded-full h-3">
                                 <div className="bg-rejimde-red h-3 rounded-full" style={{width: '70%'}}></div>
                             </div>

                            <button className="w-full bg-white border-2 border-gray-200 text-rejimde-blue py-3 rounded-xl font-extrabold text-sm shadow-btn shadow-gray-200 btn-game uppercase mt-2">
                                Detaylı Analiz
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: League Leaderboard */}
                <div className="bg-white border-2 border-gray-200 rounded-3xl p-0 overflow-hidden flex flex-col">
                    <div className="bg-rejimde-yellow p-4 border-b-2 border-rejimde-yellowDark flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-trophy text-white text-2xl drop-shadow-sm"></i>
                            <div>
                                <h3 className="font-extrabold text-white text-lg drop-shadow-sm uppercase leading-none">Düğün Ligi</h3>
                                <p className="text-yellow-100 text-xs font-bold">1. Klasman</p>
                            </div>
                        </div>
                        <span className="bg-white/20 text-white text-xs font-black px-2 py-1 rounded">2 GÜN KALDI</span>
                    </div>
                    
                    <div className="p-4 space-y-2 flex-1">
                        {/* Rank 1 */}
                        <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-xl border-2 border-yellow-100">
                            <span className="font-black text-rejimde-yellowDark text-lg w-6 text-center">1</span>
                            <img src="https://i.pravatar.cc/150?img=5" alt="" className="w-10 h-10 rounded-full border-2 border-white" />
                            <div className="flex-1">
                                <p className="font-extrabold text-sm text-gray-700">GelinAdayı_99</p>
                                <p className="text-xs text-rejimde-green font-bold">850 Puan</p>
                            </div>
                            <i className="fa-solid fa-crown text-rejimde-yellow text-xl animate-pulse"></i>
                        </div>
                        {/* Rank 2 */}
                        <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl border-2 border-transparent transition">
                            <span className="font-black text-gray-400 text-lg w-6 text-center">2</span>
                            <img src="https://i.pravatar.cc/150?img=12" alt="" className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" />
                            <div className="flex-1">
                                <p className="font-bold text-sm text-gray-700">DamatBey</p>
                                <p className="text-xs text-gray-400 font-bold">820 Puan</p>
                            </div>
                        </div>
                         {/* Rank 3 */}
                         <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl border-2 border-transparent transition">
                            <span className="font-black text-rejimde-yellowDark text-lg w-6 text-center text-[#cd7f32]">3</span>
                            <img src="https://i.pravatar.cc/150?img=32" alt="" className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" />
                            <div className="flex-1">
                                <p className="font-bold text-sm text-gray-700">FitGörümce</p>
                                <p className="text-xs text-gray-400 font-bold">795 Puan</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-3 text-center border-t-2 border-gray-100">
                        <Link href="/leagues" className="text-rejimde-blue font-extrabold text-sm uppercase hover:underline">Tüm Sıralamayı Gör</Link>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* TOOLS with Colloquialisms */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-extrabold text-center text-gray-700 mb-8 uppercase tracking-wide">
                Popüler Araçlar
            </h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Tool 1 */}
                <Link href="/calculators" className="bg-white border-2 border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-btn shadow-gray-300 btn-game group hover:border-rejimde-blue">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition">💧</div>
                    <h3 className="font-extrabold text-gray-700 mb-1">Su Takibi</h3>
                    <p className="text-xs text-gray-400 font-bold leading-tight">
                        &quot;Su içsen yara aslında&quot; diyenler buraya!
                    </p>
                </Link>
                
                {/* Tool 2 */}
                <Link href="/calculators" className="bg-white border-2 border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-btn shadow-gray-300 btn-game group hover:border-rejimde-yellow">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition">🏃‍♂️</div>
                    <h3 className="font-extrabold text-gray-700 mb-1">Egzersiz</h3>
                    <p className="text-xs text-gray-400 font-bold leading-tight">
                        &quot;Sabah koşusu gibisi yok&quot; yalanı değil.
                    </p>
                </Link>

                {/* Tool 3 */}
                <Link href="/calculators" className="bg-white border-2 border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-btn shadow-gray-300 btn-game group hover:border-rejimde-red">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition">🥗</div>
                    <h3 className="font-extrabold text-gray-700 mb-1">Kalori Sayar</h3>
                    <p className="text-xs text-gray-400 font-bold leading-tight">
                        O poğaçayı yavaşça yere bırak evlat.
                    </p>
                </Link>

                {/* Tool 4 */}
                <Link href="/calculators" className="bg-white border-2 border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-btn shadow-gray-300 btn-game group hover:border-rejimde-purple">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition">🤰</div>
                    <h3 className="font-extrabold text-gray-700 mb-1">Gebelik</h3>
                    <p className="text-xs text-gray-400 font-bold leading-tight">
                        İki canlısın sen, ye gitsin (mi acaba?)
                    </p>
                </Link>
            </div>
        </div>
      </section>

      {/* PROFESSIONALS */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10">
                <div>
                    <h2 className="text-3xl font-extrabold text-rejimde-text uppercase">Takım Kaptanları</h2>
                    <p className="text-gray-500 font-bold mt-2">Seni motive edecek, skorunu patlatacak profesyoneller.</p>
                </div>
                <Link href="/experts" className="text-rejimde-blue font-extrabold uppercase hover:underline mt-4 md:mt-0">Tüm Uzmanları Gör</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* Pro Card 1 */}
                <div className="border-2 border-gray-200 rounded-3xl p-0 hover:border-rejimde-green transition group bg-white shadow-card flex flex-col h-full">
                    <div className="h-24 bg-gradient-to-r from-green-100 to-blue-50 rounded-t-3xl relative">
                        <div className="absolute -bottom-10 left-6">
                            <div className="relative">
                                <img src="https://i.pravatar.cc/150?img=44" alt="Pro" className="w-20 h-20 rounded-2xl border-4 border-white shadow-sm bg-white" />
                                <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
                            </div>
                        </div>
                        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-2 py-1 rounded-lg text-xs font-black text-gray-600 uppercase border border-white">
                            DİYETİSYEN
                        </div>
                    </div>
                    
                    <div className="pt-12 px-6 pb-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-xl font-extrabold text-rejimde-text leading-tight group-hover:text-rejimde-green transition">Dyt. Selin Yılmaz</h3>
                                <p className="text-xs font-bold text-gray-400">İstanbul / Online</p>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                <i className="fa-solid fa-star text-rejimde-yellow text-xs"></i>
                                <span className="font-bold text-rejimde-yellowDark text-xs">4.9</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            <span className="px-2 py-1 bg-purple-50 text-purple-600 text-[10px] font-black uppercase rounded border border-purple-100">KETO</span>
                            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded border border-blue-100">SPORCU</span>
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-3">
                            <button className="border-2 border-gray-200 text-gray-500 font-extrabold py-3 rounded-xl uppercase text-xs hover:bg-gray-50 transition">
                                Profili
                            </button>
                            <button className="bg-rejimde-green text-white font-extrabold py-3 rounded-xl uppercase text-xs shadow-btn shadow-rejimde-greenDark btn-game">
                                Randevu Al
                            </button>
                        </div>
                    </div>
                </div>

                {/* Pro Card 2 */}
                <div className="border-2 border-gray-200 rounded-3xl p-0 hover:border-rejimde-blue transition group bg-white shadow-card flex flex-col h-full">
                     <div className="h-24 bg-gradient-to-r from-orange-100 to-red-50 rounded-t-3xl relative">
                        <div className="absolute -bottom-10 left-6">
                             <div className="relative">
                                <img src="https://i.pravatar.cc/150?img=11" alt="Pro" className="w-20 h-20 rounded-2xl border-4 border-white shadow-sm bg-white" />
                                <div className="absolute -bottom-1 -right-1 bg-gray-300 w-5 h-5 rounded-full border-2 border-white"></div>
                             </div>
                        </div>
                        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-2 py-1 rounded-lg text-xs font-black text-gray-600 uppercase border border-white">
                            PT / KOÇ
                        </div>
                    </div>
                    
                    <div className="pt-12 px-6 pb-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-xl font-extrabold text-rejimde-text leading-tight group-hover:text-rejimde-blue transition">Burak Demir</h3>
                                <p className="text-xs font-bold text-gray-400">Ankara / Online</p>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                <i className="fa-solid fa-star text-rejimde-yellow text-xs"></i>
                                <span className="font-bold text-rejimde-yellowDark text-xs">5.0</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded border border-red-100">HIIT</span>
                            <span className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-black uppercase rounded border border-gray-200">KAS KAZANIM</span>
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-3">
                            <button className="border-2 border-gray-200 text-gray-500 font-extrabold py-3 rounded-xl uppercase text-xs hover:bg-gray-50 transition">
                                Profili
                            </button>
                            <button className="bg-rejimde-blue text-white font-extrabold py-3 rounded-xl uppercase text-xs shadow-btn shadow-rejimde-blueDark btn-game">
                                Randevu Al
                            </button>
                        </div>
                    </div>
                </div>

                {/* JOIN AS PRO (Light & Vibrant Background Fix) */}
                <div className="bg-rejimde-purple rounded-3xl p-6 flex flex-col justify-center items-center text-center shadow-btn shadow-rejimde-purpleDark btn-game cursor-pointer group relative overflow-hidden h-full">
                    {/* Background blobs */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full -ml-10 -mb-10"></div>
                    
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-rejimde-purple text-3xl mb-6 shadow-sm relative z-10 group-hover:scale-110 transition">
                        <i className="fa-solid fa-briefcase"></i>
                    </div>
                    <h3 className="text-2xl font-extrabold text-white mb-2 relative z-10">Uzman Mısın?</h3>
                    <p className="text-purple-100 text-sm font-bold mb-8 relative z-10 px-4">
                        Kendi klanını kur, danışanlarını ücretsiz yönet, gelirini artır.
                    </p>
                    <span className="bg-white text-rejimde-purple px-8 py-3 rounded-xl font-extrabold uppercase tracking-wide text-sm relative z-10 group-hover:bg-purple-50 transition shadow-btn shadow-purple-900/20">
                        BAŞVUR
                    </span>
                </div>
            </div>
        </div>
      </section>

    </div>
  );
}