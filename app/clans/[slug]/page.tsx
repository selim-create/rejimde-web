"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function ClanDetailPage() {
  const params = useParams();
  // Gerçekte params.slug ile API'den klan verisi çekilir
  // Şimdilik dummy data kullanıyoruz

  return (
    <div className="min-h-screen pb-20 font-sans text-rejimde-text">
      
      {/* Navbar is in layout */}

      {/* CLAN HEADER (Hero) */}
      <div className="bg-rejimde-purple text-white py-8 relative overflow-hidden mb-8 shadow-card">
          <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 2px, transparent 2px)', backgroundSize: '20px 20px'}}></div>
          
          <div className="max-w-6xl mx-auto px-4 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-8">
                  
                  {/* Clan Logo */}
                  <div className="relative group cursor-pointer">
                      <div className="w-32 h-32 bg-white/20 rounded-3xl flex items-center justify-center border-4 border-white/30 shadow-[0_0_20px_rgba(206,130,255,0.5)] backdrop-blur-sm group-hover:scale-105 transition">
                          <i className="fa-solid fa-ring text-6xl text-white drop-shadow-md"></i>
                      </div>
                      <div className="absolute -bottom-3 -right-3 bg-rejimde-yellow border-4 border-rejimde-purple w-12 h-12 rounded-full flex items-center justify-center font-black text-rejimde-text text-sm shadow-md">
                          LVL 5
                      </div>
                  </div>

                  {/* Info */}
                  <div className="text-center md:text-left flex-1">
                      <div className="flex flex-col md:flex-row items-center gap-3 mb-2 justify-center md:justify-start">
                          <h1 className="text-4xl font-extrabold uppercase tracking-wide">Düğün Tayfası</h1>
                          <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-bold uppercase border border-white/10">
                              <i className="fa-solid fa-users mr-1"></i> 12/15 Üye
                          </span>
                      </div>
                      <p className="text-purple-100 font-bold text-lg italic mb-6">&quot;O gelinlik o bele girecek! 💪&quot;</p>
                      
                      <div className="flex gap-3 justify-center md:justify-start">
                          <button className="bg-white text-rejimde-purple px-6 py-3 rounded-xl font-extrabold uppercase text-sm shadow-btn shadow-purple-900/20 btn-game flex items-center gap-2 hover:bg-purple-50">
                              <i className="fa-solid fa-gear"></i> Ayarlar
                          </button>
                          <button className="bg-rejimde-purpleDark text-white border-2 border-white/20 px-6 py-3 rounded-xl font-extrabold uppercase text-sm btn-game hover:bg-purple-900/50 flex items-center gap-2">
                              <i className="fa-solid fa-user-plus"></i> Üye Davet Et
                          </button>
                      </div>
                  </div>

                  {/* Clan Score */}
                  <div className="bg-black/20 px-8 py-4 rounded-2xl border border-white/10 backdrop-blur-sm text-center min-w-[150px]">
                      <p className="text-xs font-bold text-purple-200 uppercase mb-1">Toplam Puan</p>
                      <div className="text-3xl font-black font-mono tracking-widest text-white">
                          42.850
                      </div>
                      <div className="text-xs font-bold text-rejimde-green mt-1 bg-white/10 rounded px-2 py-1 inline-block">
                          <i className="fa-solid fa-arrow-trend-up"></i> Ligde 3.
                      </div>
                  </div>

              </div>
          </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: Clan Quest (Co-op) */}
          <div className="lg:col-span-8 space-y-8">
              
              {/* ACTIVE QUEST CARD */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 relative overflow-hidden shadow-card group hover:border-rejimde-green transition">
                  <div className="absolute top-0 right-0 bg-rejimde-green text-white text-xs font-black px-4 py-2 rounded-bl-2xl uppercase shadow-sm">
                      Haftalık Görev
                  </div>
                  
                  <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-rejimde-green text-3xl group-hover:scale-110 transition border-2 border-green-200">
                          <i className="fa-solid fa-shoe-prints"></i>
                      </div>
                      <div>
                          <h2 className="text-xl font-extrabold text-gray-800">Büyük Yürüyüş</h2>
                          <p className="text-gray-500 font-bold text-sm">Klan olarak toplam <span className="text-rejimde-text font-extrabold">500.000 adım</span> atın.</p>
                          <p className="text-xs font-bold text-gray-400 mt-1">
                              <i className="fa-regular fa-clock"></i> Bitiş: 2 Gün 14 Saat
                          </p>
                      </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-8 bg-gray-200 rounded-full mb-2 border-2 border-gray-100 overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-rejimde-green flex items-center justify-center text-white text-xs font-black tracking-wider transition-all duration-1000" style={{width: '75%'}}>
                          <div className="w-full h-full opacity-20 absolute top-0 left-0 animate-[pulse_2s_infinite]" style={{backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMjBMMjAgMEgwTDIwIDIwIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwKSIvPjwvc3ZnPg==')"}}></div>
                      </div>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-gray-600 mix-blend-multiply z-10">
                          375.000 / 500.000
                      </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                      <div className="flex -space-x-3">
                          <img src="https://i.pravatar.cc/150?img=12" className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" title="Katkı: 50k" alt="" />
                          <img src="https://i.pravatar.cc/150?img=32" className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" title="Katkı: 42k" alt="" />
                          <img src="https://i.pravatar.cc/150?img=5" className="w-8 h-8 rounded-full border-2 border-rejimde-green bg-gray-200" title="Sen: 12k" alt="" />
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500">+8</div>
                      </div>
                      <div className="text-right">
                          <span className="text-xs font-bold text-gray-400 uppercase">Ödül</span>
                          <div className="flex items-center gap-1 text-rejimde-yellowDark font-black">
                              <i className="fa-solid fa-gem"></i> 1000 Elmas
                          </div>
                      </div>
                  </div>
              </div>

              {/* MEMBER LIST (Leaderboard Style) */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden shadow-card">
                  <div className="bg-gray-50 px-6 py-4 border-b-2 border-gray-100 flex justify-between items-center">
                      <h3 className="font-extrabold text-gray-700 uppercase text-sm">Üye Sıralaması</h3>
                      <div className="flex gap-2">
                          <button className="text-xs font-bold text-rejimde-blue bg-blue-50 px-3 py-1 rounded-lg">Bu Hafta</button>
                          <button className="text-xs font-bold text-gray-400 hover:bg-gray-100 px-3 py-1 rounded-lg">Genel</button>
                      </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                      {/* Member 1 (Leader) */}
                      <div className="flex items-center px-6 py-4 hover:bg-gray-50 transition">
                          <span className="font-black text-gray-300 w-6 text-lg text-center">1</span>
                          <div className="relative mr-4">
                              <img src="https://i.pravatar.cc/150?img=12" className="w-12 h-12 rounded-2xl bg-gray-200" alt="Leader" />
                              <i className="fa-solid fa-crown text-rejimde-yellow absolute -top-3 -right-2 text-xl drop-shadow-sm transform rotate-12"></i>
                          </div>
                          <div className="flex-1">
                              <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-gray-800">FitGörümce</span>
                                  <span className="text-[10px] bg-rejimde-purple text-white px-1.5 py-0.5 rounded uppercase font-bold">Lider</span>
                              </div>
                              <span className="text-xs font-bold text-gray-400">950 Puan Katkı</span>
                          </div>
                          <div className="text-right">
                              <button className="text-gray-300 hover:text-rejimde-red transition text-xl" title="Dürt">
                                  <i className="fa-solid fa-hand-point-up"></i>
                              </button>
                          </div>
                      </div>

                      {/* Member 2 (You) */}
                      <div className="flex items-center px-6 py-4 bg-green-50/50 border-l-4 border-rejimde-green">
                          <span className="font-black text-rejimde-green w-6 text-lg text-center">2</span>
                          <div className="relative mr-4">
                              <img src="https://i.pravatar.cc/150?img=5" className="w-12 h-12 rounded-2xl bg-white border-2 border-rejimde-green" alt="You" />
                          </div>
                          <div className="flex-1">
                              <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-rejimde-green">SEN</span>
                              </div>
                              <span className="text-xs font-bold text-gray-500">850 Puan Katkı</span>
                          </div>
                      </div>

                      {/* Member 3 (Lazy) */}
                      <div className="flex items-center px-6 py-4 hover:bg-gray-50 transition opacity-60">
                          <span className="font-black text-gray-300 w-6 text-lg text-center">12</span>
                          <div className="relative mr-4">
                              <img src="https://i.pravatar.cc/150?img=65" className="w-12 h-12 rounded-2xl bg-gray-200 grayscale" alt="Lazy" />
                              <div className="absolute -bottom-1 -right-1 bg-gray-400 text-white text-[10px] px-1 rounded font-bold">zzZ</div>
                          </div>
                          <div className="flex-1">
                              <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-gray-600">DiyetBozan</span>
                              </div>
                              <span className="text-xs font-bold text-gray-400">0 Puan (3 gündür yok)</span>
                          </div>
                          <div className="text-right">
                              <button className="text-rejimde-red hover:scale-110 transition btn-game text-xl" title="Uyar">
                                  <i className="fa-solid fa-bell"></i>
                              </button>
                          </div>
                      </div>
                  </div>
                  
                  <button className="w-full py-3 text-center text-xs font-bold text-gray-400 hover:bg-gray-50 uppercase tracking-wide">
                      Tüm Üyeleri Gör (12)
                  </button>
              </div>

          </div>

          {/* RIGHT: Chat & Info */}
          <div className="lg:col-span-4 space-y-6">
              
              {/* CLAN CHAT */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl flex flex-col h-[500px] shadow-card">
                  <div className="p-4 border-b-2 border-gray-100 flex justify-between items-center">
                      <h3 className="font-extrabold text-gray-700 uppercase text-sm">Klan Sohbeti</h3>
                      <span className="w-2 h-2 bg-rejimde-green rounded-full animate-pulse"></span>
                  </div>
                  
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar">
                      
                      {/* Msg 1 */}
                      <div className="flex gap-3">
                          <img src="https://i.pravatar.cc/150?img=12" className="w-8 h-8 rounded-lg bg-gray-200 shrink-0 mt-1" alt="Avatar" />
                          <div>
                              <span className="text-[10px] font-black text-gray-400 block mb-0.5">FitGörümce</span>
                              <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none text-xs font-bold text-gray-600 shadow-sm">
                                  Kızlar yarınki tartı gününü unutmayın! Akşam hafif yiyelim. 🥗
                              </div>
                          </div>
                      </div>

                      {/* Msg 2 */}
                      <div className="flex gap-3">
                          <img src="https://i.pravatar.cc/150?img=32" className="w-8 h-8 rounded-lg bg-gray-200 shrink-0 mt-1" alt="Avatar" />
                          <div>
                              <span className="text-[10px] font-black text-gray-400 block mb-0.5">DamatBey</span>
                              <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none text-xs font-bold text-gray-600 shadow-sm">
                                  Ben bugün kaçırdım biraz ya... 🍕
                              </div>
                          </div>
                      </div>

                      {/* System Msg */}
                      <div className="flex justify-center my-2">
                          <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[10px] font-bold">
                              🏆 Klanımız Safir Ligine Yükseldi!
                          </div>
                      </div>

                      {/* Msg 3 (Me) */}
                      <div className="flex gap-3 flex-row-reverse">
                          <img src="https://i.pravatar.cc/150?img=5" className="w-8 h-8 rounded-lg bg-gray-200 shrink-0 mt-1" alt="Avatar" />
                          <div>
                              <div className="bg-rejimde-blue text-white p-3 rounded-2xl rounded-tr-none text-xs font-bold shadow-sm">
                                  Merak etme DamatBey, yürüyüşle telafi ederiz! 🏃‍♂️
                              </div>
                          </div>
                      </div>

                  </div>

                  {/* Input Area */}
                  <div className="p-3 bg-white rounded-b-3xl">
                      <div className="relative">
                          <input type="text" placeholder="Mesaj yaz..." className="w-full bg-gray-100 border-2 border-transparent focus:border-rejimde-blue rounded-xl text-xs font-bold pl-4 pr-10 py-3 outline-none transition" />
                          <button className="absolute right-2 top-2 text-white bg-rejimde-blue w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-500 transition btn-game shadow-sm">
                              <i className="fa-solid fa-paper-plane text-xs"></i>
                          </button>
                      </div>
                  </div>
              </div>

              {/* LEAVE BUTTON (Danger Zone) */}
              <button className="w-full border-2 border-gray-200 text-gray-400 py-3 rounded-xl font-extrabold uppercase text-xs hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition flex items-center justify-center gap-2">
                  <i className="fa-solid fa-arrow-right-from-bracket"></i> Klandan Ayrıl
              </button>

          </div>

      </div>

    </div>
  );
}