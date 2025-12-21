"use client";

import Link from "next/link";
import Image from "next/image";

export default function ExerciseDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen pb-24 font-sans text-rejimde-text">
      
      {/* Navbar is in layout */}

      {/* HERO SECTION */}
      <div className="bg-rejimde-red text-white pt-10 pb-16 relative overflow-hidden shadow-md">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '20px 20px'}}></div>
          
          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg text-xs font-black uppercase mb-4 border border-white/10 animate-pulse">
                  <i className="fa-solid fa-fire text-yellow-300"></i> Yağ Yakımı
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-wide">20 Dk Evde HIIT</h1>
              <p className="text-red-100 font-bold text-lg mb-8 max-w-xl mx-auto">
                  Ekipman yok, bahane yok. Nabzı yükseltip metabolizmayı ateşliyoruz. Komşuları rahatsız etmeden sessiz ama etkili.
              </p>

              <div className="flex justify-center gap-4 md:gap-8 mb-8">
                  <div className="bg-black/20 rounded-2xl p-4 backdrop-blur-sm border border-white/10 min-w-[100px]">
                      <i className="fa-regular fa-clock text-2xl mb-1 opacity-80"></i>
                      <div className="font-black text-xl">20 Dk</div>
                      <div className="text-[10px] uppercase font-bold opacity-70">Süre</div>
                  </div>
                  <div className="bg-black/20 rounded-2xl p-4 backdrop-blur-sm border border-white/10 min-w-[100px]">
                      <i className="fa-solid fa-fire-flame-curved text-2xl mb-1 opacity-80"></i>
                      <div className="font-black text-xl">250</div>
                      <div className="text-[10px] uppercase font-bold opacity-70">Kalori</div>
                  </div>
                  <div className="bg-black/20 rounded-2xl p-4 backdrop-blur-sm border border-white/10 min-w-[100px]">
                      <i className="fa-solid fa-dumbbell text-2xl mb-1 opacity-80"></i>
                      <div className="font-black text-xl">Orta</div>
                      <div className="text-[10px] uppercase font-bold opacity-70">Zorluk</div>
                  </div>
              </div>
          </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-20">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT COLUMN: Workout Content */}
              <div className="lg:col-span-8">
                  
                  {/* Music Selector Card */}
                  <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-card mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-rejimde-purple rounded-xl flex items-center justify-center text-white text-2xl">
                              <i className="fa-solid fa-music"></i>
                          </div>
                          <div>
                              <h3 className="font-extrabold text-gray-800">Antrenman Modu</h3>
                              <p className="text-xs font-bold text-gray-400">Müzik seçimi performansını %15 artırır.</p>
                          </div>
                      </div>
                      <div className="flex gap-2">
                          <button className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl font-bold text-xs hover:bg-rejimde-red hover:text-white transition">
                              🔥 Hype
                          </button>
                          <button className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl font-bold text-xs hover:bg-rejimde-blue hover:text-white transition">
                              🎧 Pop
                          </button>
                          <button className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl font-bold text-xs hover:bg-rejimde-green hover:text-white transition">
                              🌿 Chill
                          </button>
                      </div>
                  </div>

                  {/* WORKOUT FLOW */}
                  <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 md:p-8 shadow-card relative">
                      {/* Timeline line */}
                      <div className="absolute top-[5rem] bottom-8 left-[3.5rem] md:left-[4rem] w-1 bg-gray-100 z-0"></div>
                      
                      <h2 className="text-xl font-extrabold text-gray-800 mb-6 pl-2">Hareket Listesi</h2>

                      {/* Warm Up Section */}
                      <div className="mb-8 relative z-10">
                          <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 bg-rejimde-yellow rounded-full border-4 border-white shadow-sm flex items-center justify-center text-white text-xl font-black shrink-0 z-10">
                                  1
                              </div>
                              <h3 className="font-extrabold text-rejimde-yellow text-lg uppercase">Isınma (3 Dk)</h3>
                          </div>

                          {/* Exercise 1 */}
                          <div className="ml-6 pl-8 pb-6 border-l-4 border-transparent hover:border-rejimde-yellow transition group cursor-pointer">
                              <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 group-hover:bg-yellow-50 transition border border-transparent group-hover:border-yellow-200">
                                  <img src="https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" className="w-16 h-16 rounded-xl object-cover bg-gray-200" alt="Jumping Jacks" />
                                  <div className="flex-1">
                                      <h4 className="font-extrabold text-gray-800">Jumping Jacks</h4>
                                      <p className="text-xs font-bold text-gray-400">45 Saniye • Nabzı yükselt</p>
                                  </div>
                                  <i className="fa-solid fa-circle-play text-gray-300 text-3xl group-hover:text-rejimde-yellow transition"></i>
                              </div>
                          </div>

                          {/* Exercise 2 */}
                          <div className="ml-6 pl-8 pb-6 border-l-4 border-transparent hover:border-rejimde-yellow transition group cursor-pointer">
                              <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 group-hover:bg-yellow-50 transition border border-transparent group-hover:border-yellow-200">
                                  <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400 text-2xl">
                                      <i className="fa-solid fa-person-walking"></i>
                                  </div>
                                  <div className="flex-1">
                                      <h4 className="font-extrabold text-gray-800">High Knees</h4>
                                      <p className="text-xs font-bold text-gray-400">45 Saniye • Dizleri çek</p>
                                  </div>
                                  <i className="fa-solid fa-circle-play text-gray-300 text-3xl group-hover:text-rejimde-yellow transition"></i>
                              </div>
                          </div>
                      </div>

                      {/* Main Circuit Section */}
                      <div className="mb-8 relative z-10">
                          <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 bg-rejimde-red rounded-full border-4 border-white shadow-sm flex items-center justify-center text-white text-xl font-black shrink-0 z-10">
                                  2
                              </div>
                              <h3 className="font-extrabold text-rejimde-red text-lg uppercase">Ana Devre (12 Dk)</h3>
                          </div>

                          {/* Exercise 3 */}
                          <div className="ml-6 pl-8 pb-6 border-l-4 border-transparent hover:border-rejimde-red transition group cursor-pointer">
                              <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 group-hover:bg-red-50 transition border border-transparent group-hover:border-red-200">
                                  <img src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" className="w-16 h-16 rounded-xl object-cover bg-gray-200" alt="Squat" />
                                  <div className="flex-1">
                                      <h4 className="font-extrabold text-gray-800">Squat Jumps</h4>
                                      <p className="text-xs font-bold text-gray-400">40 Sn Yap / 20 Sn Dinlen</p>
                                      {/* Coach Tip */}
                                      <div className="mt-2 text-[10px] font-bold text-rejimde-red bg-white/50 px-2 py-1 rounded inline-block border border-red-100">
                                          💡 İnerken topuklarına bas!
                                      </div>
                                  </div>
                                  <i className="fa-solid fa-circle-play text-gray-300 text-3xl group-hover:text-rejimde-red transition"></i>
                              </div>
                          </div>

                          {/* Exercise 4 */}
                          <div className="ml-6 pl-8 pb-6 border-l-4 border-transparent hover:border-rejimde-red transition group cursor-pointer">
                              <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 group-hover:bg-red-50 transition border border-transparent group-hover:border-red-200">
                                  <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400 text-2xl">
                                      <i className="fa-solid fa-person-running"></i>
                                  </div>
                                  <div className="flex-1">
                                      <h4 className="font-extrabold text-gray-800">Mountain Climbers</h4>
                                      <p className="text-xs font-bold text-gray-400">40 Sn Yap / 20 Sn Dinlen</p>
                                  </div>
                                  <i className="fa-solid fa-circle-play text-gray-300 text-3xl group-hover:text-rejimde-red transition"></i>
                              </div>
                          </div>
                      </div>

                      {/* Cooldown */}
                      <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 bg-rejimde-blue rounded-full border-4 border-white shadow-sm flex items-center justify-center text-white text-xl font-black shrink-0 z-10">
                                  3
                              </div>
                              <h3 className="font-extrabold text-rejimde-blue text-lg uppercase">Soğuma (5 Dk)</h3>
                          </div>

                          <div className="ml-6 pl-8 border-l-4 border-transparent hover:border-rejimde-blue transition group cursor-pointer">
                              <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 group-hover:bg-blue-50 transition border border-transparent group-hover:border-blue-200">
                                  <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400 text-2xl">
                                      <i className="fa-solid fa-child-reaching"></i>
                                  </div>
                                  <div className="flex-1">
                                      <h4 className="font-extrabold text-gray-800">Cobra Stretch</h4>
                                      <p className="text-xs font-bold text-gray-400">1 Dakika • Karın kaslarını esnet</p>
                                  </div>
                                  <i className="fa-solid fa-circle-play text-gray-300 text-3xl group-hover:text-rejimde-blue transition"></i>
                              </div>
                          </div>
                      </div>

                  </div>
              </div>

              {/* RIGHT COLUMN: Sidebar Info (Gamified) */}
              <div className="lg:col-span-4 space-y-6">
                  
                  {/* Reward Card */}
                  <div className="bg-rejimde-green rounded-3xl p-6 text-white shadow-float relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                      
                      <div className="flex items-center gap-4 mb-2">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                              <i className="fa-solid fa-trophy text-2xl"></i>
                          </div>
                          <div>
                              <h3 className="font-extrabold text-lg leading-tight">Görev Ödülü</h3>
                              <p className="text-green-100 text-xs font-bold">Tamamlanınca</p>
                          </div>
                      </div>
                      
                      <div className="text-4xl font-black mb-1">+300 Puan</div>
                      <p className="text-xs font-bold text-green-100 opacity-80">Rejimde Skoruna eklenir.</p>
                  </div>

                  {/* Coach Card */}
                  <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 text-center shadow-card group hover:border-rejimde-blue transition">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-4">Hazırlayan Koç</p>
                      <div className="w-20 h-20 mx-auto bg-gray-200 rounded-2xl border-4 border-white shadow-md overflow-hidden mb-3 relative">
                          <img src="https://i.pravatar.cc/150?img=11" className="w-full h-full object-cover" alt="Coach" />
                          <div className="absolute bottom-0 right-0 w-5 h-5 bg-rejimde-green border-2 border-white rounded-full"></div>
                      </div>
                      <h3 className="text-lg font-extrabold text-gray-800 group-hover:text-rejimde-blue transition">Koç Burak</h3>
                      <p className="text-xs font-bold text-gray-400 mb-3">PT • Vücut Geliştirme</p>
                      
                      <div className="flex justify-center text-rejimde-yellow text-xs mb-6">
                          <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                      </div>
                      
                      <button className="bg-white border-2 border-gray-200 text-gray-500 w-full py-2 rounded-xl font-bold text-xs shadow-btn shadow-gray-200 btn-game hover:text-rejimde-blue hover:border-rejimde-blue uppercase">
                          Soru Sor
                      </button>
                  </div>

                  {/* Participants / Social Proof */}
                  <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-card">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="font-extrabold text-gray-700 text-sm uppercase">Bunu Yapanlar</h3>
                          <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-lg text-[10px] font-black">2.4k</span>
                      </div>
                      
                      <div className="space-y-4">
                          {/* Review 1 */}
                          <div className="flex gap-3">
                              <img src="https://i.pravatar.cc/150?img=5" className="w-10 h-10 rounded-xl bg-gray-200 shrink-0 border-2 border-white shadow-sm" alt="User" />
                              <div>
                                  <p className="text-xs font-bold text-gray-600 leading-snug">
                                      &quot;20 dakikada pestilim çıktı ama değdi! Gerçekten terletiyor 🔥&quot;
                                  </p>
                                  <span className="text-[10px] font-black text-gray-400 block mt-1">GelinAdayı_99</span>
                              </div>
                          </div>
                          
                          {/* Review 2 */}
                          <div className="flex gap-3">
                              <img src="https://i.pravatar.cc/150?img=32" className="w-10 h-10 rounded-xl bg-gray-200 shrink-0 border-2 border-white shadow-sm" alt="User" />
                              <div>
                                  <p className="text-xs font-bold text-gray-600 leading-snug">
                                      &quot;Apartmanda yaşıyorum, zıplama hareketlerini yavaş yaptım, sorun olmadı.&quot;
                                  </p>
                                  <span className="text-[10px] font-black text-gray-400 block mt-1">DamatBey</span>
                              </div>
                          </div>
                      </div>
                      
                      <button className="w-full mt-4 text-center text-xs font-bold text-rejimde-blue hover:underline">
                          Tüm Yorumları Gör
                      </button>
                  </div>

              </div>

          </div>
      </div>

      {/* START BUTTON (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t-2 border-gray-200 p-4 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              <div className="hidden md:block">
                  <div className="text-xs font-bold text-gray-400 uppercase">Tahmini Süre</div>
                  <div className="text-xl font-black text-gray-800">20:00 Dk</div>
              </div>
              <button className="flex-1 bg-rejimde-green text-white py-4 rounded-2xl font-extrabold text-lg shadow-btn shadow-rejimde-greenDark btn-game uppercase tracking-wide flex items-center justify-center gap-3 group">
                  <i className="fa-solid fa-play group-hover:scale-110 transition"></i>
                  ANTRENMANI BAŞLAT
              </button>
              <button className="bg-gray-100 text-gray-500 w-14 h-14 rounded-2xl font-black text-xl shadow-btn shadow-gray-200 btn-game flex items-center justify-center hover:text-rejimde-blue">
                  <i className="fa-solid fa-share-nodes"></i>
              </button>
          </div>
      </div>

    </div>
  );
}