"use client";

import Link from "next/link";
import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getPlanBySlug, getMe, earnPoints, getProgress, updateProgress, startProgress, completeProgress, toggleProgressItem } from "@/lib/api";
import { getSafeAvatarUrl, getUserProfileUrl } from "@/lib/helpers";
import CommentsSection from "@/components/CommentsSection";
import AuthorCard from "@/components/AuthorCard";
import SocialShare from "@/components/SocialShare";
import PointsToast from "@/components/PointsToast";
import { useGamification } from "@/hooks/useGamification";
import { getProfessionLabel } from "@/lib/constants";

// --- API Helperları ---
const approvePlan = async (id: number) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
  const res = await fetch(`${process.env. NEXT_PUBLIC_WP_API_URL || "http://localhost/wp-json"}/rejimde/v1/plans/approve/${id}`, {
    method: "POST",
    headers:  { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

const startPlan = async (id: number) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
  const res = await fetch(`${process.env.NEXT_PUBLIC_WP_API_URL || "http://localhost/wp-json"}/rejimde/v1/plans/start/${id}`, {
    method: "POST",
    headers:  { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

const completePlanAPI = async (id:  number) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
  const res = await fetch(`${process.env.NEXT_PUBLIC_WP_API_URL || "http://localhost/wp-json"}/rejimde/v1/plans/complete/${id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

// --- MODAL ---
const Modal = ({
  isOpen,
  title,
  message,
  type,
  onConfirm,
  onCancel,
}:  {
  isOpen: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "confirm" | "info" | "warning";
  onConfirm?:  () => void;
  onCancel?:  () => void;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-300 relative overflow-hidden">
        <div
          className={`absolute top-0 left-0 w-full h-2 ${
            type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" :  type === "warning" ? "bg-orange-500" : type === "info" ? "bg-blue-500" :  "bg-blue-500"
          }`}
        ></div>
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${
            type === "success"
              ? "bg-green-100 text-green-600"
              : type === "error"
              ? "bg-red-100 text-red-600"
              : type === "warning"
              ? "bg-orange-100 text-orange-600"
              : type === "info"
              ?  "bg-blue-100 text-blue-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          <i
            className={`fa-solid ${
              type === "success"
                ? "fa-trophy"
                : type === "error"
                ? "fa-circle-exclamation"
                : type === "warning"
                ? "fa-triangle-exclamation"
                : type === "info"
                ? "fa-circle-info"
                : "fa-circle-question"
            } text-2xl`}
          ></i>
        </div>
        <h3 className="text-xl font-black text-gray-900 text-center mb-2">{title}</h3>
        <p className="text-gray-500 text-center text-sm mb-8 leading-relaxed whitespace-pre-line">{message}</p>
        <div className="flex gap-3 justify-center">
          {type === "confirm" || type === "warning" ? (
            <>
              <button onClick={onCancel} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-sm transition">
                Vazgeç
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-4 py-3 text-white rounded-2xl font-bold text-sm transition shadow-lg ${
                  type === "warning" ? "bg-orange-500 hover: bg-orange-600" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Onaylıyorum
              </button>
            </>
          ) : (
            <button onClick={onConfirm || onCancel} className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-bold text-sm transition shadow-lg">
              Tamam, Harika! 
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Completed user type
type CompletedUser = {
  id?:  number;
  name?: string;
  avatar?: string;
  slug?: string;
  is_expert?: boolean;
};

// Approver type
type Approver = {
  id?:  number;
  name:  string;
  avatar?:  string;
  slug:  string;
  profession?: string;
};

export default function DietDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);

  const [activeDay, setActiveDay] = useState(1);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authorDetail, setAuthorDetail] = useState<any>(null);

  const [completedMeals, setCompletedMeals] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message:  string;
    type: "success" | "error" | "confirm" | "info" | "warning";
    onConfirm?:  () => void;
    onCancel?:  () => void;
  }>({ isOpen: false, title: "", message:  "", type: "info" });

  const { dispatchAction, lastResult, showToast, closeToast } = useGamification();

  const showModal = (title: string, message: string, type:  "success" | "error" | "confirm" | "info" | "warning", onConfirm?:  () => void) => {
    setModal({
      isOpen:  true,
      title,
      message,
      type,
      onConfirm:  () => {
        if (onConfirm) onConfirm();
        setModal((prev) => ({ ...prev, isOpen:  false }));
      },
      onCancel: () => setModal((prev) => ({ ...prev, isOpen: false })),
    });
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [planData, userData] = await Promise. all([getPlanBySlug(slug), getMe()]);

        if (planData) {
          setPlan(planData);
          setCurrentUser(userData);

          const authorSlug = planData.author?. slug || "#";
          let authorInfo: any = {
            id: 0,
            name: planData.author?.name || "Rejimde Uzman",
            slug: authorSlug,
            avatar: getSafeAvatarUrl(planData.author?.avatar, authorSlug),
            isExpert: planData. author?.is_expert || false,
            isVerified: planData. author?.is_expert || false,
            role: planData.author?.is_expert ? "rejimde_pro" : "rejimde_user",
            profession: planData. author?.is_expert ? "Diyetisyen" : "",
            level: 1,
            score: 0,
            articleCount: 1,
            followers_count: 0,
            high_fives: 0,
          };

          try {
            const apiUrl = process.env.NEXT_PUBLIC_WP_API_URL || "http://localhost/wp-json";
            const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
            const headers: HeadersInit = {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            
            // Use correct API endpoint based on user type
            const isExpert = planData.author?.is_expert || false;
            const endpoint = isExpert 
              ? `${apiUrl}/rejimde/v1/professionals/${authorSlug}`
              : `${apiUrl}/rejimde/v1/profile/${authorSlug}`;
            
            const res = await fetch(endpoint, { headers });
            
            if (res.ok) {
              const data = await res.json();
              const user = data.data || data;
              
              if (user) {
                const isPro = isExpert || (user.roles && user.roles.includes("rejimde_pro"));
                let profession = authorInfo.profession;
                if (isPro) {
                  const rawProfession = user.profession || "dietitian";
                  profession = getProfessionLabel(rawProfession) || "Uzman";
                }

                authorInfo = {
                  ...authorInfo,
                  id: user.id,
                  name: user.name || user.display_name,
                  avatar: user.avatar_url || authorInfo.avatar,
                  isExpert: isPro,
                  isVerified: isPro,
                  role: isPro ? "rejimde_pro" : "rejimde_user",
                  profession: profession,
                  level: user.rejimde_level || user.level || 5,
                  score: user.rejimde_score || 0,
                  articleCount: user.posts_count || user.content_count || 12,
                  followers_count: user.followers_count || 0,
                  high_fives: user.high_fives || 0,
                  is_following: user.is_following || false,
                  has_high_fived: user.has_high_fived || false,
                  // Expert-specific fields
                  reji_score: isPro ? user.reji_score : undefined,
                  client_count: isPro ? user.client_count : undefined,
                  // Normal user fields
                  rejimde_total_score: !isPro ? user.rejimde_total_score || user.total_score : undefined,
                };
              }
            }
          } catch (e) {
            console.warn("Yazar detayları çekilemedi", e);
          }
          setAuthorDetail(authorInfo);

          // Progress
          if (userData) {
            const progressData = await getProgress("diet", planData.id);
            if (progressData) {
              setCompletedMeals(progressData.completed_items || []);
              setIsStarted(progressData. is_started || progressData.started || false);
              setIsCompleted(progressData.is_completed || progressData.completed || false);
              setRewardClaimed(progressData.reward_claimed || false);
            }
          }

          // Favorites check
          if (typeof window !== "undefined") {
            const favorites = JSON.parse(localStorage. getItem("favorite_diets") || "[]");
            setIsFavorited(favorites.includes(planData.id));
          }
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console. error("Veri hatası:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  // Plan Data Parsing
  let planData: any[] = [];
  if (plan?. plan_data) {
    if (Array.isArray(plan.plan_data)) {
      planData = plan.plan_data;
    } else if (typeof plan.plan_data === "object") {
      planData = Object.values(plan. plan_data);
    }
  }

  const getTotalMeals = useCallback(() => {
    return planData.reduce((acc, day) => acc + (Array.isArray(day. meals) ? day.meals.length : 0), 0);
  }, [planData]);

  // Progress calculation - sadece progress güncelliyor, modal göstermiyor
  useEffect(() => {
    if (planData.length === 0) return;
    const totalMeals = getTotalMeals();
    if (totalMeals === 0) return;
    const currentProgress = Math.round((completedMeals. length / totalMeals) * 100);
    setProgress(currentProgress);
  }, [completedMeals, planData. length, getTotalMeals]);

  useEffect(() => {
    if (planData.length > 0 && activeDay > planData. length) setActiveDay(1);
  }, [planData.length, activeDay]);

  const toggleMealCompletion = async (mealId: string) => {
    if (! currentUser) {
      showModal("Giriş Yapmalısın", "Öğün takibi yapmak için lütfen giriş yap.", "error");
      return;
    }

    if (! isStarted) {
      showModal("Önce Başlamalısın!  🍽️", "Öğünleri işaretleyebilmek için önce diyete başlamalısın.  \"Bu Diyete Başla\" butonuna tıkla ve maceraya atıl!", "info");
      return;
    }

    try {
      const result = await toggleProgressItem("diet", plan.id, mealId);

      if (result. success) {
        const newCompletedMeals = result.completed_items || [];
        setCompletedMeals(newCompletedMeals);

        // Tüm öğünler tamamlandı mı kontrol et
        const totalMeals = getTotalMeals();
        const allCompleted = newCompletedMeals. length >= totalMeals && totalMeals > 0;

        if (allCompleted && !rewardClaimed) {
          // Sadece tüm öğünler bitince ve daha önce puan alınmadıysa
          handleCompleteDiet();
        }
      } else {
        // Backend'den gelen hata mesajını Türkçeleştir
        let errorMessage = result.message || "Öğün işaretlenemedi. ";
        if (errorMessage.includes("Content must be started")) {
          errorMessage = "Önce diyete başlamalısın! \"Bu Diyete Başla\" butonuna tıkla. ";
        }
        showModal("Bir Dakika!  ✋", errorMessage, "error");
      }
    } catch (e) {
      console.error("Meal completion error:", e);
      showModal("Hata", "İşlem sırasında bir hata oluştu.", "error");
    }
  };

  const handleStartDiet = async () => {
    if (!currentUser) {
      showModal("Giriş Yapmalısın", "Diyet takibi yapmak için lütfen giriş yap.", "error");
      return;
    }

    if (isStarted) {
      showModal("Zaten Başladın", "Bu diyeti zaten takip ediyorsun. Öğünleri işaretleyerek ilerleyebilirsin.", "info");
      return;
    }

    // Yasal Uyarı (onaylanmamış diyetler için)
    if (!plan. meta?.is_verified) {
      showModal(
        "Yasal Uyarı ⚠️",
        "Bu diyet planı henüz bir uzman tarafından onaylanmamıştır.\n\nDiyete başlamadan önce lütfen bir sağlık profesyoneline (diyetisyen, doktor vb.) danışınız.\n\nOlası sağlık sorunlarında sorumluluk size aittir.",
        "warning",
        () => {
          startDietLogic();
        }
      );
    } else {
      startDietLogic();
    }
  };

  const startDietLogic = async () => {
    try {
      const startResult = await startProgress("diet", plan. id);

      if (startResult.success || startResult.already_started) {
        setIsStarted(true);

        const eventResult = await dispatchAction("diet_started", "diet", plan.id);

        if (eventResult.success && ! eventResult.already_earned) {
          showModal("Başarılar!  🥗", `Bu diyete başladın!  +${eventResult.points_earned} puan kazandın.`, "success");
        } else {
          showModal("Başarılar! 🥗", "Bu diyete başladın. Sağlıklı günler dileriz!", "success");
        }
      } else {
        showModal("Hata", startResult.message || "Bir hata oluştu.", "error");
      }
    } catch (e) {
      showModal("Hata", "İşlem sırasında bir hata oluştu.", "error");
    }
  };

  const handleCompleteAllMeals = async () => {
    const currentDay = planData.find((d: any) => d.dayNumber == activeDay);
    if (!currentDay || !currentDay.meals) return;
    const mealIds = currentDay.meals.map((m: any) => m.id);

    if (! currentUser) {
      showModal("Giriş Yapmalısın", "Öğün takibi yapmak için lütfen giriş yap.", "error");
      return;
    }

    if (! isStarted) {
      showModal("Önce Başlamalısın!  🍽️", "Öğünleri işaretleyebilmek için önce diyete başlamalısın.", "info");
      return;
    }

    for (const mealId of mealIds) {
      if (! completedMeals. includes(mealId)) {
        await toggleMealCompletion(mealId);
      }
    }
  };

  const handleCompleteDiet = async () => {
    if (rewardClaimed) return; // Zaten alındıysa tekrar verme

    setIsCompleted(true);
    setRewardClaimed(true);

    if (currentUser) {
      try {
        const reward = parseInt(plan?. meta?.score_reward || "0");

        const result = await dispatchAction("diet_completed", "diet", plan.id);

        if (result.success) {
          await completeProgress("diet", plan.id);
          showModal("Tebrikler Şampiyon! 🏆", `Bu diyet planını başarıyla tamamladın ve ${result.points_earned || reward} puan kazandın! `, "success");
        } else {
          await earnPoints("complete_plan", plan?. id);
          await completePlanAPI(plan. id);
          showModal("Tebrikler Şampiyon! 🏆", `Bu diyet planını başarıyla tamamladın ve ${reward} puan kazandın!`, "success");
        }
      } catch (e) {
        const reward = parseInt(plan?. meta?.score_reward || "0");
        showModal("Tebrikler Şampiyon! 🏆", `Bu diyet planını başarıyla tamamladın ve ${reward} puan kazandın!`, "success");
      }
    }
  };

  const handleApprove = () => {
    showModal("Onaylıyor musun? ", "Bu diyet planını 'Uzman Onaylı' olarak işaretlemek üzeresin.", "confirm", async () => {
      try {
        const result = await approvePlan(plan.id);
        if (result. success || result.status === "success") {
          // Approvers listesine ekle veya oluştur
          const newApprover:  Approver = {
            id: currentUser.id,
            name: currentUser.name || currentUser.display_name,
            avatar: currentUser.avatar_url,
            slug: currentUser.username || currentUser.slug,
            profession:  currentUser.profession,
          };

          setPlan((prev:  any) => {
            const existingApprovers = Array.isArray(prev.approvers) ? prev.approvers :  [];
            const alreadyApproved = existingApprovers.some((a: Approver) => a.id === newApprover.id);

            return {
              ...prev,
              meta: { ...prev.meta, is_verified: true },
              approved_by: prev.approved_by || newApprover,
              approvers: alreadyApproved ? existingApprovers :  [...existingApprovers, newApprover],
            };
          });

          showModal("Onaylandı ✅", "Diyet planı onaylandı.  Teşekkürler!", "success");
        } else {
          showModal("Hata", result.message || "Onaylama işlemi başarısız.", "error");
        }
      } catch (e) {
        showModal("Hata", "Onaylama işlemi başarısız.", "error");
      }
    });
  };

  const toggleFavorite = () => {
    if (typeof window !== "undefined" && plan) {
      const favorites = JSON.parse(localStorage.getItem("favorite_diets") || "[]");
      if (isFavorited) {
        const updated = favorites.filter((id: number) => id !== plan.id);
        localStorage.setItem("favorite_diets", JSON.stringify(updated));
        setIsFavorited(false);
        showModal("Favorilerden Çıkarıldı", "Bu diyet favorilerinden kaldırıldı.", "info");
      } else {
        favorites.push(plan. id);
        localStorage.setItem("favorite_diets", JSON.stringify(favorites));
        setIsFavorited(true);
        showModal("Favorilere Eklendi ❤️", "Bu diyet favorilerine eklendi!", "success");
      }
    }
  };

  const shareOnWhatsApp = () => {
    if (! plan. shopping_list || plan.shopping_list. length === 0) return;
    const text = `*${plan.title} - Alışveriş Listesi*\n\n` + plan.shopping_list.map((i: string) => `- ${i}`).join("\n");
    const url = `https://wa.me/? text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><i className="fa-solid fa-circle-notch animate-spin text-4xl text-rejimde-green"></i></div>;
  if (notFound || !plan) return <div className="min-h-screen flex flex-col items-center justify-center p-4"><h1 className="text-2xl font-black">Bulunamadı</h1><Link href="/diets" className="text-rejimde-blue font-bold mt-4">Diyet Listelerine Dön</Link></div>;

  const difficulty = plan.meta?.difficulty || "Orta";
  const duration = plan.meta?. duration || planData. length. toString() || "3";
  const calories = plan.meta?. calories || "--";
  const scoreReward = plan. meta?.score_reward || "0";
  const category = plan.meta?. diet_category || "Genel";

  const isAuthor = currentUser && (plan.author?.name === currentUser.name || currentUser.username === plan.author?. slug);
  const isExpertUser = currentUser && Array.isArray(currentUser.roles) && (currentUser.roles. includes("rejimde_pro") || currentUser.roles.includes("administrator"));
  const hasCurrentUserApproved = isExpertUser && Array.isArray(plan.approvers) && plan.approvers.some((a: Approver) => a.id === currentUser?. id);

  const currentDayData = planData.find((d: any) => d.dayNumber == activeDay) || planData[0] || { meals: [] };
  const meals = Array.isArray(currentDayData.meals) ? currentDayData.meals : currentDayData.meals ?  Object.values(currentDayData.meals) : [];
  const shoppingList = Array. isArray(plan.shopping_list) ? plan.shopping_list : Array.isArray(plan.meta?.shopping_list) ? plan.meta. shopping_list : [];

  // Approvers:  backend'den gelen veya approved_by'dan oluşturulan liste
  const approvers:  Approver[] = Array.isArray(plan.approvers) ? plan.approvers :  plan.approved_by ? [plan.approved_by] : [];

  // Completed users
  const completedUsers:  CompletedUser[] = Array.isArray(plan.completed_users) ? plan.completed_users : [];
  const completedCount:  number = plan.completed_count || completedUsers.length || 0;

  const getMealIcon = (type: string) => {
    switch (type) {
      case "breakfast":  return "fa-mug-hot";
      case "lunch": return "fa-utensils";
      case "dinner": return "fa-moon";
      case "snack": return "fa-apple-whole";
      case "pre-workout": return "fa-dumbbell";
      case "post-workout": return "fa-bolt";
      default: return "fa-circle";
    }
  };

  return (
    <div className="min-h-screen pb-20 font-sans text-rejimde-text">
      <Modal {... modal} />

      {/* HERO SECTION */}
      <div className="bg-white border-b-2 border-gray-200 pb-8 pt-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Left:  Image */}
            <div className="relative w-full md:w-1/3 group">
              <div className="aspect-video md:aspect-square rounded-3xl overflow-hidden shadow-card border-2 border-gray-100 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={plan.image || "https://images.unsplash. com/photo-1512621776951-a57141f2eefd? ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt={plan.title}
                />
                <div className="absolute top-4 left-4 bg-rejimde-green text-white px-3 py-1 rounded-lg text-xs font-black uppercase shadow-sm border border-white/20">
                  {difficulty === "hard" ? "Zor" : difficulty === "easy" ? "Kolay" : "Orta"}
                </div>

                {isAuthor && (
                  <Link
                    href={`/dashboard/pro/diets/edit/${plan.id}`}
                    className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 px-3 py-1. 5 rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-1"
                  >
                    <i className="fa-solid fa-pen-to-square"></i> Düzenle
                  </Link>
                )}
              </div>
            </div>

            {/* Right: Info */}
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
              <p className="text-gray-500 font-bold text-lg mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: plan.excerpt || plan.content?. substring(0, 150) + "..." || "" }}></p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-orange-50 border-2 border-orange-100 rounded-2xl p-3 text-center">
                  <i className="fa-solid fa-gauge-high text-orange-500 text-xl mb-1"></i>
                  <div className="text-xs font-bold text-gray-400 uppercase">Zorluk</div>
                  <div className="text-lg font-black text-gray-700">{difficulty === "hard" ? "Zor" :  difficulty === "easy" ? "Kolay" : "Orta"}</div>
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

              {/* Onaylanmamış Uyarısı */}
              {!plan.meta?.is_verified && ! isExpertUser && (
                <div className="mb-6 bg-orange-50 border-2 border-orange-200 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-orange-900">Bu diyet henüz uzman tarafından onaylanmadı</p>
                    <p className="text-xs text-orange-700">Diyete başlamadan önce bir uzmana danışmanızı öneririz.</p>
                  </div>
                </div>
              )}

              {/* Uzman Onay Paneli */}
              {isExpertUser && ! plan.meta?.is_verified && (
                <div className="mb-6 bg-blue-50 border-2 border-blue-100 p-4 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <i className="fa-solid fa-user-doctor"></i>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-900">Uzman Onayı Bekliyor</p>
                      <p className="text-xs text-blue-700">Bu diyeti inceleyip onaylamak ister misiniz? </p>
                    </div>
                  </div>
                  <button onClick={handleApprove} className="bg-blue-600 hover: bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg transition whitespace-nowrap">
                    Onayla
                  </button>
                </div>
              )}

              {/* Onaylayanlar Listesi (Çoklu) */}
              {plan.meta?.is_verified && approvers.length > 0 && (
                <div className="mb-6 bg-green-50 border-2 border-green-100 p-3 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fa-solid fa-circle-check text-green-500"></i>
                    <span className="text-xs font-bold text-green-800">Onaylayan Uzmanlar: </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {approvers. map((approver:  Approver, idx: number) => (
                      <Link
                        key={approver.id || idx}
                        href={getUserProfileUrl(approver. slug, true)}
                        className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-green-200 hover:border-green-400 transition"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={getSafeAvatarUrl(approver.avatar, approver.slug)} alt={approver.name} className="w-6 h-6 rounded-full object-cover border border-green-200" />
                        <span className="text-xs font-bold text-green-800">{approver.name}</span>
                      </Link>
                    ))}

                    {/* Uzman ise ve henüz onaylamamışsa + butonu */}
                    {isExpertUser && ! hasCurrentUserApproved && (
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

              {/* CTA Buttons */}
              <div className="flex gap-4 mb-6">
                {isStarted ? (
                  <div className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2 border-2 border-gray-200">
                    <i className="fa-solid fa-check"></i> Takip Ediliyor
                  </div>
                ) : (
                  <button
                    onClick={handleStartDiet}
                    className="flex-1 bg-rejimde-green text-white py-4 rounded-2xl font-extrabold text-lg shadow-btn shadow-rejimde-greenDark btn-game uppercase group flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-play group-hover:scale-110 transition"></i> Bu Diyete Başla
                  </button>
                )}
                <button
                  onClick={toggleFavorite}
                  className={`px-6 rounded-2xl font-extrabold text-2xl shadow-btn btn-game transition ${
                    isFavorited ? "bg-red-500 text-white border-2 border-red-500 hover:bg-red-600" : "bg-white border-2 border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200"
                  }`}
                >
                  <i className={`${isFavorited ?  "fa-solid" : "fa-regular"} fa-heart`}></i>
                </button>
              </div>

              {/* Social Share */}
              <div className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
                <SocialShare url={`/diets/${plan.slug}`} title={plan.title} description={plan.excerpt} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT */}
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
                  {completedMeals. length} / {getTotalMeals()} Öğün
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
            {planData && planData.length > 0 ?  (
              planData.map((day: any, index: number) => {
                const dayNum = day.dayNumber || index + 1;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveDay(Number(dayNum))}
                    className={`px-6 py-2 rounded-xl font-black text-sm shadow-btn btn-game shrink-0 transition-colors ${
                      activeDay === Number(dayNum) ? "bg-rejimde-blue text-white shadow-blue-200" : "bg-white text-gray-600 border-2 border-gray-200"
                    }`}
                  >
                    {dayNum}.  GÜN
                  </button>
                );
              })
            ) : (
              <div className="w-full text-center py-4 text-gray-400 font-bold">Plan bulunamadı. </div>
            )}
          </div>

          {/* Meals List */}
          <div className="space-y-4">
            {meals.length > 0 ? (
              meals.map((meal: any, mealIndex: number) => {
                const mealType = meal.type;
                const icon = getMealIcon(mealType);
                const isChecked = completedMeals. includes(meal.id);

                return (
                  <div key={mealIndex} className="relative group">
                    <label className="cursor-pointer block">
                      <input type="checkbox" className="meal-check hidden peer" checked={isChecked} onChange={() => toggleMealCompletion(meal. id)} />
                      <div
                        className={`bg-white border-2 border-gray-200 rounded-3xl p-5 flex flex-col md:flex-row items-start gap-4 hover:border-rejimde-green transition shadow-sm ${
                          isChecked ?  "border-green-400 bg-green-50/30" : ""
                        }`}
                      >
                        <div
                          className={`w-12 h-12 ${isChecked ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"} rounded-xl flex items-center justify-center text-2xl shrink-0 transition`}
                        >
                          <i className={`fa-solid ${icon}`}></i>
                        </div>
                        <div className="flex-1 w-full">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-gray-400 uppercase">
                              {meal.title} ({meal.time})
                            </span>
                            {meal.calories && <span className="text-xs font-black text-rejimde-green bg-green-50 px-2 py-1 rounded">{meal.calories} kcal</span>}
                          </div>
                          <h4 className={`font-extrabold text-lg text-gray-800 mb-2 transition-all ${isChecked ? "line-through text-green-800" : ""}`}>{meal.title}</h4>
                          <p className={`text-sm font-bold text-gray-500 mb-3 whitespace-pre-wrap ${isChecked ?  "text-green-700/70" : ""}`}>{meal.content}</p>

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
                        <div
                          className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                            isChecked ? "bg-rejimde-green border-rejimde-green text-white" : "bg-white border-gray-200 text-gray-300"
                          }`}
                        >
                          <i className="fa-solid fa-check"></i>
                        </div>
                      </div>
                    </label>
                  </div>
                );
              })
            ) : (
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

          {/* Comments */}
          <div className="mt-8">
            <CommentsSection postId={plan.id} context="diet" title="Değerlendirmeler" allowRating={true} />
          </div>
        </div>

        {/* RIGHT Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Shopping List */}
          {shoppingList && shoppingList.length > 0 && (
            <div className="bg-rejimde-purple rounded-3xl p-6 text-white shadow-float relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                  <i className="fa-solid fa-basket-shopping text-2xl"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg leading-tight">Alışveriş Listesi</h3>
                  <p className="text-purple-200 text-xs font-bold">{shoppingList. length} Malzeme Gerekli</p>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm max-h-60 overflow-y-auto custom-scrollbar">
                <ul className="text-sm font-bold space-y-2">
                  {shoppingList.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 group/item cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 rounded border-white/30 bg-transparent checked:bg-white checked:text-rejimde-purple focus:ring-0 cursor-pointer"
                      />
                      <span className="group-hover/item:text-white/90 transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shoppingList. join("\n"));
                    showModal("Başarılı", "Alışveriş listesi panoya kopyalandı.", "success");
                  }}
                  className="flex-1 bg-white text-rejimde-purple py-3 rounded-xl font-extrabold text-xs shadow-btn btn-game uppercase hover:bg-purple-50 transition"
                >
                  Kopyala
                </button>
                <button
                  onClick={shareOnWhatsApp}
                  className="flex-1 bg-green-500 text-white py-3 rounded-xl font-extrabold text-xs shadow-btn btn-game uppercase hover:bg-green-600 transition flex items-center justify-center gap-2"
                >
                  <i className="fa-brands fa-whatsapp text-lg"></i> Paylaş
                </button>
              </div>
            </div>
          )}

          {/* Author Card (Sticky) */}
          {authorDetail && (
            <div className="sticky top-24 z-30 space-y-6">
              <AuthorCard author={authorDetail} context={authorDetail.isExpert ? "Hazırlayan" : "Paylaşan"} />

                {/* Hedefine Ulaşanlar */}
                <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-[0_4px_0_#E5E5E5] overflow-hidden relative">
                <div className="bg-green-50 p-4 border-b-2 border-gray-100 text-center relative overflow-hidden">
                    <i className="fa-solid fa-trophy text-green-200 text-6xl absolute -left-2 top-2 rotate-12"></i>
                    <div className="relative z-10">
                    <div className="text-xs font-bold text-green-600 uppercase tracking-wide">Bu Planla</div>
                    <div className="text-2xl font-black text-gray-800">{completedCount} Kişi</div>
                    <div className="text-xs font-bold text-green-600 uppercase tracking-wide">Hedefine Ulaştı!  🚀</div>
                    </div>
                </div>

                <div className="p-5 text-center">
                    {completedUsers.length > 0 ?  (
                    <div className="flex justify-center items-center -space-x-4 mb-4">
                        {completedUsers. slice(0, 3).map((u:  CompletedUser, i: number) => {
                        // Slug oluştur - boş/undefined durumunda fallback
                        const userName = u.name || u.slug || `user-${u.id || i}`;
                        const userSlug = u.slug || String(userName).toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "") || `user-${i}`;
                        const isExpert = Boolean(u.is_expert);
                        
                        // Avatar:  önce user meta'dan gelen, sonra getSafeAvatarUrl fallback
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
                                // Fallback:  eğer resim yüklenemezse dicebear kullan
                                e.currentTarget.src = `https://api.dicebear. com/9.x/personas/svg?seed=${userSlug}`;
                                }}
                            />
                            {i === 1 && (
                                <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[10px] font-bold px-1. 5 rounded-full border-2 border-white flex items-center gap-0.5">
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
                    <div className="mb-4 text-gray-400 text-xs font-bold">Henüz kimse tamamlamadı.  İlk sen ol!</div>
                    )}

                    <p className="text-sm text-gray-600 font-bold mb-4">
                    Sen de bu <span className="text-[#58CC02]">{planData.length} günlük</span> maceraya katıl! 
                    </p>

                    <button
                    onClick={handleStartDiet}
                    disabled={isStarted}
                    className={`w-full font-black py-3 rounded-2xl border-b-4 flex items-center justify-center gap-2 group transition-all active:border-b-0 active:translate-y-1 ${
                        isStarted
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-default"
                        : "bg-[#58CC02] hover: bg-[#46A302] text-white border-[#46A302] shadow-green-200"
                    }`}
                    >
                    <span>{isStarted ? "Takip Ediliyor" : "Ben de Başladım!"}</span>
                    {!isStarted && <i className="fa-solid fa-arrow-right group-hover: translate-x-1 transition-transform"></i>}
                    {isStarted && <i className="fa-solid fa-check"></i>}
                    </button>

                    <div className="mt-3 flex items-center justify-center gap-1 text-[10px] text-gray-400 font-bold">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_0_4px_rgba(34,197,94,0.2)]"></div>
                    Şu an {Math.floor(Math.random() * 20) + 5} kişi aktif uyguluyor
                    </div>
                </div>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Points Toast */}
      {showToast && lastResult && (
        <PointsToast points={lastResult.points_earned} message={lastResult.message} streak={lastResult.streak} milestone={lastResult.milestone} onClose={closeToast} />
      )}
    </div>
  );
}