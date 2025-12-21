"use client";

import Link from "next/link";
import Image from "next/image";

export default function ClansPage() {
  return (
    <div className="min-h-screen pb-20 font-sans text-rejimde-text">
      
      {/* Header & Search */}
      <div className="bg-white border-b-2 border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-black text-gray-800 mb-4">Klanını Bul, Gücüne Güç Kat</h1>
            <p className="text-gray-500 font-bold text-lg mb-8 max-w-2xl mx-auto">
                Seninle aynı hedefe koşan insanlarla takım ol. Birlikte zayıflamak, tek başına zayıflamaktan %60 daha etkili.
            </p>

            <div className="max-w-xl mx-auto relative mb-8">
                <input type="text" placeholder="Klan adı veya etiket ara (Örn: Düğün, Koşu)..." className="w-full bg-gray-100 border-2 border-gray-200 focus:border-rejimde-purple rounded-2xl py-4 pl-12 pr-4 font-bold text-gray-600 outline-none transition text-lg" />
                <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"></i>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
                <button className="bg-rejimde-purple text-white px-5 py-2 rounded-xl font-extrabold text-sm shadow-btn shadow-purple-800 btn-game">
                    Tümü
                </button>
                <button className="bg-white border-2 border-gray-200 text-gray-500 px-5 py-2 rounded-xl font-extrabold text-sm shadow-btn shadow-gray-200 btn-game hover:text-rejimde-green hover:border-rejimde-green transition">
                    💍 Düğün Hazırlığı
                </button>
                <button className="bg-white border-2 border-gray-200 text-gray-500 px-5 py-2 rounded-xl font-extrabold text-sm shadow-btn shadow-gray-200 btn-game hover:text-rejimde-blue hover:border-rejimde-blue transition">
                    👔 Ofis Çalışanları
                </button>
                <button className="bg-white border-2 border-gray-200 text-gray-500 px-5 py-2 rounded-xl font-extrabold text-sm shadow-btn shadow-gray-200 btn-game hover:text-rejimde-red hover:border-rejimde-red transition">
                    👶 Yeni Anneler
                </button>
            </div>
        </div>
      </div>

      {/* CLANS GRID */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Create Clan Card */}
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white hover:border-rejimde-green hover:shadow-card transition group h-full min-h-[300px]">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-400 text-4xl mb-4 group-hover:text-rejimde-green group-hover:scale-110 transition shadow-sm">
                  <i className="fa-solid fa-plus"></i>
              </div>
              <h3 className="font-extrabold text-xl text-gray-700 mb-2">Kendi Klanını Kur</h3>
              <p className="text-sm font-bold text-gray-400 mb-6">
                  Arkadaşlarını topla, kuralları sen koy, liderlik et.
              </p>
              <button className="bg-white border-2 border-rejimde-green text-rejimde-green px-6 py-2 rounded-xl font-extrabold text-sm shadow-btn shadow-gray-200 btn-game uppercase">
                  Oluştur
              </button>
          </div>

          {/* Clan Card 1 */}
          <Link href="/clan" className="bg-white border-2 border-gray-200 rounded-3xl p-0 overflow-hidden shadow-sm hover:shadow-card hover:border-rejimde-purple transition group flex flex-col h-full relative hover:-translate-y-1 duration-200">
              <div className="h-24 bg-rejimde-purple/10 flex items-center justify-center relative">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border-4 border-white shadow-md absolute -bottom-10">
                      <i className="fa-solid fa-ring text-4xl text-rejimde-purple"></i>
                  </div>
              </div>
              <div className="pt-12 pb-6 px-6 text-center flex-1 flex flex-col">
                  <h3 className="font-extrabold text-xl text-gray-800 mb-1 group-hover:text-rejimde-purple transition">Düğün Tayfası</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-4">Motto: &quot;O gelinlik girecek&quot;</p>
                  
                  <div className="flex justify-center gap-4 mb-6 border-y border-gray-100 py-3">
                      <div>
                          <div className="font-black text-gray-800">12<span className="text-gray-400 text-xs">/15</span></div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase">Üye</div>
                      </div>
                      <div className="w-px bg-gray-100"></div>
                      <div>
                          <div className="font-black text-rejimde-green">3.</div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase">Lig Sırası</div>
                      </div>
                  </div>

                  <div className="mt-auto">
                      <span className="block w-full bg-rejimde-purple text-white py-3 rounded-xl font-extrabold text-sm shadow-btn shadow-purple-800 btn-game uppercase">
                          Katıl
                      </span>
                  </div>
              </div>
          </Link>

          {/* Clan Card 2 */}
          <Link href="#" className="bg-white border-2 border-gray-200 rounded-3xl p-0 overflow-hidden shadow-sm hover:shadow-card hover:border-rejimde-blue transition group flex flex-col h-full relative hover:-translate-y-1 duration-200">
              <div className="h-24 bg-rejimde-blue/10 flex items-center justify-center relative">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border-4 border-white shadow-md absolute -bottom-10">
                      <i className="fa-solid fa-laptop-code text-4xl text-rejimde-blue"></i>
                  </div>
              </div>
              <div className="pt-12 pb-6 px-6 text-center flex-1 flex flex-col">
                  <h3 className="font-extrabold text-xl text-gray-800 mb-1 group-hover:text-rejimde-blue transition">Plaza Koşucuları</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-4">Motto: &quot;Toplantıdan koşuya&quot;</p>
                  
                  <div className="flex justify-center gap-4 mb-6 border-y border-gray-100 py-3">
                      <div>
                          <div className="font-black text-gray-800">8<span className="text-gray-400 text-xs">/20</span></div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase">Üye</div>
                      </div>
                      <div className="w-px bg-gray-100"></div>
                      <div>
                          <div className="font-black text-rejimde-yellowDark">8.</div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase">Lig Sırası</div>
                      </div>
                  </div>

                  <div className="mt-auto">
                      <span className="block w-full bg-rejimde-blue text-white py-3 rounded-xl font-extrabold text-sm shadow-btn shadow-blue-600 btn-game uppercase">
                          Katıl
                      </span>
                  </div>
              </div>
          </Link>

          {/* Clan Card 3 (Locked/Full) */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-3xl p-0 overflow-hidden shadow-none flex flex-col h-full relative opacity-70 cursor-not-allowed">
              <div className="absolute top-2 right-2 bg-gray-200 text-gray-500 px-2 py-1 rounded text-[10px] font-black uppercase">Dolu</div>
              <div className="h-24 bg-gray-200 flex items-center justify-center relative">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border-4 border-white shadow-sm absolute -bottom-10">
                      <i className="fa-solid fa-baby-carriage text-4xl text-gray-400"></i>
                  </div>
              </div>
              <div className="pt-12 pb-6 px-6 text-center flex-1 flex flex-col">
                  <h3 className="font-extrabold text-xl text-gray-600 mb-1">Fit Anneler</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-4">Motto: &quot;Bebek arabasıyla kardiyo&quot;</p>
                  
                  <div className="flex justify-center gap-4 mb-6 border-y border-gray-200 py-3">
                      <div>
                          <div className="font-black text-gray-600">20<span className="text-gray-400 text-xs">/20</span></div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase">Üye</div>
                      </div>
                      <div className="w-px bg-gray-200"></div>
                      <div>
                          <div className="font-black text-gray-600">1.</div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase">Lig Sırası</div>
                      </div>
                  </div>

                  <div className="mt-auto">
                      <button className="w-full bg-gray-200 text-gray-400 py-3 rounded-xl font-extrabold text-sm uppercase cursor-not-allowed">
                          Katılım Kapalı
                      </button>
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
}