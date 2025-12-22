"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getExercisePlans } from "@/lib/api";
import { getSafeAvatarUrl } from "@/lib/helpers";

const CATEGORIES = [
  { id: 'all', label: 'Tümü', icon: 'fa-layer-group' },
  { id: 'Kardiyo', label: 'Kardiyo', icon: 'fa-heart-pulse' },
  { id: 'Güç Antrenmanı', label: 'Güç', icon: 'fa-dumbbell' },
  { id: 'HIIT', label: 'HIIT', icon: 'fa-bolt' },
  { id: 'Yoga', label: 'Yoga', icon: 'fa-spa' },
  { id: 'Pilates', label: 'Pilates', icon: 'fa-child-reaching' },
  { id: 'CrossFit', label: 'CrossFit', icon: 'fa-weight-hanging' },
  { id: 'Vücut Ağırlığı', label: 'Evde', icon: 'fa-house' },
  { id: 'Esneklik', label: 'Esneklik', icon: 'fa-person-dots-from-line' },
];

const SORT_OPTIONS = [
    { id: 'newest', label: 'En Yeni' },
    { id: 'points_desc', label: 'En Çok Puan' },
    { id: 'duration_asc', label: 'En Kısa Süre' },
];

export default function ExercisesPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtre State'leri
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSort, setActiveSort] = useState('newest');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

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

  // FİLTRELEME VE SIRALAMA MANTIĞI
  const filteredPlans = plans
    .filter(plan => {
        if (!plan || !plan.meta) return false;

        // 1. Kategori Filtresi
        if (activeCategory !== 'all') {
            const planCat = plan.meta.exercise_category;
            if (Array.isArray(planCat)) {
                if (!planCat.includes(activeCategory)) return false;
            } else {
                if (planCat !== activeCategory) return false;
            }
        }

        // 2. Onaylı Filtresi
        if (showVerifiedOnly) {
            const isVerified = plan.meta.is_verified === true || plan.meta.is_verified === '1' || plan.meta.is_verified === 'true';
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
            const scoreA = parseInt(a.meta?.score_reward) || 0;
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

  return (
    <div className="min-h-screen pb-20 font-sans text-gray-800 bg-gray-50/30">
      
      {/* HERO: AI Selection */}
      <div className="bg-blue-600 text-white py-12 relative overflow-hidden mb-8 shadow-lg">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '20px 20px'}}></div>
          
          <div className="max-w-6xl mx-auto px-4 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                  <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg text-xs font-black uppercase mb-4 border border-white/10 backdrop-blur-sm">
                      <i className="fa-solid fa-bolt text-yellow-300"></i> AI Antrenör
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                      Hedefin ne? <br />
                      <span className="text-blue-200">Sana özel programı hazırlayalım.</span>
                  </h1>
                  <p className="text-blue-100 font-bold mb-8 text-lg opacity-90">
                      Ekipmanlarını, seviyeni ve hedefini seç, yapay zeka senin için en verimli antrenman programını oluştursun.
                  </p>
                  <Link href="/dashboard/pro/exercises/create" className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-extrabold text-sm shadow-xl shadow-blue-900/20 btn-game uppercase flex items-center gap-3 hover:bg-blue-50 transition transform hover:scale-105 inline-flex">
                      <i className="fa-solid fa-plus"></i> Kendi Programını Oluştur
                  </Link>
                  {/* AI Linki eklenebilir: href="/ai-workout-generator" */}
              </div>
              
              <div className="hidden md:flex justify-end relative">
                  <div className="relative w-72 h-72 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20 animate-pulse-slow">
                      <i className="fa-solid fa-person-running text-9xl text-white opacity-90 drop-shadow-lg"></i>
                      <div className="absolute top-0 right-0 bg-orange-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 border-4 border-white/20 animate-bounce">
                          <i className="fa-solid fa-fire text-2xl"></i>
                      </div>
                      <div className="absolute bottom-4 left-4 bg-indigo-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-12 border-4 border-white/20 animate-bounce delay-75">
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
              
              <div className="w-full xl:w-auto overflow-x-auto pb-4 xl:pb-0 scrollbar-hide -mx-4 px-4 xl:mx-0 xl:px-0">
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
                            <i className={`fa-solid ${cat.icon} ${activeCategory === cat.id ? 'text-yellow-400' : 'text-gray-300'}`}></i> 
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
                      <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:border-gray-300 hover:shadow-md transition min-w-[140px] justify-between">
                          <div className="flex items-center gap-2">
                              <i className="fa-solid fa-arrow-down-wide-short text-gray-400"></i>
                              <span>{SORT_OPTIONS.find(o => o.id === activeSort)?.label}</span>
                          </div>
                          <i className="fa-solid fa-chevron-down text-[10px] text-gray-300"></i>
                      </button>
                      
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover/sort:opacity-100 group-hover/sort:visible transition-all transform origin-top-right overflow-hidden">
                          {SORT_OPTIONS.map(opt => (
                              <button 
                                key={opt.id}
                                onClick={() => setActiveSort(opt.id)}
                                className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-gray-50 flex items-center justify-between ${activeSort === opt.id ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                              >
                                  {opt.label}
                                  {activeSort === opt.id && <i className="fa-solid fa-check text-blue-600"></i>}
                              </button>
                          ))}
                      </div>
                  </div>

              </div>
          </div>

          {/* LISTS GRID */}
          {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                  <div className="relative">
                      <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <i className="fa-solid fa-dumbbell absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-300 text-xl"></i>
                  </div>
                  <p className="text-gray-400 font-bold text-sm animate-pulse">Programlar Yükleniyor...</p>
              </div>
          ) : filteredPlans.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center shadow-sm">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                  {filteredPlans.map((plan) => {
                      // Kategoriye göre renk belirleme
                      let themeColor = 'blue-600';
                      let borderColor = 'hover:border-blue-500';
                      let iconColor = 'text-blue-500';
                      let bgColor = 'bg-blue-600';
                      
                      const cat = plan.meta?.exercise_category;
                      if (['HIIT', 'Kardiyo'].includes(cat)) { themeColor = 'red-500'; bgColor = 'bg-red-500'; borderColor = 'hover:border-red-500'; iconColor = 'text-red-500'; }
                      if (['Yoga', 'Pilates', 'Esneklik'].includes(cat)) { themeColor = 'green-500'; bgColor = 'bg-green-500'; borderColor = 'hover:border-green-500'; iconColor = 'text-green-500'; }
                      if (['Güç Antrenmanı', 'CrossFit'].includes(cat)) { themeColor = 'slate-800'; bgColor = 'bg-slate-800'; borderColor = 'hover:border-slate-800'; iconColor = 'text-slate-800'; }

                      // Yazar bilgisi
                      const authorName = plan.author?.name || 'Rejimde Coach';
                      const authorAvatar = getSafeAvatarUrl(plan.author?.avatar, plan.author?.slug);

                      return (
                          <Link 
                              key={plan.id} 
                              href={`/exercises/${plan.slug}`} 
                              className={`bg-white border-2 border-gray-100 rounded-[2rem] p-0 transition-all duration-300 shadow-sm hover:shadow-xl ${borderColor} group flex flex-col h-full relative hover:-translate-y-2 overflow-hidden`}
                          >
                              {/* Badge: Verified or Category */}
                              <div className="absolute top-4 left-4 z-10 flex gap-2">
                                  {plan.meta?.is_verified === true || plan.meta?.is_verified === '1' ? (
                                      <div className="bg-blue-600/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg border border-white/20 flex items-center gap-1.5">
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
                                  <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-md text-yellow-600 px-3 py-1.5 rounded-xl text-[10px] font-black border border-yellow-100 shadow-sm flex items-center gap-1.5">
                                      <i className="fa-solid fa-trophy"></i> +{plan.meta.score_reward}
                                  </div>
                              )}

                              <div className="h-52 bg-gray-100 relative overflow-hidden flex-shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img 
                                      src={plan.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                                      alt={plan.title} 
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90"></div>
                                  <div className="absolute bottom-5 left-5 right-5 text-white">
                                      <h3 className="font-extrabold text-xl shadow-black drop-shadow-md line-clamp-2 mb-2 leading-tight" dangerouslySetInnerHTML={{ __html: plan.title }}></h3>
                                      <div className="flex items-center gap-2 opacity-90">
                                          <div className="w-5 h-5 rounded-full overflow-hidden border border-white/50">
                                              {/* eslint-disable-next-line @next/next/no-img-element */}
                                              <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
                                          </div>
                                          <p className="text-xs font-bold">{authorName}</p>
                                      </div>
                                  </div>
                              </div>

                              <div className="p-6 flex flex-col h-full">
                                  {/* Açıklama */}
                                  <div className="text-gray-500 text-sm font-bold mb-6 line-clamp-2 min-h-[40px] leading-relaxed" dangerouslySetInnerHTML={{ __html: plan.content ? plan.content.replace(/<[^>]+>/g, '') : (plan.excerpt || 'Etkili bir egzersiz programı.') }}></div>
                                  
                                  {/* Meta Grid */}
                                  <div className="grid grid-cols-3 gap-3 mb-6">
                                      <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center group-hover:bg-gray-100 transition-colors border border-transparent group-hover:border-gray-200">
                                          <i className={`fa-solid fa-gauge-high ${iconColor} text-sm mb-1.5`}></i>
                                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide truncate w-full">
                                              {plan.meta?.difficulty === 'easy' ? 'Başlangıç' : plan.meta?.difficulty === 'hard' ? 'Zor' : 'Orta'}
                                          </span>
                                      </div>
                                      <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center group-hover:bg-gray-100 transition-colors border border-transparent group-hover:border-gray-200">
                                          <i className="fa-regular fa-clock text-blue-600 text-sm mb-1.5"></i>
                                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide truncate w-full">{plan.meta?.duration || '30'} Dk</span>
                                      </div>
                                      <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center group-hover:bg-gray-100 transition-colors border border-transparent group-hover:border-gray-200">
                                          <i className="fa-solid fa-fire text-orange-500 text-sm mb-1.5"></i>
                                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide truncate w-full">{plan.meta?.calories || '-'} kcal</span>
                                      </div>
                                  </div>

                                  <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                                      <div className="flex -space-x-2 overflow-hidden pl-2">
                                          {/* Tamamlayanlar (Varsa) */}
                                          {plan.completed_users && plan.completed_users.slice(0, 3).map((u: any, i: number) => (
                                              <div key={i} className="w-7 h-7 rounded-full border-2 border-white relative shadow-sm" title={u.name}>
                                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                                  <img src={u.avatar} className="w-full h-full object-cover rounded-full" alt={u.name} />
                                              </div>
                                          ))}
                                          {(!plan.completed_users || plan.completed_users.length === 0) && (
                                              <span className="text-[10px] font-bold text-gray-400 ml-[-8px] bg-gray-50 px-2 py-1 rounded-md">İlk sen başla</span>
                                          )}
                                      </div>
                                      
                                      <span className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-lg shadow-gray-200 btn-game uppercase flex items-center gap-2 group-hover:bg-blue-600 transition-colors group-hover:shadow-blue-200">
                                          İncele <i className="fa-solid fa-arrow-right"></i>
                                      </span>
                                  </div>
                              </div>
                          </Link>
                      );
                  })}
              </div>
          )}

      </div>

    </div>
  );
}