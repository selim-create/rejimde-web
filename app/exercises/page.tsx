"use client";

import Link from "next/link";
import Image from "next/image";

export default function ExercisesPage() {
  return (
    <div className="min-h-screen pb-20">
      
      {/* HERO: AI Workout Coach */}
      <div className="bg-rejimde-blue text-white py-12 relative overflow-hidden mb-8 shadow-md">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '20px 20px'}}></div>
          
          <div className="max-w-6xl mx-auto px-4 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                  <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg text-xs font-black uppercase mb-4 border border-white/10 animate-pulse">
                      <i className="fa-solid fa-bolt text-yellow-300"></i> AI Antrenör
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                      Bugün nasıl hissediyorsun? <br />
                      <span className="text-blue-200">Sana uygun sporu bulalım.</span>
                  </h1>
                  <p className="text-blue-100 font-bold mb-8 text-lg">
                      &quot;Dizim ağrıyor&quot;, &quot;Sadece 15 dakikam var&quot; veya &quot;Apartmandayım zıplayamam&quot; de, gerisini bize bırak.
                  </p>
                  <button className="bg-white text-rejimde-blue px-8 py-3 rounded-xl font-extrabold text-sm shadow-btn shadow-blue-900/30 btn-game uppercase flex items-center gap-2 hover:bg-blue-50 transition">
                      <i className="fa-solid fa-wand-magic-sparkles"></i> Antrenman Oluştur
                  </button>
              </div>
              
              {/* Illustration */}
              <div className="hidden md:flex justify-end">
                  <div className="relative w-64 h-64 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20 animate-bounce-slow">
                      <i className="fa-solid fa-dumbbell text-8xl text-white opacity-80 transform -rotate-12"></i>
                      {/* Floating Icons */}
                      <div className="absolute top-0 right-4 bg-rejimde-red text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform rotate-12 border-2 border-white/20">
                          <i className="fa-solid fa-heart-pulse text-xl"></i>
                      </div>
                      <div className="absolute bottom-4 left-0 bg-rejimde-yellow text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transform -rotate-12 border-2 border-white/20">
                          <i className="fa-solid fa-stopwatch"></i>
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
              <button className="bg-white border-2 border-gray-200 text-gray-500 px-5 py-2 rounded-xl font-extrabold text-sm shadow-btn shadow-gray-200 btn-game hover:text-rejimde-red hover:border-rejimde-red transition">
                  🔥 Kardiyo / HIIT
              </button>
              <button className="bg-white border-2 border-gray-200 text-gray-500 px-5 py-2 rounded-xl font-extrabold text-sm shadow-btn shadow-gray-200 btn-game hover:text-rejimde-blue hover:border-rejimde-blue transition">
                  💪 Güç / Kas
              </button>
              <button className="bg-white border-2 border-gray-200 text-gray-500 px-5 py-2 rounded-xl font-extrabold text-sm shadow-btn shadow-gray-200 btn-game hover:text-rejimde-purple hover:border-rejimde-purple transition">
                  🧘 Yoga / Esneme
              </button>
              <button className="bg-white border-2 border-gray-200 text-gray-500 px-5 py-2 rounded-xl font-extrabold text-sm shadow-btn shadow-gray-200 btn-game hover:text-rejimde-green hover:border-rejimde-green transition">
                  🏠 Ekipmansız
              </button>
          </div>

          {/* LISTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">

              {/* CARD 1: Morning Stretch (Easy) */}
              <Link href="/exercises/morning-stretch" className="bg-white border-2 border-gray-200 rounded-3xl p-0 transition shadow-sm hover:shadow-card group flex flex-col h-full relative hover:-translate-y-1 duration-200">
                  {/* Badge */}
                  <div className="absolute top-4 left-4 z-10 bg-rejimde-green text-white px-3 py-1 rounded-lg text-xs font-black uppercase shadow-sm border border-white/20">
                      <i className="fa-solid fa-sun mr-1"></i> Sabah Rutini
                  </div>

                  <div className="h-40 bg-gray-200 rounded-t-3xl relative overflow-hidden flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1544367563-121910aa662f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="Morning Stretch" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-extrabold text-xl shadow-black drop-shadow-md">Yatakta Başla</h3>
                          <p className="text-xs font-bold opacity-90">Güne Enerjik Uyan</p>
                      </div>
                  </div>

                  <div className="p-5 flex flex-col h-full">
                      <p className="text-gray-500 text-sm font-bold mb-4 line-clamp-2">
                          Yataktan kalkmadan yapabileceğin 5 dakikalık esneme hareketleri. Omurganı aç, güne hazırla.
                      </p>
                      
                      {/* Meta Tags */}
                      <div className="grid grid-cols-3 gap-2 mb-6">
                          <div className="bg-green-50 rounded-lg p-2 text-center">
                              <i className="fa-solid fa-leaf text-rejimde-green text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">Kolay</span>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2 text-center">
                              <i className="fa-regular fa-clock text-rejimde-blue text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">5 Dk</span>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-2 text-center">
                              <i className="fa-solid fa-fire text-orange-500 text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">30 Cal</span>
                          </div>
                      </div>

                      <div className="mt-auto">
                          <div className="flex items-center justify-between border-t-2 border-gray-100 pt-4">
                              <div className="text-xs font-bold text-gray-400">
                                  <span className="text-rejimde-green font-black">+50</span> Puan
                              </div>
                              <span className="bg-rejimde-text text-white px-6 py-2 rounded-xl font-extrabold text-xs shadow-btn shadow-gray-800 btn-game uppercase flex items-center">
                                  Başla
                              </span>
                          </div>
                      </div>
                  </div>
              </Link>

              {/* CARD 2: HIIT (Hard) */}
              <Link href="/exercises/home-hiit" className="bg-white border-2 border-gray-200 rounded-3xl p-0 transition shadow-sm hover:shadow-card hover:border-rejimde-red group flex flex-col h-full relative hover:-translate-y-1 duration-200">
                  <div className="absolute top-4 left-4 z-10 bg-rejimde-red text-white px-3 py-1 rounded-lg text-xs font-black uppercase shadow-sm border border-white/20">
                      <i className="fa-solid fa-fire mr-1"></i> Yağ Yakıcı
                  </div>

                  <div className="h-40 bg-gray-200 rounded-t-3xl relative overflow-hidden flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="HIIT" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-extrabold text-xl shadow-black drop-shadow-md">20 Dk Evde HIIT</h3>
                          <p className="text-xs font-bold opacity-90">Ekipmansız Terleme</p>
                      </div>
                  </div>

                  <div className="p-5 flex flex-col h-full">
                      <p className="text-gray-500 text-sm font-bold mb-4 line-clamp-2">
                          Apartman dostu (sessiz) ama nabzı tavana vurduran egzersizler. Komşular duymadan yağ yak.
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2 mb-6">
                          <div className="bg-red-50 rounded-lg p-2 text-center">
                              <i className="fa-solid fa-gauge-high text-rejimde-red text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">Zor</span>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2 text-center">
                              <i className="fa-regular fa-clock text-rejimde-blue text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">20 Dk</span>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-2 text-center">
                              <i className="fa-solid fa-fire text-orange-500 text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">250 Cal</span>
                          </div>
                      </div>

                      <div className="mt-auto">
                          <div className="flex items-center justify-between border-t-2 border-gray-100 pt-4">
                              <div className="text-xs font-bold text-gray-400">
                                  <span className="text-rejimde-green font-black">+300</span> Puan
                              </div>
                              <span className="bg-rejimde-text text-white px-6 py-2 rounded-xl font-extrabold text-xs shadow-btn shadow-gray-800 btn-game uppercase flex items-center">
                                  Başla
                              </span>
                          </div>
                      </div>
                  </div>
              </Link>

              {/* CARD 3: Office Yoga (Medium) */}
              <Link href="/exercises/office-yoga" className="bg-white border-2 border-gray-200 rounded-3xl p-0 transition shadow-sm hover:shadow-card hover:border-rejimde-blue group flex flex-col h-full relative hover:-translate-y-1 duration-200">
                  <div className="h-40 bg-gray-200 rounded-t-3xl relative overflow-hidden flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="Yoga" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-extrabold text-xl shadow-black drop-shadow-md">Ofis Sandalye Yogası</h3>
                          <p className="text-xs font-bold opacity-90">Sırt & Boyun Ağrısına Son</p>
                      </div>
                  </div>

                  <div className="p-5 flex flex-col h-full">
                      <p className="text-gray-500 text-sm font-bold mb-4 line-clamp-2">
                          Bilgisayar başında kambur durmaktan bıktın mı? Sandalyeden kalkmadan omurganı rahatlat.
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2 mb-6">
                          <div className="bg-green-50 rounded-lg p-2 text-center">
                              <i className="fa-solid fa-chair text-rejimde-green text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">Kolay</span>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2 text-center">
                              <i className="fa-regular fa-clock text-rejimde-blue text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">10 Dk</span>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-2 text-center">
                              <i className="fa-solid fa-heart-pulse text-orange-500 text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">Rahatla</span>
                          </div>
                      </div>

                      <div className="mt-auto">
                          <div className="flex items-center justify-between border-t-2 border-gray-100 pt-4">
                              <div className="text-xs font-bold text-gray-400">
                                  <span className="text-rejimde-green font-black">+100</span> Puan
                              </div>
                              <span className="bg-rejimde-text text-white px-6 py-2 rounded-xl font-extrabold text-xs shadow-btn shadow-gray-800 btn-game uppercase flex items-center">
                                  Başla
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
                      <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover" alt="Dumbbell" />
                  </div>

                  <div className="p-5 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="font-extrabold text-xl text-gray-600">Dambıl İle Tüm Vücut</h3>
                      </div>
                      <p className="text-gray-400 text-sm font-bold mb-4 line-clamp-2">
                          Sadece iki dambıl ile evde spor salonu etkisi yarat. Kas kütlesini artır, metabolizmanı hızlandır.
                      </p>
                      <div className="mt-auto"></div>
                  </div>
              </div>

              {/* CARD 5: Walking (Steps) */}
              <Link href="/exercises/walking" className="bg-white border-2 border-gray-200 rounded-3xl p-0 transition shadow-sm hover:shadow-card hover:border-rejimde-green group flex flex-col h-full relative hover:-translate-y-1 duration-200">
                  <div className="h-40 bg-gray-200 rounded-t-3xl relative overflow-hidden flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="Walking" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-extrabold text-xl shadow-black drop-shadow-md">Tempolu Yürüyüş</h3>
                          <p className="text-xs font-bold opacity-90">Kafa Dağıtma</p>
                      </div>
                  </div>

                  <div className="p-5 flex flex-col h-full">
                      <p className="text-gray-500 text-sm font-bold mb-4 line-clamp-2">
                          Kulaklığını tak, en sevdiğin podcasti aç ve 45 dakika boyunca durmadan yürü. Hem zihin hem beden detoksu.
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2 mb-6">
                          <div className="bg-green-50 rounded-lg p-2 text-center">
                              <i className="fa-solid fa-shoe-prints text-rejimde-green text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">Kolay</span>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2 text-center">
                              <i className="fa-regular fa-clock text-rejimde-blue text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">45 Dk</span>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-2 text-center">
                              <i className="fa-solid fa-fire text-orange-500 text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">200 Cal</span>
                          </div>
                      </div>

                      <div className="mt-auto">
                          <div className="flex items-center justify-between border-t-2 border-gray-100 pt-4">
                              <div className="text-xs font-bold text-gray-400">
                                  <span className="text-rejimde-green font-black">+150</span> Puan
                              </div>
                              <span className="bg-rejimde-text text-white px-6 py-2 rounded-xl font-extrabold text-xs shadow-btn shadow-gray-800 btn-game uppercase flex items-center">
                                  Başla
                              </span>
                          </div>
                      </div>
                  </div>
              </Link>

              {/* CARD 6: Plank Challenge */}
              <Link href="/exercises/plank-challenge" className="bg-white border-2 border-gray-200 rounded-3xl p-0 transition shadow-sm hover:shadow-card hover:border-rejimde-purple group flex flex-col h-full relative hover:-translate-y-1 duration-200">
                  <div className="absolute top-4 left-4 z-10 bg-rejimde-purple text-white px-3 py-1 rounded-lg text-xs font-black uppercase shadow-sm border border-white/20">
                      <i className="fa-solid fa-trophy mr-1"></i> Challenge
                  </div>

                  <div className="h-40 bg-gray-200 rounded-t-3xl relative overflow-hidden flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="Plank" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-extrabold text-xl shadow-black drop-shadow-md">30 Gün Plank</h3>
                          <p className="text-xs font-bold opacity-90">Karın Kası</p>
                      </div>
                  </div>

                  <div className="p-5 flex flex-col h-full">
                      <p className="text-gray-500 text-sm font-bold mb-4 line-clamp-2">
                          Her gün süreyi biraz daha artırarak çelik gibi karın kaslarına sahip ol. Dayanabilir misin?
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2 mb-6">
                          <div className="bg-red-50 rounded-lg p-2 text-center">
                              <i className="fa-solid fa-gauge-high text-rejimde-red text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">Zor</span>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-2 text-center">
                              <i className="fa-regular fa-calendar text-rejimde-blue text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">30 Gün</span>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-2 text-center">
                              <i className="fa-solid fa-medal text-purple-500 text-sm mb-1 block"></i>
                              <span className="text-[10px] font-black text-gray-500 uppercase">Rozet</span>
                          </div>
                      </div>

                      <div className="mt-auto">
                          <div className="flex items-center justify-between border-t-2 border-gray-100 pt-4">
                              <div className="text-xs font-bold text-gray-400">
                                  <span className="text-rejimde-green font-black">+1000</span> Puan
                              </div>
                              <span className="bg-rejimde-text text-white px-6 py-2 rounded-xl font-extrabold text-xs shadow-btn shadow-gray-800 btn-game uppercase flex items-center">
                                  Katıl
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