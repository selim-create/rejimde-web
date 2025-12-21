"use client";

import Link from "next/link";
import Image from "next/image";

export default function DietsPage() {
  return (
    <div className="min-h-screen pb-20">
      
      {/* HERO: AI Selection */}
      <div className="bg-rejimde-purple text-white py-12 relative overflow-hidden mb-8 shadow-md">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '20px 20px'}}></div>
          
          <div className="max-w-6xl mx-auto px-4 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                  <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg text-xs font-black uppercase mb-4 border border-white/10">
                      <i className="fa-solid fa-wand-magic-sparkles text-yellow-300"></i> Rejimde AI
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                      Hangi diyet sana uygun? <br />
                      <span className="text-purple-200">Bırak yapay zeka seçsin.</span>
                  </h1>
                  <p className="text-purple-100 font-bold mb-8 text-lg">
                      Boyunu, kilonu ve sevmediğin yemekleri söyle, sana özel 3 günlük deneme listesi oluşturalım.
                  </p>
                  <button className="bg-white text-rejimde-purple px-8 py-3 rounded-xl font-extrabold text-sm shadow-btn shadow-purple-900/30 btn-game uppercase flex items-center gap-2 hover:bg-purple-50 transition">
                      <i className="fa-solid fa-robot"></i> AI İle Liste Oluştur
                  </button>
              </div>
              
              {/* Illustration */}
              <div className="hidden md:flex justify-end">
                  <div className="relative w-64 h-64 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20 animate-pulse">
                      <i className="fa-solid fa-utensils text-8xl text-white opacity-80"></i>
                      {/* Floating Icons */}
                      <div className="absolute top-0 right-0 bg-rejimde-yellow text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform rotate-12 border-2 border-white/20">
                          <i className="fa-solid fa-carrot text-xl"></i>
                      </div>
                      <div className="absolute bottom-4 left-4 bg-rejimde-green text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transform -rotate-12 border-2 border-white/20">
                          <i className="fa-solid fa-leaf"></i>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-12">

          {/* FILTERS */}
          <div className="flex flex-wrap gap-3 mb-8">
              <button className="bg-rejimde-text text-white px-5 py-2 rounded-xl font-extrabold text-sm shadow-btn shadow-gray-800 btn-game">
                  Tümü
              </button>
              <button className="bg-white border-2 border-gray-200 text-gray-500 px-5 py-2 rounded-xl font-extrabold text-sm shadow-btn shadow-gray-200 btn-game hover:text-rejimde-green hover:border-rejimde-green transition">
                  🚀 Hızlı Sonuç
              </button>
              <button className="bg-white border-2 border-gray-200 text-gray-500 px-5 py-2 rounded-xl font-extrabold text-sm shadow-btn shadow-gray-200 btn-game hover:text-rejimde-blue hover:border-rejimde-blue transition">
                  🌿 Vegan / Vejetaryen
              </button>
              <button className="bg-white border-2 border-gray-200 text-gray-500 px-5 py-2 rounded-xl font-extrabold text-sm shadow-btn shadow-gray-200 btn-game hover:text-rejimde-red hover:border-rejimde-red transition">
                  🍖 Keto / Düşük Karbonhidrat
              </button>
              <button className="bg-white border-2 border-gray-200 text-gray-500 px-5 py-2 rounded-xl font-extrabold text-sm shadow-btn shadow-gray-200 btn-game hover:text-rejimde-yellow hover:border-rejimde-yellow transition">
                  💰 Ekonomik
              </button>
          </div>

          {/* LISTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">

              {/* CARD 1: Intermittent Fasting (Popular) */}
              <Link href="/diets/intermittent-fasting" className="bg-white border-2 border-gray-200 rounded-3xl p-0 transition shadow-sm hover:shadow-card hover:border-rejimde-green group flex flex-col h-full relative hover:-translate-y-1 duration-200">
                  {/* Badge */}
                  <div className="absolute top-4 left-4 z-10 bg-rejimde-yellow text-white px-3 py-1 rounded-lg text-xs font-black uppercase shadow-sm border border-white/20">
                      <i className="fa-solid fa-fire mr-1"></i> Popüler
                  </div>

                  <div className="h-40 bg-gray-200 rounded-t-3xl relative overflow-hidden flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1543362906-ac1b481287cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="IF Diet" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-extrabold text-xl shadow-black drop-shadow-md">Aralıklı Oruç (16:8)</h3>
                          <p className="text-xs font-bold opacity-90">Yeni Başlayanlar İçin</p>
                      </div>
                  </div>

                  <div className="p-5 flex flex-col h-full">
                      <p className="text-gray-500 text-sm font-bold mb-4 line-clamp-2">
                          Günde sadece 8 saat yemek yiyerek metabolizmanı hızlandır. Kahvaltıyı atla, yağ yakımını başlat.
                      </p>
                      
                      {/* Meta Tags */}
                      <div className="grid grid-cols-3 gap-2 mb-6">
                          <div className="bg-green-50 rounded-lg p-2 text-center">
                              <i className="fa-solid fa-gauge-simple text-rejimde-green text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">Kolay</span>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2 text-center">
                              <i className="fa-regular fa-clock text-rejimde-blue text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">Süresiz</span>
                          </div>
                          <div className="bg-red-50 rounded-lg p-2 text-center">
                              <i className="fa-solid fa-weight-hanging text-rejimde-red text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">-3kg/Ay</span>
                          </div>
                      </div>

                      <div className="mt-auto">
                          <div className="flex items-center justify-between border-t-2 border-gray-100 pt-4">
                              <div className="text-xs font-bold text-gray-400">
                                  <span className="text-rejimde-green font-black">+200</span> Puan Kazandırır
                              </div>
                              <span className="bg-rejimde-text text-white px-6 py-2 rounded-xl font-extrabold text-xs shadow-btn shadow-gray-800 btn-game uppercase flex items-center">
                                  İncele
                              </span>
                          </div>
                      </div>
                  </div>
              </Link>

              {/* CARD 2: 3 Day Detox (Short Term) */}
              <Link href="/diets/3-day-detox" className="bg-white border-2 border-gray-200 rounded-3xl p-0 transition shadow-sm hover:shadow-card hover:border-rejimde-blue group flex flex-col h-full hover:-translate-y-1 duration-200">
                  <div className="h-40 bg-gray-200 rounded-t-3xl relative overflow-hidden flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="Detox" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-extrabold text-xl shadow-black drop-shadow-md">3 Günlük Yeşil Detoks</h3>
                          <p className="text-xs font-bold opacity-90">Ödem Atıcı</p>
                      </div>
                  </div>

                  <div className="p-5 flex flex-col h-full">
                      <p className="text-gray-500 text-sm font-bold mb-4 line-clamp-2">
                          Düğün öncesi veya tatil dönüşü şişkinlikten kurtulmak için sıvı ağırlıklı hızlı bir program.
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2 mb-6">
                          <div className="bg-orange-50 rounded-lg p-2 text-center">
                              <i className="fa-solid fa-gauge-high text-orange-500 text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">Orta</span>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2 text-center">
                              <i className="fa-regular fa-clock text-rejimde-blue text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">3 Gün</span>
                          </div>
                          <div className="bg-red-50 rounded-lg p-2 text-center">
                              <i className="fa-solid fa-weight-hanging text-rejimde-red text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">-1.5kg</span>
                          </div>
                      </div>

                      <div className="mt-auto">
                          <div className="flex items-center justify-between border-t-2 border-gray-100 pt-4">
                              <div className="text-xs font-bold text-gray-400">
                                  <span className="text-rejimde-green font-black">+500</span> Puan Kazandırır
                              </div>
                              <span className="bg-rejimde-text text-white px-6 py-2 rounded-xl font-extrabold text-xs shadow-btn shadow-gray-800 btn-game uppercase flex items-center">
                                  İncele
                              </span>
                          </div>
                      </div>
                  </div>
              </Link>

              {/* CARD 3: Keto (Expert Verified) */}
              <Link href="/diets/keto-start" className="bg-white border-2 border-gray-200 rounded-3xl p-0 transition shadow-sm hover:shadow-card hover:border-rejimde-red group flex flex-col h-full relative hover:-translate-y-1 duration-200">
                  <div className="absolute top-4 left-4 z-10 bg-rejimde-blue text-white px-3 py-1 rounded-lg text-xs font-black uppercase shadow-sm border border-white/20">
                      <i className="fa-solid fa-user-doctor mr-1"></i> Uzman Onaylı
                  </div>

                  <div className="h-40 bg-gray-200 rounded-t-3xl relative overflow-hidden flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1606853998125-9636e35c4c3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="Keto" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-extrabold text-xl shadow-black drop-shadow-md">Ketojenik Başlangıç</h3>
                          <p className="text-xs font-bold opacity-90">Yağ Yakım Modu</p>
                      </div>
                  </div>

                  <div className="p-5 flex flex-col h-full">
                      <p className="text-gray-500 text-sm font-bold mb-4 line-clamp-2">
                          Karbonhidratı kes, yağı artır. Vücudunu ketozise sokarak inatçı yağlardan kurtul.
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2 mb-6">
                          <div className="bg-red-50 rounded-lg p-2 text-center">
                              <i className="fa-solid fa-gauge text-rejimde-red text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">Zor</span>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2 text-center">
                              <i className="fa-regular fa-clock text-rejimde-blue text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">21 Gün</span>
                          </div>
                          <div className="bg-red-50 rounded-lg p-2 text-center">
                              <i className="fa-solid fa-weight-hanging text-rejimde-red text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">-5kg</span>
                          </div>
                      </div>

                      <div className="mt-auto">
                          <div className="flex items-center justify-between border-t-2 border-gray-100 pt-4">
                              <div className="flex items-center gap-2">
                                  <img src="https://i.pravatar.cc/150?img=44" className="w-6 h-6 rounded-full border border-gray-200" alt="Dyt. Selin" />
                                  <span className="text-[10px] font-bold text-gray-500">Dyt. Selin Y.</span>
                              </div>
                              <span className="bg-rejimde-text text-white px-6 py-2 rounded-xl font-extrabold text-xs shadow-btn shadow-gray-800 btn-game uppercase flex items-center">
                                  İncele
                              </span>
                          </div>
                      </div>
                  </div>
              </Link>

              {/* CARD 4: Premium (Locked) */}
              <div className="bg-gray-100 border-2 border-gray-200 rounded-3xl p-0 transition shadow-sm flex flex-col relative group grayscale opacity-90 h-full cursor-not-allowed">
                  <div className="absolute inset-0 bg-white/60 z-20 flex flex-col items-center justify-center backdrop-blur-[2px]">
                      <i className="fa-solid fa-lock text-rejimde-yellowDark text-5xl mb-3 drop-shadow-md"></i>
                      <span className="bg-rejimde-yellowDark text-white px-4 py-2 rounded-xl font-black text-xs uppercase shadow-sm">Premium Üyelere Özel</span>
                  </div>

                  <div className="h-40 bg-gray-300 rounded-t-3xl relative overflow-hidden flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover" alt="Model Diet" />
                  </div>

                  <div className="p-5 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="font-extrabold text-xl text-gray-600">Model Diyeti</h3>
                      </div>
                      <p className="text-gray-400 text-sm font-bold mb-4 line-clamp-2">
                          Defile öncesi son 1 hafta uygulanan, sıkılaştırıcı ve parlaklık veren özel kür.
                      </p>
                      <div className="mt-auto"></div>
                  </div>
              </div>

              {/* CARD 5: Mediterranean */}
              <Link href="/diets/mediterranean" className="bg-white border-2 border-gray-200 rounded-3xl p-0 transition shadow-sm hover:shadow-card hover:border-rejimde-yellow group flex flex-col h-full hover:-translate-y-1 duration-200">
                  <div className="h-40 bg-gray-200 rounded-t-3xl relative overflow-hidden flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1511993226957-cd3429977161?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="Akdeniz" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-extrabold text-xl shadow-black drop-shadow-md">Akdeniz Diyeti</h3>
                          <p className="text-xs font-bold opacity-90">Sağlıklı Yaşam</p>
                      </div>
                  </div>

                  <div className="p-5 flex flex-col h-full">
                      <p className="text-gray-500 text-sm font-bold mb-4 line-clamp-2">
                          Zeytinyağı, balık ve bol yeşillik. Kalp dostu ve sürdürülebilir bir beslenme tarzı.
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2 mb-6">
                          <div className="bg-green-50 rounded-lg p-2 text-center">
                              <i className="fa-solid fa-gauge-simple text-rejimde-green text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">Kolay</span>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2 text-center">
                              <i className="fa-regular fa-clock text-rejimde-blue text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">Süresiz</span>
                          </div>
                          <div className="bg-red-50 rounded-lg p-2 text-center">
                              <i className="fa-solid fa-heart-pulse text-rejimde-red text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">Sağlık</span>
                          </div>
                      </div>

                      <div className="mt-auto">
                          <div className="flex items-center justify-between border-t-2 border-gray-100 pt-4">
                              <div className="text-xs font-bold text-gray-400">
                                  <span className="text-rejimde-green font-black">+100</span> Puan/Hafta
                              </div>
                              <span className="bg-rejimde-text text-white px-6 py-2 rounded-xl font-extrabold text-xs shadow-btn shadow-gray-800 btn-game uppercase flex items-center">
                                  İncele
                              </span>
                          </div>
                      </div>
                  </div>
              </Link>

              {/* CARD 6: Budget Friendly */}
              <Link href="/diets/budget-friendly" className="bg-white border-2 border-gray-200 rounded-3xl p-0 transition shadow-sm hover:shadow-card hover:border-rejimde-green group flex flex-col h-full hover:-translate-y-1 duration-200">
                  <div className="absolute top-4 left-4 z-10 bg-rejimde-green text-white px-3 py-1 rounded-lg text-xs font-black uppercase shadow-sm border border-white/20">
                      <i className="fa-solid fa-piggy-bank mr-1"></i> Ekonomik
                  </div>

                  <div className="h-40 bg-gray-200 rounded-t-3xl relative overflow-hidden flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1585937421612-70a008356f36?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="Ekonomik" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-extrabold text-xl shadow-black drop-shadow-md">Öğrenci Dostu</h3>
                          <p className="text-xs font-bold opacity-90">Bütçe Zorlamayan</p>
                      </div>
                  </div>

                  <div className="p-5 flex flex-col h-full">
                      <p className="text-gray-500 text-sm font-bold mb-4 line-clamp-2">
                          Avokado veya somon yok. Yumurta, bakliyat ve mevsim sebzeleriyle protein dolu bir liste.
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2 mb-6">
                          <div className="bg-green-50 rounded-lg p-2 text-center">
                              <i className="fa-solid fa-gauge-simple text-rejimde-green text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">Kolay</span>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2 text-center">
                              <i className="fa-regular fa-clock text-rejimde-blue text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">1 Ay</span>
                          </div>
                          <div className="bg-red-50 rounded-lg p-2 text-center">
                              <i className="fa-solid fa-wallet text-rejimde-red text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">Ucuz</span>
                          </div>
                      </div>

                      <div className="mt-auto">
                          <div className="flex items-center justify-between border-t-2 border-gray-100 pt-4">
                              <div className="text-xs font-bold text-gray-400">
                                  <span className="text-rejimde-green font-black">+300</span> Puan
                              </div>
                              <span className="bg-rejimde-text text-white px-6 py-2 rounded-xl font-extrabold text-xs shadow-btn shadow-gray-800 btn-game uppercase flex items-center">
                                  İncele
                              </span>
                          </div>
                      </div>
                  </div>
              </Link>

          </div>

      </div>

    </div>
  );
}