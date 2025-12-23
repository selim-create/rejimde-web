"use client";

import Link from "next/link";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPlanBySlug, getMe, earnPoints, getProgress, updateProgress, startProgress, completeProgress } from "@/lib/api";
import { getSafeAvatarUrl, getUserProfileUrl } from "@/lib/helpers";
import CommentsSection from "@/components/CommentsSection";

// --- API Helperları (Bu sayfaya özel) ---
const approvePlan = async (id: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    const res = await fetch(`${process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost/wp-json'}/rejimde/v1/plans/approve/${id}`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
};

const startPlan = async (id: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    const res = await fetch(`${process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost/wp-json'}/rejimde/v1/plans/start/${id}`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
};

const completePlanAPI = async (id: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    const res = await fetch(`${process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost/wp-json'}/rejimde/v1/plans/complete/${id}`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
};

// --- MODAL BİLEŞENİ ---
const Modal = ({ isOpen, title, message, type, onConfirm, onCancel }: { isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'confirm', onConfirm?: () => void, onCancel?: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-2 ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${type === 'success' ? 'bg-green-100 text-green-600' : type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    <i className={`fa-solid ${type === 'success' ? 'fa-trophy' : type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-question'} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-black text-gray-900 text-center mb-2">{title}</h3>
                <p className="text-gray-500 text-center text-sm mb-8 leading-relaxed">{message}</p>
                <div className="flex gap-3 justify-center">
                    {type === 'confirm' ? (
                        <>
                            <button onClick={onCancel} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-sm transition">Vazgeç</button>
                            <button onClick={onConfirm} className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition shadow-lg shadow-blue-200">Onayla</button>
                        </>
                    ) : (
                        <button onClick={onConfirm || onCancel} className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-bold text-sm transition shadow-lg">Tamam, Harika!</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function DietDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  
  const [activeDay, setActiveDay] = useState(1);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Gamification State
  const [completedMeals, setCompletedMeals] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  // Modal State
  const [modal, setModal] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'confirm', onConfirm?: () => void, onCancel?: () => void }>({
      isOpen: false, title: '', message: '', type: 'success'
  });

  const showModal = (title: string, message: string, type: 'success' | 'error' | 'confirm', onConfirm?: () => void) => {
      setModal({ 
          isOpen: true, title, message, type, 
          onConfirm: () => { if(onConfirm) onConfirm(); setModal(prev => ({...prev, isOpen: false})); },
          onCancel: () => setModal(prev => ({...prev, isOpen: false}))
      });
  };

  useEffect(() => {
    async function loadData() {
      try {
        // Promise.all kullanarak paralel yükleme
        const [planData, userData] = await Promise.all([
            getPlanBySlug(slug),
            getMe()
        ]);

        if (planData) {
          setPlan(planData);
          setCurrentUser(userData);
          
          // Progress: API'den çek (logged in user) veya localStorage'dan (guest)
          if (userData) {
              // Logged in user - API'den çek
              const progressData = await getProgress('diet', planData.id);
              if (progressData) {
                  setCompletedMeals(progressData.completed_items || []);
                  setIsStarted(progressData.started || false);
                  setIsCompleted(progressData.completed || false);
              }
          } else {
              // Guest user - localStorage fallback
              const storedProgress = localStorage.getItem(`diet_progress_${planData.id}`);
              if (storedProgress) {
                  setCompletedMeals(JSON.parse(storedProgress));
              }
              
              const storedStarted = localStorage.getItem(`diet_started_${planData.id}`);
              if (storedStarted) setIsStarted(true);
          }

        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Veri yükleme hatası:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  // Plan Data Parsing
  let planData: any[] = [];
  if (plan?.plan_data) {
      if (Array.isArray(plan.plan_data)) {
          planData = plan.plan_data;
      } else if (typeof plan.plan_data === 'object') {
          planData = Object.values(plan.plan_data);
      }
  }
  
  // Progress Hesaplama
  useEffect(() => {
    if (planData.length === 0) return;
    const totalMeals = getTotalMeals();
    if (totalMeals === 0) return;

    const currentProgress = Math.round((completedMeals.length / totalMeals) * 100);
    setProgress(currentProgress);

    // Otomatik tamamlama tetikleyicisi
    if (currentProgress === 100 && !isCompleted && completedMeals.length > 0) {
        handleCompleteDiet();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedMeals, planData.length]); 

  useEffect(() => {
    if (planData.length > 0 && activeDay > planData.length) {
      setActiveDay(1);
    }
  }, [planData.length, activeDay]);

  // ACTIONS

  const getTotalMeals = () => {
      return planData.reduce((acc, day) => acc + (Array.isArray(day.meals) ? day.meals.length : 0), 0);
  };

  const toggleMealCompletion = async (mealId: string) => {
      const newCompleted = completedMeals.includes(mealId)
          ? completedMeals.filter(id => id !== mealId)
          : [...completedMeals, mealId];
      
      setCompletedMeals(newCompleted);
      
      // Update progress in both API and localStorage
      if (plan) {
          if (currentUser) {
              // Logged in - update via API
              await updateProgress('diet', plan.id, {
                  completed_items: newCompleted,
                  progress_percentage: Math.round((newCompleted.length / getTotalMeals()) * 100)
              });
          }
          // Always update localStorage as fallback
          localStorage.setItem(`diet_progress_${plan.id}`, JSON.stringify(newCompleted));
      }
  };

  const handleStartDiet = async () => {
      if (!currentUser) return showModal("Giriş Yapmalısın", "Diyet takibi yapmak için lütfen giriş yap.", "error");
      
      try {
          // Use new Progress API
          const result = await startProgress('diet', plan.id);
          if (result.success) {
              setIsStarted(true);
              localStorage.setItem(`diet_started_${plan.id}`, 'true');
              showModal("Başarılar!", "Bu diyete başladın. İlerlemeni kaydetmek için öğünleri işaretlemeyi unutma.", "success");
          } else {
              showModal("Hata", result.message || "Bir sorun oluştu.", "error");
          }
      } catch (e) {
          // Fallback to old API
          try {
              await startPlan(plan.id);
              setIsStarted(true);
              localStorage.setItem(`diet_started_${plan.id}`, 'true');
              showModal("Başarılar!", "Bu diyete başladın. İlerlemeni kaydetmek için öğünleri işaretlemeyi unutma.", "success");
          } catch (err) {
              showModal("Hata", "Bir sorun oluştu.", "error");
          }
      }
  };

  const handleCompleteAllMeals = async () => {
      // Aktif gündeki tüm öğünleri bul
      const currentDay = planData.find((d: any) => d.dayNumber == activeDay);
      if (!currentDay || !currentDay.meals) return;

      const mealIds = currentDay.meals.map((m: any) => m.id);
      
      // Henüz tamamlanmamış olanları ekle
      const newCompleted = [...completedMeals];
      mealIds.forEach((id: string) => {
          if (!newCompleted.includes(id)) newCompleted.push(id);
      });

      setCompletedMeals(newCompleted);
      
      // Update both API and localStorage
      if (plan) {
          if (currentUser) {
              await updateProgress('diet', plan.id, {
                  completed_items: newCompleted,
                  progress_percentage: Math.round((newCompleted.length / getTotalMeals()) * 100)
              });
          }
          localStorage.setItem(`diet_progress_${plan.id}`, JSON.stringify(newCompleted));
      }
  };

  const handleCompleteDiet = async () => {
      setIsCompleted(true);
      if (currentUser) {
          try {
            const reward = parseInt(plan?.meta?.score_reward || "0");
            
            // Use new Progress API
            const result = await completeProgress('diet', plan.id);
            if (result.success) {
                await earnPoints('complete_plan', plan?.id);
                showModal(
                    "Tebrikler Şampiyon! 🏆", 
                    `Bu diyet planını başarıyla tamamladın ve ${reward} puan kazandın!`, 
                    "success"
                );
            } else {
                // Fallback to old API
                await earnPoints('complete_plan', plan?.id);
                await completePlanAPI(plan.id);
                showModal(
                    "Tebrikler Şampiyon! 🏆", 
                    `Bu diyet planını başarıyla tamamladın ve ${reward} puan kazandın!`, 
                    "success"
                );
            }
          } catch(e) { 
              console.error(e);
              // Still show success message for user experience
              const reward = parseInt(plan?.meta?.score_reward || "0");
              showModal(
                  "Tebrikler Şampiyon! 🏆", 
                  `Bu diyet planını başarıyla tamamladın ve ${reward} puan kazandın!`, 
                  "success"
              );
          }
      }
  };

  const handleApprove = () => {
      showModal(
          "Onaylıyor musun?",
          "Bu diyet planını 'Uzman Onaylı' olarak işaretlemek üzeresin.",
          "confirm",
          async () => {
              try {
                  await approvePlan(plan.id);
                  // UI'ı güncelle
                  setPlan((prev: any) => ({
                      ...prev,
                      meta: { ...prev.meta, is_verified: true },
                      approved_by: {
                          name: currentUser.name,
                          avatar: currentUser.avatar_url,
                          slug: currentUser.username
                      }
                  }));
                  showModal("Onaylandı", "Diyet planı onaylandı ve yayınlandı.", "success");
              } catch (e) {
                  showModal("Hata", "Onaylama işlemi başarısız.", "error");
              }
          }
      );
  };

  const shareOnWhatsApp = () => {
      if (!plan.shopping_list || plan.shopping_list.length === 0) return;
      const text = `*${plan.title} - Alışveriş Listesi*\n\n` + plan.shopping_list.map((i: string) => `- ${i}`).join('\n');
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><i className="fa-solid fa-circle-notch animate-spin text-4xl text-rejimde-green"></i></div>;
  if (notFound || !plan) return <div className="min-h-screen flex flex-col items-center justify-center p-4"><h1 className="text-2xl font-black">Bulunamadı</h1><Link href="/diets" className="text-rejimde-blue">Listeye Dön</Link></div>;

  // Veriler
  const difficulty = plan.meta?.difficulty || 'Orta';
  const duration = plan.meta?.duration || planData.length.toString() || '3'; 
  const calories = plan.meta?.calories || '--';
  const scoreReward = plan.meta?.score_reward || '0';
  const category = plan.meta?.diet_category || 'Genel';
  
  const authorName = plan.author?.name || 'Rejimde Uzman';
  const authorSlug = plan.author?.slug || '#';
  // Avatar Düzeltmesi: author objesinden gelen avatar zaten API'de dicebear fallback içeriyor olabilir ama garanti olsun
  const authorAvatar = getSafeAvatarUrl(plan.author?.avatar, authorSlug);
  const authorIsExpert = plan.author?.is_expert || false;

  const isAuthor = currentUser && (plan.author?.name === currentUser.name || currentUser.username === authorSlug); 
  
  // Uzman Yetki Kontrolü (Güvenli)
  const isExpertUser = currentUser && Array.isArray(currentUser.roles) && (currentUser.roles.includes('rejimde_pro') || currentUser.roles.includes('administrator'));

  const currentDayData = planData.find((d: any) => d.dayNumber == activeDay) || planData[0] || { meals: [] };
  const meals = Array.isArray(currentDayData.meals) ? currentDayData.meals : (currentDayData.meals ? Object.values(currentDayData.meals) : []);
  const shoppingList = Array.isArray(plan.shopping_list) ? plan.shopping_list : (Array.isArray(plan.meta?.shopping_list) ? plan.meta.shopping_list : []);

  // Icon Helper (Create sayfasıyla uyumlu)
  const getMealIcon = (type: string) => {
      switch (type) {
          case 'breakfast': return 'fa-mug-hot';
          case 'lunch': return 'fa-utensils';
          case 'dinner': return 'fa-moon';
          case 'snack': return 'fa-apple-whole';
          case 'pre-workout': return 'fa-dumbbell';
          case 'post-workout': return 'fa-bolt';
          default: return 'fa-circle';
      }
  };

  return (
    <div className="min-h-screen pb-20 font-sans text-rejimde-text">
      <Modal {...modal} />
      
      {/* HERO SECTION */}
      <div className="bg-white border-b-2 border-gray-200 pb-8 pt-8">
          <div className="max-w-6xl mx-auto px-4">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                  
                  {/* Left: Image & Badge */}
                  <div className="relative w-full md:w-1/3 group">
                      <div className="aspect-video md:aspect-square rounded-3xl overflow-hidden shadow-card border-2 border-gray-100 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={plan.image || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            alt={plan.title} 
                          />
                          <div className="absolute top-4 left-4 bg-rejimde-green text-white px-3 py-1 rounded-lg text-xs font-black uppercase shadow-sm border border-white/20">
                              {difficulty === 'hard' ? 'Zor' : difficulty === 'easy' ? 'Kolay' : 'Orta'}
                          </div>
                          
                          {isAuthor && (
                              <Link 
                                  href={`/dashboard/pro/diets/edit/${plan.id}`}
                                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1 z-20 opacity-0 group-hover:opacity-100"
                              >
                                  <i className="fa-solid fa-pen-to-square"></i> Düzenle
                              </Link>
                          )}
                      </div>
                  </div>

                  {/* Right: Info & Actions */}
                  <div className="flex-1 w-full">
                      <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                            <Link href="/diets" className="hover:text-rejimde-blue transition">Diyet Listeleri</Link>
                            <i className="fa-solid fa-chevron-right text-xs"></i>
                            <span className="text-rejimde-blue">{category}</span>
                            <i className="fa-solid fa-chevron-right text-xs text-gray-300"></i>
                            <span className="text-rejimde-text truncate max-w-[200px]">{plan.title}</span>
                          </div>
                          
                          <div className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 border border-yellow-100">
                              <i className="fa-solid fa-trophy"></i> +{scoreReward} Puan
                          </div>
                      </div>
                      
                      <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-2 leading-tight" dangerouslySetInnerHTML={{ __html: plan.title }}></h1>
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

                      {/* Uzman Onayı Paneli (Sadece Uzmansa ve Onaylanmadıysa) */}
                      {isExpertUser && !plan.meta?.is_verified && (
                          <div className="mb-6 bg-blue-50 border-2 border-blue-100 p-4 rounded-2xl flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                      <i className="fa-solid fa-user-doctor"></i>
                                  </div>
                                  <div>
                                      <p className="text-sm font-bold text-blue-900">Uzman Onayı Bekliyor</p>
                                      <p className="text-xs text-blue-700">Bu diyeti inceleyip onaylamak ister misiniz?</p>
                                  </div>
                              </div>
                              <button onClick={handleApprove} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg transition whitespace-nowrap">
                                  Onayla
                              </button>
                          </div>
                      )}

                      {/* Onaylanmış Bilgisi */}
                      {plan.meta?.is_verified && plan.approved_by && (
                          <div className="mb-6 bg-green-50 border-2 border-green-100 p-3 rounded-2xl flex items-center gap-3">
                              <Link href={getUserProfileUrl(plan.approved_by.slug, true)} className="w-8 h-8 rounded-full overflow-hidden border-2 border-green-200 block shrink-0 hover:scale-105 transition-transform">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={getSafeAvatarUrl(plan.approved_by.avatar, plan.approved_by.slug)} alt="Approver" className="w-full h-full object-cover" />
                              </Link>
                              <div>
                                  <p className="text-xs font-bold text-green-800">
                                      <span className="text-green-600">Onaylayan:</span>
                                      <Link href={getUserProfileUrl(plan.approved_by.slug, true)} className="hover:underline ml-1">
                                         {plan.approved_by.name}
                                      </Link>
                                      <i className="fa-solid fa-circle-check text-green-500 ml-1"></i>
                                  </p>
                              </div>
                          </div>
                      )}

                      {/* CTA Buttons */}
                      <div className="flex gap-4">
                          {isStarted ? (
                              <div className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2 border-2 border-gray-200">
                                  <i className="fa-solid fa-check"></i> Takip Ediliyor
                              </div>
                          ) : (
                              <button onClick={handleStartDiet} className="flex-1 bg-rejimde-green text-white py-4 rounded-2xl font-extrabold text-lg shadow-btn shadow-rejimde-greenDark btn-game uppercase flex items-center justify-center gap-2 group hover:bg-green-500 transition">
                                  <i className="fa-solid fa-play group-hover:scale-110 transition"></i> Bu Diyete Başla
                              </button>
                          )}
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
              
              {/* Progress Bar */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-end mb-2">
                      <div>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">İlerleme Durumu</span>
                          <div className="text-lg font-black text-rejimde-blue">{progress}% Tamamlandı</div>
                      </div>
                      <div className="text-right">
                          <span className="text-xs font-bold text-gray-500">
                              {completedMeals.length} / {planData.reduce((acc, d) => acc + (Array.isArray(d.meals) ? d.meals.length : 0), 0)} Öğün
                          </span>
                      </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div 
                          className="bg-gradient-to-r from-rejimde-blue to-green-400 h-full rounded-full transition-all duration-1000 ease-out relative" 
                          style={{ width: `${progress}%` }}
                      ></div>
                  </div>
              </div>

              {/* Day Selector */}
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
                    <div className="w-full text-center py-4 text-gray-400 font-bold">Plan bulunamadı.</div>
                  )}
              </div>

              {/* Meals List */}
              <div className="space-y-4">
                  {meals.length > 0 ? meals.map((meal: any, mealIndex: number) => {
                      const mealType = meal.type; 
                      const icon = getMealIcon(mealType);
                      const isChecked = completedMeals.includes(meal.id);
                      
                      return (
                        <div key={mealIndex} className="relative group">
                            <label className="cursor-pointer block">
                                <input 
                                    type="checkbox" 
                                    className="meal-check hidden peer" 
                                    checked={isChecked}
                                    onChange={() => toggleMealCompletion(meal.id)}
                                />
                                <div className={`bg-white border-2 border-gray-200 rounded-3xl p-5 flex flex-col md:flex-row items-start gap-4 hover:border-rejimde-green transition shadow-sm ${isChecked ? 'bg-green-50 border-green-200 opacity-80' : ''}`}>
                                    <div className={`w-12 h-12 ${isChecked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'} rounded-xl flex items-center justify-center text-2xl shrink-0 transition-colors`}>
                                        <i className={`fa-solid ${icon}`}></i>
                                    </div>
                                    <div className="flex-1 w-full">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-gray-400 uppercase">{meal.title} ({meal.time})</span>
                                            {meal.calories && <span className="text-xs font-black text-rejimde-green bg-green-50 px-2 py-1 rounded">{meal.calories} kcal</span>}
                                        </div>
                                        <h4 className={`font-extrabold text-lg text-gray-800 mb-2 transition-all ${isChecked ? 'line-through text-green-800' : ''}`}>
                                            {meal.title}
                                        </h4>
                                        <p className={`text-sm font-bold text-gray-500 mb-3 whitespace-pre-wrap ${isChecked ? 'text-green-700/70' : ''}`}>
                                            {meal.content}
                                        </p>
                                        
                                        {meal.tags && meal.tags.length > 0 && (
                                            <div className="flex gap-2 flex-wrap mb-2">
                                                {meal.tags.map((tag: string, idx: number) => (
                                                    <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-1 rounded border border-gray-200">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {meal.tip && (
                                            <div className="bg-blue-50 border-l-4 border-rejimde-blue p-2 rounded-r-lg mt-2">
                                                <p className="text-xs font-bold text-rejimde-blueDark flex items-center gap-1">
                                                    <i className="fa-solid fa-lightbulb"></i> {meal.tip}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${isChecked ? 'bg-rejimde-green border-rejimde-green text-white scale-110' : 'border-gray-300 bg-white text-transparent group-hover:border-rejimde-green'}`}>
                                        <i className="fa-solid fa-check"></i>
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
              <button 
                onClick={handleCompleteAllMeals}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 py-4 rounded-2xl font-extrabold text-lg uppercase shadow-inner transition md:block"
              >
                  Bu Günün Tüm Öğünlerini Tamamla
              </button>

              {/* YENİ YORUM BÖLÜMÜ (MODÜLER) */}
              <div className="mt-8">
                  <CommentsSection 
                      postId={plan.id}
                      context="diet"
                      title="Değerlendirmeler"
                      allowRating={true}
                  />
              </div>

          </div>

          {/* RIGHT: Sidebar */}
          <div className="lg:col-span-4 space-y-6">
              
              {/* Shopping List Card */}
              {shoppingList && shoppingList.length > 0 && (
                  <div className="bg-rejimde-purple rounded-3xl p-6 text-white shadow-float relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                      
                      <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                              <i className="fa-solid fa-basket-shopping text-2xl"></i>
                          </div>
                          <div>
                              <h3 className="font-extrabold text-lg leading-tight">Alışveriş Listesi</h3>
                              <p className="text-purple-200 text-xs font-bold">{shoppingList.length} Malzeme Gerekli</p>
                          </div>
                      </div>
                      
                      <div className="bg-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm max-h-60 overflow-y-auto custom-scrollbar">
                          <ul className="text-sm font-bold space-y-2">
                              {shoppingList.map((item: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2 group/item cursor-pointer">
                                      <input type="checkbox" className="mt-1 w-4 h-4 rounded border-white/30 bg-transparent checked:bg-white checked:text-rejimde-purple focus:ring-0 cursor-pointer accent-white" />
                                      <span className="group-hover/item:text-white/90 transition-colors">{item}</span>
                                  </li>
                              ))}
                          </ul>
                      </div>

                      <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(shoppingList.join('\n'));
                                showModal("Başarılı", "Alışveriş listesi panoya kopyalandı.", "success");
                            }}
                            className="flex-1 bg-white text-rejimde-purple py-3 rounded-xl font-extrabold text-xs shadow-btn btn-game uppercase hover:bg-purple-50 transition"
                        >
                            Kopyala
                        </button>
                        <button 
                            onClick={shareOnWhatsApp}
                            className="flex-1 bg-green-500 text-white py-3 rounded-xl font-extrabold text-xs shadow-btn btn-game uppercase hover:bg-green-600 transition flex items-center justify-center gap-1"
                        >
                            <i className="fa-brands fa-whatsapp text-lg"></i> Paylaş
                        </button>
                      </div>
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
                  {authorIsExpert && (
                      <div className="flex justify-center text-rejimde-yellow text-xs mb-4">
                          <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                      </div>
                  )}
                  <Link href={getUserProfileUrl(authorSlug, authorIsExpert)} className="bg-white border-2 border-gray-200 text-gray-500 w-full py-2 rounded-xl font-bold text-xs shadow-btn shadow-gray-200 btn-game hover:text-rejimde-green hover:border-rejimde-green uppercase inline-block">
                      Profili Gör
                  </Link>
              </div>

              {/* Completed Users */}
              {plan.completed_users && plan.completed_users.length > 0 && (
                  <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm">
                      <h4 className="font-extrabold text-gray-700 mb-4 flex items-center gap-2">
                          <i className="fa-solid fa-users text-rejimde-blue"></i> Tamamlayanlar
                      </h4>
                      <div className="flex -space-x-3 overflow-hidden mb-2 pl-2">
                          {plan.completed_users.slice(0, 5).map((u: any, i: number) => (
                              <Link key={i} href={getUserProfileUrl(u.slug || '#', false)} className="w-10 h-10 rounded-full border-2 border-white relative block hover:scale-110 transition-transform" title={u.name}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={getSafeAvatarUrl(u.avatar, u.slug)} alt={u.name} className="w-full h-full object-cover rounded-full" />
                              </Link>
                          ))}
                          {plan.completed_count > 5 && (
                              <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                  +{plan.completed_count - 5}
                              </div>
                          )}
                      </div>
                      <p className="text-xs font-bold text-gray-400">
                          Toplam {plan.completed_count} kişi bu diyeti başarıyla tamamladı.
                      </p>
                  </div>
              )}

          </div>

      </div>
    </div>
  );
}