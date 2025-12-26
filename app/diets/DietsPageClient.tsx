"use client";

import Link from "next/link";
import { useMemo, useEffect, useState } from "react";
import { getPlans } from "@/lib/api";
import { getSafeAvatarUrl, getUserProfileUrl } from "@/lib/helpers";
import MascotDisplay from "@/components/MascotDisplay";

// KATEGORİLER
const CATEGORIES = [
  { id: "all", label: "Tümü", icon: "fa-layer-group" },
  { id: "Hızlı Sonuç", label: "Hızlı Sonuç", icon: "fa-rocket" },
  { id: "Keto", label: "Keto", icon: "fa-drumstick-bite" },
  { id: "Vegan", label: "Vegan", icon: "fa-leaf" },
  { id: "Vejetaryen", label: "Vejetaryen", icon: "fa-carrot" },
  { id: "Akdeniz", label: "Akdeniz", icon: "fa-fish" },
  { id: "Glutensiz", label: "Glutensiz", icon: "fa-bread-slice" },
  { id: "Ekonomik", label: "Ekonomik", icon: "fa-piggy-bank" },
  { id: "Detoks", label: "Detoks", icon: "fa-glass-water" },
  { id: "Protein Ağırlıklı", label: "Protein", icon: "fa-dumbbell" },
  { id: "Aralıklı Oruç", label: "Oruç (IF)", icon: "fa-clock" },
];

const SORT_OPTIONS = [
  { id: "newest", label: "En Yeni" },
  { id: "points_desc", label: "En Çok Puan" },
  { id: "duration_asc", label: "En Kısa Süre" },
];

type CompletedUser = {
  id?: number;
  name?: string;
  slug?: string;
  avatar?: string;
  is_expert?: boolean;
};

export default function DietsPageClient() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtre State'leri
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSort, setActiveSort] = useState("newest");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const plansData = await getPlans();
        setPlans(Array.isArray(plansData) ? plansData : []);
      } catch (error) {
        console.error("Planlar yüklenirken hata:", error);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // filtre + sıralama
  const filteredPlans = useMemo(() => {
    return plans
      .filter((plan) => {
        if (!plan || !plan.meta) return false;

        // Kategori
        if (activeCategory !== "all") {
          const planCat = plan.meta.diet_category;
          if (Array.isArray(planCat)) {
            if (!planCat.includes(activeCategory)) return false;
          } else {
            if (planCat !== activeCategory) return false;
          }
        }

        // Onaylı
        if (showVerifiedOnly) {
          const isVerified =
            plan.meta.is_verified === true ||
            plan.meta.is_verified === "1" ||
            plan.meta.is_verified === "true";
          if (!isVerified) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (activeSort === "newest") return (b.id || 0) - (a.id || 0);

        if (activeSort === "points_desc") {
          const scoreA = parseInt(a.meta?.score_reward) || 0;
          const scoreB = parseInt(b.meta?.score_reward) || 0;
          return scoreB - scoreA;
        }

        if (activeSort === "duration_asc") {
          const durA = parseInt(a.meta?.duration) || 999;
          const durB = parseInt(b.meta?.duration) || 999;
          return durA - durB;
        }

        return 0;
      });
  }, [plans, activeCategory, activeSort, showVerifiedOnly]);

  // Pagination hesapları
  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const paginatedPlans = filteredPlans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Filtre değişince sayfayı 1'e çek
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeSort, showVerifiedOnly]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 400, behavior: "smooth" });
    }
  };

  // Sidebar modülleri: basit örnekler (UI)
  const popularPlans = useMemo(() => {
    // “popüler”i şimdilik score_reward’a göre türetiyoruz
    const sorted = [...filteredPlans].sort((a, b) => {
      const scoreA = parseInt(a.meta?.score_reward) || 0;
      const scoreB = parseInt(b.meta?.score_reward) || 0;
      return scoreB - scoreA;
    });
    return sorted.slice(0, 5);
  }, [filteredPlans]);

  // “Haftanın Okurları” benzeri (diyet uyarlaması) - şimdilik mock / fallback
  const [dietHeroes, setDietHeroes] = useState<any[]>([]);
  useEffect(() => {
    // İsterseniz burayı backend leaderboard/points endpoint'ine bağlarız.
    setDietHeroes([
      { id: 1, name: "BulgurPilavı", score: 1280, avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Bulgur", slug: "bulgurpilavi" },
      { id: 2, name: "KetoKaptan", score: 1170, avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Keto", slug: "ketokaptan" },
      { id: 3, name: "YeşilCanavar", score: 990, avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Yesil", slug: "yesilcanavar" },
      { id: 4, name: "IFNinja", score: 880, avatar: "https://api.dicebear.com/9.x/personas/svg?seed=IF", slug: "ifninja" },
      { id: 5, name: "ProteinPanda", score: 760, avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Panda", slug: "proteinpanda" },
      { id: 6, name: "DetoksDedektifi", score: 640, avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Detoks", slug: "detoksdedektifi" },
      { id: 7, name: "AkdenizAşığı", score: 540, avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Akdeniz", slug: "akdeniz asigi" },
      { id: 8, name: "VeganVızır", score: 430, avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Vegan", slug: "veganvizir" },
      { id: 9, name: "GlutensizGurme", score: 320, avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Gurme", slug: "glutensizgurme" },
      { id: 10, name: "Suİçtim", score: 210, avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Su", slug: "suictim" },
    ]);
  }, []);

  return (
    <div className="min-h-screen pb-20 font-sans text-gray-800 bg-gray-50/30">
      {/* HERO */}
      <div className="bg-rejimde-purple text-white py-12 relative overflow-hidden mb-8 shadow-lg">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(#fff 2px, transparent 2px)", backgroundSize: "20px 20px" }}
        ></div>

        <div className="max-w-6xl mx-auto px-4 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg text-xs font-black uppercase mb-4 border border-white/10 backdrop-blur-sm">
              <i className="fa-solid fa-wand-magic-sparkles text-yellow-300"></i> Rejimde AI
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              Diyet seçmek zor mu? <br />
              <span className="text-purple-200">Bırak planlar konuşsun.</span>
            </h1>
            <p className="text-purple-100 font-bold mb-8 text-lg opacity-90">
              Hedefine uygun listeleri seç, uygula, tamamla… sonra puanları cebe indir.
            </p>
            <Link
              href="/ai-diet-generator"
              className="bg-white text-rejimde-purple px-8 py-4 rounded-2xl font-extrabold text-sm shadow-xl shadow-purple-900/20 btn-game uppercase flex items-center gap-2 w-fit"
            >
              <i className="fa-solid fa-robot text-lg"></i> AI Asistanı Başlat
            </Link>
          </div>

          <div className="hidden md:flex justify-end relative">
            <div className="relative w-72 h-72 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20 animate-pulse-slow">
              <i className="fa-solid fa-utensils text-9xl text-white opacity-90 drop-shadow-lg"></i>
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
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-5 py-3 rounded-2xl font-bold text-xs shadow-sm transition whitespace-nowrap flex items-center gap-2 border-2 ${
                    activeCategory === cat.id
                      ? "bg-gray-900 text-white border-gray-900 shadow-lg transform scale-105"
                      : "bg-white text-gray-500 border-white hover:border-gray-200 hover:text-gray-700"
                  }`}
                >
                  <i className={`fa-solid ${cat.icon} ${activeCategory === cat.id ? "text-yellow-400" : "text-gray-300"}`}></i>
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
              <span className={`text-xs font-bold ${showVerifiedOnly ? "text-blue-600" : "text-gray-500"} group-hover:text-blue-600 transition-colors`}>
                Sadece Onaylılar
              </span>
            </label>

            <div className="relative group/sort z-20">
              <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:border-gray-300 hover:shadow-md transition">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-arrow-down-wide-short text-gray-400"></i>
                  <span>{SORT_OPTIONS.find((o) => o.id === activeSort)?.label}</span>
                </div>
                <i className="fa-solid fa-chevron-down text-[10px] text-gray-300"></i>
              </button>

              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover/sort:opacity-100 group-hover/sort:visible transition-all overflow-hidden">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setActiveSort(opt.id)}
                    className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-gray-50 flex items-center justify-between ${
                      activeSort === opt.id ? "text-rejimde-purple bg-purple-50" : "text-gray-600"
                    }`}
                  >
                    {opt.label}
                    {activeSort === opt.id && <i className="fa-solid fa-check text-rejimde-purple"></i>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* GRID + SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Cards */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-gray-200 border-t-rejimde-purple rounded-full animate-spin"></div>
                  <i className="fa-solid fa-utensils absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-300 text-xl"></i>
                </div>
                <p className="text-gray-400 font-bold text-sm animate-pulse">En sağlıklı listeler hazırlanıyor...</p>
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center shadow-sm">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <i className="fa-solid fa-filter-circle-xmark text-5xl text-gray-300"></i>
                </div>
                <h3 className="text-2xl font-black text-gray-700 mb-2">Plan Bulunamadı</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-8 font-medium">
                  Seçtiğiniz kriterlere uygun bir diyet listesi şu an mevcut değil. Filtreleri temizleyerek diğer listelere göz atabilirsiniz.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory("all");
                    setShowVerifiedOnly(false);
                  }}
                  className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-gray-800 transition flex items-center gap-2"
                >
                  <i className="fa-solid fa-rotate-left"></i> Filtreleri Temizle
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {paginatedPlans.map((plan) => {
                    // Yazar
                    const authorName = plan.author?.name || "Rejimde Uzman";
                    const authorAvatar = getSafeAvatarUrl(plan.author?.avatar, plan.author?.slug || authorName);

                    // Tamamlayanlar (avatar FIX burada)
                    const completedUsersRaw: CompletedUser[] = Array.isArray(plan.completed_users) ? plan.completed_users : [];
                    const completedUsers = completedUsersRaw.map((u) => ({
                      ...u,
                      avatar: getSafeAvatarUrl(u.avatar, u.slug || u.name || "user"),
                    }));
                    const completedCount = completedUsers.length;

                    const scoreReward = parseInt(plan.meta?.score_reward) || 0;

                    return (
                      <Link
                        key={plan.id}
                        href={`/diets/${plan.slug}`}
                        className="bg-white border-2 border-gray-100 rounded-[2rem] p-0 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 group flex flex-col h-full relative"
                      >
                        {/* Badge: Verified */}
                        <div className="absolute top-4 left-4 z-10 flex gap-2">
                          {(plan.meta?.is_verified === true || plan.meta?.is_verified === "1") && (
                            <div className="bg-blue-600/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg border border-white/20 flex items-center gap-2">
                              <i className="fa-solid fa-circle-check"></i> Uzman Onaylı
                            </div>
                          )}

                          {plan.meta?.diet_category && (
                            <div className="bg-white/90 backdrop-blur-md text-gray-800 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg border border-white/20">
                              {plan.meta.diet_category}
                            </div>
                          )}
                        </div>

                        {/* Puan Badge (Sağ Üst) */}
                        {scoreReward > 0 && (
                          <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-md text-yellow-600 px-3 py-1.5 rounded-xl text-[10px] font-black border border-yellow-100 shadow-sm flex items-center gap-2">
                            <i className="fa-solid fa-trophy"></i> +{scoreReward}
                          </div>
                        )}

                        <div className="h-52 bg-gray-100 relative overflow-hidden flex-shrink-0 rounded-t-[2rem]">
                          {plan.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={plan.image}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                              alt={plan.title}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-50">
                              <i className="fa-solid fa-leaf text-7xl text-green-400 opacity-60"></i>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90"></div>
                          <div className="absolute bottom-5 left-5 right-5 text-white">
                            <h3 className="font-extrabold text-xl drop-shadow-md line-clamp-2 mb-2 leading-tight" dangerouslySetInnerHTML={{ __html: plan.title }} />
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
                          <div
                            className="text-gray-500 text-sm font-bold mb-6 line-clamp-2 min-h-[40px] leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: plan.content ? String(plan.content).replace(/<[^>]+>/g, "").slice(0, 120) : "",
                            }}
                          />

                          <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center border border-transparent">
                              <i className="fa-solid fa-gauge-high text-rejimde-purple text-sm mb-1.5"></i>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide truncate w-full">
                                {plan.meta?.difficulty === "easy" ? "Kolay" : plan.meta?.difficulty === "hard" ? "Zor" : "Orta"}
                              </span>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center border border-transparent">
                              <i className="fa-regular fa-clock text-rejimde-blue text-sm mb-1.5"></i>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide truncate w-full">
                                {plan.meta?.duration || "3"} Gün
                              </span>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-3 flex flex-col items-center justify-center text-center border border-transparent">
                              <i className="fa-solid fa-fire text-orange-500 text-sm mb-1.5"></i>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide truncate w-full">
                                {plan.meta?.calories || "-"} kcal
                              </span>
                            </div>
                          </div>

                          <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                            {/* Tamamlayanlar - blog tarzı */}
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2 overflow-hidden pl-2">
                                {completedUsers.slice(0, 3).map((u, i) => (
                                  <div key={`${plan.id}-c-${i}`} className="w-7 h-7 rounded-full border-2 border-white relative shadow-sm bg-gray-100">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={u.avatar}
                                      className="w-full h-full object-cover rounded-full"
                                      alt={u.name || "Kullanıcı"}
                                    />
                                  </div>
                                ))}

                                {completedCount > 3 && (
                                  <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500">
                                    +{completedCount - 3}
                                  </div>
                                )}

                                {completedCount === 0 && (
                                  <span className="text-[10px] font-bold text-gray-400 ml-[-8px] bg-gray-50 px-2 py-1 rounded-md">
                                    Henüz yok
                                  </span>
                                )}
                              </div>
                              {completedCount > 0 && (
                                <span className="text-xs font-bold text-gray-400">
                                  {completedCount} kişi bitirdi
                                </span>
                              )}
                            </div>

                            <span className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-lg shadow-gray-200 btn-game uppercase flex items-center gap-2 group-hover:bg-black transition">
                              İncele <i className="fa-solid fa-arrow-right"></i>
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination (blog benzeri) */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400 font-bold hover:border-rejimde-blue hover:text-rejimde-blue transition disabled:opacity-50"
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-xl font-black flex items-center justify-center transition ${
                          currentPage === page
                            ? "bg-rejimde-blue text-white shadow-btn shadow-blue-200"
                            : "bg-white border-2 border-gray-200 text-gray-600 hover:border-rejimde-blue"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center text-gray-400 font-bold hover:border-rejimde-blue hover:text-rejimde-blue transition disabled:opacity-50"
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT: Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Popüler Diyetler */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-card">
              <h3 className="font-extrabold text-gray-700 uppercase text-sm mb-4">Popüler Diyetler</h3>
              <div className="space-y-4">
                {popularPlans.map((p) => (
                  <Link
                    key={`pop-${p.id}`}
                    href={`/diets/${p.slug}`}
                    className="flex gap-3 group p-2 rounded-xl transition border border-transparent hover:border-gray-200"
                  >
                    <div className="w-14 h-14 bg-gray-200 rounded-xl shrink-0 overflow-hidden border-2 border-transparent group-hover:border-rejimde-blue transition">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image || "https://placehold.co/100x100?text=Diyet"} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-gray-700 text-sm leading-tight group-hover:text-rejimde-blue transition line-clamp-2">
                        {String(p.title).replace(/<[^>]+>/g, "")}
                      </h4>
                      <span className="text-xs font-bold text-gray-400">
                        +{parseInt(p.meta?.score_reward) || 0} puan • {p.meta?.duration || "-"} gün
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-rejimde-purple text-white rounded-3xl p-6 text-center shadow-float relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>

              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-white/30 group-hover:scale-110 transition">
                <i className="fa-solid fa-envelope-open-text text-3xl"></i>
              </div>
              <h3 className="font-extrabold text-lg mb-2">Tüyoları Kaçırma!</h3>
              <p className="text-purple-100 text-xs font-bold mb-4 px-2">
                “Bugün ne yesem?” sorusunu e-postaya outsource ediyoruz. Haftalık öneriler gelsin.
              </p>
              <div className="bg-white p-1 rounded-xl flex">
                <input
                  type="email"
                  placeholder="E-posta adresin"
                  className="flex-1 bg-transparent border-none text-gray-700 text-xs font-bold px-3 focus:outline-none"
                />
                <button className="bg-rejimde-purpleDark text-white px-3 py-2 rounded-lg font-black text-xs uppercase hover:bg-purple-900 transition">
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </div>

            {/* Haftanın Diyet Canavarları (blogdaki okurlar modülünün uyarlaması) */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-gray-700 uppercase text-sm">Haftanın Diyet Canavarları</h3>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Top 10</span>
              </div>

              <div className="space-y-3">
                {dietHeroes.length > 0 ? (
                  dietHeroes.map((reader: any, index: number) => {
                    let rankColor = "text-gray-400";
                    let rankBg = "bg-gray-100";
                    if (index === 0) { rankColor = "text-yellow-600"; rankBg = "bg-yellow-100 border-yellow-200"; }
                    else if (index === 1) { rankColor = "text-gray-600"; rankBg = "bg-gray-200 border-gray-300"; }
                    else if (index === 2) { rankColor = "text-orange-600"; rankBg = "bg-orange-100 border-orange-200"; }

                    return (
                      <div key={reader.id} className="flex items-center gap-3 group">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs border ${rankBg} ${rankColor}`}>
                          {index + 1}
                        </div>

                        <Link href={getUserProfileUrl(reader.slug || "user", false)} className="relative hover:scale-110 transition-transform">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getSafeAvatarUrl(reader.avatar, reader.name)}
                            className="w-9 h-9 rounded-xl bg-gray-100 object-cover border-2 border-white shadow-sm"
                            alt={reader.name}
                          />
                          {index < 3 && (
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                              <i className="fa-solid fa-crown text-[6px] text-white"></i>
                            </div>
                          )}
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link href={getUserProfileUrl(reader.slug || "user", false)} className="text-xs font-bold text-gray-700 hover:text-rejimde-blue truncate block transition">
                            {reader.name}
                          </Link>
                          <div className="flex items-center gap-1">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-rejimde-green rounded-full" style={{ width: `${Math.min((reader.score / 2000) * 100, 100)}%` }}></div>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-gray-700 block">{reader.score}</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">Puan</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6">
                    <MascotDisplay state="idle_dashboard" size={60} showBubble={false} />
                    <p className="text-xs text-gray-400 font-bold mt-2">Henüz veri yok.</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <Link href="/leagues" className="text-xs font-bold text-rejimde-blue hover:underline">
                  “Canavarlar Ligi” Tam Liste
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}