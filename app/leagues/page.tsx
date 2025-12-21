"use client";

import Link from "next/link";
import Image from "next/image";

export default function LeaguesHubPage() {
  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      
      {/* Header */}
      <div className="bg-rejimde-blue text-white py-12 relative overflow-hidden shadow-md mb-8">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '20px 20px'}}></div>
          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
              <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-wide">Rejimde Ligleri</h1>
              <p className="text-blue-100 font-bold text-lg max-w-xl mx-auto">
                  Bronz'dan başla, Elmas'a yüksel. Her hafta ilk 5'e gir, lig atla ve büyük ödülleri topla.
              </p>
          </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 relative">
          
          {/* Vertical Line (The Path) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-gray-200 -ml-1 rounded-full z-0"></div>

          <div className="space-y-16 relative z-10 py-8">

              {/* LEVEL 5: DIAMOND (Locked) */}
              <div className="flex flex-col items-center group opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300">
                  <div className="w-32 h-32 bg-white rounded-3xl border-4 border-gray-300 flex items-center justify-center shadow-lg mb-4 group-hover:border-blue-400 group-hover:shadow-blue-200 group-hover:scale-110 transition z-10">
                      <i className="fa-solid fa-gem text-6xl text-blue-500"></i>
                  </div>
                  <div className="bg-white px-6 py-3 rounded-xl border-2 border-gray-200 text-center shadow-sm">
                      <h3 className="text-xl font-black text-gray-700 uppercase">Elmas Ligi</h3>
                      <p className="text-xs font-bold text-gray-400">Sadece %1 buraya ulaşır</p>
                  </div>
              </div>

              {/* LEVEL 4: RUBY (Locked) */}
              <div className="flex flex-col items-center group opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition duration-300">
                  <div className="w-32 h-32 bg-white rounded-3xl border-4 border-gray-300 flex items-center justify-center shadow-lg mb-4 group-hover:border-red-400 group-hover:shadow-red-200 group-hover:scale-110 transition z-10">
                      <i className="fa-solid fa-gem text-6xl text-red-500"></i>
                  </div>
                  <div className="bg-white px-6 py-3 rounded-xl border-2 border-gray-200 text-center shadow-sm">
                      <h3 className="text-xl font-black text-gray-700 uppercase">Yakut Ligi</h3>
                      <p className="text-xs font-bold text-gray-400">Elit sporcuların yeri</p>
                  </div>
              </div>

              {/* LEVEL 3: SAPPHIRE (Active) */}
              <div className="flex flex-col items-center scale-110 relative">
                  {/* Pulse Effect */}
                  <div className="absolute top-8 left-1/2 -ml-16 w-32 h-32 bg-rejimde-blue rounded-full animate-ping opacity-20"></div>
                  
                  <Link href="/leagues/sapphire" className="w-32 h-32 bg-rejimde-blue rounded-3xl border-4 border-white flex items-center justify-center shadow-btn shadow-blue-800 mb-4 z-20 cursor-pointer hover:-translate-y-2 transition">
                      <i className="fa-solid fa-gem text-6xl text-white"></i>
                      {/* User Avatar Badge */}
                      <div className="absolute -bottom-4 -right-4 w-12 h-12 rounded-xl border-4 border-white bg-white shadow-md">
                          <img src="https://i.pravatar.cc/150?img=5" className="w-full h-full rounded-lg" alt="Me" />
                      </div>
                  </Link>
                  <div className="bg-rejimde-blue text-white px-8 py-4 rounded-xl shadow-lg text-center relative z-10">
                      <span className="absolute -top-3 left-1/2 -ml-3 w-6 h-6 bg-rejimde-blue transform rotate-45"></span>
                      <h3 className="text-2xl font-black uppercase">Safir Ligi</h3>
                      <p className="text-sm font-bold text-blue-100 mb-2">Mevcut Ligin</p>
                      <div className="inline-block bg-black/20 px-3 py-1 rounded text-xs font-bold">
                          <i className="fa-solid fa-clock mr-1"></i> Bitiş: 2 Gün
                      </div>
                      <div className="mt-3">
                          <Link href="/leagues/sapphire" className="block w-full bg-white text-rejimde-blue px-4 py-2 rounded-lg font-extrabold text-xs uppercase hover:bg-blue-50 transition">
                              Sıralamayı Gör
                          </Link>
                      </div>
                  </div>
              </div>

              {/* LEVEL 2: GOLD (Passed) */}
              <div className="flex flex-col items-center opacity-80">
                  <div className="w-24 h-24 bg-rejimde-yellow rounded-3xl border-4 border-white flex items-center justify-center shadow-md mb-4 z-10">
                      <i className="fa-solid fa-crown text-4xl text-white"></i>
                      <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px]">
                          <i className="fa-solid fa-check"></i>
                      </div>
                  </div>
                  <div className="bg-white px-5 py-2 rounded-xl border-2 border-gray-200 text-center shadow-sm">
                      <h3 className="text-lg font-black text-gray-500 uppercase">Altın Ligi</h3>
                  </div>
              </div>

              {/* LEVEL 1: BRONZE (Passed) */}
              <div className="flex flex-col items-center opacity-60">
                  <div className="w-20 h-20 bg-[#cd7f32] rounded-3xl border-4 border-white flex items-center justify-center shadow-md mb-4 z-10">
                      <i className="fa-solid fa-medal text-3xl text-white"></i>
                      <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px]">
                          <i className="fa-solid fa-check"></i>
                      </div>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-xl border-2 border-gray-200 text-center shadow-sm">
                      <h3 className="text-base font-black text-gray-400 uppercase">Bronz Ligi</h3>
                  </div>
              </div>

          </div>

      </div>
    </div>
  );
}