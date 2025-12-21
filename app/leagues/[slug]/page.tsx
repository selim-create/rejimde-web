"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function LeagueDetailPage() {
  const params = useParams();
  
  return (
    <div className="min-h-screen pb-20 font-sans text-rejimde-text">
      
      {/* Header Banner */}
      <div className="bg-rejimde-blue text-white py-8 relative overflow-hidden mb-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '20px 20px'}}></div>
          
          <div className="max-w-6xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-bounce-slow">
                      <i className="fa-solid fa-gem text-5xl text-white drop-shadow-md"></i>
                  </div>
                  <div>
                      <h1 className="text-4xl font-extrabold uppercase tracking-wide">Safir Ligi</h1>
                      <p className="text-blue-100 font-bold text-lg">En iyilerin yarıştığı arena.</p>
                  </div>
              </div>
              
              <div className="bg-black/20 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-sm text-center">
                  <p className="text-xs font-bold text-blue-200 uppercase mb-1">Ligin Bitimine</p>
                  <div className="text-2xl font-black font-mono tracking-widest">
                      02<span className="text-sm">G</span> : 14<span className="text-sm">S</span> : 25<span className="text-sm">D</span>
                  </div>
              </div>
          </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT SIDEBAR: Tier Progress */}
          <div className="hidden lg:block lg:col-span-3">
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-4 sticky top-24">
                  <h3 className="font-extrabold text-gray-400 text-xs uppercase mb-4 text-center">Lig Seviyeleri</h3>
                  
                  <div className="space-y-2 relative">
                      {/* Connector Line */}
                      <div className="absolute left-1/2 top-4 bottom-4 w-1 bg-gray-100 -ml-0.5 z-0"></div>

                      {/* Diamond (Locked) */}
                      <div className="relative z-10 flex flex-col items-center grayscale opacity-50">
                          <div className="w-12 h-12 bg-rejimde-blue rounded-xl flex items-center justify-center text-white text-xl shadow-btn shadow-rejimde-blueDark border-2 border-white">
                              <i className="fa-solid fa-gem"></i>
                          </div>
                          <span className="text-xs font-bold text-gray-400 mt-1">Elmas</span>
                      </div>

                      {/* Ruby (Locked) */}
                      <div className="relative z-10 flex flex-col items-center grayscale opacity-50 mt-4">
                          <div className="w-12 h-12 bg-rejimde-red rounded-xl flex items-center justify-center text-white text-xl shadow-btn shadow-rejimde-redDark border-2 border-white">
                              <i className="fa-solid fa-gem"></i>
                          </div>
                          <span className="text-xs font-bold text-gray-400 mt-1">Yakut</span>
                      </div>

                      {/* Sapphire (Active) */}
                      <div className="relative z-10 flex flex-col items-center mt-4 scale-110">
                          <div className="w-14 h-14 bg-rejimde-blue rounded-xl flex items-center justify-center text-white text-2xl shadow-btn shadow-rejimde-blueDark border-4 border-white ring-4 ring-blue-100">
                              <i className="fa-solid fa-gem"></i>
                          </div>
                          <span className="text-sm font-black text-rejimde-blue mt-1 bg-white px-2 rounded-full shadow-sm">Safir</span>
                      </div>

                      {/* Gold (Passed) */}
                      <div className="relative z-10 flex flex-col items-center mt-4 opacity-50">
                          <div className="w-10 h-10 bg-rejimde-yellow rounded-xl flex items-center justify-center text-white text-lg shadow-sm border-2 border-white">
                              <i className="fa-solid fa-crown"></i>
                          </div>
                          <span className="text-xs font-bold text-gray-400 mt-1">Altın</span>
                      </div>

                       {/* Silver (Passed) */}
                       <div className="relative z-10 flex flex-col items-center mt-4 opacity-50">
                          <div className="w-10 h-10 bg-gray-300 rounded-xl flex items-center justify-center text-white text-lg shadow-sm border-2 border-white">
                              <i className="fa-solid fa-medal"></i>
                          </div>
                          <span className="text-xs font-bold text-gray-400 mt-1">Gümüş</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* CENTER: Leaderboard */}
          <div className="lg:col-span-6">
              
              {/* Podium (Top 3 Visual) */}
              <div className="flex items-end justify-center gap-4 mb-8 h-48">
                  {/* 2nd Place */}
                  <div className="flex flex-col items-center">
                      <div className="relative">
                          <img src="https://i.pravatar.cc/150?img=12" className="w-16 h-16 rounded-2xl border-4 border-gray-200 bg-white" alt="2nd" />
                          <div className="absolute -bottom-2 -right-2 bg-gray-200 text-gray-500 w-6 h-6 rounded-full flex items-center justify-center font-black text-xs border-2 border-white">2</div>
                      </div>
                      <div className="text-xs font-bold text-gray-600 mt-2 mb-1">DamatBey</div>
                      <div className="text-rejimde-green font-black text-sm">1450 P</div>
                      <div className="w-20 h-24 bg-gray-100 rounded-t-lg mt-2 border-t-4 border-gray-200"></div>
                  </div>

                  {/* 1st Place */}
                  <div className="flex flex-col items-center z-10 -mb-2">
                      <i className="fa-solid fa-crown text-rejimde-yellow text-3xl mb-1 animate-bounce"></i>
                      <div className="relative">
                          <img src="https://i.pravatar.cc/150?img=32" className="w-20 h-20 rounded-2xl border-4 border-rejimde-yellow bg-white shadow-[0_0_20px_rgba(255,200,0,0.5)]" alt="1st" />
                          <div className="absolute -bottom-2 -right-2 bg-rejimde-yellow text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 border-white">1</div>
                      </div>
                      <div className="text-sm font-black text-gray-800 mt-2 mb-1">FitGörümce</div>
                      <div className="text-rejimde-green font-black text-lg">1890 P</div>
                      <div className="w-24 h-32 bg-yellow-50 rounded-t-lg mt-2 border-t-4 border-rejimde-yellow shadow-lg"></div>
                  </div>

                  {/* 3rd Place */}
                  <div className="flex flex-col items-center">
                      <div className="relative">
                          <img src="https://i.pravatar.cc/150?img=44" className="w-16 h-16 rounded-2xl border-4 border-orange-200 bg-white" alt="3rd" />
                          <div className="absolute -bottom-2 -right-2 bg-orange-200 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center font-black text-xs border-2 border-white">3</div>
                      </div>
                      <div className="text-xs font-bold text-gray-600 mt-2 mb-1">DytSelin</div>
                      <div className="text-rejimde-green font-black text-sm">1320 P</div>
                      <div className="w-20 h-16 bg-orange-50 rounded-t-lg mt-2 border-t-4 border-orange-200"></div>
                  </div>
              </div>

              {/* List Container */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden shadow-card relative">
                  
                  {/* PROMOTION ZONE INDICATOR */}
                  <div className="bg-green-50 px-4 py-2 flex items-center gap-2 border-b border-green-100">
                      <i className="fa-solid fa-arrow-up text-rejimde-green text-sm"></i>
                      <span className="text-xs font-extrabold text-rejimde-green uppercase">Yükselme Hattı (İlk 5)</span>
                  </div>

                  {/* List Items */}
                  <div className="divide-y divide-gray-100">
                      
                      {/* Rank 4 */}
                      <div className="flex items-center p-4 hover:bg-gray-50 transition" style={{background: 'linear-gradient(180deg, rgba(88, 204, 2, 0.1) 0%, rgba(255, 255, 255, 0) 100%)'}}>
                          <span className="font-black text-rejimde-green w-8 text-center text-lg">4</span>
                          <img src="https://i.pravatar.cc/150?img=8" className="w-10 h-10 rounded-xl bg-gray-200 mr-4" alt="" />
                          <div className="flex-1">
                              <p className="font-bold text-gray-700">SporcuAnne</p>
                          </div>
                          <div className="font-black text-gray-500">1250 P</div>
                      </div>

                      {/* Rank 5 (Edge of Promotion) */}
                      <div className="flex items-center p-4 hover:bg-gray-50 transition" style={{background: 'linear-gradient(180deg, rgba(88, 204, 2, 0.1) 0%, rgba(255, 255, 255, 0) 100%)'}}>
                          <span className="font-black text-rejimde-green w-8 text-center text-lg">5</span>
                          <img src="https://i.pravatar.cc/150?img=11" className="w-10 h-10 rounded-xl bg-gray-200 mr-4" alt="" />
                          <div className="flex-1">
                              <p className="font-bold text-gray-700">KoşanAdam</p>
                              <p className="text-[10px] text-rejimde-green font-bold">Seninle yarışıyor 🔥</p>
                          </div>
                          <div className="font-black text-gray-500">1100 P</div>
                      </div>

                      {/* Divider */}
                      <div className="h-1 bg-gray-100"></div>

                      {/* Rank 6 */}
                      <div className="flex items-center p-4 hover:bg-gray-50 transition">
                          <span className="font-bold text-gray-400 w-8 text-center">6</span>
                          <img src="https://i.pravatar.cc/150?img=3" className="w-10 h-10 rounded-xl bg-gray-200 mr-4 grayscale opacity-70" alt="" />
                          <div className="flex-1">
                              <p className="font-bold text-gray-700">DiyetBozan</p>
                          </div>
                          <div className="font-black text-gray-400">980 P</div>
                      </div>

                      {/* CURRENT USER (Sticky Highlight) */}
                      <div className="flex items-center p-4 bg-blue-50/50 border-l-4 border-rejimde-blue relative shadow-inner">
                          <span className="font-black text-rejimde-blue w-8 text-center text-xl">7</span>
                          <img src="https://i.pravatar.cc/150?img=5" className="w-12 h-12 rounded-xl bg-white border-2 border-rejimde-blue mr-4" alt="" />
                          <div className="flex-1">
                              <p className="font-black text-rejimde-blue text-lg">SEN</p>
                              <p className="text-xs text-gray-500 font-bold">Yükselmek için +250 Puan lazım!</p>
                          </div>
                          <div className="font-black text-rejimde-blue text-xl">850 P</div>
                          
                          {/* Tooltip */}
                          <div className="absolute right-16 -top-3 bg-rejimde-yellow text-white text-[10px] font-black px-2 py-1 rounded shadow-sm animate-bounce">
                              Suyu iç, geç!
                          </div>
                      </div>

                      {/* Rank 8 */}
                      <div className="flex items-center p-4 hover:bg-gray-50 transition">
                          <span className="font-bold text-gray-400 w-8 text-center">8</span>
                          <img src="https://i.pravatar.cc/150?img=60" className="w-10 h-10 rounded-xl bg-gray-200 mr-4 grayscale opacity-70" alt="" />
                          <div className="flex-1">
                              <p className="font-bold text-gray-700">LazyCat</p>
                          </div>
                          <div className="font-black text-gray-400">720 P</div>
                      </div>

                       {/* Divider */}
                       <div className="h-1 bg-gray-100"></div>

                      {/* DEMOTION ZONE INDICATOR */}
                      <div className="bg-red-50 px-4 py-2 flex items-center gap-2 border-t border-red-100">
                          <i className="fa-solid fa-arrow-down text-rejimde-red text-sm"></i>
                          <span className="text-xs font-extrabold text-rejimde-red uppercase">Düşme Hattı (Son 5)</span>
                      </div>

                      {/* Rank 25 (Example of bottom) */}
                      <div className="flex items-center p-4 hover:bg-gray-50 transition opacity-70" style={{background: 'linear-gradient(0deg, rgba(255, 75, 75, 0.1) 0%, rgba(255, 255, 255, 0) 100%)'}}>
                          <span className="font-black text-rejimde-red w-8 text-center">25</span>
                          <img src="https://i.pravatar.cc/150?img=65" className="w-10 h-10 rounded-xl bg-gray-200 mr-4 grayscale" alt="" />
                          <div className="flex-1">
                              <p className="font-bold text-gray-700">YarınBaşlarım</p>
                          </div>
                          <div className="font-black text-gray-400">120 P</div>
                      </div>

                  </div>
              </div>
          </div>

          {/* RIGHT SIDEBAR: Motivation & Rewards */}
          <div className="lg:col-span-3 space-y-6">
              
              {/* Rules Card */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
                  <h3 className="font-extrabold text-gray-700 text-sm uppercase mb-4">Lig Kuralları</h3>
                  <ul className="space-y-3">
                      <li className="flex gap-3 text-xs font-bold text-gray-500">
                          <i className="fa-solid fa-arrow-up text-rejimde-green text-lg shrink-0"></i>
                          <span>İlk 5 kişi pazar gecesi <span className="text-rejimde-red">Yakut Ligi&apos;ne</span> yükselir.</span>
                      </li>
                      <li className="flex gap-3 text-xs font-bold text-gray-500">
                          <i className="fa-solid fa-arrow-down text-rejimde-red text-lg shrink-0"></i>
                          <span>Son 5 kişi <span className="text-rejimde-yellow">Altın Ligi&apos;ne</span> düşer.</span>
                      </li>
                  </ul>
              </div>

              {/* Reward Card */}
              <div className="bg-rejimde-purple rounded-3xl p-6 text-white text-center shadow-float relative overflow-hidden group cursor-pointer">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
                  
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-white/30 group-hover:scale-110 transition">
                      <i className="fa-solid fa-gift text-3xl"></i>
                  </div>
                  <h3 className="font-extrabold text-lg mb-1">Şampiyon Ödülü</h3>
                  <p className="text-purple-100 text-xs font-bold mb-4">Ligi 1. bitiren kişi kazanır!</p>
                  <div className="bg-white text-rejimde-purple font-black text-sm py-2 rounded-xl shadow-btn shadow-purple-900/30 uppercase">
                      500 TL Hediye Çeki
                  </div>
              </div>

          </div>

      </div>
    </div>
  );
}