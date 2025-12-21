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

  // Backend'den gelen plan_data zaten decode edilmiş array
  const planData = plan?.plan_data || [];
  
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
  const duration = plan.meta?.duration || '3 Gün';
  const calories = plan.meta?.calories || '1200';
  
  // Yazar bilgileri
  const authorName = plan.author?.name || 'Rejimde Uzman';
  const authorSlug = plan.author?.slug || 'expert';
  // avatar doğrudan author.avatar olarak geliyor
  const authorAvatar = plan.author?.avatar || getSafeAvatarUrl(plan.author?.avatar, authorSlug);
  // is_expert boolean olarak geliyor
  const authorIsExpert = plan.author?.is_expert || false;

  return (
    <div className="min-h-screen pb-20">
      
      {/* Navbar is in layout */}

      {/* HERO SECTION */}
      <div className="bg-white border-b-2 border-gray-200 pb-8 pt-8">
          <div className="max-w-6xl mx-auto px-4">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                  
                  {/* Left: Image & Badge */}
                  <div className="relative w-full md:w-1/3">
                      <div className="aspect-video md:aspect-square rounded-3xl overflow-hidden shadow-card border-2 border-gray-100 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={plan.image || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} className="w-full h-full object-cover" alt={plan.title} />
                          <div className="absolute top-4 left-4 bg-rejimde-green text-white px-3 py-1 rounded-lg text-xs font-black uppercase shadow-sm border border-white/20">
                              Diyet Planı
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
                              <div className="text-lg font-black text-gray-700">{difficulty}</div>
                          </div>
                          <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-3 text-center">
                              <i className="fa-regular fa-clock text-rejimde-blue text-xl mb-1"></i>
                              <div className="text-xs font-bold text-gray-400 uppercase">Süre</div>
                              <div className="text-lg font-black text-gray-700">{duration}</div>
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
                  {planData && planData.length > 0 ? planData.map((day: any, index: number) => (
                    <button 
                        key={index}
                        onClick={() => setActiveDay(index + 1)}
                        className={`px-6 py-2 rounded-xl font-black text-sm shadow-btn btn-game shrink-0 transition-colors ${activeDay === index + 1 ? 'bg-rejimde-blue text-white shadow-rejimde-blueDark' : 'bg-white border-2 border-gray-200 text-gray-400 shadow-gray-200 hover:bg-gray-50'}`}
                    >
                        {index + 1}. GÜN
                    </button>
                  )) : (
                    <div className="w-full text-center py-4 text-gray-400 font-bold">
                      Bu diyet için günlük plan bulunamadı.
                    </div>
                  )}
              </div>

              {/* Meals List */}
              <div className="space-y-4">
                  {planData && planData[activeDay - 1] && planData[activeDay - 1]?.meals?.map((meal: any, mealIndex: number) => {
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
                      
                      const icon = mealIcons[meal.name] || 'fa-utensils';
                      const color = mealColors[meal.name] || 'bg-gray-100 text-gray-600';
                      
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
                                            <span className="text-xs font-bold text-gray-400 uppercase">{meal.name} {meal.time ? `(${meal.time})` : ''}</span>
                                            {meal.calories && <span className="text-xs font-black text-rejimde-green bg-green-50 px-2 py-1 rounded">{meal.calories} kcal</span>}
                                        </div>
                                        <h4 className="font-extrabold text-lg text-gray-800 mb-2 peer-checked:line-through peer-checked:text-green-800">{meal.title || meal.name}</h4>
                                        <p className="text-sm font-bold text-gray-500 mb-3">
                                            {meal.description || meal.content || 'Tarif bilgisi mevcut değil.'}
                                        </p>
                                        {meal.tags && meal.tags.length > 0 && (
                                            <div className="flex gap-2">
                                                {meal.tags.map((tag: string, tagIndex: number) => (
                                                    <span key={tagIndex} className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-1 rounded">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                        {meal.tip && (
                                            <div className="bg-blue-50 border-l-4 border-rejimde-blue p-3 rounded-r-lg mt-3">
                                                <p className="text-xs font-bold text-rejimde-blueDark">
                                                    💡 <span className="uppercase">İpucu:</span> {meal.tip}
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
                  })}
                  
                  {(!planData[activeDay - 1]?.meals || planData[activeDay - 1]?.meals.length === 0) && (
                      <div className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                          <i className="fa-regular fa-calendar-xmark text-4xl text-gray-300 mb-2"></i>
                          <p className="text-gray-400 font-bold">Bu gün için öğün planı bulunmuyor.</p>
                      </div>
                  )}
              </div>

              {/* Complete Day Button */}
              <button className="w-full bg-gray-100 text-gray-400 py-4 rounded-2xl font-extrabold text-lg uppercase shadow-inner cursor-not-allowed mt-8 hover:bg-gray-200 transition">
                  Tüm Öğünleri Tamamla (0/4)
              </button>

          </div>

          {/* RIGHT: Sidebar */}
          <div className="lg:col-span-4 space-y-6">
              
              {/* Shopping List Card */}
              <div className="bg-rejimde-purple rounded-3xl p-6 text-white shadow-float relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                  
                  <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                          <i className="fa-solid fa-basket-shopping text-2xl"></i>
                      </div>
                      <div>
                          <h3 className="font-extrabold text-lg leading-tight">Alışveriş Listesi</h3>
                          <p className="text-purple-200 text-xs font-bold">12 Malzeme Gerekli</p>
                      </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm">
                      <ul className="text-sm font-bold space-y-2">
                          <li className="flex items-center gap-2"><i className="fa-solid fa-check text-rejimde-green"></i> Yeşil Elma (3 adet)</li>
                          <li className="flex items-center gap-2"><i className="fa-regular fa-circle text-white/50"></i> Ispanak (1 bağ)</li>
                          <li className="flex items-center gap-2"><i className="fa-regular fa-circle text-white/50"></i> Kinoa (1 paket)</li>
                          <li className="text-xs text-center text-white/60 mt-2">+9 malzeme daha</li>
                      </ul>
                  </div>

                  <button className="bg-white text-rejimde-purple w-full py-3 rounded-xl font-extrabold text-sm shadow-btn shadow-purple-900/30 btn-game uppercase hover:bg-purple-50 transition">
                      Listeyi Görüntüle
                  </button>
              </div>

              {/* Author Expert */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 text-center shadow-card">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-4">Hazırlayan {authorIsExpert ? 'Uzman' : 'Kişi'}</p>
                  <div className="w-20 h-20 mx-auto bg-gray-200 rounded-2xl border-4 border-white shadow-md overflow-hidden mb-3 relative group cursor-pointer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={authorAvatar} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={authorName} />
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

              {/* Success Stories */}
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
                  <h3 className="font-extrabold text-gray-700 text-sm uppercase mb-4">Bunu Yapanlar Ne Dedi?</h3>
                  <div className="space-y-4">
                      <div className="flex gap-3">
                          <img src="https://i.pravatar.cc/150?img=5" className="w-10 h-10 rounded-xl bg-gray-200 shrink-0 border border-gray-100" alt="User" />
                          <div>
                              <p className="text-xs font-bold text-gray-600 leading-snug">
                                  "3 günde -1.8 kg gitti! Ödem atmak için harika."
                              </p>
                              <span className="text-[10px] font-black text-gray-400 block mt-1">GelinAdayı_99</span>
                          </div>
                      </div>
                      <div className="flex gap-3">
                          <img src="https://i.pravatar.cc/150?img=12" className="w-10 h-10 rounded-xl bg-gray-200 shrink-0 border border-gray-100" alt="User" />
                          <div>
                              <p className="text-xs font-bold text-gray-600 leading-snug">
                                  "Smoothie tadı beklediğimden iyiydi. Aç kalmadım."
                              </p>
                              <span className="text-[10px] font-black text-gray-400 block mt-1">Mehmet T.</span>
                          </div>
                      </div>
                  </div>
              </div>

          </div>

      </div>
    </div>
  );
}