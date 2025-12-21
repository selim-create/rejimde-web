"use client";

import Link from "next/link";
import { use, useState, useEffect } from "react";
import { getPlanBySlug } from "@/lib/api";
import { getSafeAvatarUrl, getUserProfileUrl } from "@/lib/helpers";

export default function DietDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  
  const [activeDay, setActiveDay] = useState(1);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadPlan() {
      try {
        const plan = await getPlanBySlug(slug);
        if (plan) {
          setPlan(plan);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Plan yükleme hatası:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadPlan();
  }, [slug]);

  // VERİ GÜVENLİĞİ: plan_data'nın her durumda Array olmasını sağla
  let planData: any[] = [];
  if (plan?.plan_data) {
      if (Array.isArray(plan.plan_data)) {
          planData = plan.plan_data;
      } else if (typeof plan.plan_data === 'object') {
          // Eğer obje gelirse (indexli array) değerlerini al
          planData = Object.values(plan.plan_data);
      }
  }
  
  // Ensure activeDay is valid
  useEffect(() => {
    if (planData.length > 0 && activeDay > planData.length) {
      setActiveDay(1);
    }
  }, [planData.length, activeDay]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <i className="fa-solid fa-circle-notch animate-spin text-4xl text-rejimde-green"></i>
      </div>
    );
  }

  if (notFound || !plan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <i className="fa-solid fa-triangle-exclamation text-6xl text-gray-300 mb-4"></i>
        <h1 className="text-2xl font-black text-gray-800 mb-2">Diyet Bulunamadı</h1>
        <p className="text-gray-500 font-bold mb-6">Aradığınız diyet planı mevcut değil.</p>
        <Link href="/diets" className="bg-rejimde-green text-white px-6 py-3 rounded-xl font-extrabold shadow-btn btn-game uppercase">
          Diyet Listesine Dön
        </Link>
      </div>
    );
  }

  // Meta data
  const difficulty = plan.meta?.difficulty || 'Orta';
  const duration = plan.meta?.duration || planData.length.toString() || '3 Gün'; // Gün sayısına göre fallback
  const calories = plan.meta?.calories || '--';
  
  // Yazar bilgileri
  const authorName = plan.author?.name || 'Rejimde Uzman';
  const authorSlug = plan.author?.slug || 'expert';
  const authorAvatar = plan.author?.avatar || getSafeAvatarUrl(plan.author?.avatar, authorSlug);
  const authorIsExpert = plan.author?.is_expert || false;

  // Aktif gün verisi
  // dayNumber number veya string olabilir, esnek karşılaştırma (==)
  const currentDayData = planData.find((d: any) => d.dayNumber == activeDay) || planData[0] || { meals: [] };
  const meals = Array.isArray(currentDayData.meals) ? currentDayData.meals : (currentDayData.meals ? Object.values(currentDayData.meals) : []);

  return (
    <div className="min-h-screen pb-20 font-sans text-rejimde-text">
      
      {/* HERO SECTION */}
      <div className="bg-white border-b-2 border-gray-200 pb-8 pt-8">
          <div className="max-w-6xl mx-auto px-4">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                  
                  {/* Left: Image & Badge */}
                  <div className="relative w-full md:w-1/3">
                      <div className="aspect-video md:aspect-square rounded-3xl overflow-hidden shadow-card border-2 border-gray-100 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={plan.image || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                            className="w-full h-full object-cover" 
                            alt={plan.title} 
                          />
                          <div className="absolute top-4 left-4 bg-rejimde-green text-white px-3 py-1 rounded-lg text-xs font-black uppercase shadow-sm border border-white/20">
                              {difficulty === 'hard' ? 'Zor' : difficulty === 'easy' ? 'Kolay' : 'Orta'}
                          </div>
                      </div>
                  </div>

                  {/* Right: Info & Actions */}
                  <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-2">
                        <Link href="/diets" className="hover:text-rejimde-blue transition">Diyet Listeleri</Link>
                        <i className="fa-solid fa-chevron-right text-xs"></i>
                        <span className="text-rejimde-text">{plan.title}</span>
                      </div>
                      <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-2" dangerouslySetInnerHTML={{ __html: plan.title }}></h1>
                      <p className="text-gray-500 font-bold text-lg mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: plan.excerpt || plan.content?.substring(0, 150) + '...' || '' }}></p>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4 mb-8">
                          <div className="bg-orange-50 border-2 border-orange-100 rounded-2xl p-3 text-center">
                              <i className="fa-solid fa-gauge-high text-orange-500 text-xl mb-1"></i>
                              <div className="text-xs font-bold text-gray-400 uppercase">Zorluk</div>
                              <div className="text-lg font-black text-gray-700">
                                {difficulty === 'hard' ? 'Zor' : difficulty === 'easy' ? 'Kolay' : 'Orta'}
                              </div>
                          </div>
                          <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-3 text-center">
                              <i className="fa-regular fa-clock text-rejimde-blue text-xl mb-1"></i>
                              <div className="text-xs font-bold text-gray-400 uppercase">Süre</div>
                              <div className="text-lg font-black text-gray-700">{duration} Gün</div>
                          </div>
                          <div className="bg-rejimde-green/10 border-2 border-rejimde-green/20 rounded-2xl p-3 text-center">
                              <i className="fa-solid fa-fire text-rejimde-green text-xl mb-1"></i>
                              <div className="text-xs font-bold text-gray-400 uppercase">Kalori</div>
                              <div className="text-lg font-black text-gray-700">{calories}</div>
                          </div>
                      </div>

                      {/* CTA Buttons */}
                      <div className="flex gap-4">
                          <button className="flex-1 bg-rejimde-green text-white py-4 rounded-2xl font-extrabold text-lg shadow-btn shadow-rejimde-greenDark btn-game uppercase flex items-center justify-center gap-2 group">
                              <i className="fa-solid fa-play group-hover:scale-110 transition"></i> Bu Diyete Başla
                          </button>
                          <button className="bg-white border-2 border-gray-200 text-gray-500 px-6 rounded-2xl font-extrabold text-2xl shadow-btn shadow-gray-200 btn-game hover:text-rejimde-red hover:border-rejimde-red transition">
                              <i className="fa-regular fa-heart"></i>
                          </button>
                      </div>
                  </div>

              </div>
          </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: Meal Plan */}
          <div className="lg:col-span-8 space-y-8">
              
              {/* Day Selector (Tabs) */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {planData && planData.length > 0 ? planData.map((day: any, index: number) => {
                    const dayNum = day.dayNumber || index + 1;
                    return (
                        <button 
                            key={index}
                            onClick={() => setActiveDay(Number(dayNum))}
                            className={`px-6 py-2 rounded-xl font-black text-sm shadow-btn btn-game shrink-0 transition-colors ${activeDay === Number(dayNum) ? 'bg-rejimde-blue text-white shadow-rejimde-blueDark' : 'bg-white border-2 border-gray-200 text-gray-400 shadow-gray-200 hover:bg-gray-50'}`}
                        >
                            {dayNum}. GÜN
                        </button>
                    );
                  }) : (
                    <div className="w-full text-center py-4 text-gray-400 font-bold">
                      Bu diyet için günlük plan bulunamadı.
                    </div>
                  )}
              </div>

              {/* Meals List */}
              <div className="space-y-4">
                  {meals.length > 0 ? meals.map((meal: any, mealIndex: number) => {
                      // Öğün ikonu belirleme
                      const mealIcons: Record<string, string> = {
                          'Kahvaltı': 'fa-mug-hot',
                          'Ara Öğün': 'fa-cookie-bite',
                          'Öğle': 'fa-bowl-food',
                          'Akşam': 'fa-utensils',
                          'Sabah': 'fa-mug-hot',
                          'Atıştırmalık': 'fa-cookie-bite'
                      };
                      
                      const mealColors: Record<string, string> = {
                          'Kahvaltı': 'bg-yellow-100 text-yellow-600',
                          'Ara Öğün': 'bg-orange-100 text-orange-500',
                          'Öğle': 'bg-green-100 text-rejimde-green',
                          'Akşam': 'bg-purple-100 text-rejimde-purple',
                          'Sabah': 'bg-yellow-100 text-yellow-600',
                          'Atıştırmalık': 'bg-orange-100 text-orange-500'
                      };
                      
                      // Eğer meal.type varsa onu kullan, yoksa title'a bak
                      const mealType = meal.type === 'breakfast' ? 'Kahvaltı' : 
                                       meal.type === 'lunch' ? 'Öğle' : 
                                       meal.type === 'dinner' ? 'Akşam' : 
                                       meal.type === 'snack' ? 'Ara Öğün' : meal.title;

                      const icon = mealIcons[mealType] || 'fa-utensils';
                      const color = mealColors[mealType] || 'bg-gray-100 text-gray-600';
                      
                      return (
                        <div key={mealIndex} className="relative group">
                            <label className="cursor-pointer block">
                                <input type="checkbox" className="meal-check hidden peer" />
                                <div className="bg-white border-2 border-gray-200 rounded-3xl p-5 flex items-start gap-4 hover:border-rejimde-green transition shadow-sm peer-checked:bg-green-50 peer-checked:border-rejimde-green peer-checked:opacity-75">
                                    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-2xl shrink-0`}>
                                        <i className={`fa-solid ${icon}`}></i>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-gray-400 uppercase">{mealType} {meal.time ? `(${meal.time})` : ''}</span>
                                            {meal.calories && <span className="text-xs font-black text-rejimde-green bg-green-50 px-2 py-1 rounded">{meal.calories} kcal</span>}
                                        </div>
                                        <h4 className="font-extrabold text-lg text-gray-800 mb-2 peer-checked:line-through peer-checked:text-green-800">{meal.title || meal.name}</h4>
                                        <p className="text-sm font-bold text-gray-500 mb-3 whitespace-pre-wrap">
                                            {meal.description || meal.content || 'Tarif bilgisi mevcut değil.'}
                                        </p>
                                        
                                        {/* Tags */}
                                        {meal.tags && meal.tags.length > 0 && (
                                            <div className="flex gap-2 flex-wrap mb-2">
                                                {meal.tags.map((tag: string, idx: number) => (
                                                    <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-1 rounded border border-gray-200">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Tip */}
                                        {meal.tip && (
                                            <div className="bg-blue-50 border-l-4 border-rejimde-blue p-2 rounded-r-lg mt-2">
                                                <p className="text-xs font-bold text-rejimde-blueDark flex items-center gap-1">
                                                    <i className="fa-solid fa-lightbulb"></i> {meal.tip}
                                                </p>
                                            </div>
                                        )}

                                    </div>
                                    <div className="w-8 h-8 rounded-lg border-2 border-gray-300 flex items-center justify-center text-white bg-white group-hover:border-rejimde-green peer-checked:bg-rejimde-green peer-checked:border-rejimde-green">
                                        <i className="fa-solid fa-check text-rejimde-green opacity-0 group-hover:opacity-50 peer-checked:text-white peer-checked:opacity-100"></i>
                                    </div>
                                </div>
                            </label>
                        </div>
                      );
                  }) : (
                       <div className="text-center text-gray-400 font-bold p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">Bu gün için öğün bulunamadı.</div>
                  )}
              </div>

              {/* Complete Day Button */}
              <button className="w-full bg-gray-100 text-gray-400 py-4 rounded-2xl font-extrabold text-lg uppercase shadow-inner cursor-not-allowed mt-8 hover:bg-gray-200 transition">
                  Tüm Öğünleri Tamamla (0/{meals.length})
              </button>

          </div>

          {/* RIGHT: Sidebar */}
          <div className="lg:col-span-4 space-y-6">
              
              {/* Shopping List Card */}
              {plan.shopping_list && plan.shopping_list.length > 0 && (
                  <div className="bg-rejimde-purple rounded-3xl p-6 text-white shadow-float relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                      
                      <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                              <i className="fa-solid fa-basket-shopping text-2xl"></i>
                          </div>
                          <div>
                              <h3 className="font-extrabold text-lg leading-tight">Alışveriş Listesi</h3>
                              <p className="text-purple-200 text-xs font-bold">{plan.shopping_list.length} Malzeme Gerekli</p>
                          </div>
                      </div>
                      
                      <div className="bg-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm max-h-40 overflow-y-auto custom-scrollbar">
                          <ul className="text-sm font-bold space-y-2">
                              {plan.shopping_list.map((item: string, idx: number) => (
                                  <li key={idx} className="flex items-center gap-2">
                                      <i className="fa-regular fa-circle text-white/50 text-xs"></i> {item}
                                  </li>
                              ))}
                          </ul>
                      </div>

                      <button className="bg-white text-rejimde-purple w-full py-3 rounded-xl font-extrabold text-sm shadow-btn shadow-purple-900/30 btn-game uppercase hover:bg-purple-50 transition">
                          Listeyi Kopyala
                      </button>
                  </div>
              )}

              {/* Author Expert */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 text-center shadow-card">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-4">Hazırlayan {authorIsExpert ? 'Uzman' : 'Kişi'}</p>
                  <div className="w-20 h-20 mx-auto bg-gray-200 rounded-2xl border-4 border-white shadow-md overflow-hidden mb-3 relative group cursor-pointer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={authorAvatar} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                        alt={authorName}
                        onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/9.x/personas/svg?seed=${authorSlug}` }} 
                      />
                  </div>
                  <Link href={getUserProfileUrl(authorSlug, authorIsExpert)} className="text-lg font-extrabold text-gray-800 hover:text-rejimde-blue block mb-2">
                      {authorName}
                  </Link>
                  <div className="flex justify-center text-rejimde-yellow text-xs mb-4">
                      <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                  </div>
                  <Link href={getUserProfileUrl(authorSlug, authorIsExpert)} className="bg-white border-2 border-gray-200 text-gray-500 w-full py-2 rounded-xl font-bold text-xs shadow-btn shadow-gray-200 btn-game hover:text-rejimde-green hover:border-rejimde-green uppercase inline-block">
                      Profili Gör
                  </Link>
              </div>

          </div>

      </div>
    </div>
  );
}