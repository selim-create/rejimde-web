"use client";

import Link from "next/link";
import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getExercisePlanBySlug, getMe, earnPoints, approveExercisePlan, getProgress, updateProgress, startProgress, completeProgress, toggleProgressItem, toggleFavoriteAPI, checkFavoriteAPI } from "@/lib/api";
import { getSafeAvatarUrl, getUserProfileUrl } from "@/lib/helpers";
import CommentsSection from "@/components/CommentsSection";
import AuthorCard from "@/components/AuthorCard";
import SocialShare from "@/components/SocialShare";
import PointsToast from "@/components/PointsToast";
import { useGamification } from "@/hooks/useGamification";

// --- UZMANLIK KATEGORİLERİ (AuthorCard Renkleri İçin) ---
const SPECIALTY_CATEGORIES = [
    { title: "Beslenme", items: [{ id: "dietitian_spec", label: "Diyetisyen" }, { id: "dietitian", label: "Diyetisyen" }] },
    { title: "Hareket", items: [{ id: "pt", label: "PT / Fitness Koçu" }, { id: "trainer", label: "Antrenör" }] },
    { title: "Zihin & Alışkanlık", items: [{ id: "psychologist", label: "Psikolog" }, { id: "life_coach", label: "Yaşam Koçu" }] },
    { title: "Sağlık Destek", items: [{ id: "doctor", label: "Doktor" }, { id: "physio", label: "Fizyoterapist" }] },
    { title: "Kardiyo & Güç", items: [{ id: "box", label: "Boks / Kickboks" }, { id: "defense", label: "Savunma & Kondisyon" }] }
];

const getProfessionLabel = (slug: string = '') => {
    if (!slug) return '';
    const slugLower = slug.toLowerCase();
    for (const cat of SPECIALTY_CATEGORIES) {
        const found = cat.items.find(item => item.id === slugLower || slugLower.includes(item.id));
        if (found) return found.label;
    }
    return slug.charAt(0).toUpperCase() + slug.slice(1);
};

// --- TİPLER ---
interface Exercise {
    id: string;
    name: string;
    sets: string;
    reps: string;
    rest: string; 
    notes: string;
    videoUrl?: string; 
    image?: string;
    tags: string[];
}

interface DayPlan {
    id: string;
    dayNumber: number;
    exercises: Exercise[];
}

// Completed user type
type CompletedUser = {
  id?: number;
  name?: string;
  avatar?: string;
  slug?: string;
  is_expert?: boolean;
};

// Approver type
type Approver = {
  id?: number;
  name: string;
  avatar?: string;
  slug: string;
  profession?: string;
};

// --- MODAL BİLEŞENLERİ ---

const AlertModal = ({ isOpen, title, message, type, onConfirm, onCancel }: { isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'confirm' | 'warning' | 'info', onConfirm?: () => void, onCancel?: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-2 ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${type === 'success' ? 'bg-green-100 text-green-600' : type === 'error' ? 'bg-red-100 text-red-600' : type === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                    <i className={`fa-solid ${type === 'success' ? 'fa-trophy' : type === 'error' ? 'fa-circle-exclamation' : type === 'warning' ? 'fa-triangle-exclamation' : type === 'info' ? 'fa-circle-info' : 'fa-circle-question'} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-black text-gray-900 text-center mb-2">{title}</h3>
                <p className="text-gray-500 text-center text-sm mb-8 leading-relaxed">{message}</p>
                <div className="flex gap-3 justify-center">
                    {type === 'confirm' || type === 'warning' ? (
                        <>
                            <button onClick={onCancel} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-sm transition">Vazgeç</button>
                            <button onClick={onConfirm} className={`flex-1 px-4 py-3 text-white rounded-2xl font-bold text-sm transition shadow-lg ${type === 'warning' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>Onayla</button>
                        </>
                    ) : (
                        <button onClick={onConfirm || onCancel} className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-bold text-sm transition shadow-lg">Tamam</button>
                    )}
                </div>
            </div>
        </div>
    );
};

const ExerciseDetailModal = ({ isOpen, exercise, onClose, onComplete }: { isOpen: boolean, exercise: Exercise | null, onClose: () => void, onComplete: (id: string) => void }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && timerActive) {
            setTimerActive(false);
            const audio = new Audio('/assets/sounds/timer-done.mp3'); 
            audio.play().catch(() => {});
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    useEffect(() => {
        if (isOpen && exercise) {
            setTimeLeft(parseInt(exercise.rest) || 60);
            setTimerActive(false);
        }
    }, [isOpen, exercise]);

    const startTimer = () => setTimerActive(true);
    const stopTimer = () => setTimerActive(false);

    if (!isOpen || !exercise) return null;

    const getEmbedUrl = (url: string) => {
        if (!url) return '';
        const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
        return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1&mute=1` : url;
    };

    const hasMedia = exercise.videoUrl || exercise.image;

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition shadow-sm">
                    <i className="fa-solid fa-xmark"></i>
                </button>

                {/* Medya Alanı - Sadece varsa ve kırpılmış şekilde */}
                {hasMedia && (
                    <div className="bg-black relative shrink-0 h-56 flex items-center justify-center overflow-hidden">
                        {exercise.videoUrl ? (
                            <iframe 
                                src={getEmbedUrl(exercise.videoUrl)} 
                                className="w-full h-full" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                        ) : exercise.image ? (
                             /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={exercise.image} alt={exercise.name} className="w-full h-full object-cover" />
                        ) : null}
                    </div>
                )}

                {/* İçerik */}
                <div className="p-6 overflow-y-auto">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-black text-gray-800 leading-tight">{exercise.name}</h2>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {exercise.tags.map((tag, i) => (
                                    <span key={i} className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded border border-gray-200">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-blue-50 p-3 rounded-xl text-center border border-blue-100">
                            <span className="block text-2xl font-black text-blue-600">{exercise.sets}</span>
                            <span className="text-[10px] font-bold text-blue-400 uppercase">SET</span>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-xl text-center border border-blue-100">
                            <span className="block text-2xl font-black text-blue-600">{exercise.reps}</span>
                            <span className="text-[10px] font-bold text-blue-400 uppercase">TEKRAR</span>
                        </div>
                         <div className="bg-orange-50 p-3 rounded-xl text-center border border-orange-100">
                            <span className="block text-2xl font-black text-orange-600">{exercise.rest}</span>
                            <span className="text-[10px] font-bold text-orange-400 uppercase">DİNLENME</span>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600 font-medium mb-6 leading-relaxed">
                        <h4 className="text-xs font-black text-gray-400 uppercase mb-2 flex items-center gap-2">
                            <i className="fa-solid fa-circle-info"></i> Nasıl Yapılır?
                        </h4>
                        {exercise.notes || "Bu egzersiz için özel bir not bulunmuyor."}
                    </div>

                    {/* Timer & Tamamlama */}
                    <div className="space-y-3">
                        {exercise.rest && (
                            <div className="flex items-center justify-between bg-gray-100 border border-gray-200 p-3 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-600 shadow-sm">
                                        <i className="fa-solid fa-stopwatch text-lg"></i>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Sayaç</p>
                                        <p className="text-lg font-black text-gray-800 tabular-nums">{timeLeft} sn</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={timerActive ? stopTimer : startTimer}
                                    className={`px-4 py-2 rounded-xl font-bold text-xs transition shadow-sm flex items-center gap-2 ${timerActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-900 hover:bg-black text-white'}`}
                                >
                                    {timerActive ? 'Durdur' : 'Başlat'}
                                </button>
                            </div>
                        )}

                        <button 
                            onClick={() => { onComplete(exercise.id); onClose(); }}
                            className="w-full py-4 rounded-2xl font-black text-lg bg-green-500 text-white hover:bg-green-600 transition shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                        >
                            <i className="fa-solid fa-check"></i> Hareketi Tamamladım
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ExerciseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  
  const [activeDay, setActiveDay] = useState(1);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Author Card için detaylar
  const [authorDetail, setAuthorDetail] = useState<any>(null);

  // States
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  
  // Modals
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'confirm' | 'warning' | 'info', onConfirm?: () => void, onCancel?: () => void }>({ isOpen: false, title: '', message: '', type: 'success' });
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  // Gamification Hook
  const { dispatchAction, lastResult, showToast, closeToast } = useGamification();

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'confirm' | 'warning' | 'info', onConfirm?: () => void) => {
      setAlertModal({ 
          isOpen: true, title, message, type, 
          onConfirm: () => { if(onConfirm) onConfirm(); setAlertModal(prev => ({...prev, isOpen: false})); },
          onCancel: () => setAlertModal(prev => ({...prev, isOpen: false}))
      });
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [planData, userData] = await Promise.all([
            getExercisePlanBySlug(slug),
            getMe()
        ]);

        if (planData) {
          setPlan(planData);
          setCurrentUser(userData);
          
          // Yazar Detaylarını Oluştur
          const authorSlug = planData.author?.slug || '#';
          let authorInfo = {
              id: 0,
              name: planData.author?.name || 'Rejimde Coach',
              slug: authorSlug,
              avatar: getSafeAvatarUrl(planData.author?.avatar, authorSlug),
              isExpert: planData.author?.is_expert || false,
              isVerified: planData.author?.is_expert || false,
              role: planData.author?.is_expert ? 'rejimde_pro' : 'rejimde_user',
              profession: planData.author?.is_expert ? 'Antrenör' : '',
              level: 1,
              score: 0,
              articleCount: 1,
              followers_count: 0,
              high_fives: 0
          };

          // API'den detaylı yazar verisi çek (ID, Takipçi sayısı vb. için)
          try {
              const apiUrl = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost/wp-json';
              const res = await fetch(`${apiUrl}/wp/v2/users?search=${encodeURIComponent(authorInfo.name)}`);
              if (res.ok) {
                  const users = await res.json();
                  const user = users.find((u: any) => u.slug === authorSlug) || users[0];
                  if (user) {
                      const isPro = user.roles && user.roles.includes('rejimde_pro');
                      let profession = authorInfo.profession;
                      if (isPro) {
                          const rawProfession = user.profession || 'trainer'; // Default to trainer for exercise plan authors
                          profession = getProfessionLabel(rawProfession) || 'Antrenör'; 
                      }

                      authorInfo = {
                          ...authorInfo,
                          id: user.id,
                          name: user.name,
                          avatar: user.avatar_url || authorInfo.avatar,
                          isExpert: isPro,
                          isVerified: isPro, 
                          role: isPro ? 'rejimde_pro' : 'rejimde_user',
                          profession: profession,
                          level: user.rejimde_level || 5,
                          score: user.rejimde_score || 0,
                          articleCount: user.posts_count || 12,
                          followers_count: user.followers_count || 0,
                          high_fives: user.high_fives || 0
                      };
                  }
              }
          } catch (e) {
              console.warn("Yazar detayları çekilemedi, varsayılanlar kullanılıyor.", e);
          }
          setAuthorDetail(authorInfo);

          // Progress: API'den çek (logged in user)
          if (userData) {
              const progressData = await getProgress('exercise', planData.id);
              if (progressData) {
                  setCompletedExercises(progressData.completed_items || []);
                  setIsStarted(progressData.is_started || progressData.started || false);
                  setIsCompleted(progressData.is_completed || progressData.completed || false);
                  setRewardClaimed(progressData.reward_claimed || false);
              }
              
              // Favorites check
              const favoriteCheck = await checkFavoriteAPI('exercise', planData.id);
              if (favoriteCheck.success) {
                  setIsFavorited(favoriteCheck.is_favorited);
              }
          }

        } else {
          setNotFound(true);
        }
      } catch (error) {
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
  
  const getTotalExercises = useCallback(() => {
      return planData.reduce((acc, day) => acc + (Array.isArray(day.exercises) ? day.exercises.length : 0), 0);
  }, [planData]);
  
  // Progress calculation - sadece progress güncelliyor, modal göstermiyor
  useEffect(() => {
    if (planData.length === 0) return;
    const totalExercises = getTotalExercises();
    if (totalExercises === 0) return;
    const currentProgress = Math.round((completedExercises.length / totalExercises) * 100);
    setProgress(currentProgress);
  }, [completedExercises, planData.length, getTotalExercises]); 

  useEffect(() => {
    if (planData.length > 0 && activeDay > planData.length) {
      setActiveDay(1);
    }
  }, [planData.length, activeDay]);

  const toggleExerciseCompletion = async (exerciseId: string) => {
      if (!currentUser) {
          showAlert("Giriş Yapmalısın", "Hareket takibi yapmak için lütfen giriş yap.", "error");
          return;
      }

      if (!isStarted) {
          showAlert("Dur Bakalım! 🏋️", "Önce 'Programa Başla' butonuna tıklamalısın. Isınmadan antrenman olmaz, başlamadan tamamlama da olmaz! 💪", "info");
          return;
      }

      // Logged in user - use API
      try {
          const result = await toggleProgressItem('exercise', plan.id, exerciseId);
          
          if (result.success) {
              const newCompletedExercises = result.completed_items || [];
              setCompletedExercises(newCompletedExercises);
              
              // Tüm hareketler tamamlandı mı kontrol et
              const totalExercises = getTotalExercises();
              const allCompleted = newCompletedExercises.length >= totalExercises && totalExercises > 0;
              
              if (allCompleted && !rewardClaimed) {
                  // Sadece tüm hareketler bitince ve daha önce puan alınmadıysa
                  handleCompletePlan();
              }
          } else {
              // Backend'den gelen hata mesajını Türkçeleştir
              let errorMessage = result.message || "Hareket işaretlenemedi.";
              if (errorMessage.includes("Content must be started")) {
                  errorMessage = "Önce programa başlamalısın! \"Programa Başla\" butonuna tıkla.";
              }
              showAlert("Bir Dakika! ✋", errorMessage, "error");
          }
      } catch (e) {
          console.error('Exercise completion error:', e);
          showAlert("Hata", "İşlem sırasında bir hata oluştu.", "error");
      }
  };

  const handleStartPlan = async () => {
      // Yasal Uyarı Kontrolü
      if (!plan.meta?.is_verified) {
          showAlert(
              "Yasal Uyarı", 
              "Bu egzersiz planı henüz bir uzman tarafından onaylanmamıştır. Egzersizlere başlamadan önce lütfen bir sağlık profesyoneline danışınız. Olası sakatlıklarda sorumluluk kullanıcıya aittir.", 
              "warning",
              () => {
                  startPlanLogic(); // Onay verirse başlat
              }
          );
      } else {
          startPlanLogic();
      }
  };

  const startPlanLogic = async () => {
      if (!currentUser) return showAlert("Giriş Yapmalısın", "Antrenman takibi yapmak için lütfen giriş yap.", "error");
      
      if (isStarted) {
          showAlert("Zaten Başladın", "Bu antrenman programını zaten takip ediyorsun.", "info");
          return;
      }
      
      try {
          // Call startProgress to mark as started
          const startResult = await startProgress('exercise', plan?.id);
          
          if (startResult.success || startResult.already_started) {
              setIsStarted(true);
              
              // Dispatch gamification event
              const eventResult = await dispatchAction('exercise_started', 'exercise', plan?.id);
              
              if (eventResult.success && !eventResult.already_earned) {
                  showAlert("Başarılar!", `Antrenman programına başladın! +${eventResult.points_earned} puan kazandın.`, "success");
              } else {
                  showAlert("Başarılar!", "Antrenman programına başladın. Hedefine ulaşman dileğiyle!", "success");
              }
          } else {
              showAlert("Hata", startResult.message || "Bir hata oluştu.", "error");
          }
      } catch (e) {
          showAlert("Hata", "İşlem sırasında bir hata oluştu.", "error");
      }
  };

  const handleCompletePlan = async () => {
      if (rewardClaimed) return; // Zaten alındıysa tekrar verme
      
      setIsCompleted(true);
      setRewardClaimed(true);
      
      if (currentUser) {
          try {
            const reward = parseInt(plan?.meta?.score_reward || "0");
            
            // Dispatch exercise_completed event
            const result = await dispatchAction('exercise_completed', 'exercise', plan?.id);
            
            if (result.success) {
                // Also mark as complete in progress tracking
                await completeProgress('exercise', plan?.id);
                showAlert(
                    "Tebrikler Şampiyon! 🏆", 
                    `Bu antrenman programını başarıyla tamamladın ve ${result.points_earned || reward} puan kazandın! Gücüne güç kattın.`, 
                    "success"
                );
            } else {
                // Fallback - still award points
                await earnPoints('complete_exercise_plan', plan?.id);
                showAlert(
                    "Tebrikler Şampiyon! 🏆", 
                    `Bu antrenman programını başarıyla tamamladın ve ${reward} puan kazandın! Gücüne güç kattın.`, 
                    "success"
                );
            }
          } catch(e) { 
              console.error(e);
              // Still show success message for user experience
              const reward = parseInt(plan?.meta?.score_reward || "0");
              showAlert(
                  "Tebrikler Şampiyon! 🏆", 
                  `Bu antrenman programını başarıyla tamamladın ve ${reward} puan kazandın! Gücüne güç kattın.`, 
                  "success"
              );
          }
      }
  };

  // Uzman Onayı
  const handleApprove = () => {
    showAlert("Onaylıyor musun?", "Bu egzersiz planını 'Uzman Onaylı' olarak işaretlemek üzeresin.", "confirm", async () => {
      try {
          const result = await approveExercisePlan(plan.id);
            if (result. success) {  // result.status === "success" kaldırıldı
              // Approvers listesine ekle veya oluştur
              const newApprover: Approver = {
                  id: currentUser.id,
                  name: currentUser.name || currentUser.display_name,
                  avatar: currentUser.avatar_url,
                  slug: currentUser.username || currentUser.slug,
                  profession: currentUser.profession,
              };

              setPlan((prev: any) => {
                  const existingApprovers = Array.isArray(prev.approvers) ? prev.approvers : [];
                  const alreadyApproved = existingApprovers.some((a: Approver) => a.id === newApprover.id);

                  return {
                      ...prev,
                      meta: { ...prev.meta, is_verified: true },
                      approved_by: prev.approved_by || newApprover,
                      approvers: alreadyApproved ? existingApprovers : [...existingApprovers, newApprover],
                  };
              });

              showAlert("Onaylandı ✅", "Egzersiz planı onaylandı. Teşekkürler!", "success");
          } else {
              showAlert("Hata", result.message || "Onaylama işlemi başarısız.", "error");
          }
      } catch (e) {
          showAlert("Hata", "Onaylama işlemi başarısız.", "error");
      }
    });
  };

  const toggleFavorite = async () => {
      if (!currentUser) {
          showAlert("Giriş Yapmalısın", "Favorilere eklemek için lütfen giriş yap.", "error");
          return;
      }

      try {
          const result = await toggleFavoriteAPI('exercise', plan.id);
          if (result.success) {
              setIsFavorited(result.is_favorited);
              if (result.is_favorited) {
                  showAlert("Favorilere Eklendi ❤️", "Bu egzersiz favorilerine eklendi!", "success");
              } else {
                  showAlert("Favorilerden Çıkarıldı", "Bu egzersiz favorilerinden kaldırıldı.", "info");
              }
          } else {
              showAlert("Hata", result.message || "İşlem başarısız.", "error");
          }
      } catch (e) {
          showAlert("Hata", "İşlem sırasında bir hata oluştu.", "error");
      }
  };

  const handleExerciseClick = (exercise: Exercise) => {
      setSelectedExercise(exercise);
      setDetailModalOpen(true);
  };

  const shareOnWhatsApp = () => {
      const text = `*${plan.title}* - Harika bir antrenman programı buldum! Sen de incele: ${window.location.href}`;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><i className="fa-solid fa-circle-notch animate-spin text-4xl text-blue-600"></i></div>;
  if (notFound || !plan) return <div className="min-h-screen flex flex-col items-center justify-center p-4"><h1 className="text-2xl font-black">Bulunamadı</h1><Link href="/exercises" className="text-blue-600">Listeye Dön</Link></div>;

  const difficulty = plan.meta?.difficulty || 'Orta';
  const duration = plan.meta?.duration || '30'; 
  const calories = plan.meta?.calories || '--';
  const scoreReward = plan.meta?.score_reward || '0';
  const category = plan.meta?.exercise_category || 'Genel';
  
  const isAuthor = currentUser && (plan.author?.name === currentUser.name || currentUser.username === plan.author?.slug); 
  const isExpertUser = currentUser && Array.isArray(currentUser.roles) && (currentUser.roles.includes('rejimde_pro') || currentUser.roles.includes('administrator'));
  const hasCurrentUserApproved = isExpertUser && Array.isArray(plan.approvers) && plan.approvers.some((a: Approver) => a.id === currentUser?.id);
  
  const currentDayData = planData.find((d: any) => d.dayNumber == activeDay) || planData[0] || { exercises: [] };
  const exercises = Array.isArray(currentDayData.exercises) ? currentDayData.exercises : (currentDayData.exercises ? Object.values(currentDayData.exercises) : []);
  const equipmentList = Array.isArray(plan.equipment_list) ? plan.equipment_list : (Array.isArray(plan.meta?.equipment_list) ? plan.meta.equipment_list : []);

  // Approvers: backend'den gelen veya approved_by'dan oluşturulan liste
  const approvers: Approver[] = Array.isArray(plan.approvers) ? plan.approvers : plan.approved_by ? [plan.approved_by] : [];

  // Completed users
  const completedUsers: CompletedUser[] = Array.isArray(plan.completed_users) ? plan.completed_users : [];
  const completedCount: number = plan.completed_count || completedUsers.length || 0;

  // Yasal Uyarı Metni
  const disclaimerText = !plan.meta?.is_verified 
    ? "⚠️ Bu egzersiz planı bir uzman tarafından onaylanmamıştır. Uygulamadan önce doktorunuza danışınız."
    : null;

  return (
    <div className="min-h-screen pb-20 font-sans text-gray-800">
      
      <AlertModal {...alertModal} />
      <ExerciseDetailModal 
        isOpen={detailModalOpen} 
        exercise={selectedExercise} 
        onClose={() => setDetailModalOpen(false)} 
        onComplete={(id) => toggleExerciseCompletion(id)}
      />

      {/* HERO SECTION */}
      <div className="bg-white border-b-2 border-gray-200 pb-8 pt-8">
          <div className="max-w-6xl mx-auto px-4">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                  
                  <div className="relative w-full md:w-1/3 group">
                      <div className="aspect-video md:aspect-square rounded-3xl overflow-hidden shadow-card border-2 border-gray-100 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={plan.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            alt={plan.title} 
                          />
                          <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-black uppercase shadow-sm border border-white/20">
                              {difficulty === 'hard' ? 'Zor' : difficulty === 'easy' ? 'Kolay' : 'Orta'}
                          </div>
                          
                          {isAuthor && (
                              <Link 
                                  href={`/dashboard/pro/exercises/edit/${plan.id}`}
                                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1 z-20 opacity-0 group-hover:opacity-100"
                              >
                                  <i className="fa-solid fa-pen-to-square"></i> Düzenle
                              </Link>
                          )}
                      </div>
                  </div>

                  <div className="flex-1 w-full">
                      <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                            <Link href="/exercises" className="hover:text-blue-600 transition">Egzersizler</Link>
                            <i className="fa-solid fa-chevron-right text-xs"></i>
                            <span className="text-blue-600">{category}</span>
                            <i className="fa-solid fa-chevron-right text-xs text-gray-300"></i>
                            <span className="text-gray-900 truncate max-w-[200px]">{plan.title}</span>
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
                              <div className="text-xs font-bold text-gray-400 uppercase">Seviye</div>
                              <div className="text-lg font-black text-gray-700">
                                {difficulty === 'hard' ? 'Zor' : difficulty === 'easy' ? 'Başlangıç' : 'Orta'}
                              </div>
                          </div>
                          <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-3 text-center">
                              <i className="fa-regular fa-clock text-blue-600 text-xl mb-1"></i>
                              <div className="text-xs font-bold text-gray-400 uppercase">Süre</div>
                              <div className="text-lg font-black text-gray-700">{duration} Dk</div>
                          </div>
                          <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-3 text-center">
                              <i className="fa-solid fa-fire text-red-500 text-xl mb-1"></i>
                              <div className="text-xs font-bold text-gray-400 uppercase">Yakım</div>
                              <div className="text-lg font-black text-gray-700">{calories} kcal</div>
                          </div>
                      </div>

                      {/* Onaylanmamış Uyarısı */}
                      {!plan.meta?.is_verified && !isExpertUser && (
                        <div className="mb-6 bg-orange-50 border-2 border-orange-200 p-4 rounded-2xl flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
                            <i className="fa-solid fa-triangle-exclamation"></i>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-orange-900">Bu egzersiz henüz uzman tarafından onaylanmadı</p>
                            <p className="text-xs text-orange-700">Egzersize başlamadan önce bir uzmana danışmanızı öneririz.</p>
                          </div>
                        </div>
                      )}

                      {/* Uzman Onay Paneli */}
                      {isExpertUser && !plan.meta?.is_verified && (
                        <div className="mb-6 bg-blue-50 border-2 border-blue-100 p-4 rounded-2xl flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                              <i className="fa-solid fa-user-doctor"></i>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-blue-900">Uzman Onayı Bekliyor</p>
                              <p className="text-xs text-blue-700">Bu egzersizi inceleyip onaylamak ister misiniz?</p>
                            </div>
                          </div>
                          <button onClick={handleApprove} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg transition whitespace-nowrap">
                            Onayla
                          </button>
                        </div>
                      )}

                      {/* Onaylayanlar Listesi (Çoklu) */}
                      {plan.meta?.is_verified && approvers.length > 0 && (
                        <div className="mb-6 bg-green-50 border-2 border-green-100 p-3 rounded-2xl">
                          <div className="flex items-center gap-2 mb-2">
                            <i className="fa-solid fa-circle-check text-green-500"></i>
                            <span className="text-xs font-bold text-green-800">Onaylayan Uzmanlar:</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {approvers.map((approver: Approver, idx: number) => (
                              <Link
                                key={approver.id || idx}
                                href={getUserProfileUrl(approver.slug, true)}
                                className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-green-200 hover:border-green-400 transition"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={getSafeAvatarUrl(approver.avatar, approver.slug)} alt={approver.name} className="w-6 h-6 rounded-full object-cover border border-green-200" />
                                <span className="text-xs font-bold text-green-800">{approver.name}</span>
                              </Link>
                            ))}

                            {/* Uzman ise ve henüz onaylamamışsa + butonu */}
                            {isExpertUser && !hasCurrentUserApproved && (
                              <button
                                onClick={handleApprove}
                                className="flex items-center justify-center w-8 h-8 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg border-2 border-dashed border-green-300 transition"
                                title="Sen de onayla"
                              >
                                <i className="fa-solid fa-plus text-sm"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-4">
                          <div className="flex gap-4">
                              {isStarted ? (
                                  <Link href={`/exercises/${slug}/assistant`} className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2 hover:bg-black transition shadow-lg shadow-gray-400/50 animate-pulse-slow">
                                      <i className="fa-solid fa-play"></i> Asistanı Başlat
                                  </Link>
                              ) : (
                                  <button onClick={handleStartPlan} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-extrabold text-lg shadow-btn shadow-blue-200 btn-game uppercase flex items-center justify-center gap-2 group hover:bg-blue-700 transition">
                                      <i className="fa-solid fa-dumbbell group-hover:scale-110 transition"></i> Programa Başla
                                  </button>
                              )}
                              <button 
                                onClick={toggleFavorite}
                                className={`px-6 rounded-2xl font-extrabold text-2xl shadow-btn btn-game transition ${
                                  isFavorited ? "bg-red-500 text-white border-2 border-red-500 hover:bg-red-600" : "bg-white border-2 border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200"
                                }`}
                              >
                                <i className={`${isFavorited ? "fa-solid" : "fa-regular"} fa-heart`}></i>
                              </button>
                          </div>

                          {/* Social Share */}
                          <div className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
                              <SocialShare url={`/exercises/${slug}`} title={plan?.title || ''} description={plan?.excerpt || ''} />
                          </div>
                      </div>
                  </div>

              </div>
          </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT */}
          <div className="lg:col-span-8 space-y-8">
              
              {/* Progress Bar */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-end mb-2">
                      <div>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">İlerleme Durumu</span>
                          <div className="text-lg font-black text-blue-600">{progress}% Tamamlandı</div>
                      </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                  </div>
              </div>

              {/* Day Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {planData && planData.length > 0 ? planData.map((day: any, index: number) => {
                    const dayNum = day.dayNumber || index + 1;
                    return (
                        <button 
                            key={index}
                            onClick={() => setActiveDay(Number(dayNum))}
                            className={`px-6 py-2 rounded-xl font-black text-sm shadow-btn btn-game shrink-0 transition-colors ${activeDay === Number(dayNum) ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white border-2 border-gray-200 text-gray-400 shadow-gray-200 hover:bg-gray-50'}`}
                        >
                            {dayNum}. GÜN
                        </button>
                    );
                  }) : (
                    <div className="w-full text-center py-4 text-gray-400 font-bold">Plan bulunamadı.</div>
                  )}
              </div>

              {/* Exercises List */}
              <div className="space-y-4">
                  {exercises.length > 0 ? exercises.map((exercise: any, exIndex: number) => {
                      const isChecked = completedExercises.includes(exercise.id);
                      
                      return (
                        <div key={exIndex} className="relative group cursor-pointer" onClick={() => handleExerciseClick(exercise)}>
                            <div className={`bg-white border-2 border-gray-200 rounded-3xl p-5 flex flex-col md:flex-row items-center gap-4 hover:border-blue-500 transition shadow-sm ${isChecked ? 'bg-blue-50 border-blue-200 opacity-80' : ''}`}>
                                
                                <div className="relative shrink-0">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden border-2 border-gray-200">
                                         {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={exercise.image || exercise.videoUrl ? `https://img.youtube.com/vi/${exercise.videoUrl?.split('v=')[1]}/0.jpg` : 'https://placehold.co/100x100?text=Egzersiz'} className="w-full h-full object-cover" alt={exercise.name} onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100?text=GYM'; }} />
                                    </div>
                                    {exercise.videoUrl && <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl"><i className="fa-solid fa-play text-white text-xs"></i></div>}
                                </div>

                                <div className="flex-1 w-full text-center md:text-left">
                                    <h4 className={`font-extrabold text-lg text-gray-800 mb-1 ${isChecked ? 'line-through text-blue-800' : ''}`}>{exercise.name || exercise.title}</h4>
                                    <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-bold text-gray-500">
                                        <span className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1"><i className="fa-solid fa-layer-group"></i> {exercise.sets} Set</span>
                                        <span className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1"><i className="fa-solid fa-rotate-right"></i> {exercise.reps} Tekrar</span>
                                        {exercise.rest && <span className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1"><i className="fa-regular fa-clock"></i> {exercise.rest}sn</span>}
                                    </div>
                                </div>

                                <div onClick={(e) => { e.stopPropagation(); toggleExerciseCompletion(exercise.id); }} className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${isChecked ? 'bg-blue-600 border-blue-600 text-white scale-110' : 'border-gray-300 bg-white text-transparent hover:border-blue-500'}`}>
                                    <i className="fa-solid fa-check"></i>
                                </div>
                            </div>
                        </div>
                      );
                  }) : (
                       <div className="text-center text-gray-400 font-bold p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">Bu gün için antrenman bulunamadı.</div>
                  )}
              </div>

              {/* YENİ YORUM BÖLÜMÜ (MODÜLER) */}
              <div className="mt-8">
                  <CommentsSection 
                      postId={plan.id}
                      context="exercise"
                      title="Değerlendirmeler"
                      allowRating={true}
                  />
              </div>

          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4 space-y-6">
              
              {/* Equipment List */}
              {equipmentList && equipmentList.length > 0 && (
                  <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-float relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
                      <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                              <i className="fa-solid fa-dumbbell text-2xl"></i>
                          </div>
                          <div>
                              <h3 className="font-extrabold text-lg leading-tight">Gerekli Ekipmanlar</h3>
                              <p className="text-gray-400 text-xs font-bold">{equipmentList.length} Ekipman</p>
                          </div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm max-h-60 overflow-y-auto custom-scrollbar">
                          <ul className="text-sm font-bold space-y-2">
                              {equipmentList.map((item: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2"><i className="fa-solid fa-check text-blue-400 mt-1 text-xs"></i><span className="text-white/90">{item}</span></li>
                              ))}
                          </ul>
                      </div>
                  </div>
              )}

              {/* YENİ: ORTAK AUTHOR CARD */}
              {authorDetail && (
                  <div className="sticky top-24 z-30 space-y-6">
                      <AuthorCard author={authorDetail} context={authorDetail.isExpert ? 'Hazırlayan' : 'Paylaşan'} />

                      {/* Formuna Kavuşanlar */}
                      <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-[0_4px_0_#E5E5E5] overflow-hidden relative">
                        <div className="bg-blue-50 p-4 border-b-2 border-gray-100 text-center relative overflow-hidden">
                          <i className="fa-solid fa-trophy text-blue-200 text-6xl absolute -left-2 top-2 rotate-12"></i>
                          <div className="relative z-10">
                            <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">Bu Antrenmanla</div>
                            <div className="text-2xl font-black text-gray-800">{completedCount} Kişi</div>
                            <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">Formuna Kavuştu! 💪</div>
                          </div>
                        </div>

                        <div className="p-5 text-center">
                          {completedUsers.length > 0 ? (
                            <div className="flex justify-center items-center -space-x-4 mb-4">
                              {completedUsers.slice(0, 3).map((u: CompletedUser, i: number) => {
                                // Slug oluştur - boş/undefined durumunda fallback
                                const userName = u.name || u.slug || `user-${u.id || i}`;
                                const userSlug = u.slug || String(userName).toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "") || `user-${i}`;
                                const isExpert = Boolean(u.is_expert);
                                
                                // Avatar: önce user meta'dan gelen, sonra getSafeAvatarUrl fallback
                                const avatarUrl = getSafeAvatarUrl(u.avatar, userSlug);

                                return (
                                  <Link
                                    key={u.id || `completed-${i}`}
                                    href={getUserProfileUrl(userSlug, isExpert)}
                                    className="relative transition-transform duration-200 hover:-translate-y-1 hover:scale-110 z-0 hover:z-10 block"
                                    title={userName}
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      className="w-12 h-12 rounded-full border-4 border-white object-cover shadow-sm bg-gray-200"
                                      src={avatarUrl}
                                      alt={userName}
                                      onError={(e) => {
                                        // Fallback: eğer resim yüklenemezse dicebear kullan
                                        e.currentTarget.src = `https://api.dicebear.com/9.x/personas/svg?seed=${userSlug}`;
                                      }}
                                    />
                                    {i === 1 && (
                                      <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 rounded-full border-2 border-white flex items-center gap-0.5">
                                        <i className="fa-solid fa-fire"></i>
                                      </div>
                                    )}
                                  </Link>
                                );
                              })}
                              {completedCount > 3 && (
                                <div className="w-12 h-12 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500 z-0 shadow-sm">
                                  +{completedCount - 3}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="mb-4 text-gray-400 text-xs font-bold">Henüz kimse tamamlamadı. İlk sen ol!</div>
                          )}

                          <p className="text-sm text-gray-600 font-bold mb-4">
                            Sen de bu <span className="text-blue-600">{planData.length} günlük</span> maceraya katıl!
                          </p>

                          <button
                            onClick={handleStartPlan}
                            disabled={isStarted}
                            className={`w-full font-black py-3 rounded-2xl border-b-4 flex items-center justify-center gap-2 group transition-all active:border-b-0 active:translate-y-1 ${
                              isStarted
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-default"
                                : "bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-blue-200"
                            }`}
                          >
                            <span>{isStarted ? "Takip Ediliyor" : "Ben de Başlıyorum!"}</span>
                            {!isStarted && <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>}
                            {isStarted && <i className="fa-solid fa-check"></i>}
                          </button>

                          <div className="mt-3 flex items-center justify-center gap-1 text-[10px] text-gray-400 font-bold">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_0_4px_rgba(59,130,246,0.2)]"></div>
                            Şu an {Math.floor(Math.random() * 20) + 5} kişi aktif çalışıyor
                          </div>
                        </div>
                      </div>
                  </div>
              )}

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
    </div>
  );
}