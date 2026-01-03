'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import LayoutWrapper from '@/components/LayoutWrapper';
import MascotDisplay from "@/components/MascotDisplay";
import StreakDisplay from "@/components/StreakDisplay";
import PointsToast from "@/components/PointsToast";
import TasksWidget from "@/components/dashboard/TasksWidget";
import BadgesWidget from "@/components/dashboard/BadgesWidget";
import { earnPoints, getMe, getGamificationStats, getPlans, getExercisePlans, getMyExperts, getMyAppointments, getMyInboxThreads, getMyPrivatePlans, getFollowingActivity } from "@/lib/api"; 
import { MascotState } from "@/lib/mascot-config";
import { useGamification } from "@/hooks/useGamification";

export default function DashboardPage() {
  // User & Gamification States
  const [user, setUser] = useState<any>(null);
  const [score, setScore] = useState(0); 
  const [totalScore, setTotalScore] = useState(0);
  const [levelInfo, setLevelInfo] = useState<any>(null);
  
  // Content States
  const [activeDiet, setActiveDiet] = useState<any>(null);
  const [todaysExercise, setTodaysExercise] = useState<any>(null);
  
  // User Dashboard States (Mirror Logic)
  const [myExperts, setMyExperts] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [assignedPlans, setAssignedPlans] = useState<any[]>([]);
  
  // Following Activity States
  const [followingActivity, setFollowingActivity] = useState<any[]>([]);
  const [followingLoading, setFollowingLoading] = useState(true);
  
  // User Rank State
  const [userRank, setUserRank] = useState<number | null>(null);
  
  // UI States
  const [mascotState, setMascotState] = useState<MascotState>("idle_dashboard");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Gamification Hook
  const { dispatchAction, lastResult, showToast, closeToast } = useGamification();

  // Veri Çekme
  useEffect(() => {
    async function loadData() {
        try {
            // 1. Kullanıcı Verisi
            const userData = await getMe();
            if (userData) {
                setUser(userData);
                // Level bilgisini manuel oluştur veya backend'den al
                setLevelInfo(userData.level || { name: 'Begin (Level 1)', icon: 'fa-seedling', color: 'text-gray-500' });
            }
            
            // 2. Gamification İstatistikleri
            const stats = await getGamificationStats();
            if (stats) {
                setScore(stats.daily_score);
                setTotalScore(stats.total_score);
                if (stats.level) setLevelInfo(stats.level);
                // Sıralamayı al
                if (stats.rank) setUserRank(stats.rank);
            }

            // 3. Aktif Diyet Planı
            const diets = await getPlans();
            if (diets && diets.length > 0) setActiveDiet(diets[0]);

            // 4. Egzersiz Planı
            const exercises = await getExercisePlans();
            if (exercises && exercises.length > 0) setTodaysExercise(exercises[0]);

            // 5. User Dashboard Data (Mirror Logic)
            const experts = await getMyExperts();
            setMyExperts(experts.slice(0, 3)); // İlk 3 uzman

            const appointments = await getMyAppointments({ status: 'confirmed', limit: 3 });
            setUpcomingAppointments(appointments);

            const threads = await getMyInboxThreads();
            const unread = threads.filter(t => !t.is_read).length;
            setUnreadMessages(unread);

            const plans = await getMyPrivatePlans();
            setAssignedPlans(plans.filter(p => p.status === 'active'));

            // 6. Takip edilen kullanıcıların aktivitelerini çek
            try {
                const followingData = await getFollowingActivity();
                // data array olduğundan emin ol
                if (followingData && Array.isArray(followingData.data)) {
                    setFollowingActivity(followingData.data);
                } else {
                    setFollowingActivity([]);
                }
            } catch (error) {
                console.error('Following activity fetch error:', error);
                setFollowingActivity([]);
            }
            setFollowingLoading(false);

        } catch (error) {
            console.error("Dashboard veri hatası:", error);
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, []);

  // Puan Kazanma Aksiyonu
  const handleAction = async (action: string, refMascotState: MascotState) => {
    setLoadingAction(action);
    setMascotState(refMascotState);

    const result = await earnPoints(action);

    if (result.success) {
        setScore(result.data.daily_score);
        setTotalScore(result.data.total_score);
        
        setTimeout(() => {
            setMascotState("idle_dashboard");
        }, 4000);
    } else {
        alert(result.message || "Bir hata oluştu.");
        setMascotState("cheat_meal_detected");
    }

    setLoadingAction(null);
  };

  if (loading) {
      return (
        <LayoutWrapper>
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
        </LayoutWrapper>
      );
  }

  return (
    <LayoutWrapper>
    <div className="min-h-screen pb-24 font-sans text-gray-800">
      
      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT SIDEBAR: Tools & Nav */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
              <div className="bg-white border-2 border-gray-200 rounded-[2rem] p-4 sticky top-24 shadow-sm">
                  <nav className="space-y-2">
                      <Link href="/dashboard" className="flex items-center gap-4 p-3 rounded-2xl bg-blue-50 border-2 border-blue-100 text-blue-600 mb-2 shadow-sm transition-transform hover:scale-105">
                          <i className="fa-solid fa-house text-xl w-8 text-center"></i>
                          <span className="font-extrabold uppercase text-sm">Panelim</span>
                      </Link>
                      <Link href="/dashboard/experts" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 text-gray-500 transition group">
                          <i className="fa-solid fa-user-doctor text-xl w-8 text-center group-hover:text-blue-500"></i>
                          <span className="font-extrabold uppercase text-sm group-hover:text-gray-700">Uzmanlarım</span>
                      </Link>
                      <Link href="/dashboard/calendar" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 text-gray-500 transition group">
                          <i className="fa-solid fa-calendar-days text-xl w-8 text-center group-hover:text-green-500"></i>
                          <span className="font-extrabold uppercase text-sm group-hover:text-gray-700">Takvimim</span>
                      </Link>
                      <Link href="/dashboard/inbox" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 text-gray-500 transition group">
                          <i className="fa-solid fa-message text-xl w-8 text-center group-hover:text-purple-500"></i>
                          <span className="font-extrabold uppercase text-sm group-hover:text-gray-700">Mesajlarım</span>
                      </Link>
                      <Link href="/dashboard/wallet" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 text-gray-500 transition group">
                          <i className="fa-solid fa-wallet text-xl w-8 text-center group-hover:text-yellow-500"></i>
                          <span className="font-extrabold uppercase text-sm group-hover:text-gray-700">Cüzdanım</span>
                      </Link>
                      <Link href="/dashboard/plans" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 text-gray-500 transition group">
                          <i className="fa-solid fa-clipboard-list text-xl w-8 text-center group-hover:text-orange-500"></i>
                          <span className="font-extrabold uppercase text-sm group-hover:text-gray-700">Planlarım</span>
                      </Link>
                      <div className="h-px bg-gray-100 my-2"></div>
                      <Link href={user?.clan ? `/circles/${user.clan.slug}` : "/circles"} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 text-gray-500 transition group">
                          <i className={`fa-solid ${user?.clan ? 'fa-shield-cat' : 'fa-shield-halved'} text-xl w-8 text-center group-hover:text-purple-500`}></i>
                          <span className="font-extrabold uppercase text-sm group-hover:text-gray-700">Circle'ım</span>
                      </Link>
                      <Link href="/levels" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 text-gray-500 transition group">
                          <i className="fa-solid fa-trophy text-xl w-8 text-center group-hover:text-yellow-500"></i>
                          <span className="font-extrabold uppercase text-sm group-hover:text-gray-700">Levels</span>
                      </Link>
                      <Link href="/dashboard/score" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 text-gray-500 transition group">
                          <i className="fa-solid fa-chart-pie text-xl w-8 text-center group-hover:text-orange-500"></i>
                          <span className="font-extrabold uppercase text-sm group-hover:text-gray-700">Skor & Analiz</span>
                      </Link>
                      <Link href="/dashboard/tasks" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 text-gray-500 transition group">
                          <i className="fa-solid fa-list-check text-xl w-8 text-center group-hover:text-blue-500"></i>
                          <span className="font-extrabold uppercase text-sm group-hover:text-gray-700">Görevlerim</span>
                      </Link>
                      <Link href="/dashboard/badges" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 text-gray-500 transition group">
                          <i className="fa-solid fa-medal text-xl w-8 text-center group-hover:text-purple-500"></i>
                          <span className="font-extrabold uppercase text-sm group-hover:text-gray-700">Rozetlerim</span>
                      </Link>
                      <Link href="/dashboard/notifications" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 text-gray-500 transition group">
                          <i className="fa-solid fa-bell text-xl w-8 text-center group-hover:text-blue-500"></i>
                          <span className="font-extrabold uppercase text-sm group-hover:text-gray-700">Bildirimler</span>
                      </Link>
                      <Link href="/dashboard/activity" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 text-gray-500 transition group">
                          <i className="fa-solid fa-clock-rotate-left text-xl w-8 text-center group-hover:text-purple-500"></i>
                          <span className="font-extrabold uppercase text-sm group-hover:text-gray-700">Aktiviteler</span>
                      </Link>
                      <Link href="/diets" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 text-gray-500 transition group">
                          <i className="fa-solid fa-utensils text-xl w-8 text-center group-hover:text-green-500"></i>
                          <span className="font-extrabold uppercase text-sm group-hover:text-gray-700">Diyetler</span>
                      </Link>
                      <Link href="/exercises" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 text-gray-500 transition group">
                          <i className="fa-solid fa-dumbbell text-xl w-8 text-center group-hover:text-red-500"></i>
                          <span className="font-extrabold uppercase text-sm group-hover:text-gray-700">Egzersiz</span>
                      </Link>
                      <div className="h-px bg-gray-100 my-2"></div>
                      <Link href="/settings" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 text-gray-500 transition group">
                          <i className="fa-solid fa-gear text-xl w-8 text-center"></i>
                          <span className="font-extrabold uppercase text-sm group-hover:text-gray-700">Ayarlar</span>
                      </Link>
                  </nav>
              </div>
          </div>

          {/* CENTER: Feed & Actions */}
          <div className="lg:col-span-6 space-y-8">
              
              {/* MASCOT HERO */}
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                  {/* DÜZELTME: wave_hello yerine success_milestone veya idle kullanıldı */}
                  <div className="shrink-0 transition-all duration-300 transform hover:scale-105 filter drop-shadow-xl cursor-pointer" onClick={() => setMascotState("success_milestone")}>
                      <MascotDisplay 
                        state={mascotState} 
                        size={180} 
                        showBubble={false} 
                      />
                  </div>
                  <div className="bg-white border-2 border-gray-200 p-6 rounded-[2rem] relative flex-1 shadow-sm transition-all duration-300 hover:shadow-md">
                      <div className="hidden sm:block absolute -left-3 top-1/2 w-6 h-6 bg-white border-l-2 border-b-2 border-gray-200 transform -translate-y-1/2 rotate-45"></div>
                      
                      <h2 className="font-black text-gray-800 text-xl mb-2">Selam {user?.name?.split(' ')[0] || 'Şampiyon'}! 👋</h2>
                      <p className="text-gray-500 font-bold text-base leading-relaxed">
                        {mascotState === 'idle_dashboard' && '"Bugün hava çok güzel, hedeflerine ulaşmak için harika bir gün!"'}
                        {mascotState === 'water_reminder' && '"Ohh! Su gibisi yok. Hücrelerin bayram etti! 💧"'}
                        {mascotState === 'cheat_meal_detected' && '"Hmmm... Bunu kaydettim ama akşamı hafif geçirmen lazım!"'}
                        {mascotState === 'success_milestone' && '"Harikasın! Adım adım hedefe yaklaşıyoruz! 🚀"'}
                      </p>
                  </div>
              </div>

              {/* SCORE CARD */}
              <Link href="/dashboard/score" className="block bg-green-500 rounded-[2.5rem] p-8 shadow-[0_10px_20px_-5px_rgba(34,197,94,0.4)] relative overflow-hidden text-white group cursor-pointer hover:scale-[1.02] transition duration-300">
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '24px 24px'}}></div>
                  
                  <div className="relative z-10 flex justify-between items-center">
                      <div>
                          <p className="font-black text-green-100 text-xs uppercase tracking-widest mb-2">GÜNLÜK SKORUN</p>
                          <div className="flex items-baseline gap-3">
                             <div className="text-6xl font-black tracking-tighter transition-all duration-500 drop-shadow-sm">{score}</div>
                             <div className="text-2xl font-bold text-green-100 opacity-80">/ 100</div>
                          </div>
                          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-sm mt-3 border border-white/10">
                              <i className="fa-solid fa-star text-yellow-300"></i> Toplam: {totalScore} XP
                          </div>
                      </div>
                      <div className="w-28 h-28 relative flex items-center justify-center bg-white/10 rounded-full border-4 border-white/20">
                          <i className="fa-solid fa-trophy text-5xl absolute animate-wiggle drop-shadow-md"></i>
                      </div>
                  </div>
              </Link>
              
              {/* QUICK ACTIONS */}
              <div className="space-y-4">
                  <h3 className="font-extrabold text-gray-400 text-sm uppercase tracking-wider ml-2 flex items-center gap-2">
                      <i className="fa-solid fa-bolt text-yellow-400"></i> Hızlı Eylemler
                  </h3>
                  
                  {/* Water */}
                  <div className="bg-white border-2 border-b-4 border-gray-200 rounded-3xl p-4 flex items-center justify-between group hover:border-blue-400 transition cursor-pointer">
                      <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 text-3xl group-hover:scale-110 transition border-2 border-blue-100">
                              <i className="fa-solid fa-glass-water"></i>
                          </div>
                          <div>
                              <h4 className="font-black text-gray-700 text-lg">Su İçtim</h4>
                              <p className="text-xs font-bold text-gray-400">+5 Puan (200ml)</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => handleAction('water_added', 'water_reminder')}
                        disabled={loadingAction === 'water_added'}
                        className="bg-blue-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_4px_0_rgb(37,99,235)] hover:bg-blue-600 hover:translate-y-[2px] hover:shadow-[0_2px_0_rgb(37,99,235)] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         {loadingAction === 'water_added' ? <i className="fa-solid fa-spinner animate-spin text-xl"></i> : <i className="fa-solid fa-plus font-black text-xl"></i>}
                      </button>
                  </div>

                  {/* Meal (AI) */}
                  <div className="bg-white border-2 border-b-4 border-gray-200 rounded-3xl p-4 flex items-center justify-between group hover:border-green-400 transition cursor-pointer">
                      <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 text-3xl group-hover:scale-110 transition border-2 border-green-100">
                              <i className="fa-solid fa-camera"></i>
                          </div>
                          <div>
                              <h4 className="font-black text-gray-700 text-lg">Öğün Ekle</h4>
                              <p className="text-xs font-bold text-gray-400">+15 Puan</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => handleAction('log_meal', 'cheat_meal_detected')}
                        disabled={loadingAction === 'log_meal'}
                        className="bg-green-500 text-white px-6 h-14 rounded-2xl shadow-[0_4px_0_rgb(21,128,61)] font-extrabold text-sm uppercase hover:bg-green-600 hover:translate-y-[2px] hover:shadow-[0_2px_0_rgb(21,128,61)] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                          {loadingAction === 'log_meal' ? <i className="fa-solid fa-spinner animate-spin"></i> : <><i className="fa-solid fa-camera"></i> Foto Çek</>}
                      </button>
                  </div>

                  {/* Steps - Adım Ekle */}
                  <div className="bg-white border-2 border-b-4 border-gray-200 rounded-3xl p-4 flex items-center justify-between group hover:border-orange-400 transition cursor-pointer">
                      <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 text-3xl group-hover:scale-110 transition border-2 border-orange-100">
                              <i className="fa-solid fa-shoe-prints"></i>
                          </div>
                          <div>
                              <h4 className="font-black text-gray-700 text-lg">Adım Ekle</h4>
                              <p className="text-xs font-bold text-gray-400">+5 Puan</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => handleAction('steps_logged', 'success_milestone')}
                        disabled={loadingAction === 'steps_logged'}
                        className="bg-orange-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_4px_0_rgb(234,88,12)] hover:bg-orange-600 hover:translate-y-[2px] hover:shadow-[0_2px_0_rgb(234,88,12)] active:translate-y-[4px] active:shadow-none transition-all"
                      >
                         {loadingAction === 'steps_logged' ? <i className="fa-solid fa-spinner animate-spin text-xl"></i> : <i className="fa-solid fa-plus font-black text-xl"></i>}
                      </button>
                  </div>
              </div>

              {/* ACTIVE PLANS (Diet & Exercise) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Diet Plan */}
                  <div className="bg-white border-2 border-gray-200 rounded-3xl p-5 shadow-sm hover:border-orange-300 transition">
                      <div className="flex justify-between items-start mb-3">
                          <div className="bg-orange-100 text-orange-600 w-10 h-10 rounded-xl flex items-center justify-center">
                              <i className="fa-solid fa-utensils"></i>
                          </div>
                          <Link href="/diets" className="text-xs font-black text-orange-500 uppercase hover:underline">Değiştir</Link>
                      </div>
                      <h4 className="font-black text-gray-800 mb-1 line-clamp-1">{activeDiet?.title || "Diyet Planı Seç"}</h4>
                      <p className="text-xs font-bold text-gray-400 mb-3 line-clamp-2">{activeDiet?.excerpt || "Henüz bir plan seçmedin."}</p>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-orange-500 h-full w-1/3 rounded-full"></div>
                      </div>
                  </div>

                  {/* Exercise Plan */}
                  <div className="bg-white border-2 border-gray-200 rounded-3xl p-5 shadow-sm hover:border-purple-300 transition">
                      <div className="flex justify-between items-start mb-3">
                          <div className="bg-purple-100 text-purple-600 w-10 h-10 rounded-xl flex items-center justify-center">
                              <i className="fa-solid fa-dumbbell"></i>
                          </div>
                          <Link href="/exercises" className="text-xs font-black text-purple-500 uppercase hover:underline">Değiştir</Link>
                      </div>
                      <h4 className="font-black text-gray-800 mb-1 line-clamp-1">{todaysExercise?.title || "Egzersiz Planı Seç"}</h4>
                      <p className="text-xs font-bold text-gray-400 mb-3 line-clamp-2">{todaysExercise?.excerpt || "Bugün için plan yok."}</p>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full w-0 rounded-full"></div>
                      </div>
                  </div>
              </div>

          </div>

          {/* RIGHT SIDEBAR: Level & Social */}
          <div className="lg:col-span-3 space-y-6">
              
              {/* STREAK DISPLAY */}
              {!user?.roles?.includes('rejimde_pro') && <StreakDisplay />}
              
              {/* LEVEL WIDGET */}
              <Link href="/levels" className="block bg-white border-2 border-gray-200 rounded-[2rem] overflow-hidden shadow-card group hover:border-yellow-400 transition cursor-pointer">
                  <div className={`p-4 border-b-2 flex justify-between items-center ${levelInfo?.bg ? levelInfo.bg.replace('bg-gradient-to-br', 'bg') : 'bg-gray-400'} text-white`}>
                      <h3 className="font-extrabold uppercase text-sm flex items-center gap-2">
                          <i className={`fa-solid ${levelInfo?.icon || 'fa-trophy'}`}></i> {levelInfo?.name || 'Levels'}
                      </h3>
                      <i className="fa-solid fa-chevron-right text-xs"></i>
                  </div>
                  <div className="p-4 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 border-2 border-gray-100 mb-2">
                          <i className={`fa-solid ${levelInfo?.icon || 'fa-trophy'} text-3xl ${levelInfo?.color || 'text-gray-400'}`}></i>
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Sıralaman</p>
                      <div className="text-3xl font-black text-gray-800 leading-none">#{userRank || '-'}</div>
                      <div className="mt-3 bg-green-50 text-green-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase inline-block">
                          Yükselme Hattı
                      </div>
                  </div>
              </Link>

              {/* CIRCLE WIDGET */}
              {user?.clan ? (
                  <Link href={`/circles/${user.clan.slug}`} className="block bg-white border-2 border-gray-200 rounded-[2rem] p-5 shadow-card group hover:border-purple-400 transition">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-extrabold text-gray-400 text-xs uppercase px-1 flex items-center gap-2">
                            <i className="fa-solid fa-shield-cat text-purple-500"></i> Circle'ın
                        </h3>
                        <span className="bg-purple-100 text-purple-600 text-[10px] font-black px-2 py-1 rounded-lg">{user.clan.member_count || 1} Üye</span>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center border-2 border-purple-100 overflow-hidden shrink-0">
                              {user.clan.logo ? (
                                  <img src={user.clan.logo} className="w-full h-full object-cover" alt="Circle" />
                              ) : (
                                  <i className="fa-solid fa-shield text-purple-300 text-2xl"></i>
                              )}
                          </div>
                          <div className="min-w-0">
                              <h4 className="font-black text-gray-800 text-base group-hover:text-purple-600 transition truncate">{user.clan.name}</h4>
                              <p className="text-xs text-gray-400 font-bold truncate">Birlikte güçlüyüz! 💪</p>
                          </div>
                      </div>

                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-1">
                          <div className="bg-purple-500 h-full w-3/4 rounded-full"></div>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold text-right">Haftalık Hedef: %75</p>
                  </Link>
              ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-[2rem] p-6 text-center">
                      <i className="fa-solid fa-users-slash text-4xl text-gray-300 mb-2"></i>
                      <p className="text-xs font-bold text-gray-400 mb-4">Henüz bir Circle'ın yok.</p>
                      <Link href="/circles" className="block w-full bg-white border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-extrabold text-xs uppercase hover:border-purple-400 hover:text-purple-600 transition shadow-sm">
                          Circle Bul
                      </Link>
                  </div>
              )}

              {/* MY EXPERTS WIDGET */}
              {myExperts.length > 0 && (
                <div className="bg-white border-2 border-gray-200 rounded-[2rem] overflow-hidden shadow-card">
                  <div className="p-4 bg-blue-50 border-b-2 border-blue-100 flex justify-between items-center">
                    <h3 className="font-extrabold uppercase text-sm flex items-center gap-2 text-blue-600">
                      <i className="fa-solid fa-user-doctor"></i> Uzmanlarım
                    </h3>
                    <Link href="/dashboard/experts" className="text-blue-600 text-xs font-bold hover:underline">
                      Tümü
                    </Link>
                  </div>
                  <div className="p-4 space-y-3">
                    {myExperts.map((expert) => (
                      <Link 
                        key={expert.id}
                        href={`/dashboard/experts`}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={expert.expert.avatar} className="w-10 h-10 rounded-xl border border-gray-100" alt={expert.expert.name} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 text-sm truncate group-hover:text-blue-600">{expert.expert.name}</h4>
                          <p className="text-xs text-gray-400 font-bold truncate">{expert.expert.title}</p>
                        </div>
                        {expert.unread_messages > 0 && (
                          <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">{expert.unread_messages}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* UPCOMING APPOINTMENTS WIDGET */}
              {upcomingAppointments.length > 0 && (
                <div className="bg-white border-2 border-gray-200 rounded-[2rem] overflow-hidden shadow-card">
                  <div className="p-4 bg-green-50 border-b-2 border-green-100 flex justify-between items-center">
                    <h3 className="font-extrabold uppercase text-sm flex items-center gap-2 text-green-600">
                      <i className="fa-solid fa-calendar-days"></i> Yaklaşan Randevular
                    </h3>
                    <Link href="/dashboard/calendar" className="text-green-600 text-xs font-bold hover:underline">
                      Tümü
                    </Link>
                  </div>
                  <div className="p-4 space-y-3">
                    {upcomingAppointments.map((apt) => (
                      <Link 
                        key={apt.id}
                        href="/dashboard/calendar"
                        className="block p-3 rounded-xl bg-gray-50 hover:bg-green-50 border border-gray-100 hover:border-green-200 transition"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            apt.type === 'online' 
                              ? 'bg-purple-100 text-purple-600' 
                              : 'bg-orange-100 text-orange-600'
                          }`}>
                            {apt.type === 'online' ? 'Online' : 'Yüzyüze'}
                          </span>
                          <span className="text-xs font-bold text-gray-500">{apt.expert.name}</span>
                        </div>
                        <h4 className="font-black text-gray-800 text-sm mb-1">{apt.title}</h4>
                        <p className="text-xs text-gray-500 font-bold">
                          {new Date(apt.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} - {apt.start_time}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* UNREAD MESSAGES WIDGET */}
              {unreadMessages > 0 && (
                <Link href="/dashboard/inbox" className="block bg-purple-50 border-2 border-purple-200 rounded-[2rem] p-5 shadow-card hover:border-purple-400 transition group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center text-white">
                      <i className="fa-solid fa-message text-xl"></i>
                    </div>
                    <div className="bg-red-500 text-white text-lg font-black px-3 py-1 rounded-full">{unreadMessages}</div>
                  </div>
                  <h4 className="font-black text-gray-800 text-base mb-1 group-hover:text-purple-600 transition">Okunmamış Mesaj</h4>
                  <p className="text-xs text-gray-500 font-bold">Uzmanlarından yeni mesajlar var!</p>
                </Link>
              )}

              {/* ASSIGNED PLANS WIDGET */}
              {assignedPlans.length > 0 && (
                <div className="bg-white border-2 border-gray-200 rounded-[2rem] overflow-hidden shadow-card">
                  <div className="p-4 bg-orange-50 border-b-2 border-orange-100 flex justify-between items-center">
                    <h3 className="font-extrabold uppercase text-sm flex items-center gap-2 text-orange-600">
                      <i className="fa-solid fa-clipboard-list"></i> Aktif Planlar
                    </h3>
                    <Link href="/dashboard/plans" className="text-orange-600 text-xs font-bold hover:underline">
                      Tümü
                    </Link>
                  </div>
                  <div className="p-4 space-y-3">
                    {assignedPlans.slice(0, 2).map((plan) => (
                      <Link 
                        key={plan.id}
                        href="/dashboard/plans"
                        className="block p-3 rounded-xl hover:bg-orange-50 border border-gray-100 hover:border-orange-200 transition"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            plan.type === 'diet' ? 'bg-green-100 text-green-600' :
                            plan.type === 'workout' ? 'bg-orange-100 text-orange-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            <i className={`fa-solid text-sm ${
                              plan.type === 'diet' ? 'fa-utensils' :
                              plan.type === 'workout' ? 'fa-dumbbell' :
                              'fa-list-check'
                            }`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-gray-800 text-sm truncate">{plan.title}</h4>
                            <p className="text-xs text-gray-400 font-bold truncate">{plan.expert.name}</p>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="bg-orange-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${plan.progress_percent}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold mt-1">İlerleme: {plan.progress_percent}%</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* TASKS WIDGET */}
              <TasksWidget />

              {/* BADGES WIDGET */}
              <BadgesWidget />

              {/* FRIEND ACTIVITY (Dynamic) */}
              <div className="bg-white border-2 border-gray-200 rounded-[2rem] p-5 shadow-sm">
                  <h3 className="font-extrabold text-gray-400 text-xs uppercase mb-3 px-1">Arkadaşların</h3>
                  {followingLoading ? (
                      <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                      </div>
                  ) : Array.isArray(followingActivity) && followingActivity.length > 0 ? (
                      <>
                          <div className="space-y-4">
                              {followingActivity.slice(0, 2).map((friend: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-3">
                                      <img src={friend.avatar || `https://api.dicebear.com/9.x/personas/svg?seed=${friend.name}`} className="w-10 h-10 rounded-xl bg-gray-100" alt={friend.name} />
                                      <div>
                                          <p className="text-xs font-bold text-gray-700">{friend.name}</p>
                                          <p className="text-[10px] text-green-500 font-bold">{friend.last_activity || 'Aktif'}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                          <Link href="/explore" className="block w-full mt-4 text-xs font-bold text-gray-400 hover:text-gray-600 uppercase border-t-2 border-gray-50 pt-2 text-center">
                              Tümünü Gör
                          </Link>
                      </>
                  ) : (
                      <div className="text-center py-4">
                          <i className="fa-solid fa-user-plus text-3xl text-gray-300 mb-2"></i>
                          <p className="text-xs font-bold text-gray-400 mb-3">Henüz takip ettiğin kimse yok.</p>
                          <Link href="/community" className="text-xs font-bold text-blue-500 hover:underline">
                              Keşfet →
                          </Link>
                      </div>
                  )}
              </div>

          </div>

      </div>
    </div>
    
    {/* Points Toast Notification */}
    {showToast && lastResult && (
      <PointsToast
        points={lastResult.points_earned}
        message={lastResult.message}
        streak={lastResult.streak}
        milestone={lastResult.milestone}
        onClose={closeToast}
      />
    )}
    </LayoutWrapper>
  );
}