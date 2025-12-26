"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { getExercisePlans } from "@/lib/api";
import { getSafeAvatarUrl, getUserProfileUrl } from "@/lib/helpers";
import MascotDisplay from "@/components/MascotDisplay";

const CATEGORIES = [
  { id: 'all', label: 'Tümü', icon: 'fa-layer-group' },
  { id: 'Kardiyo', label:  'Kardiyo', icon: 'fa-heart-pulse' },
  { id: 'Güç Antrenmanı', label: 'Güç', icon: 'fa-dumbbell' },
  { id: 'HIIT', label:  'HIIT', icon: 'fa-bolt' },
  { id: 'Yoga', label: 'Yoga', icon: 'fa-spa' },
  { id: 'Pilates', label:  'Pilates', icon: 'fa-child-reaching' },
  { id: 'CrossFit', label:  'CrossFit', icon: 'fa-weight-hanging' },
  { id: 'Vücut Ağırlığı', label: 'Evde', icon: 'fa-house' },
  { id: 'Esneklik', label:  'Esneklik', icon:  'fa-person-dots-from-line' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'En Yeni' },
  { id: 'points_desc', label: 'En Çok Puan' },
  { id: 'duration_asc', label: 'En Kısa Süre' },
];

type CompletedUser = {
  id?:  number;
  name?:  string;
  avatar?: string;
  slug?: string;
  is_expert?: boolean;
};

export default function ExercisesPageClient() {
  const router = useRouter();

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtre State'leri
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSort, setActiveSort] = useState('newest');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sidebar:  leaderboard
  const [exerciseHeroes, setExerciseHeroes] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getExercisePlans();
        
        let plansData = [];
        if (Array.isArray(data)) {
          plansData = data;
        } else if (data && data.data && Array.isArray(data.data)) {
          plansData = data.data;
        } else if (data && typeof data === 'object') {
          plansData = Object.values(data);
        }

        setPlans(plansData);
      } catch (error) {
        console.error("Egzersizler yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Leaderboard fetch
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_WP_API_URL || "https://api.rejimde.com/wp-json";
        const res = await fetch(`${apiUrl}/rejimde/v1/gamification/leaderboard`, {
          cache: "no-store",
          headers:  { "Content-Type": "application/json" },
        });

        if (!res. ok) return;

        const json = await res.json();
        if (json?. status === "success" && Array.isArray(json.data)) {
          const mapped = json.data. slice(0, 10).map((u: any) => {
            const slug =
              u.slug ||
              String(u.name || "user")
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]+/g, "");

            return {
              ...u,
              slug,
              avatar: getSafeAvatarUrl(u.avatar, slug),
              is_expert: Boolean(u.is_expert),
            };
          });

          setExerciseHeroes(mapped);
        }
      } catch (e) {
        console.error("Leaderboard fetch hatası:", e);
      }
    }

    fetchLeaderboard();
  }, []);

  // FİLTRELEME VE SIRALAMA MANTIĞI
  const filteredPlans = useMemo(() => {
    return plans
      .filter(plan => {
        if (! plan || !plan.meta) return false;

        // 1. Kategori Filtresi
        if (activeCategory !== 'all') {
          const planCat = plan.meta.exercise_category;
          if (Array.isArray(planCat)) {
            if (!planCat. includes(activeCategory)) return false;
          } else {
            if (planCat !== activeCategory) return false;
          }
        }

        // 2. Onaylı Filtresi
        if (showVerifiedOnly) {
          const isVerified = plan. meta.is_verified === true || plan.meta.is_verified === '1' || plan.meta. is_verified === 'true';
          if (!isVerified) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // 3. Sıralama
        if (activeSort === 'newest') {
          return b.id - a.id; 
        }
        if (activeSort === 'points_desc') {
          const scoreA = parseInt(a.meta?. score_reward) || 0;
          const scoreB = parseInt(b.meta?.score_reward) || 0;
          return scoreB - scoreA;
        }
        if (activeSort === 'duration_asc') {
          const durA = parseInt(a.meta?.duration) || 999;
          const durB = parseInt(b.meta?.duration) || 999;
          return durA - durB;
        }
        return 0;
      });
  }, [plans, activeCategory, activeSort, showVerifiedOnly]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeSort, showVerifiedOnly]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPlans. length / itemsPerPage);
  const paginatedPlans = filteredPlans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page:  number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 520, behavior: "smooth" });
    }
  };

  // Popular exercises:  most completed
  const popularExercises = useMemo(() => {
    const sorted = [...plans].sort((a, b) => (b.completed_count || 0) - (a.completed_count || 0));
    return sorted. slice(0, 5);
  }, [plans]);

  return (
    <div className="min-h-screen pb-20 font-sans text-gray-800 bg-gray-50/30">
      
      {/* HERO:  AI Selection */}
      <div className="bg-blue-600 text-white py-12 relative overflow-hidden mb-8 shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '20px 20px'}}></div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg text-xs font-black uppercase mb-4 border border-white/10 backdrop-blur-sm">
              <i className="fa-solid fa-bolt text-yellow-300"></i> AI Antrenör
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              Hedefin ne?  <br />
              <span className="text-blue-200">Sana özel programı hazırlayalım. </span>
            </h1>
            <p className="text-blue-100 font-bold mb-8 text-lg opacity-90">
              Ekipmanlarını, seviyeni ve hedefini seç, yapay zeka senin için en verimli antrenman programını oluştursun.
            </p>
            <Link href="/ai-workout-generator" className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-extrabold text-sm shadow-xl shadow-blue-900/20 btn-game uppercase flex items-center gap-2 w-fit">
              <i className="fa-solid fa-robot text-lg"></i> AI Asistanı Başlat
            </Link>
          </div>
          
          <div className="hidden md:flex justify-end relative">
            <div className="relative w-72 h-72 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20 animate-pulse-slow">
              <i className="fa-solid fa-person-running text-9xl text-white opacity-90 drop-shadow-lg"></i>
              <div className="absolute top-0 right-0 bg-orange-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 border-4 border-white/20">
                <i className="fa-solid fa-fire text-2xl"></i>
              </div>
              <div className="absolute bottom-4 left-4 bg-indigo-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-12 border-4 border-white/20">
                <i className="fa-solid fa-stopwatch text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-12">

        {/* CONTROL BAR */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
          
          <div className="w-full xl:w-auto overflow-x-auto pb-4 xl: pb-0 scrollbar-hide -mx-4 px-4 xl:mx-0 xl:px-0">
            <div className="flex gap-3">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-5 py-3 rounded-2xl font-bold text-xs shadow-sm transition whitespace-nowrap flex items-center gap-2 border-2 ${
                    activeCategory === cat.id 
                      ? 'bg-gray-900 text-white border-gray-900 shadow-lg transform scale-105' 
                      : 'bg-white text-gray-500 border-white hover:border-gray-200 hover:text-gray-700'
                  }`}
                >
                  <i className={`fa-solid ${cat. icon} ${activeCategory === cat.id ? 'text-yellow-400' : 'text-gray-300'}`}></i> 
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-end">
            
            <label className="flex items-center gap-3 cursor-pointer select-none group bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm hover:border-blue-100 transition">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="peer sr-only" 
                  checked={showVerifiedOnly}
                  onChange={() => setShowVerifiedOnly(!showVerifiedOnly)} 
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm flex items-center justify-center">
                  {showVerifiedOnly && <i className="fa-solid fa-check text-[8px] text-blue-500"></i>}
                </div>
              </div>
              <span className={`text-xs font-bold ${showVerifiedOnly ? 'text-blue-600' : 'text-gray-500'} group-hover:text-blue-600 transition-colors`}>
                Sadece Onaylılar
              </span>
            </label>

            <div className="relative group/sort z-20">
              <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:border-gray-300 hover:shadow-md transition">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-arrow-down-wide-short text-gray-400"></i>
                  <span>{SORT_OPTIONS.find(o => o.id === activeSort)?.label}</span>
                </div>
                <i className="fa-solid fa-chevron-down text-[10px] text-gray-300"></i>
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover/sort:opacity-100 group-hover/sort: visible transition-all duration-200 z-50">
                {SORT_OPTIONS. map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => setActiveSort(opt.id)}
                    className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-gray-50 flex items-center justify-between ${activeSort === opt.id ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                  >
                    {opt.label}
                    {activeSort === opt. id && <i className="fa-solid fa-check text-blue-600"></i>}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* GRID + SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT - Main Content */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <i className="fa-solid fa-dumbbell absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-300 text-xl"></i>
                </div>
                <p className="text-gray-400 font-bold text-sm animate-pulse">Programlar Yükleniyor...</p>
              </div>
            ) : filteredPlans.length === 0 ?  (
              <div className="text-center py-24 bg-white rounded-[2. 5rem] border-2 border-dashed border-gray-200 flex flex-col items-center shadow-sm">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <i className="fa-solid fa-filter-circle-xmark text-5xl text-gray-300"></i>
                </div>
                <h3 className="text-2xl font-black text-gray-700 mb-2">Program Bulunamadı</h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto mb-8 font-medium">
                  Seçtiğiniz kriterlere uygun bir egzersiz programı şu an mevcut değil. 
                </p>
                <button 
                  onClick={() => { setActiveCategory('all'); setShowVerifiedOnly(false); }} 
                  className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-gray-800 transition flex items-center gap-2"
                >
                  <i className="fa-solid fa-rotate-left"></i> Filtreleri Temizle
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {paginatedPlans. map((plan) => {
                    // Kategoriye göre renk belirleme
                    let themeColor = 'blue-600';
                    let borderColor = 'hover:border-blue-500';
                    let iconColor = 'text-blue-500';
                    let bgColor = 'bg-blue-600';
                    
                    const cat = plan.meta?. exercise_category;
                    if (['HIIT', 'Kardiyo']. includes(cat)) { 
                      themeColor = 'red-500'; 
                      bgColor = 'bg-red-500'; 
                      borderColor = 'hover:border-red-500'; 
                      iconColor = 'text-red-500'; 
                    }
                    if (['Yoga', 'Pilates', 'Esneklik'].includes(cat)) { 
                      themeColor = 'green-500'; 
                      bgColor = 'bg-green-500'; 
                      borderColor = 'hover:border-green-500'; 
                      iconColor = 'text-green-500';
                    }
                    if (['Güç Antrenmanı', 'CrossFit']. includes(cat)) { 
                      themeColor = 'slate-800'; 
                      bgColor = 'bg-slate-800'; 
                      borderColor = 'hover:border-slate-800'; 
                      iconColor = 'text-slate-800';
                    }

                    // Yazar bilgisi
                    const authorName = plan.author?.name || 'Rejimde Coach';
                    const authorAvatar = getSafeAvatarUrl(plan.author?.avatar, plan.author?.slug);

                    // Tamamlayanlar
                    const completedUsers:  CompletedUser[] = Array.isArray(plan.completed_users) ? plan.completed_users : [];
                    const completedCount:  number = plan.completed_count || completedUsers.length || 0;

                    return (
                      <Link 
                        key={plan.id} 
                        href={`/exercises/${plan.slug}`} 
                        className={`bg-white border-2 border-gray-100 rounded-[2rem] p-0 transition-all duration-300 shadow-sm hover:shadow-xl ${borderColor} group flex flex-col h-full relative`}
                      >
                        {/* Badge:  Verified or Category */}
                        <div className="absolute top-4 left-4 z-10 flex gap-2">
                          {plan.meta?.is_verified === true || plan.meta?.is_verified === '1' ?  (
                            <div className="bg-blue-600/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg border border-white/20 flex items-center gap-1">
                              <i className="fa-solid fa-circle-check"></i> Uzman Onaylı
                            </div>
                          ) : null}
                          
                          {plan.meta?.exercise_category && (
                            <div className={`text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg border border-white/20 ${bgColor}/90 backdrop-blur-md`}>
                              {plan.meta.exercise_category}
                            </div>
                          )}
                        </div>

                        {/* Puan Badge (Sağ Üst) */}
                        {plan.meta?.score_reward && (
                          <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-md text-yellow-600 px-3 py-1.5 rounded-xl text-[10px] font-black border border-yellow-100 shadow-sm flex items-center gap-1">
                            <i className="fa-solid fa-trophy"></i> +{plan.meta. score_reward}
                          </div>
                        )}

                        <div className="h-52 bg-gray-100 relative overflow-hidden flex-shrink-0 rounded-t-[2rem]">
                          {plan.image ?  (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={plan. image} 
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                                alt={plan.title} 
                              />
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
                              <i className="fa-solid fa-dumbbell text-7xl text-blue-400 opacity-60"></i>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90"></div>
                          <div className="absolute bottom-5 left-5 right-5 text-white">
                            <h3 className="font-extrabold text-xl shadow-black drop-shadow-md line-clamp-2 mb-2 leading-tight" dangerouslySetInnerHTML={{ __html: plan.title }}></h3>
                            <div className="flex items-center gap-2 opacity-90">
                              <div className="w-5 h-5 rounded-full overflow-hidden border border-white/50 bg-white/10">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
                              </div>
                              <p className="text-xs font-bold">{authorName}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 flex flex-col h-full">
                          {/* Açıklama */}
                          <div className="text-gray-500 text-sm font-bold mb-6 line-clamp-2 min-h-[40px] leading-relaxed" dangerouslySetInnerHTML={{ __html: plan.content ?  String(plan.content).replace(/<[^>]+>/g, '').slice(0, 160) : '' }}></div>
                          
                          {/* Meta Grid */}
                          <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center group-hover:bg-gray-100 transition-colors border border-transparent">
                              <i className={`fa-solid fa-gauge-high ${iconColor} text-sm mb-1.5`}></i>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide truncate w-full">
                                {plan.meta?.difficulty === 'easy' ? 'Başlangıç' : plan.meta?.difficulty === 'hard' ? 'Zor' : 'Orta'}
                              </span>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center group-hover:bg-gray-100 transition-colors border border-transparent">
                              <i className="fa-regular fa-clock text-blue-600 text-sm mb-1.5"></i>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide truncate w-full">{plan.meta?. duration || '30'} Dk</span>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center group-hover:bg-gray-100 transition-colors border border-transparent">
                              <i className="fa-solid fa-fire text-orange-500 text-sm mb-1.5"></i>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide truncate w-full">{plan.meta?. calories || '-'} kcal</span>
                            </div>
                          </div>

                          <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                            {/* Tamamlayanlar - Diyet sayfasındaki gibi */}
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2 overflow-hidden pl-2">
                                {completedUsers.slice(0, 3).map((u, i) => {
                                  const slug =
                                    u.slug ||
                                    String(u.name || "user")
                                      . toLowerCase()
                                      .replace(/\s+/g, "-")
                                      .replace(/[^\w-]+/g, "");
                                  const isExpert = Boolean(u.is_expert);
                                  const avatar = getSafeAvatarUrl(u.avatar, slug);
                                  const href = getUserProfileUrl(slug, isExpert);

                                  return (
                                    <button
                                      key={`${plan.id}-cu-${i}`}
                                      type="button"
                                      onClick={(e) => {
                                        e. preventDefault();
                                        e.stopPropagation();
                                        router.push(href);
                                      }}
                                      className="w-7 h-7 rounded-full border-2 border-white relative shadow-sm bg-gray-100 block hover:scale-110 transition-transform"
                                      title={u.name || "Kullanıcı"}
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={avatar} className="w-full h-full object-cover rounded-full" alt={u.name || "Kullanıcı"} />
                                    </button>
                                  );
                                })}

                                {completedCount > 3 && (
                                  <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500">
                                    +{completedCount - 3}
                                  </div>
                                )}

                                {completedCount === 0 && (
                                  <span className="text-[10px] font-bold text-gray-400 ml-[-8px] bg-gray-50 px-2 py-1 rounded-md">İlk sen başla! </span>
                                )}
                              </div>
                            </div>
                            
                            <span className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-lg shadow-gray-200 btn-game uppercase flex items-center gap-2 group-hover:bg-blue-600 transition-colors">
                              İncele <i className="fa-solid fa-arrow-right"></i>
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400 font-bold hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-xl font-black flex items-center justify-center transition ${
                          currentPage === page 
                            ? "bg-blue-600 text-white shadow-btn shadow-blue-200" 
                            : "bg-white border-2 border-gray-200 text-gray-600 hover:border-blue-500"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400 font-bold hover:border-blue-500 hover: text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT - Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Popular Exercises */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-card">
              <h3 className="font-extrabold text-gray-700 uppercase text-sm mb-4 flex items-center gap-2">
                <i className="fa-solid fa-fire text-orange-500"></i> Popüler Egzersizler
              </h3>
              <div className="space-y-4">
                {popularExercises.map((p) => (
                  <Link
                    href={`/exercises/${p.slug}`}
                    key={`popular-${p. id}`}
                    className="flex gap-3 group p-2 rounded-xl transition border border-transparent hover:border-gray-200"
                  >
                    <div className="w-14 h-14 bg-gray-200 rounded-xl shrink-0 overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image || "https://placehold.co/100x100? text=Egzersiz"} alt={String(p.title)} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-gray-700 text-sm leading-tight group-hover:text-blue-600 transition line-clamp-2">
                        {String(p.title).replace(/<[^>]+>/g, "")}
                      </h4>
                      <span className="text-xs font-bold text-gray-400">{p.completed_count || 0} kişi tamamladı</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-blue-600 text-white rounded-3xl p-6 text-center shadow-float relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>

              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-white/30 group-hover:scale-110 transition">
                <i className="fa-solid fa-dumbbell text-3xl"></i>
              </div>
              <h3 className="font-extrabold text-lg mb-2">Formda Kal! </h3>
              <p className="text-blue-100 text-xs font-bold mb-4 px-2">Haftalık antrenman önerileri ve motivasyon tüyoları e-postana gelsin. </p>
              <div className="bg-white p-1 rounded-xl flex">
                <input type="email" placeholder="E-posta adresin" className="flex-1 bg-transparent border-none text-gray-700 text-xs font-bold px-3 focus:outline-none" />
                <button className="bg-blue-800 text-white px-3 py-2 rounded-lg font-black text-xs uppercase hover:bg-blue-900 transition">
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </div>

            {/* Leaderboard - Egzersiz Kahramanları */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-gray-700 uppercase text-sm flex items-center gap-2">
                  <i className="fa-solid fa-medal text-yellow-500"></i> Haftanın Fitness Yıldızları
                </h3>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Top 10</span>
              </div>

              <p className="text-xs text-gray-400 mb-4 italic">&quot;Ter dökmeden form olmaz! &quot; 💪</p>

              <div className="space-y-3">
                {exerciseHeroes.length > 0 ?  (
                  exerciseHeroes. map((reader:  any, index: number) => {
                    let rankColor = "text-gray-400";
                    let rankBg = "bg-gray-100";
                    let rankIcon = "";
                    
                    if (index === 0) {
                      rankColor = "text-yellow-600";
                      rankBg = "bg-yellow-100 border-yellow-200";
                      rankIcon = "🥇";
                    } else if (index === 1) {
                      rankColor = "text-gray-600";
                      rankBg = "bg-gray-200 border-gray-300";
                      rankIcon = "🥈";
                    } else if (index === 2) {
                      rankColor = "text-orange-600";
                      rankBg = "bg-orange-100 border-orange-200";
                      rankIcon = "🥉";
                    }

                    const slug = reader.slug || "user";
                    const isExpert = Boolean(reader.is_expert);

                    return (
                      <div key={reader.id || `${slug}-${index}`} className="flex items-center gap-3 group">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs border ${rankBg} ${rankColor}`}>
                          {index < 3 ?  rankIcon : index + 1}
                        </div>

                        <Link href={getUserProfileUrl(slug, isExpert)} className="relative hover:scale-110 transition-transform">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getSafeAvatarUrl(reader.avatar, slug)}
                            className="w-9 h-9 rounded-xl bg-gray-100 object-cover border-2 border-white shadow-sm"
                            alt={reader.name || "Reader"}
                          />
                          {index < 3 && (
                            <div className="absolute -bottom-1 -right-1 w-3. 5 h-3.5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                              <i className="fa-solid fa-bolt text-[6px] text-white"></i>
                            </div>
                          )}
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link href={getUserProfileUrl(slug, isExpert)} className="text-xs font-bold text-gray-700 hover:text-blue-600 truncate block transition">
                            {reader.name}
                          </Link>
                          <div className="flex items-center gap-1">
                            <div className="w-16 h-1. 5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(((reader.score || 0) / 2000) * 100, 100)}%` }}></div>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-gray-700 block">{reader.score || 0}</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">Puan</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6">
                    <MascotDisplay state="idle_dashboard" size={60} showBubble={false} />
                    <p className="text-xs text-gray-400 font-bold mt-2">Henüz veri yok. </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <Link href="/leagues" className="text-xs font-bold text-blue-600 hover: underline">
                  Tüm Sıralamayı Gör
                </Link>
              </div>
            </div>
          </aside>
        </div>

      </div>

    </div>
  );
}