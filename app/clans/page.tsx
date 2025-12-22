'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutWrapper from '@/components/LayoutWrapper';
import { auth } from '@/lib/api';

export default function ClansPage() {
  const router = useRouter();
  const [clans, setClans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userClan, setUserClan] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await auth.me();
        if (userRes && userRes.clan) {
            setUserClan(userRes.clan);
        }
        const clansRes = await auth.getClans();
        setClans(clansRes);
      } catch (error) {
        console.error('Veri çekilemedi', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Arama filtresi
  const filteredClans = clans.filter(clan => 
    clan.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (clan.description && clan.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 font-sans text-gray-800 bg-gray-50">
      
      {/* HEADER & SEARCH AREA */}
      <div className="bg-purple-600 text-white pt-12 pb-16 relative overflow-hidden rounded-b-[3rem] shadow-lg mb-10">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.3) 2px, transparent 2px)', backgroundSize: '24px 24px'}}></div>
        
        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-sm">
                Klanını Bul, Gücüne Güç Kat
            </h1>
            <p className="text-purple-100 font-bold text-lg mb-8 max-w-2xl mx-auto opacity-90">
                Seninle aynı hedefe koşan insanlarla takım ol. Birlikte zayıflamak, tek başına zayıflamaktan %60 daha etkili.
            </p>

            <div className="max-w-xl mx-auto relative mb-8 group">
                <input 
                    type="text" 
                    placeholder="Klan adı veya etiket ara (Örn: Düğün, Koşu)..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-4 border-purple-400/50 focus:border-purple-300 rounded-2xl py-4 pl-14 pr-4 font-bold text-gray-600 outline-none transition text-lg shadow-lg placeholder:text-gray-300" 
                />
                <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 transform -translate-y-1/2 text-purple-400 text-xl group-focus-within:text-purple-600 transition-colors"></i>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
                <button className="bg-white text-purple-600 px-6 py-2 rounded-xl font-extrabold text-sm shadow-[0_4px_0_rgba(0,0,0,0.1)] hover:bg-purple-50 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all">
                    Tümü
                </button>
                <button className="bg-purple-700/50 border-2 border-white/20 text-white px-5 py-2 rounded-xl font-extrabold text-sm hover:bg-purple-700 hover:border-white/40 transition">
                    💍 Düğün Hazırlığı
                </button>
                <button className="bg-purple-700/50 border-2 border-white/20 text-white px-5 py-2 rounded-xl font-extrabold text-sm hover:bg-purple-700 hover:border-white/40 transition">
                    👔 Ofis Çalışanları
                </button>
                <button className="bg-purple-700/50 border-2 border-white/20 text-white px-5 py-2 rounded-xl font-extrabold text-sm hover:bg-purple-700 hover:border-white/40 transition">
                    👶 Yeni Anneler
                </button>
            </div>
        </div>
      </div>

      <LayoutWrapper>
        {/* CLANS GRID */}
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            
            {/* Create Clan Card */}
            <div 
                onClick={() => router.push('/clans/create')}
                className="bg-gray-100 border-4 border-dashed border-gray-300 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white hover:border-green-400 hover:shadow-xl transition-all duration-300 group h-full min-h-[340px]"
            >
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-gray-300 text-4xl mb-6 group-hover:text-green-500 group-hover:scale-110 transition-all duration-300 shadow-sm border-4 border-gray-100 group-hover:border-green-100">
                    <i className="fa-solid fa-plus"></i>
                </div>
                <h3 className="font-extrabold text-2xl text-gray-700 mb-3 group-hover:text-green-600 transition-colors">Kendi Klanını Kur</h3>
                <p className="text-sm font-bold text-gray-400 mb-8 px-4">
                    Arkadaşlarını topla, kuralları sen koy, liderlik et.
                </p>
                <button className="bg-white border-2 border-green-500 text-green-600 px-8 py-3 rounded-2xl font-extrabold text-sm uppercase shadow-sm group-hover:bg-green-500 group-hover:text-white group-hover:shadow-md transition-all">
                    Oluştur
                </button>
            </div>

            {/* My Clan Card (If exists) */}
            {userClan && (
               <div 
                  onClick={() => router.push(`/clans/${userClan.slug}`)}
                  className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-1 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer h-full min-h-[340px] flex flex-col"
               >
                  <div className="bg-white rounded-[1.3rem] h-full flex flex-col overflow-hidden relative">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                      <div className="absolute top-4 right-4 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">
                          Senin Klanın
                      </div>

                      <div className="pt-10 pb-6 px-6 flex flex-col items-center text-center flex-1">
                          <div className="w-24 h-24 rounded-3xl bg-indigo-50 flex items-center justify-center mb-4 shadow-inner border-4 border-white ring-4 ring-indigo-50 overflow-hidden">
                              {userClan.logo ? (
                                  <img src={userClan.logo} alt={userClan.name} className="w-full h-full object-cover" />
                              ) : (
                                  <i className="fa-solid fa-shield-cat text-4xl text-indigo-400"></i>
                              )}
                          </div>
                          
                          <h3 className="font-black text-2xl text-gray-800 mb-1 line-clamp-1">{userClan.name}</h3>
                          <p className="text-xs font-bold text-indigo-400 uppercase mb-6 tracking-wide">Lider</p>
                          
                          <div className="w-full mt-auto">
                              <div className="grid grid-cols-2 gap-2 mb-6 w-full">
                                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                      <div className="text-gray-400 text-[10px] font-black uppercase mb-1">Puan</div>
                                      <div className="text-indigo-600 font-black text-lg">{userClan.total_score || 0}</div>
                                  </div>
                                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                      <div className="text-gray-400 text-[10px] font-black uppercase mb-1">Sıra</div>
                                      <div className="text-gray-800 font-black text-lg">#4</div>
                                  </div>
                              </div>
                              <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-extrabold text-sm uppercase shadow-[0_4px_0_rgb(67,56,202)] hover:bg-indigo-700 hover:shadow-[0_2px_0_rgb(67,56,202)] hover:translate-y-[2px] transition-all">
                                  Klanına Git
                              </button>
                          </div>
                      </div>
                  </div>
               </div>
            )}

            {/* Dynamic Clan Cards */}
            {filteredClans.filter(c => !userClan || c.id !== userClan.id).map((clan) => (
                <div 
                    key={clan.id} 
                    onClick={() => router.push(`/clans/${clan.slug}`)}
                    className="bg-white border-2 border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-purple-400 transition-all duration-300 group flex flex-col h-full relative hover:-translate-y-2 cursor-pointer min-h-[340px]"
                >
                    {/* Banner Area */}
                    <div className="h-28 bg-purple-50 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(#d8b4fe 1px, transparent 1px)', backgroundSize: '12px 12px'}}></div>
                        
                        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center border-4 border-white shadow-lg absolute -bottom-10 z-10 overflow-hidden transform group-hover:scale-105 transition-transform duration-300">
                            {clan.logo ? (
                                <img src={clan.logo} alt={clan.name} className="w-full h-full object-cover" />
                            ) : (
                                <i className="fa-solid fa-shield text-4xl text-purple-200"></i>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="pt-14 pb-6 px-6 text-center flex-1 flex flex-col">
                        <h3 className="font-black text-xl text-gray-800 mb-1 group-hover:text-purple-600 transition-colors line-clamp-1">{clan.name}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-5 line-clamp-1">
                            {clan.description ? `"${clan.description.substring(0, 30)}..."` : '"Hedefe odaklan"'}
                        </p>
                        
                        {/* Stats */}
                        <div className="flex justify-center gap-4 mb-6 border-y-2 border-gray-50 py-4 bg-gray-50/50 rounded-xl">
                            <div className="text-center px-2">
                                <div className="font-black text-gray-800 text-lg">{clan.member_count}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Üye</div>
                            </div>
                            <div className="w-0.5 bg-gray-200 h-10 self-center"></div>
                            <div className="text-center px-2">
                                <div className="font-black text-green-500 text-lg">{clan.total_score}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Puan</div>
                            </div>
                        </div>

                        <div className="mt-auto space-y-2">
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${clan.privacy === 'invite_only' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                    <i className={`fa-solid ${clan.privacy === 'invite_only' ? 'fa-lock' : 'fa-globe'} mr-1`}></i>
                                    {clan.privacy === 'invite_only' ? 'Davetle' : 'Herkese Açık'}
                                </span>
                            </div>
                            <button className="w-full bg-purple-600 text-white py-3 rounded-xl font-extrabold text-sm uppercase shadow-[0_4px_0_rgb(107,33,168)] hover:bg-purple-700 hover:shadow-[0_2px_0_rgb(107,33,168)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all">
                                İncele
                            </button>
                        </div>
                    </div>
                </div>
            ))}

        </div>
      </LayoutWrapper>
    </div>
  );
}