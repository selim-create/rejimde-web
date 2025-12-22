'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/api';

// Renkleri "safelist" mantığıyla tam sınıf adlarıyla tanımlıyoruz ki Tailwind atlamasın
const LEAGUES: Record<string, any> = {
  bronze: { 
      name: 'Bronz', 
      longName: 'Bronz Ligi', 
      color: 'text-amber-700', 
      bg: 'bg-gradient-to-br from-amber-600 to-orange-700', // Daha koyu/belirgin renkler
      border: 'border-amber-700', 
      icon: 'fa-medal' 
  },
  silver: { 
      name: 'Gümüş', 
      longName: 'Gümüş Ligi', 
      color: 'text-slate-600', 
      bg: 'bg-gradient-to-br from-slate-400 to-slate-600', 
      border: 'border-slate-500', 
      icon: 'fa-medal' 
  },
  gold: { 
      name: 'Altın', 
      longName: 'Altın Ligi', 
      color: 'text-yellow-600', 
      bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600', 
      border: 'border-yellow-500', 
      icon: 'fa-crown' 
  },
  sapphire: { 
      name: 'Safir', 
      longName: 'Safir Ligi', 
      color: 'text-blue-600', 
      bg: 'bg-gradient-to-br from-blue-500 to-indigo-600', 
      border: 'border-blue-700', 
      icon: 'fa-gem' 
  },
  ruby: { 
      name: 'Yakut', 
      longName: 'Yakut Ligi', 
      color: 'text-red-600', 
      bg: 'bg-gradient-to-br from-red-500 to-rose-700', 
      border: 'border-red-700', 
      icon: 'fa-gem' 
  },
  diamond: { 
      name: 'Elmas', 
      longName: 'Elmas Ligi', 
      color: 'text-cyan-600', 
      bg: 'bg-gradient-to-br from-cyan-400 to-blue-500', 
      border: 'border-cyan-600', 
      icon: 'fa-gem' 
  },
};

const LEAGUE_ORDER = ['diamond', 'ruby', 'sapphire', 'gold', 'silver', 'bronze'];

export default function LeagueDetailPage() {
  const params = useParams();
  const router = useRouter();
  // Slug undefined gelirse varsayılan olarak 'bronze' yap
  const slug = (params.slug as string) || 'bronze';
  
  // Eğer geçersiz bir slug geldiyse 'bronze'a fallback yap
  const leagueKey = LEAGUES[slug] ? slug : 'bronze';
  const leagueInfo = LEAGUES[leagueKey];

  const [activeTab, setActiveTab] = useState<'users' | 'clans'>('users');
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState('...');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const me = await auth.me();
        setCurrentUser(me);

        // Lig verilerini çek
        const data = await auth.getLeaderboard(activeTab, 50);
        
        // Veriyi filtrele (Sadece puanı 0'dan büyük olanları göster - Hayaletleri temizle)
        // Eğer backend zaten sıralı ve temiz veriyorsa bu filtreyi kaldırabilirsin.
        const cleanList = data.filter((item: any) => item.score >= 0); 
        
        setList(cleanList);
      } catch (error) {
        console.error('Veri hatası:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Geri Sayım
    const calculateTimeLeft = () => {
        const now = new Date();
        const endOfWeek = new Date();
        endOfWeek.setDate(now.getDate() + (7 - now.getDay())); 
        endOfWeek.setHours(23, 59, 59, 999);
        
        const diff = endOfWeek.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        setTimeLeft(`${days}G : ${hours}S`);
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [slug, activeTab]);

  return (
    <div className="min-h-screen pb-20 font-sans text-gray-800 bg-gray-50">
      
      {/* Header Banner */}
      <div className={`${leagueInfo.bg} text-white py-12 relative overflow-hidden mb-8 transition-colors duration-500 shadow-md`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '20px 20px'}}></div>
          
          <div className="max-w-6xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-bounce-slow backdrop-blur-sm">
                      <i className={`fa-solid ${leagueInfo.icon} text-5xl text-white drop-shadow-md`}></i>
                  </div>
                  <div className="text-center md:text-left">
                      <h1 className="text-4xl font-extrabold uppercase tracking-wide drop-shadow-sm">{leagueInfo.longName}</h1>
                      <p className="text-white/90 font-bold text-lg">En iyilerin yarıştığı arena.</p>
                  </div>
              </div>
              
              <div className="bg-black/20 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-sm text-center min-w-[200px]">
                  <p className="text-xs font-bold text-white/70 uppercase mb-1">Ligin Bitimine</p>
                  <div className="text-2xl font-black font-mono tracking-widest text-white">
                      {timeLeft}
                  </div>
              </div>
          </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT SIDEBAR: Tier Progress */}
          <div className="hidden lg:block lg:col-span-3">
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-4 sticky top-24 shadow-sm">
                  <h3 className="font-extrabold text-gray-400 text-xs uppercase mb-4 text-center">Lig Seviyeleri</h3>
                  
                  <div className="space-y-4 relative py-2">
                      {/* Connector Line */}
                      <div className="absolute left-1/2 top-4 bottom-4 w-1 bg-gray-100 -ml-0.5 z-0"></div>

                      {LEAGUE_ORDER.map((key) => {
                          const info = LEAGUES[key];
                          const isActive = key === leagueKey;
                          
                          // Görsel durumlar
                          const currentIndex = LEAGUE_ORDER.indexOf(leagueKey);
                          const thisIndex = LEAGUE_ORDER.indexOf(key);
                          const isLocked = thisIndex < currentIndex;
                          
                          return (
                            <div 
                                key={key} 
                                onClick={() => router.push(`/leagues/${key}`)}
                                className={`relative z-10 flex flex-col items-center cursor-pointer group transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
                            >
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl border-2 border-white transition-transform group-hover:-translate-y-1 shadow-md 
                                    ${isActive 
                                        ? `${info.bg} shadow-lg` 
                                        : isLocked 
                                            ? 'bg-gray-300' 
                                            : `${info.bg}`
                                    }`}
                                >
                                    <i className={`fa-solid ${info.icon}`}></i>
                                </div>
                                <span className={`text-xs font-black mt-1 uppercase ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                                    {info.name}
                                </span>
                            </div>
                          );
                      })}
                  </div>
              </div>
          </div>

          {/* CENTER: Leaderboard */}
          <div className="lg:col-span-6">
              
              {/* TABS */}
              <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 flex mb-6">
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`flex-1 py-2 rounded-lg font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'users' 
                        ? 'bg-gray-800 text-white shadow-md' 
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                >
                    <i className="fa-solid fa-user"></i> Bireysel
                </button>
                <button 
                    onClick={() => setActiveTab('clans')}
                    className={`flex-1 py-2 rounded-lg font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'clans' 
                        ? 'bg-gray-800 text-white shadow-md' 
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                >
                    <i className="fa-solid fa-users"></i> Klanlar
                </button>
              </div>

              {/* PODIUM & LIST CONTAINER */}
              {/* Burayı birleştirdik: Eğer veri varsa göster, yoksa empty state */}
              {loading ? (
                   <div className="flex flex-col items-center justify-center h-64 text-gray-300">
                       <i className="fa-solid fa-circle-notch fa-spin text-4xl mb-4"></i>
                       <p className="font-bold">Sıralama Yükleniyor...</p>
                   </div>
              ) : list.length > 0 ? (
                <>
                    {/* PODIUM (Esnek: 1, 2 veya 3 kişi varsa da çalışır) */}
                    <div className="flex items-end justify-center gap-4 mb-8 h-48">
                        {/* 2nd Place (Varsa) */}
                        {list.length >= 2 && (
                            <div className="flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform">
                                <div className="relative">
                                    <img src={list[1].avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${list[1].name}`} className="w-16 h-16 rounded-2xl border-4 border-gray-200 bg-white shadow-md" alt="2nd" />
                                    <div className="absolute -bottom-2 -right-2 bg-gray-200 text-gray-500 w-6 h-6 rounded-full flex items-center justify-center font-black text-xs border-2 border-white">2</div>
                                </div>
                                <div className="text-xs font-bold text-gray-600 mt-2 mb-1 max-w-[80px] truncate">{list[1].name}</div>
                                <div className="text-green-600 font-black text-sm">{list[1].score} P</div>
                                <div className="w-20 h-24 bg-gray-100 rounded-t-lg mt-2 border-t-4 border-gray-200 shadow-inner"></div>
                            </div>
                        )}

                        {/* 1st Place (Her zaman var) */}
                        <div className="flex flex-col items-center z-10 -mb-2 group cursor-pointer hover:-translate-y-2 transition-transform">
                            <i className="fa-solid fa-crown text-yellow-400 text-3xl mb-1 animate-bounce"></i>
                            <div className="relative">
                                <img src={list[0].avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${list[0].name}`} className={`w-20 h-20 rounded-2xl border-4 bg-white shadow-[0_0_20px_rgba(255,200,0,0.4)] ${leagueInfo.border.replace('border-', 'border-')}`} alt="1st" />
                                <div className={`absolute -bottom-2 -right-2 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 border-white ${leagueInfo.bg}`}>1</div>
                            </div>
                            <div className="text-sm font-black text-gray-800 mt-2 mb-1 max-w-[100px] truncate">{list[0].name}</div>
                            <div className="text-green-600 font-black text-lg">{list[0].score} P</div>
                            <div className={`w-24 h-32 rounded-t-lg mt-2 border-t-4 shadow-lg bg-opacity-10 ${leagueInfo.bg.replace('bg-', 'bg-opacity-10 ')} ${leagueInfo.border}`}></div>
                        </div>

                        {/* 3rd Place (Varsa) */}
                        {list.length >= 3 && (
                            <div className="flex flex-col items-center group cursor-pointer hover:-translate-y-1 transition-transform">
                                <div className="relative">
                                    <img src={list[2].avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${list[2].name}`} className="w-16 h-16 rounded-2xl border-4 border-orange-200 bg-white shadow-md" alt="3rd" />
                                    <div className="absolute -bottom-2 -right-2 bg-orange-200 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center font-black text-xs border-2 border-white">3</div>
                                </div>
                                <div className="text-xs font-bold text-gray-600 mt-2 mb-1 max-w-[80px] truncate">{list[2].name}</div>
                                <div className="text-green-600 font-black text-sm">{list[2].score} P</div>
                                <div className="w-20 h-16 bg-orange-50 rounded-t-lg mt-2 border-t-4 border-orange-200 shadow-inner"></div>
                            </div>
                        )}
                    </div>

                    {/* REST OF THE LIST */}
                    {/* Eğer 4. kişi ve sonrası varsa liste gösterilir */}
                    {list.length > 3 && (
                        <div className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden shadow-card relative min-h-[100px]">
                            <div className="bg-green-50 px-4 py-2 flex items-center gap-2 border-b border-green-100">
                                <i className="fa-solid fa-arrow-up text-green-600 text-sm"></i>
                                <span className="text-xs font-extrabold text-green-600 uppercase">Yükselme Hattı (İlk 5)</span>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {list.slice(3).map((item, index) => {
                                    const rank = index + 4;
                                    const isMe = activeTab === 'users' && currentUser && currentUser.id === item.id;
                                    
                                    return (
                                        <div 
                                            key={item.id} 
                                            className={`flex items-center p-4 hover:bg-gray-50 transition ${isMe ? 'bg-blue-50/50 border-l-4 border-blue-500 relative shadow-inner pl-3' : ''}`}
                                            style={rank <= 5 ? {background: 'linear-gradient(180deg, rgba(88, 204, 2, 0.05) 0%, rgba(255, 255, 255, 0) 100%)'} : {}}
                                        >
                                            <span className={`font-black w-8 text-center text-lg ${rank <= 5 ? 'text-green-600' : 'text-gray-400'}`}>{rank}</span>
                                            <img src={item.avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${item.name}`} className={`w-10 h-10 rounded-xl bg-gray-200 mr-4 ${isMe ? 'border-2 border-blue-500 bg-white' : ''}`} alt="" />
                                            <div className="flex-1">
                                                <p className={`font-bold ${isMe ? 'text-blue-900' : 'text-gray-700'}`}>
                                                    {item.name} {isMe && <span className="font-black text-blue-500 ml-1">SEN</span>}
                                                </p>
                                                {isMe && rank > 5 && (
                                                    <p className="text-[10px] text-gray-500 font-bold">Yükselmek için +{(list[4]?.score - item.score) + 1} puan lazım!</p>
                                                )}
                                                {rank === 5 && (
                                                    <p className="text-[10px] text-green-600 font-bold">Sınırda 🔥</p>
                                                )}
                                            </div>
                                            <div className={`font-black ${isMe ? 'text-blue-600' : 'text-gray-400'}`}>{item.score} P</div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* DEMOTION ZONE INDICATOR */}
                            {list.length > 10 && (
                                <div className="bg-red-50 px-4 py-2 flex items-center gap-2 border-t border-red-100 mt-2">
                                    <i className="fa-solid fa-arrow-down text-red-500 text-sm"></i>
                                    <span className="text-xs font-extrabold text-red-500 uppercase">Düşme Hattı (Son 5)</span>
                                </div>
                            )}
                        </div>
                    )}
                </>
              ) : (
                <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 text-center text-gray-400">
                    <i className="fa-solid fa-ghost text-4xl mb-4 opacity-50"></i>
                    <p className="font-bold">Henüz bu ligde kimse yok.<br/>İlk sen ol!</p>
                </div>
              )}

          </div>

          {/* RIGHT SIDEBAR: Motivation & Rewards */}
          <div className="lg:col-span-3 space-y-6">
              
              {/* Rules Card */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-extrabold text-gray-700 text-sm uppercase mb-4">Lig Kuralları</h3>
                  <ul className="space-y-3">
                      <li className="flex gap-3 text-xs font-bold text-gray-500">
                          <i className="fa-solid fa-arrow-up text-green-500 text-lg shrink-0"></i>
                          <span>İlk 5 kişi pazar gecesi <span className="text-green-600">Üst Lige</span> yükselir.</span>
                      </li>
                      <li className="flex gap-3 text-xs font-bold text-gray-500">
                          <i className="fa-solid fa-arrow-down text-red-500 text-lg shrink-0"></i>
                          <span>Son 5 kişi <span className="text-red-500">Alt Lige</span> düşer.</span>
                      </li>
                  </ul>
              </div>

              {/* Reward Card */}
              <div className="bg-purple-600 rounded-3xl p-6 text-white text-center shadow-lg relative overflow-hidden group cursor-pointer transition-transform hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
                  
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-white/30 group-hover:scale-110 transition backdrop-blur-sm">
                      <i className="fa-solid fa-gift text-3xl"></i>
                  </div>
                  <h3 className="font-extrabold text-lg mb-1">Şampiyon Ödülü</h3>
                  <p className="text-purple-100 text-xs font-bold mb-4">Ligi 1. bitiren kişi kazanır!</p>
                  <div className="bg-white text-purple-600 font-black text-sm py-2 rounded-xl shadow-sm uppercase">
                      5000 Puan
                  </div>
              </div>

          </div>

      </div>
    </div>
  );
}